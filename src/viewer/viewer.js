/**
 * @file Viewer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import {
  PerspectiveCamera, OrthographicCamera,
  Box3, Vector3, Matrix4, Color,
  WebGLRenderer, WebGLRenderTarget,
  NearestFilter, LinearFilter, AdditiveBlending,
  RGBAFormat, FloatType,
  // HalfFloatType,
  UnsignedByteType,
  ShaderMaterial,
  PlaneGeometry,
  Scene, Mesh, Group,
  Fog, SpotLight, AmbientLight,
  BufferGeometry, BufferAttribute,
  LineSegments
} from '../../lib/three.es6.js'

import '../shader/BasicLine.vert'
import '../shader/BasicLine.frag'
import '../shader/Quad.vert'
import '../shader/Quad.frag'

import {
  Debug, Log, WebglErrorMessage, Browser,
  setExtensionFragDepth, SupportsReadPixelsFloat, setSupportsReadPixelsFloat
} from '../globals.js'
import { degToRad } from '../math/math-utils.js'
import Stats from './stats.js'
import { getShader } from '../shader/shader-utils.js'
import { JitterVectors } from './viewer-constants.js'
import {
  makeImage as _makeImage, testTextureSupport,
  sortProjectedPosition, updateMaterialUniforms
} from './viewer-utils'

import Signal from '../../lib/signals.es6.js'

const pixelBufferFloat = new Float32Array(4)
const pixelBufferUint = new Uint8Array(4)

var tmpMatrix = new Matrix4()

function onBeforeRender (renderer, scene, camera, geometry, material/*, group */) {
  var u = material.uniforms
  var updateList = []

  if (u.objectId) {
    u.objectId.value = SupportsReadPixelsFloat ? this.id : this.id / 255
    updateList.push('objectId')
  }

  if (u.modelViewMatrixInverse || u.modelViewMatrixInverseTranspose ||
      u.modelViewProjectionMatrix || u.modelViewProjectionMatrixInverse
  ) {
    this.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, this.matrixWorld)
  }

  if (u.modelViewMatrixInverse) {
    u.modelViewMatrixInverse.value.getInverse(this.modelViewMatrix)
    updateList.push('modelViewMatrixInverse')
  }

  if (u.modelViewMatrixInverseTranspose) {
    if (u.modelViewMatrixInverse) {
      u.modelViewMatrixInverseTranspose.value.copy(
        u.modelViewMatrixInverse.value
      ).transpose()
    } else {
      u.modelViewMatrixInverseTranspose.value
        .getInverse(this.modelViewMatrix)
        .transpose()
    }
    updateList.push('modelViewMatrixInverseTranspose')
  }

  if (u.modelViewProjectionMatrix) {
    camera.updateProjectionMatrix()
    u.modelViewProjectionMatrix.value.multiplyMatrices(
      camera.projectionMatrix, this.modelViewMatrix
    )
    updateList.push('modelViewProjectionMatrix')
  }

  if (u.modelViewProjectionMatrixInverse) {
    if (u.modelViewProjectionMatrix) {
      tmpMatrix.copy(
        u.modelViewProjectionMatrix.value
      )
      u.modelViewProjectionMatrixInverse.value.getInverse(
        tmpMatrix
      )
    } else {
      camera.updateProjectionMatrix()
      tmpMatrix.multiplyMatrices(
        camera.projectionMatrix, this.modelViewMatrix
      )
      u.modelViewProjectionMatrixInverse.value.getInverse(
        tmpMatrix
      )
    }
    updateList.push('modelViewProjectionMatrixInverse')
  }

  if (updateList.length) {
    var materialProperties = renderer.properties.get(material)

    if (materialProperties.program) {
      var gl = renderer.getContext()
      var p = materialProperties.program
      gl.useProgram(p.program)
      var pu = p.getUniforms()

      updateList.forEach(function (name) {
        pu.setValue(gl, name, u[ name ].value)
      })
    }
  }
}

/**
 * Viewer class
 * @class
 * @param {String|Element} [idOrElement] - dom id or element
 */
function Viewer (idOrElement) {
  const signals = {
    ticked: new Signal()
  }

  let container
  if (typeof idOrElement === 'string') {
    container = document.getElementById(idOrElement)
  } else if (idOrElement instanceof window.Element) {
    container = idOrElement
  } else {
    container = document.createElement('div')
  }

  let width, height
  if (container === document.body) {
    width = window.innerWidth || 1
    height = window.innerHeight || 1
  } else {
    var box = container.getBoundingClientRect()
    width = box.width || 1
    height = box.height || 1
  }

  let rendering, renderPending, lastRenderedPicking, isStill
  let sampleLevel, cDist, bRadius

  let parameters
  initParams()

  let stats
  initStats()

  let perspectiveCamera, orthographicCamera, camera
  initCamera()

  let scene, pointLight, ambientLight
  let rotationGroup, translationGroup, modelGroup, pickingGroup, backgroundGroup, helperGroup
  initScene()

  let renderer  // , supportsHalfFloat
  let pickingTarget, sampleTarget, holdTarget
  let compositeUniforms, compositeMaterial, compositeCamera, compositeScene
  if (initRenderer() === false) {
    this.container = container
    Log.error('Viewer: could not initialize renderer')
    return
  }

  let boundingBoxMesh
  const boundingBox = new Box3()
  const boundingBoxSize = new Vector3()
  let boundingBoxLength = 0
  initHelper()

    // fog & background
  setBackground()
  setFog()

  const distVector = new Vector3()

  const info = {
    memory: {
      programs: 0,
      geometries: 0,
      textures: 0
    },
    render: {
      calls: 0,
      vertices: 0,
      faces: 0,
      points: 0
    }
  }

  function initParams () {
    parameters = {

      fogColor: new Color(0x000000),
      fogNear: 50,
      fogFar: 100,

      backgroundColor: new Color(0x000000),

      cameraType: 'perspective',
      cameraFov: 40,
      cameraZ: -80, // FIXME initial value should be automatically determined

      clipNear: 0,
      clipFar: 100,
      clipDist: 10,

      lightColor: new Color(0xdddddd),
      lightIntensity: 1.0,
      ambientColor: new Color(0xdddddd),
      ambientIntensity: 0.2,

      sampleLevel: 0

    }
  }

  function initCamera () {
    var lookAt = new Vector3(0, 0, 0)

    perspectiveCamera = new PerspectiveCamera(
      parameters.cameraFov, width / height
    )
    perspectiveCamera.position.z = parameters.cameraZ
    perspectiveCamera.lookAt(lookAt)

    orthographicCamera = new OrthographicCamera(
      width / -2, width / 2, height / 2, height / -2
    )
    orthographicCamera.position.z = parameters.cameraZ
    orthographicCamera.lookAt(lookAt)

    if (parameters.cameraType === 'orthographic') {
      camera = orthographicCamera
    } else {  // parameters.cameraType === "perspective"
      camera = perspectiveCamera
    }
    camera.updateProjectionMatrix()
  }

  function initRenderer () {
    const dpr = window.devicePixelRatio

    try {
      renderer = new WebGLRenderer({
        preserveDrawingBuffer: true,
        alpha: true,
        antialias: true
      })
    } catch (e) {
      container.innerHTML = WebglErrorMessage
      return false
    }
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height)
    renderer.autoClear = false
    renderer.sortObjects = true

    const gl = renderer.getContext()
    // console.log(gl.getContextAttributes().antialias)
    // console.log(gl.getParameter(gl.SAMPLES))

    setExtensionFragDepth(renderer.extensions.get('EXT_frag_depth'))
    renderer.extensions.get('OES_element_index_uint')

    setSupportsReadPixelsFloat(
      Browser !== 'Safari' && (
        (renderer.extensions.get('OES_texture_float') &&
          renderer.extensions.get('WEBGL_color_buffer_float')) ||
        (renderer.extensions.get('OES_texture_float') &&
          testTextureSupport(gl, gl.FLOAT))
      )
    )

    container.appendChild(renderer.domElement)

    const dprWidth = width * dpr
    const dprHeight = height * dpr

    // picking texture

    renderer.extensions.get('OES_texture_float')
    // supportsHalfFloat = (
    //   renderer.extensions.get('OES_texture_half_float') &&
    //   testTextureSupport(gl, 0x8D61)
    // )
    renderer.extensions.get('WEBGL_color_buffer_float')

    pickingTarget = new WebGLRenderTarget(
      dprWidth, dprHeight,
      {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        stencilBuffer: false,
        format: RGBAFormat,
        type: SupportsReadPixelsFloat ? FloatType : UnsignedByteType
      }
    )
    pickingTarget.texture.generateMipmaps = false

    // workaround to reset the gl state after using testTextureSupport
    // fixes some bug where nothing is rendered to the canvas
    // when animations are started on page load
    renderer.clearTarget(pickingTarget)
    renderer.setRenderTarget(null)

    // ssaa textures

    sampleTarget = new WebGLRenderTarget(
      dprWidth, dprHeight,
      {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat
      }
    )

    holdTarget = new WebGLRenderTarget(
      dprWidth, dprHeight,
      {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: UnsignedByteType
        // using HalfFloatType or FloatType does not work on some Chrome 61 installations
        // type: supportsHalfFloat ? HalfFloatType : (
        //   SupportsReadPixelsFloat ? FloatType : UnsignedByteType
        // )
      }
    )

    compositeUniforms = {
      'tForeground': { type: 't', value: null },
      'scale': { type: 'f', value: 1.0 }
    }

    compositeMaterial = new ShaderMaterial({
      uniforms: compositeUniforms,
      vertexShader: getShader('Quad.vert'),
      fragmentShader: getShader('Quad.frag'),
      premultipliedAlpha: true,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false
    })

    compositeCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    compositeScene = new Scene().add(new Mesh(
      new PlaneGeometry(2, 2), compositeMaterial
    ))
  }

  function initScene () {
    if (!scene) {
      scene = new Scene()
    }

    rotationGroup = new Group()
    rotationGroup.name = 'rotationGroup'
    scene.add(rotationGroup)

    translationGroup = new Group()
    translationGroup.name = 'translationGroup'
    rotationGroup.add(translationGroup)

    modelGroup = new Group()
    modelGroup.name = 'modelGroup'
    translationGroup.add(modelGroup)

    pickingGroup = new Group()
    pickingGroup.name = 'pickingGroup'
    translationGroup.add(pickingGroup)

    backgroundGroup = new Group()
    backgroundGroup.name = 'backgroundGroup'
    translationGroup.add(backgroundGroup)

    helperGroup = new Group()
    helperGroup.name = 'helperGroup'
    translationGroup.add(helperGroup)

        // fog

    scene.fog = new Fog()

        // light

    pointLight = new SpotLight(
      parameters.lightColor, parameters.lightIntensity
    )
    scene.add(pointLight)

    ambientLight = new AmbientLight(
      parameters.ambientLight, parameters.ambientIntensity
    )
    scene.add(ambientLight)
  }

  function initHelper () {
    var indices = new Uint16Array([
      0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6,
      6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7
    ])
    var positions = new Float32Array(8 * 3)

    var bbGeometry = new BufferGeometry()
    bbGeometry.setIndex(new BufferAttribute(indices, 1))
    bbGeometry.addAttribute('position', new BufferAttribute(positions, 3))
    var bbMaterial = new ShaderMaterial({
      uniforms: { 'uColor': { value: new Color('skyblue') } },
      vertexShader: getShader('BasicLine.vert'),
      fragmentShader: getShader('BasicLine.frag'),
      linewidth: 2
    })

    boundingBoxMesh = new LineSegments(bbGeometry, bbMaterial)
    helperGroup.add(boundingBoxMesh)
  }

  function updateHelper () {
    var position = boundingBoxMesh.geometry.attributes.position
    var array = position.array

    var min = boundingBox.min
    var max = boundingBox.max

    array[ 0 ] = max.x; array[ 1 ] = max.y; array[ 2 ] = max.z
    array[ 3 ] = min.x; array[ 4 ] = max.y; array[ 5 ] = max.z
    array[ 6 ] = min.x; array[ 7 ] = min.y; array[ 8 ] = max.z
    array[ 9 ] = max.x; array[ 10 ] = min.y; array[ 11 ] = max.z
    array[ 12 ] = max.x; array[ 13 ] = max.y; array[ 14 ] = min.z
    array[ 15 ] = min.x; array[ 16 ] = max.y; array[ 17 ] = min.z
    array[ 18 ] = min.x; array[ 19 ] = min.y; array[ 20 ] = min.z
    array[ 21 ] = max.x; array[ 22 ] = min.y; array[ 23 ] = min.z

    position.needsUpdate = true

    if (!boundingBox.isEmpty()) {
      boundingBoxMesh.geometry.computeBoundingSphere()
    }
  }

  function initStats () {
    stats = new Stats()
  }

  function add (buffer, instanceList) {
    // Log.time( "Viewer.add" );

    if (instanceList) {
      instanceList.forEach(function (instance) {
        addBuffer(buffer, instance)
      })
    } else {
      addBuffer(buffer)
    }

    if (buffer.background) {
      backgroundGroup.add(buffer.group)
      backgroundGroup.add(buffer.wireframeGroup)
    } else {
      modelGroup.add(buffer.group)
      modelGroup.add(buffer.wireframeGroup)
    }

    if (buffer.pickable) {
      pickingGroup.add(buffer.pickingGroup)
    }

    if (Debug) updateHelper()

    // Log.timeEnd( "Viewer.add" );
  }

  function addBuffer (buffer, instance) {
    // Log.time( "Viewer.addBuffer" );

    function setUserData (object) {
      if (object instanceof Group) {
        object.children.forEach(setUserData)
      } else {
        object.userData.buffer = buffer
        object.userData.instance = instance
        object.onBeforeRender = onBeforeRender
      }
    }

    var mesh = buffer.getMesh()
    if (instance) {
      mesh.applyMatrix(instance.matrix)
    }
    setUserData(mesh)
    buffer.group.add(mesh)

    var wireframeMesh = buffer.getWireframeMesh()
    if (instance) {
      // wireframeMesh.applyMatrix( instance.matrix );
      wireframeMesh.matrix.copy(mesh.matrix)
      wireframeMesh.position.copy(mesh.position)
      wireframeMesh.quaternion.copy(mesh.quaternion)
      wireframeMesh.scale.copy(mesh.scale)
    }
    setUserData(wireframeMesh)
    buffer.wireframeGroup.add(wireframeMesh)

    if (buffer.pickable) {
      var pickingMesh = buffer.getPickingMesh()
      if (instance) {
        // pickingMesh.applyMatrix( instance.matrix );
        pickingMesh.matrix.copy(mesh.matrix)
        pickingMesh.position.copy(mesh.position)
        pickingMesh.quaternion.copy(mesh.quaternion)
        pickingMesh.scale.copy(mesh.scale)
      }
      setUserData(pickingMesh)
      buffer.pickingGroup.add(pickingMesh)
    }

    if (instance) {
      updateBoundingBox(buffer.geometry, buffer.matrix, instance.matrix)
    } else {
      updateBoundingBox(buffer.geometry, buffer.matrix)
    }

    // Log.timeEnd( "Viewer.addBuffer" );
  }

  function remove (buffer) {
    translationGroup.children.forEach(function (group) {
      group.remove(buffer.group)
      group.remove(buffer.wireframeGroup)
    })

    if (buffer.pickable) {
      pickingGroup.remove(buffer.pickingGroup)
    }

    updateBoundingBox()
    if (Debug) updateHelper()

    // requestRender();
  }

  function updateBoundingBox (geometry, matrix, instanceMatrix) {
    function updateGeometry (geometry, matrix, instanceMatrix) {
      if (!geometry.boundingBox) {
        geometry.computeBoundingBox()
      }

      var geoBoundingBox = geometry.boundingBox.clone()

      if (matrix) {
        geoBoundingBox.applyMatrix4(matrix)
      }
      if (instanceMatrix) {
        geoBoundingBox.applyMatrix4(instanceMatrix)
      }

      if (geoBoundingBox.min.equals(geoBoundingBox.max)) {
        // mainly to give a single impostor geometry some volume
        // as it is only expanded in the shader on the GPU
        geoBoundingBox.expandByScalar(5)
      }

      boundingBox.union(geoBoundingBox)
    }

    function updateNode (node) {
      if (node.geometry !== undefined) {
        var matrix, instanceMatrix
        if (node.userData.buffer) {
          matrix = node.userData.buffer.matrix
        }
        if (node.userData.instance) {
          instanceMatrix = node.userData.instance.matrix
        }
        updateGeometry(node.geometry, matrix, instanceMatrix)
      }
    }

    if (geometry) {
      updateGeometry(geometry, matrix, instanceMatrix)
    } else {
      boundingBox.makeEmpty()
      modelGroup.traverse(updateNode)
      backgroundGroup.traverse(updateNode)
    }

    boundingBox.getSize(boundingBoxSize)
    boundingBoxLength = boundingBoxSize.length()
  }

  function getPickingPixels () {
    const n = width * height * 4
    const imgBuffer = SupportsReadPixelsFloat ? new Float32Array(n) : new Uint8Array(n)

    render(true)
    renderer.readRenderTargetPixels(
      pickingTarget, 0, 0, width, height, imgBuffer
    )

    return imgBuffer
  }

  function getImage (picking) {
    return new Promise(function (resolve) {
      if (picking) {
        const n = width * height * 4
        let imgBuffer = getPickingPixels()

        if (SupportsReadPixelsFloat) {
          const imgBuffer2 = new Uint8Array(n)
          for (let i = 0; i < n; ++i) {
            imgBuffer2[ i ] = Math.round(imgBuffer[ i ] * 255)
          }
          imgBuffer = imgBuffer2
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        const imgData = ctx.getImageData(0, 0, width, height)
        imgData.data.set(imgBuffer)
        ctx.putImageData(imgData, 0, 0)
        canvas.toBlob(resolve, 'image/png')
      } else {
        renderer.domElement.toBlob(resolve, 'image/png')
      }
    })
  }

  function makeImage (params) {
    return _makeImage(this, params)
  }

  function setLight (color, intensity, ambientColor, ambientIntensity) {
    var p = parameters

    if (color !== undefined) p.lightColor.set(color)
    if (intensity !== undefined) p.lightIntensity = intensity
    if (ambientColor !== undefined) p.ambientColor.set(ambientColor)
    if (ambientIntensity !== undefined) p.ambientIntensity = ambientIntensity

    requestRender()
  }

  function setFog (color, near, far) {
    var p = parameters

    if (color !== undefined) p.fogColor.set(color)
    if (near !== undefined) p.fogNear = near
    if (far !== undefined) p.fogFar = far

    requestRender()
  }

  function setBackground (color) {
    var p = parameters

    if (color) p.backgroundColor.set(color)

    setFog(p.backgroundColor)
    renderer.setClearColor(p.backgroundColor, 0)
    renderer.domElement.style.backgroundColor = p.backgroundColor.getStyle()

    requestRender()
  }

  function setSampling (level) {
    if (level !== undefined) {
      parameters.sampleLevel = level
      sampleLevel = level
    }

    requestRender()
  }

  function setCamera (type, fov) {
    var p = parameters

    if (type) p.cameraType = type
    if (fov) p.cameraFov = fov

    if (p.cameraType === 'orthographic') {
      if (camera !== orthographicCamera) {
        camera = orthographicCamera
        camera.position.copy(perspectiveCamera.position)
        camera.up.copy(perspectiveCamera.up)
        updateZoom()
      }
    } else {  // p.cameraType === "perspective"
      if (camera !== perspectiveCamera) {
        camera = perspectiveCamera
        camera.position.copy(orthographicCamera.position)
        camera.up.copy(orthographicCamera.up)
      }
    }

    perspectiveCamera.fov = p.cameraFov
    camera.updateProjectionMatrix()

    requestRender()
  }

  function setClip (near, far, dist) {
    var p = parameters

    if (near !== undefined) p.clipNear = near
    if (far !== undefined) p.clipFar = far
    if (dist !== undefined) p.clipDist = dist

    requestRender()
  }

  function setSize (_width, _height) {
    width = _width || 1
    height = _height || 1

    perspectiveCamera.aspect = width / height
    orthographicCamera.left = -width / 2
    orthographicCamera.right = width / 2
    orthographicCamera.top = height / 2
    orthographicCamera.bottom = -height / 2
    camera.updateProjectionMatrix()

    var dpr = window.devicePixelRatio

    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height)

    var dprWidth = width * dpr
    var dprHeight = height * dpr

    pickingTarget.setSize(dprWidth, dprHeight)
    sampleTarget.setSize(dprWidth, dprHeight)
    holdTarget.setSize(dprWidth, dprHeight)

    requestRender()
  }

  function handleResize () {
    if (container === document.body) {
      setSize(window.innerWidth, window.innerHeight)
    } else {
      var box = container.getBoundingClientRect()
      setSize(box.width, box.height)
    }
  }

  function updateInfo (reset) {
    var memory = info.memory
    var render = info.render

    if (reset) {
      memory.programs = 0
      memory.geometries = 0
      memory.textures = 0

      render.calls = 0
      render.vertices = 0
      render.faces = 0
      render.points = 0
    } else {
      var rInfo = renderer.info
      var rMemory = rInfo.memory
      var rRender = rInfo.render

      memory.programs = rMemory.programs
      memory.geometries = rMemory.geometries
      memory.textures = rMemory.textures

      render.calls += rRender.calls
      render.vertices += rRender.vertices
      render.faces += rRender.faces
      render.points += rRender.points
    }
  }

  function animate () {
    signals.ticked.dispatch(stats)
    var delta = window.performance.now() - stats.startTime

    if (delta > 500 && !isStill && sampleLevel < 3 && sampleLevel !== -1) {
      var currentSampleLevel = sampleLevel
      sampleLevel = 3
      renderPending = true
      render()
      isStill = true
      sampleLevel = currentSampleLevel
      if (Debug) Log.log('rendered still frame')
    }

    window.requestAnimationFrame(animate)
  }

  function pick (x, y) {
    x *= window.devicePixelRatio
    y *= window.devicePixelRatio

    let pid, instance, picker
    const pixelBuffer = SupportsReadPixelsFloat ? pixelBufferFloat : pixelBufferUint

    render(true)
    renderer.readRenderTargetPixels(
      pickingTarget, x, y, 1, 1, pixelBuffer
    )

    if (SupportsReadPixelsFloat) {
      pid =
        ((Math.round(pixelBuffer[0] * 255) << 16) & 0xFF0000) |
        ((Math.round(pixelBuffer[1] * 255) << 8) & 0x00FF00) |
        ((Math.round(pixelBuffer[2] * 255)) & 0x0000FF)
    } else {
      pid =
        (pixelBuffer[0] << 16) |
        (pixelBuffer[1] << 8) |
        (pixelBuffer[2])
    }

    const oid = Math.round(pixelBuffer[ 3 ])
    const object = pickingGroup.getObjectById(oid)
    if (object) {
      instance = object.userData.instance
      picker = object.userData.buffer.picking
    }

    // if( Debug ){
    //   const rgba = Array.apply( [], pixelBuffer );
    //   Log.log( pixelBuffer );
    //   Log.log(
    //     "picked color",
    //     rgba.map( c => { return c.toPrecision( 2 ) } )
    //   );
    //   Log.log( "picked pid", pid );
    //   Log.log( "picked oid", oid );
    //   Log.log( "picked object", object );
    //   Log.log( "picked instance", instance );
    //   Log.log( "picked position", x, y );
    //   Log.log( "devicePixelRatio", window.devicePixelRatio );
    // }

    return {
      'pid': pid,
      'instance': instance,
      'picker': picker
    }
  }

  function requestRender () {
    if (renderPending) {
      // Log.info("there is still a 'render' call pending")
      return
    }

    // start gathering stats anew after inactivity
    if (window.performance.now() - stats.startTime > 22) {
      stats.begin()
      isStill = false
    }

    renderPending = true

    window.requestAnimationFrame(function requestRenderAnimation () {
      render()
      stats.update()
    })
  }

  function updateZoom () {
    var fov = degToRad(perspectiveCamera.fov)
    var _height = 2 * Math.tan(fov / 2) * -camera.position.z
    orthographicCamera.zoom = height / _height
  }

  function __updateClipping () {
    var p = parameters

    // clipping

    // cDist = distVector.copy( camera.position )
    //           .sub( controls.target ).length();
    cDist = distVector.copy(camera.position).length()
    // console.log( "cDist", cDist )
    if (!cDist) {
      // recover from a broken (NaN) camera position
      camera.position.set(0, 0, p.cameraZ)
      cDist = Math.abs(p.cameraZ)
    }

    bRadius = Math.max(10, boundingBoxLength * 0.5)
    bRadius += boundingBox.getCenter(distVector).length()
    // console.log( "bRadius", bRadius )
    if (bRadius === Infinity || bRadius === -Infinity || isNaN(bRadius)) {
      // console.warn( "something wrong with bRadius" );
      bRadius = 50
    }

    var nearFactor = (50 - p.clipNear) / 50
    var farFactor = -(50 - p.clipFar) / 50
    camera.near = cDist - (bRadius * nearFactor)
    camera.far = cDist + (bRadius * farFactor)

    // fog

    var fogNearFactor = (50 - p.fogNear) / 50
    var fogFarFactor = -(50 - p.fogFar) / 50
    var fog = scene.fog
    fog.color.set(p.fogColor)
    fog.near = cDist - (bRadius * fogNearFactor)
    fog.far = cDist + (bRadius * fogFarFactor)

    if (camera.type === 'PerspectiveCamera') {
      camera.near = Math.max(0.1, p.clipDist, camera.near)
      camera.far = Math.max(1, camera.far)
      fog.near = Math.max(0.1, fog.near)
      fog.far = Math.max(1, fog.far)
    } else if (camera.type === 'OrthographicCamera') {
      if (p.clipNear === 0 && p.clipDist > 0 && cDist + camera.zoom > 2 * -p.clipDist) {
        camera.near += camera.zoom + p.clipDist
      }
    }
  }

  function __updateCamera () {
    camera.updateMatrix()
    camera.updateMatrixWorld(true)
    camera.matrixWorldInverse.getInverse(camera.matrixWorld)
    camera.updateProjectionMatrix()

    updateMaterialUniforms(scene, camera, renderer, cDist, bRadius)
    sortProjectedPosition(scene, camera)
  }

  function __setVisibility (model, picking, background, helper) {
    modelGroup.visible = model
    pickingGroup.visible = picking
    backgroundGroup.visible = background
    helperGroup.visible = helper
  }

  function __updateLights () {
    // distVector.copy( camera.position ).sub( controls.target )
    //   .setLength( boundingBoxLength * 100 );
    distVector.copy(camera.position).setLength(boundingBoxLength * 100)

    pointLight.position.copy(camera.position).add(distVector)
    pointLight.color.set(parameters.lightColor)
    pointLight.intensity = parameters.lightIntensity

    ambientLight.color.set(parameters.ambientColor)
    ambientLight.intensity = parameters.ambientIntensity
  }

  function __renderPickingGroup () {
    renderer.clearTarget(pickingTarget)
    __setVisibility(false, true, false, false)
    renderer.render(scene, camera, pickingTarget)
    updateInfo()
    renderer.setRenderTarget(null)  // back to standard render target

    // if( Debug ){
    //   __setVisibility( false, true, false, true );

    //   renderer.clear();
    //   renderer.render( scene, camera );
    // }
  }

  function __renderModelGroup (renderTarget) {
    if (renderTarget) {
      renderer.clearTarget(renderTarget)
    } else {
      renderer.clear()
    }

    __setVisibility(false, false, true, false)
    renderer.render(scene, camera, renderTarget)
    if (renderTarget) {
      renderer.clearTarget(renderTarget, false, true, false)
    } else {
      renderer.clearDepth()
    }
    updateInfo()

    __setVisibility(true, false, false, Debug)
    renderer.render(scene, camera, renderTarget)
    updateInfo()
  }

  function __renderSuperSample () {
    // based on the Supersample Anti-Aliasing Render Pass
    // contributed to three.js by bhouston / http://clara.io/
    //
    // This manual approach to SSAA re-renders the scene ones for
    // each sample with camera jitter and accumulates the results.
    // References: https://en.wikipedia.org/wiki/Supersampling

    var offsetList = JitterVectors[ Math.max(0, Math.min(sampleLevel, 5)) ]

    var baseSampleWeight = 1.0 / offsetList.length
    var roundingRange = 1 / 32

    compositeUniforms.tForeground.value = sampleTarget.texture

    var _width = sampleTarget.width
    var _height = sampleTarget.height

    // render the scene multiple times, each slightly jitter offset
    // from the last and accumulate the results.
    for (var i = 0; i < offsetList.length; ++i) {
      var offset = offsetList[ i ]
      camera.setViewOffset(
        _width, _height, offset[ 0 ], offset[ 1 ], _width, _height
      )
      __updateCamera()

      var sampleWeight = baseSampleWeight
      // the theory is that equal weights for each sample lead to an
      // accumulation of rounding errors.
      // The following equation varies the sampleWeight per sample
      // so that it is uniformly distributed across a range of values
      // whose rounding errors cancel each other out.
      var uniformCenteredDistribution = (-0.5 + (i + 0.5) / offsetList.length)
      sampleWeight += roundingRange * uniformCenteredDistribution
      compositeUniforms.scale.value = sampleWeight

      __renderModelGroup(sampleTarget)
      renderer.render(
        compositeScene, compositeCamera, holdTarget, (i === 0)
      )
    }

    compositeUniforms.scale.value = 1.0
    compositeUniforms.tForeground.value = holdTarget.texture

    renderer.render(compositeScene, compositeCamera, null, true)

    camera.view = null
  }

  function render (picking) {
    if (rendering) {
      Log.warn("'tried to call 'render' from within 'render'")
      return
    }

    // Log.time('Viewer.render')

    rendering = true

    __updateClipping()
    __updateCamera()
    __updateLights()

    // render

    updateInfo(true)

    if (picking) {
      if (!lastRenderedPicking) __renderPickingGroup()
    } else if (sampleLevel > 0) {
      __renderSuperSample()
    } else {
      __renderModelGroup()
    }
    lastRenderedPicking = picking

    rendering = false
    renderPending = false

    // Log.timeEnd('Viewer.render')
    // Log.log(info.memory, info.render)
  }

  function clear () {
    Log.log('scene cleared')
    scene.remove(rotationGroup)
    initScene()
    renderer.clear()
  }

  // API

  this.container = container
  this.stats = stats
  this.signals = signals

  this.rotationGroup = rotationGroup
  this.translationGroup = translationGroup

  this.add = add
  this.remove = remove
  this.clear = clear

  this.getPickingPixels = getPickingPixels
  this.getImage = getImage
  this.makeImage = makeImage

  this.setLight = setLight
  this.setFog = setFog
  this.setBackground = setBackground
  this.setSampling = setSampling
  this.setCamera = setCamera
  this.setClip = setClip
  this.setSize = setSize
  this.handleResize = handleResize

  this.pick = pick
  this.requestRender = requestRender
  this.render = render
  this.animate = animate
  this.updateZoom = updateZoom
  this.updateHelper = updateHelper

  this.renderer = renderer
  this.scene = scene
  this.perspectiveCamera = perspectiveCamera
  this.boundingBox = boundingBox
  this.updateBoundingBox = function () {
    updateBoundingBox()
    if (Debug) updateHelper()
  }

  Object.defineProperties(this, {
    camera: { get: function () { return camera } },
    width: { get: function () { return width } },
    height: { get: function () { return height } },
    sampleLevel: { get: function () { return sampleLevel } }
  })
}

Viewer.prototype.constructor = Viewer

export default Viewer
