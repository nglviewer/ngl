/**
 * @file Point Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { DataTexture } from '../../lib/three.es6.js'

import '../shader/Point.vert'
import '../shader/Point.frag'

import { defaults } from '../utils.js'
import { serialArray } from '../math/array-utils.js'
import { smoothstep } from '../math/math-utils.js'
import Buffer from './buffer.js'

function distance (x0, y0, x1, y1) {
  var dx = x1 - x0
  var dy = y1 - y0
  return Math.sqrt(dx * dx + dy * dy)
}

function makePointTexture (params) {
  const p = params || {}

  const width = defaults(p.width, 256)
  const height = defaults(p.height, 256)
  const center = [ width / 2, height / 2 ]
  const radius = Math.min(width / 2, height / 2)
  const delta = defaults(p.delta, 1 / (radius + 1)) * radius

  let x = 0
  let y = 0
  const data = new Uint8Array(width * height * 4)

  for (let i = 0, il = data.length; i < il; i += 4) {
    const dist = distance(x, y, center[ 0 ], center[ 1 ])
    const value = 1 - smoothstep(radius - delta, radius, dist)

    data[ i ] = value * 255
    data[ i + 1 ] = value * 255
    data[ i + 2 ] = value * 255
    data[ i + 3 ] = value * 255

    if (++x === width) {
      x = 0
      y++
    }
  }

  const tex = new DataTexture(data, width, height)
  tex.needsUpdate = true

  return tex
}

/**
 * Point buffer. Draws points. Optionally textured.
 *
 * @example
 * var pointBuffer = new PointBuffer( {
 *     position: new Float32Array( [ 0, 0, 0 ] ),
 *     color: new Float32Array( [ 1, 0, 0 ] )
 * } );
 */
class PointBuffer extends Buffer {
  /**
   * @param  {Object} data - attribute object
   * @param  {Float32Array} data.position - positions
   * @param  {Float32Array} data.color - colors
   * @param  {BufferParameters} params - parameter object
   */
  constructor (data, params) {
    const d = data || {}
    const p = params || {}

    if (!d.primitiveId) {
      d.primitiveId = serialArray(d.position.length / 3)
    }

    super(d, p)

    this.pointSize = defaults(p.pointSize, 1)
    this.sizeAttenuation = defaults(p.sizeAttenuation, true)
    this.sortParticles = defaults(p.sortParticles, false)
    this.alphaTest = defaults(p.alphaTest, 0.5)
    this.useTexture = defaults(p.useTexture, false)
    this.forceTransparent = defaults(p.forceTransparent, false)
    this.edgeBleach = defaults(p.edgeBleach, 0.0)

    this.addUniforms({
      'size': { value: this.pointSize },
      'canvasHeight': { value: 1.0 },
      'pixelRatio': { value: 1.0 },
      'map': { value: null }
    })
  }

  get parameters () {
    return Object.assign({

      pointSize: { uniform: 'size' },
      sizeAttenuation: { updateShader: true },
      sortParticles: {},
      alphaTest: { updateShader: true },
      useTexture: { updateShader: true },
      forceTransparent: {},
      edgeBleach: { uniform: true }

    }, super.parameters)
  }

  makeMaterial () {
    super.makeMaterial()

    this.makeTexture()

    const m = this.material
    const wm = this.wireframeMaterial
    const pm = this.pickingMaterial

    m.uniforms.map.value = this.tex
    m.needsUpdate = true

    wm.uniforms.map.value = this.tex
    wm.needsUpdate = true

    pm.uniforms.map.value = this.tex
    pm.needsUpdate = true
  }

  makeTexture () {
    if (this.tex) this.tex.dispose()
    this.tex = makePointTexture({ delta: this.edgeBleach })
  }

  getDefines (type) {
    const defines = super.getDefines(type)

    if (this.sizeAttenuation) {
      defines.USE_SIZEATTENUATION = 1
    }

    if (this.useTexture) {
      defines.USE_MAP = 1
    }

    if (this.alphaTest > 0 && this.alphaTest <= 1) {
      defines.ALPHATEST = this.alphaTest.toPrecision(2)
    }

    return defines
  }

  setUniforms (data) {
    if (data && data.edgeBleach !== undefined) {
      this.makeTexture()
      data.map = this.tex
    }

    super.setUniforms(data)
  }

  dispose () {
    super.dispose()

    if (this.tex) this.tex.dispose()
  }

  get isPoint () { return true }
  get vertexShader () { return 'Point.vert' }
  get fragmentShader () { return 'Point.frag' }
}

export default PointBuffer
