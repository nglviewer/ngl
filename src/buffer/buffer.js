/**
 * @file Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import {
    Color, Vector3, Matrix4,
    FrontSide, BackSide, DoubleSide, VertexColors, NoBlending,
    BufferGeometry, BufferAttribute,
    UniformsUtils, UniformsLib,
    Group, LineSegments, Points, Mesh,
    ShaderMaterial
} from '../../lib/three.es6.js'

import { Log } from '../globals.js'
import { defaults, getTypedArray, getUintArray } from '../utils.js'
import { getShader } from '../shader/shader-utils.js'

/**
 * Buffer parameter object.
 * @typedef {Object} BufferParameters - buffer parameters
 * @property {Boolean} opaqueBack - render back-side opaque
 * @property {Boolean} dullInterior - render back-side with dull lighting
 * @property {String} side - which triangle sides to render, "front" front-side,
 *                            "back" back-side, "double" front- and back-side
 * @property {Float} opacity - translucency: 1 is fully opaque, 0 is fully transparent
 * @property {Boolean} depthWrite - depth write
 * @property {Integer} clipNear - position of camera near/front clipping plane
 *                                in percent of scene bounding box
 * @property {Boolean} flatShaded - render flat shaded
 * @property {Boolean} wireframe - render as wireframe
 * @property {Float} roughness - how rough the material is, between 0 and 1
 * @property {Float} metalness - how metallic the material is, between 0 and 1
 * @property {Color} diffuse - diffuse color for lighting
 * @property {Boolean} forceTransparent - force the material to allow transparency
 * @property {Matrix4} matrix - additional transformation matrix
 * @property {Boolean} disablePicking - disable picking
 */

function getThreeSide (side) {
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

function setObjectMatrix (object, matrix) {
  object.matrix.copy(matrix)
  object.matrix.decompose(object.position, object.quaternion, object.scale)
  object.matrixWorldNeedsUpdate = true
}

/**
 * Buffer class. Base class for buffers.
 * @interface
 */
class Buffer {
  /**
   * @param {Object} data - attribute object
   * @param {Float32Array} data.position - positions
   * @param {Float32Array} data.color - colors
   * @param {Float32Array} data.index - triangle indices
   * @param {Picker} [data.picking] - picking ids
   * @param {BufferParameters} params - parameters object
   */
  constructor (data, params) {
    const d = data || {}
    const p = params || {}

    this.opaqueBack = defaults(p.opaqueBack, false)
    this.dullInterior = defaults(p.dullInterior, false)
    this.side = defaults(p.side, 'double')
    this.opacity = defaults(p.opacity, 1.0)
    this.depthWrite = defaults(p.depthWrite, true)
    this.clipNear = defaults(p.clipNear, 0)
    this.clipRadius = defaults(p.clipRadius, 0)
    this.clipCenter = defaults(p.clipCenter, new Vector3())
    this.flatShaded = defaults(p.flatShaded, false)
    this.background = defaults(p.background, false)
    this.wireframe = defaults(p.wireframe, false)
    this.roughness = defaults(p.roughness, 0.4)
    this.metalness = defaults(p.metalness, 0.0)
    this.diffuse = defaults(p.diffuse, 0xffffff)
    this.forceTransparent = defaults(p.forceTransparent, false)
    this.disablePicking = defaults(p.disablePicking, false)

    this.geometry = new BufferGeometry()

    this.indexVersion = 0
    this.wireframeIndexVersion = -1

    this.uniforms = UniformsUtils.merge([
      UniformsLib.common,
      {
        fogColor: { value: null },
        fogNear: { value: 0.0 },
        fogFar: { value: 0.0 },
        opacity: { value: this.opacity },
        nearClip: { value: 0.0 },
        clipRadius: { value: this.clipRadius },
        clipCenter: { value: this.clipCenter }
      },
      {
        emissive: { value: new Color(0x000000) },
        roughness: { value: this.roughness },
        metalness: { value: this.metalness }
      },
      UniformsLib.ambient,
      UniformsLib.lights
    ])

    this.uniforms.diffuse.value.set(this.diffuse)

    this.pickingUniforms = {
      nearClip: { value: 0.0 },
      objectId: { value: 0 },
      opacity: { value: this.opacity }
    }

    this.group = new Group()
    this.wireframeGroup = new Group()
    this.pickingGroup = new Group()

    // requires Group objects to be present
    this.matrix = defaults(p.matrix, new Matrix4())

    //

    const position = d.position || d.position1
    this._positionDataSize = position ? position.length / 3 : 0

    this.addAttributes({
      position: { type: 'v3', value: d.position },
      color: { type: 'c', value: d.color },
      primitiveId: { type: 'f', value: d.primitiveId }
    })

    if (d.index) {
      this.initIndex(d.index)
    }
    this.picking = d.picking

    this.makeWireframeGeometry()
  }

  get parameters () {
    return {
      opaqueBack: { updateShader: true },
      dullInterior: { updateShader: true },
      side: { updateShader: true, property: true },
      opacity: { uniform: true },
      depthWrite: { property: true },
      clipNear: { updateShader: true, property: true },
      clipRadius: { updateShader: true, property: true, uniform: true },
      clipCenter: { uniform: true },
      flatShaded: { updateShader: true },
      background: { updateShader: true },
      wireframe: { updateVisibility: true },
      roughness: { uniform: true },
      metalness: { uniform: true },
      diffuse: { uniform: true },
      matrix: {}
    }
  }

  set matrix (m) {
    this.setMatrix(m)
  }
  get matrix () {
    return this.group.matrix.clone()
  }

  get transparent () {
    return this.opacity < 1 || this.forceTransparent
  }

  get size () {
    return this._positionDataSize
  }

  get attributeSize () {
    return this.size
  }

  get pickable () {
    return !!this.picking && !this.disablePicking
  }

  get dynamic () { return true }

  /**
   * @abstract
   */
  get vertexShader () {}

  /**
   * @abstract
   */
  get fragmentShader () {}

  setMatrix (m) {
    setObjectMatrix(this.group, m)
    setObjectMatrix(this.wireframeGroup, m)
    setObjectMatrix(this.pickingGroup, m)
  }

  initIndex (index) {
    this.geometry.setIndex(
            new BufferAttribute(index, 1)
        )
    this.geometry.getIndex().setDynamic(this.dynamic)
  }

  makeMaterial () {
    const side = getThreeSide(this.side)

    const m = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: '',
      fragmentShader: '',
      depthTest: true,
      transparent: this.transparent,
      depthWrite: this.depthWrite,
      lights: true,
      fog: true,
      side: side
    })
    m.vertexColors = VertexColors
    m.extensions.derivatives = this.flatShaded
    m.extensions.fragDepth = this.isImpostor
    m.clipNear = this.clipNear

    const wm = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: '',
      fragmentShader: '',
      depthTest: true,
      transparent: this.transparent,
      depthWrite: this.depthWrite,
      lights: false,
      fog: true,
      side: side
    })
    wm.vertexColors = VertexColors
    wm.clipNear = this.clipNear

    const pm = new ShaderMaterial({
      uniforms: this.pickingUniforms,
      vertexShader: '',
      fragmentShader: '',
      depthTest: true,
      transparent: false,
      depthWrite: this.depthWrite,
      lights: false,
      fog: false,
      side: side,
      blending: NoBlending
    })
    pm.vertexColors = VertexColors
    pm.extensions.fragDepth = this.isImpostor
    pm.clipNear = this.clipNear

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
                new BufferAttribute(wireframeIndex, 1)
                    .setDynamic(this.dynamic)
            )
      wireframeGeometry.setDrawRange(0, this.wireframeIndexCount)
    }

    this.wireframeGeometry = wireframeGeometry
  }

  makeWireframeIndex () {
    const edges = []

    function checkEdge (a, b) {
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

    if (!this.wireframe) {
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
        const count = geometry.attributes.position.count
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
      const n = geometry.attributes.position.count

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
    this.wireframeGeometry.setDrawRange(0, Infinity)
    if (this.wireframeIndexVersion < this.indexVersion) this.makeWireframeIndex()

    if (this.wireframeIndex.length > this.wireframeGeometry.index.array.length) {
      this.wireframeGeometry.setIndex(
        new BufferAttribute(this.wireframeIndex, 1).setDynamic(this.dynamic)
      )
    } else {
      const index = this.wireframeGeometry.getIndex()
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

  _getMesh (materialName) {
    if (!this.material) this.makeMaterial()

    const g = this.geometry
    const m = this[ materialName ]

    let mesh

    if (this.isLine) {
      mesh = new LineSegments(g, m)
    } else if (this.isPoint) {
      mesh = new Points(g, m)
      if (this.sortParticles) mesh.sortParticles = true
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

  getShader (name, type) {
    return getShader(name, this.getDefines(type))
  }

  getVertexShader (type) {
    return this.getShader(this.vertexShader, type)
  }

  getFragmentShader (type) {
    return this.getShader(this.fragmentShader, type)
  }

  getDefines (type) {
    const defines = {}

    if (this.clipNear) {
      defines.NEAR_CLIP = 1
    }

    if (this.clipRadius) {
      defines.RADIUS_CLIP = 1
    }

    if (type === 'picking') {
      defines.PICKING = 1
    } else {
      if (type === 'background' || this.background) {
        defines.NOLIGHT = 1
      }
      if (this.flatShaded) {
        defines.FLAT_SHADED = 1
      }
      if (this.opaqueBack) {
        defines.OPAQUE_BACK = 1
      }
      if (this.dullInterior) {
        defines.DULL_INTERIOR = 1
      }
    }

    return defines
  }

  getParameters () {
    const params = {}

    for (let name in this.parameters) {
      params[ name ] = this[ name ]
    }

    return params
  }

  addUniforms (uniforms) {
    this.uniforms = UniformsUtils.merge(
      [ this.uniforms, uniforms ]
    )

    this.pickingUniforms = UniformsUtils.merge(
      [ this.pickingUniforms, uniforms ]
    )
  }

  addAttributes (attributes) {
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

      this.geometry.addAttribute(
        name,
        new BufferAttribute(buf, itemSize[ a.type ]).setDynamic(this.dynamic)
      )
    }
  }

  updateRenderOrder () {
    const renderOrder = this.getRenderOrder()
    function setRenderOrder (mesh) {
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
  setParameters (params) {
    if (!params) return

    const p = params
    const tp = this.parameters

    const propertyData = {}
    const uniformData = {}
    let doShaderUpdate = false
    let doVisibilityUpdate = false

    for (let name in p) {
      const value = p[ name ]

      if (value === undefined) continue
      if (tp[ name ] === undefined) continue

      this[ name ] = value

      if (tp[ name ].property) {
        if (tp[ name ].property !== true) {
          propertyData[ tp[ name ].property ] = value
        } else {
          propertyData[ name ] = value
        }
      }

      if (tp[ name ].uniform) {
        if (tp[ name ].uniform !== true) {
          uniformData[ tp[ name ].uniform ] = value
        } else {
          uniformData[ name ] = value
        }
      }

      if (tp[ name ].updateShader) {
        doShaderUpdate = true
      }

      if (tp[ name ].updateVisibility) {
        doVisibilityUpdate = true
      }

      if (this.dynamic && name === 'wireframe' && value === true) {
        this.updateWireframeIndex()
      }

      if (name === 'flatShaded') {
        this.material.extensions.derivatives = this.flatShaded
      }

      if (name === 'forceTransparent') {
        propertyData.transparent = this.transparent
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
  setAttributes (data) {
    const geometry = this.geometry
    const attributes = geometry.attributes

    for (let name in data) {
      if (name === 'picking') continue

      const array = data[ name ]
      const length = array.length

      if (name === 'index') {
        const index = geometry.getIndex()
        geometry.setDrawRange(0, Infinity)

        if (length > index.array.length) {
          geometry.setIndex(
            new BufferAttribute(array, 1).setDynamic(this.dynamic)
          )
        } else {
          index.set(array)
          index.needsUpdate = length > 0
          index.updateRange.count = length
          geometry.setDrawRange(0, length)
        }

        this.indexVersion++
        if (this.wireframe) this.updateWireframeIndex()
      } else {
        const attribute = attributes[ name ]

        if (length > attribute.array.length) {
          geometry.addAttribute(
            name,
            new BufferAttribute(array, attribute.itemSize)
              .setDynamic(this.dynamic)
          )
        } else {
          attributes[ name ].set(array)
          attributes[ name ].needsUpdate = length > 0
          attributes[ name ].updateRange.count = length
        }
      }
    }
  }

  setUniforms (data) {
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

  setProperties (data) {
    if (!data) return

    const m = this.material
    const wm = this.wireframeMaterial
    const pm = this.pickingMaterial

    for (let name in data) {
      let value = data[ name ]

      if (name === 'transparent') {
        this.updateRenderOrder()
      } else if (name === 'side') {
        value = getThreeSide(value)
      }

      if (m[ name ] !== undefined) {
        m[ name ] = value
      }

      if (wm[ name ] !== undefined) {
        wm[ name ] = value
      }

      if (pm[ name ] !== undefined) {
        pm[ name ] = value
      }
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
  setVisibility (value) {
    this.visible = value

    if (this.wireframe) {
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
}

export default Buffer
