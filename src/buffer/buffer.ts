/**
 * @file Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import {
  Color, Vector3, Matrix4,
  FrontSide, BackSide, DoubleSide,
  // VertexColors,
  NoBlending,
  BufferGeometry, BufferAttribute,
  UniformsUtils, UniformsLib, Uniform,
  Group, LineSegments, Points, Mesh, Object3D,
  ShaderMaterial
} from 'three'

import { Log } from '../globals'
import { createParams, getTypedArray, getUintArray } from '../utils'
import { NumberArray } from '../types'
import { getShader, ShaderDefines } from '../shader/shader-utils'
import { serialArray } from '../math/array-utils'
import { Picker } from '../utils/picker'

export type BufferSide = 'front'|'back'|'double'

function getThreeSide (side: BufferSide) {
  if (side === 'front') {
    return FrontSide
  } else if (side === 'back') {
    return BackSide
  } else if (side === 'double') {
    return DoubleSide
  } else {
    return DoubleSide
  }
}

const itemSize = {
  'f': 1, 'v2': 2, 'v3': 3, 'c': 3
}

function setObjectMatrix (object: Object3D, matrix: Matrix4) {
  object.matrix.copy(matrix)
  object.matrix.decompose(object.position, object.quaternion, object.scale)
  object.matrixWorldNeedsUpdate = true
}

export type BufferTypes = 'picking'|'background'
export type BufferMaterials = 'material'|'wireframeMaterial'|'pickingMaterial'

export interface _BufferAttribute {
  type: 'f'|'v2'|'v3'|'c'
  value?: NumberArray
}

export type Uniforms = { [k: string]: Uniform|{ value: any } }

export const BufferDefaultParameters = {
  opaqueBack: false,
  side: 'double' as BufferSide,  // which triangle sides to render
  opacity: 1.0,  // translucency: 1 is fully opaque, 0 is fully transparent
  depthWrite: true,
  clipNear: 0, // position of camera near/front clipping plane in percent of scene bounding box
  clipRadius: 0,
  clipCenter: new Vector3(),
  flatShaded: false,  // render flat shaded
  wireframe: false,  // render as wireframe
  roughness: 0.4,  // how rough the material is, between 0 and 1
  metalness: 0.0,  // how metallic the material is, between 0 and 1
  diffuse: 0xffffff,  // diffuse color for lighting
  diffuseInterior: false,
  useInteriorColor: false,  // render back-side with interior color
  interiorColor: 0xdddddd,  // interior color
  interiorDarkening: 0,  // interior darkening factor
  forceTransparent: false,  // force the material to allow transparency
  matrix: new Matrix4(),  // additional transformation matrix
  disablePicking: false,  // disable picking
  sortParticles: false,
  background: false
}
export type BufferParameters = typeof BufferDefaultParameters

export const BufferParameterTypes = {
  opaqueBack: { updateShader: true },
  side: { updateShader: true, property: true },
  opacity: { uniform: true },
  depthWrite: { property: true },
  clipNear: { updateShader: true, property: true },
  clipRadius: { updateShader: true, uniform: true },
  clipCenter: { uniform: true },
  flatShaded: { updateShader: true },
  background: { updateShader: true },
  wireframe: { updateVisibility: true },
  roughness: { uniform: true },
  metalness: { uniform: true },
  diffuse: { uniform: true },
  diffuseInterior: { updateShader: true },
  useInteriorColor: { updateShader: true },
  interiorColor: { uniform: true },
  interiorDarkening: { uniform: true },
  matrix: {}
}

export interface BufferData {
  position?: Float32Array
  position1?: Float32Array  // TODO
  color?: Float32Array
  index?: Uint32Array|Uint16Array
  normal?: Float32Array

  picking?: Picker
  primitiveId?: Float32Array
}

/**
 * Buffer class. Base class for buffers.
 * @interface
 */
class Buffer {
  parameterTypes = BufferParameterTypes
  get defaultParameters() { return BufferDefaultParameters }
  parameters: BufferParameters
  uniforms: Uniforms
  pickingUniforms: Uniforms

  private _positionDataSize: number

  geometry = new BufferGeometry()
  indexVersion = 0
  wireframeIndexVersion = -1
  group = new Group()
  wireframeGroup = new Group()
  pickingGroup = new Group()

  vertexShader = ''
  fragmentShader = ''
  isImpostor = false
  isText = false
  isSurface = false
  isPoint = false
  isLine = false
  dynamic = true
  visible = true

  picking?: Picker

  material: ShaderMaterial
  wireframeMaterial: ShaderMaterial
  pickingMaterial: ShaderMaterial

  wireframeIndex?: Uint32Array|Uint16Array
  wireframeIndexCount = 0
  wireframeGeometry?: BufferGeometry

  /**
   * @param {Object} data - attribute object
   * @param {Float32Array} data.position - positions
   * @param {Float32Array} data.color - colors
   * @param {Uint32Array|Uint16Array} data.index - triangle indices
   * @param {Picker} [data.picking] - picking ids
   * @param {BufferParameters} params - parameters object
   */
  constructor (data: BufferData, params: Partial<BufferParameters> = {}) {
    this.parameters = createParams(params, this.defaultParameters)

    this.uniforms = UniformsUtils.merge([
      UniformsLib.common,
      {
        fogColor: { value: new Color(0x000000) },
        fogNear: { value: 0.0 },
        fogFar: { value: 0.0 },
        opacity: { value: this.parameters.opacity },
        clipNear: { value: 0.0 },
        clipRadius: { value: this.parameters.clipRadius },
        clipCenter: { value: this.parameters.clipCenter }
      },
      {
        emissive: { value: new Color(0x000000) },
        roughness: { value: this.parameters.roughness },
        metalness: { value: this.parameters.metalness },
        interiorColor: { value: new Color(this.parameters.interiorColor) },
        interiorDarkening: { value: this.parameters.interiorDarkening },
      },
      UniformsLib.lights
    ])

    this.uniforms.diffuse.value.set(this.parameters.diffuse)

    this.pickingUniforms = {
      clipNear: { value: 0.0 },
      objectId: { value: 0 },
      opacity: { value: this.parameters.opacity }
    }

    //

    const position = data.position || data.position1
    this._positionDataSize = position ? position.length / 3 : 0

    if (!data.primitiveId) {
      data.primitiveId = serialArray(this._positionDataSize)
    }

    this.addAttributes({
      position: { type: 'v3', value: data.position },
      color: { type: 'c', value: data.color },
      primitiveId: { type: 'f', value: data.primitiveId }
    })

    if (params.matrix) {
      this.matrix = params.matrix
    }

    if (data.index) {
      this.initIndex(data.index)
    }
    this.picking = data.picking

    this.makeWireframeGeometry()
  }

  set matrix (m) {
    this.setMatrix(m)
  }
  get matrix () {
    return this.group.matrix.clone()
  }

  get transparent () {
    return this.parameters.opacity < 1 || this.parameters.forceTransparent
  }

  get size () {
    return this._positionDataSize
  }

  get attributeSize () {
    return this.size
  }

  get pickable () {
    return !!this.picking && !this.parameters.disablePicking
  }

  setMatrix (m: Matrix4) {
    setObjectMatrix(this.group, m)
    setObjectMatrix(this.wireframeGroup, m)
    setObjectMatrix(this.pickingGroup, m)
  }

  initIndex (index: Uint32Array|Uint16Array) {
    this.geometry.setIndex(
      new BufferAttribute(index, 1)
    )
    const nindex = this.geometry.getIndex();
    if (!nindex) { Log.error('Index is null'); return; }
    nindex.setUsage(this.dynamic ? WebGLRenderingContext.DYNAMIC_DRAW : 0)
  }

  makeMaterial () {
    const side = getThreeSide(this.parameters.side)

    const m = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: '',
      fragmentShader: '',
      depthTest: true,
      transparent: this.transparent,
      depthWrite: this.parameters.depthWrite,
      lights: true,
      fog: true,
      side: side
    })
    m.vertexColors = true
    m.extensions.derivatives = true
    m.extensions.fragDepth = this.isImpostor

    const wm = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: '',
      fragmentShader: '',
      depthTest: true,
      transparent: this.transparent,
      depthWrite: this.parameters.depthWrite,
      lights: false,
      fog: true,
      side: side
    })
    wm.vertexColors = true

    const pm = new ShaderMaterial({
      uniforms: this.pickingUniforms,
      vertexShader: '',
      fragmentShader: '',
      depthTest: true,
      transparent: false,
      depthWrite: this.parameters.depthWrite,
      lights: false,
      fog: false,
      side: side,
      blending: NoBlending
    })
    pm.vertexColors = true
    pm.extensions.fragDepth = this.isImpostor

    ;(m as any).clipNear = this.parameters.clipNear
    ;(wm as any).clipNear = this.parameters.clipNear
    ;(pm as any).clipNear = this.parameters.clipNear

    this.material = m
    this.wireframeMaterial = wm
    this.pickingMaterial = pm

    // also sets vertexShader/fragmentShader
    this.updateShader()
  }

  makeWireframeGeometry () {
    this.makeWireframeIndex()

    const geometry = this.geometry
    const wireframeIndex = this.wireframeIndex
    const wireframeGeometry = new BufferGeometry()

    wireframeGeometry.attributes = geometry.attributes
    if (wireframeIndex) {
      wireframeGeometry.setIndex(
        new BufferAttribute(wireframeIndex, 1).setUsage(this.dynamic ? WebGLRenderingContext.DYNAMIC_DRAW : 0)
      )
      wireframeGeometry.setDrawRange(0, this.wireframeIndexCount)
    }

    this.wireframeGeometry = wireframeGeometry
  }

  makeWireframeIndex () {
    const edges: number[][] = []

    function checkEdge (a: number, b: number) {
      if (a > b) {
        const tmp = a
        a = b
        b = tmp
      }

      const list = edges[ a ]

      if (list === undefined) {
        edges[ a ] = [ b ]
        return true
      } else if (!list.includes(b)) {
        list.push(b)
        return true
      }

      return false
    }

    const geometry = this.geometry
    const index = geometry.index

    if (!this.parameters.wireframe) {
      this.wireframeIndex = new Uint16Array(0)
      this.wireframeIndexCount = 0
    } else if (index) {
      const array = index.array
      let n = array.length
      if (geometry.drawRange.count !== Infinity) {
        n = geometry.drawRange.count
      }
      let wireframeIndex
      if (this.wireframeIndex && this.wireframeIndex.length > n * 2) {
        wireframeIndex = this.wireframeIndex
      } else {
        const count = (geometry.attributes as any).position.count  // TODO
        wireframeIndex = getUintArray(n * 2, count)
      }

      let j = 0
      edges.length = 0

      for (let i = 0; i < n; i += 3) {
        const a = array[ i + 0 ]
        const b = array[ i + 1 ]
        const c = array[ i + 2 ]

        if (checkEdge(a, b)) {
          wireframeIndex[ j + 0 ] = a
          wireframeIndex[ j + 1 ] = b
          j += 2
        }
        if (checkEdge(b, c)) {
          wireframeIndex[ j + 0 ] = b
          wireframeIndex[ j + 1 ] = c
          j += 2
        }
        if (checkEdge(c, a)) {
          wireframeIndex[ j + 0 ] = c
          wireframeIndex[ j + 1 ] = a
          j += 2
        }
      }

      this.wireframeIndex = wireframeIndex
      this.wireframeIndexCount = j
      this.wireframeIndexVersion = this.indexVersion
    } else {
      const n = (geometry.attributes as any).position.count  // TODO

      let wireframeIndex
      if (this.wireframeIndex && this.wireframeIndex.length > n * 2) {
        wireframeIndex = this.wireframeIndex
      } else {
        wireframeIndex = getUintArray(n * 2, n)
      }

      for (let i = 0, j = 0; i < n; i += 3) {
        wireframeIndex[ j + 0 ] = i
        wireframeIndex[ j + 1 ] = i + 1
        wireframeIndex[ j + 2 ] = i + 1
        wireframeIndex[ j + 3 ] = i + 2
        wireframeIndex[ j + 4 ] = i + 2
        wireframeIndex[ j + 5 ] = i

        j += 6
      }

      this.wireframeIndex = wireframeIndex
      this.wireframeIndexCount = n * 2
      this.wireframeIndexVersion = this.indexVersion
    }
  }

  updateWireframeIndex () {
    if (!this.wireframeGeometry || !this.wireframeIndex) return

    this.wireframeGeometry.setDrawRange(0, Infinity)
    if (this.wireframeIndexVersion < this.indexVersion) this.makeWireframeIndex()

    if (this.wireframeGeometry.index &&
        this.wireframeIndex.length > this.wireframeGeometry.index.array.length) {
      this.wireframeGeometry.setIndex(
        new BufferAttribute(this.wireframeIndex, 1).setUsage(this.dynamic ? WebGLRenderingContext.DYNAMIC_DRAW : 0)
      )
    } else {
      const index = this.wireframeGeometry.getIndex()
      if (!index) { Log.error('Index is null'); return; }
      index.set(this.wireframeIndex)
      index.needsUpdate = this.wireframeIndexCount > 0
      index.updateRange.count = this.wireframeIndexCount
    }

    this.wireframeGeometry.setDrawRange(0, this.wireframeIndexCount)
  }

  getRenderOrder () {
    let renderOrder = 0

    if (this.isText) {
      renderOrder = 1
    } else if (this.transparent) {
      if (this.isSurface) {
        renderOrder = 3
      } else {
        renderOrder = 2
      }
    }

    return renderOrder
  }

  _getMesh (materialName: BufferMaterials) {
    if (!this.material) this.makeMaterial()

    const g = this.geometry
    const m = this[ materialName ]

    let mesh

    if (this.isLine) {
      mesh = new LineSegments(g, m)
    } else if (this.isPoint) {
      mesh = new Points(g, m)
    } else {
      mesh = new Mesh(g, m)
    }

    mesh.frustumCulled = false
    mesh.renderOrder = this.getRenderOrder()

    return mesh
  }

  getMesh () {
    return this._getMesh('material')
  }

  getWireframeMesh () {
    let mesh

    if (!this.material) this.makeMaterial()
    if (!this.wireframeGeometry) this.makeWireframeGeometry()

    mesh = new LineSegments(
      this.wireframeGeometry, this.wireframeMaterial
    )

    mesh.frustumCulled = false
    mesh.renderOrder = this.getRenderOrder()

    return mesh
  }

  getPickingMesh () {
    return this._getMesh('pickingMaterial')
  }

  getShader (name: string, type?: BufferTypes) {
    return getShader(name, this.getDefines(type))
  }

  getVertexShader (type?: BufferTypes) {
    return this.getShader(this.vertexShader, type)
  }

  getFragmentShader (type?: BufferTypes) {
    return this.getShader(this.fragmentShader, type)
  }

  getDefines (type?: BufferTypes) {
    const defines: ShaderDefines = {}

    if (this.parameters.clipNear) {
      defines.NEAR_CLIP = 1
    }

    if (this.parameters.clipRadius) {
      defines.RADIUS_CLIP = 1
    }

    if (type === 'picking') {
      defines.PICKING = 1
    } else {
      if (type === 'background' || this.parameters.background) {
        defines.NOLIGHT = 1
      }
      if (this.parameters.flatShaded) {
        defines.FLAT_SHADED = 1
      }
      if (this.parameters.opaqueBack) {
        defines.OPAQUE_BACK = 1
      }
      if (this.parameters.diffuseInterior) {
        defines.DIFFUSE_INTERIOR = 1
      }
      if (this.parameters.useInteriorColor) {
        defines.USE_INTERIOR_COLOR = 1
      }
    }

    return defines
  }

  getParameters () {
    return this.parameters
  }

  addUniforms (uniforms: Uniforms) {
    this.uniforms = UniformsUtils.merge(
      [ this.uniforms, uniforms ]
    )

    this.pickingUniforms = UniformsUtils.merge(
      [ this.pickingUniforms, uniforms ]
    )
  }

  addAttributes (attributes: { [k: string]: _BufferAttribute }) {
    for (let name in attributes) {
      let buf
      const a = attributes[ name ]
      const arraySize = this.attributeSize * itemSize[ a.type ]

      if (a.value) {
        if (arraySize !== a.value.length) {
          Log.error('attribute value has wrong length', name)
        }
        buf = a.value
      } else {
        buf = getTypedArray('float32', arraySize)
      }

      this.geometry.setAttribute(
        name,
        new BufferAttribute(buf, itemSize[ a.type ]).setUsage(this.dynamic ? WebGLRenderingContext.DYNAMIC_DRAW : 0)
      )
    }
  }

  updateRenderOrder () {
    const renderOrder = this.getRenderOrder()
    function setRenderOrder (mesh: Object3D) {
      mesh.renderOrder = renderOrder
    }

    this.group.children.forEach(setRenderOrder)
    if (this.pickingGroup) {
      this.pickingGroup.children.forEach(setRenderOrder)
    }
  }

  updateShader () {
    const m = this.material
    const wm = this.wireframeMaterial
    const pm = this.pickingMaterial

    m.vertexShader = this.getVertexShader()
    m.fragmentShader = this.getFragmentShader()
    m.needsUpdate = true

    wm.vertexShader = this.getShader('Line.vert')
    wm.fragmentShader = this.getShader('Line.frag')
    wm.needsUpdate = true

    pm.vertexShader = this.getVertexShader('picking')
    pm.fragmentShader = this.getFragmentShader('picking')
    pm.needsUpdate = true
  }

  /**
   * Set buffer parameters
   * @param {BufferParameters} params - buffer parameters object
   * @return {undefined}
   */
  setParameters (params: Partial<BufferParameters>) {
    const p = params as any
    const pt = this.parameterTypes as any
    const pv = this.parameters as any

    const propertyData: { [k: string]: any } = {}
    const uniformData: { [k: string]: any } = {}
    let doShaderUpdate = false
    let doVisibilityUpdate = false

    for (const name in p) {
      const value = p[ name ]

      if (value === undefined) continue
      pv[ name ] = value

      if (pt[ name ] === undefined) continue

      if (pt[ name ].property) {
        if (pt[ name ].property !== true) {
          propertyData[ pt[ name ].property as any ] = value
        } else {
          propertyData[ name ] = value
        }
      }

      if (pt[ name ].uniform) {
        if (pt[ name ].uniform !== true) {
          uniformData[ pt[ name ].uniform as any ] = value
        } else {
          uniformData[ name ] = value
        }
      }

      if (pt[ name ].updateShader) {
        doShaderUpdate = true
      }

      if (pt[ name ].updateVisibility) {
        doVisibilityUpdate = true
      }

      if (this.dynamic && name === 'wireframe' && value === true) {
        this.updateWireframeIndex()
      }

      if (name === 'forceTransparent') {
        propertyData.transparent = this.transparent
      }

      if (name === 'matrix') {
        this.matrix = value
      }
    }

    this.setProperties(propertyData)
    this.setUniforms(uniformData)
    if (doShaderUpdate) this.updateShader()
    if (doVisibilityUpdate) this.setVisibility(this.visible)
  }

  /**
   * Sets buffer attributes
   * @param {Object} data - An object where the keys are the attribute names
   *      and the values are the attribute data.
   * @example
   * var buffer = new Buffer();
   * buffer.setAttributes({ attrName: attrData });
   */
  setAttributes (data: any) {  // TODO
    const geometry = this.geometry
    const attributes = geometry.attributes as any  // TODO

    for (const name in data) {
      if (name === 'picking') continue

      const array = data[ name ]
      const length = array.length

      if (name === 'index') {
        const index = geometry.getIndex()
        if (!index) { Log.error('Index is null'); continue; }
        geometry.setDrawRange(0, Infinity)

        if (length > index.array.length) {
          geometry.setIndex(
            new BufferAttribute(array, 1)
              .setUsage(this.dynamic ? WebGLRenderingContext.DYNAMIC_DRAW : 0)
          )
        } else {
          index.set(array)
          index.count = length
          index.needsUpdate = length > 0
          index.updateRange.count = length
          geometry.setDrawRange(0, length)
        }

        this.indexVersion++
        if (this.parameters.wireframe) this.updateWireframeIndex()
      } else {
        const attribute = attributes[ name ]

        if (length > attribute.array.length) {
          geometry.setAttribute(
            name,
            new BufferAttribute(array, attribute.itemSize)
              .setUsage(this.dynamic ? WebGLRenderingContext.DYNAMIC_DRAW : 0)
          )
        } else {
          attributes[ name ].set(array)
          attributes[ name ].needsUpdate = length > 0
          attributes[ name ].updateRange.count = length
        }
      }
    }
  }

  setUniforms (data: any) {  // TODO
    if (!data) return

    const u = this.material.uniforms
    const wu = this.wireframeMaterial.uniforms
    const pu = this.pickingMaterial.uniforms

    for (let name in data) {
      if (name === 'opacity') {
        this.setProperties({ transparent: this.transparent })
      }

      if (u[ name ] !== undefined) {
        if (u[ name ].value.isVector3) {
          u[ name ].value.copy(data[ name ])
        } else if (u[ name ].value.set) {
          u[ name ].value.set(data[ name ])
        } else {
          u[ name ].value = data[ name ]
        }
      }

      if (wu[ name ] !== undefined) {
        if (wu[ name ].value.isVector3) {
          wu[ name ].value.copy(data[ name ])
        } else if (wu[ name ].value.set) {
          wu[ name ].value.set(data[ name ])
        } else {
          wu[ name ].value = data[ name ]
        }
      }

      if (pu[ name ] !== undefined) {
        if (pu[ name ].value.isVector3) {
          pu[ name ].value.copy(data[ name ])
        } else if (pu[ name ].value.set) {
          pu[ name ].value.set(data[ name ])
        } else {
          pu[ name ].value = data[ name ]
        }
      }
    }
  }

  setProperties (data: any) {  // TODO
    if (!data) return

    const m = this.material
    const wm = this.wireframeMaterial
    const pm = this.pickingMaterial

    for (const _name in data) {
      const name = _name as 'side'|'transparent'  // TODO

      let value = data[ name ]

      if (name === 'transparent') {
        this.updateRenderOrder()
      } else if (name === 'side') {
        value = getThreeSide(value)
      }

      (m[ name ] as any) = value;
      (wm[ name ] as any) = value;
      (pm[ name ] as any) = value
    }

    m.needsUpdate = true
    wm.needsUpdate = true
    pm.needsUpdate = true
  }

  /**
   * Set buffer visibility
   * @param {Boolean} value - visibility value
   * @return {undefined}
   */
  setVisibility (value: boolean) {
    this.visible = value

    if (this.parameters.wireframe) {
      this.group.visible = false
      this.wireframeGroup.visible = value
      if (this.pickable) {
        this.pickingGroup.visible = false
      }
    } else {
      this.group.visible = value
      this.wireframeGroup.visible = false
      if (this.pickable) {
        this.pickingGroup.visible = value
      }
    }
  }

  /**
   * Free buffer resources
   * @return {undefined}
   */
  dispose () {
    if (this.material) this.material.dispose()
    if (this.wireframeMaterial) this.wireframeMaterial.dispose()
    if (this.pickingMaterial) this.pickingMaterial.dispose()

    this.geometry.dispose()
    if (this.wireframeGeometry) this.wireframeGeometry.dispose()
  }

  /**
   * Customize JSON serialization to avoid circular references
   */
  toJSON () {
    var result: any = {};
    for (var x in this) {
      if (x !== "group" && x !== "wireframeGroup" && x != "pickingGroup"
         && x !== "picking") {
        result[x] = this[x];
      }
    }
    return result;
  }
}

export default Buffer
