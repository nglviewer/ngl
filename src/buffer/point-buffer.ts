/**
 * @file Point Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

// @ts-ignore: unused import Vector3, Matrix4 required for declaration only
import { DataTexture, Vector3, Matrix4 } from 'three'

import '../shader/Point.vert'
import '../shader/Point.frag'

import { BufferRegistry } from '../globals'
import { defaults } from '../utils'
import { smoothstep } from '../math/math-utils'
import Buffer, { BufferDefaultParameters, BufferParameterTypes, BufferData, BufferTypes } from './buffer'

function distance (x0: number, y0: number, x1: number, y1: number) {
  const dx = x1 - x0
  const dy = y1 - y0
  return Math.sqrt(dx * dx + dy * dy)
}

interface PointTextureParams {
  width?: number
  height?: number
  delta?: number
}

function makePointTexture (params: PointTextureParams) {
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

export const PointBufferDefaultParameters = Object.assign({
  pointSize: 1,
  sizeAttenuation: true,
  sortParticles: false,
  alphaTest: 0.5,
  useTexture: false,
  forceTransparent: false,
  edgeBleach: 0.0
}, BufferDefaultParameters)
export type PointBufferParameters = typeof PointBufferDefaultParameters

const PointBufferParameterTypes = Object.assign({
  pointSize: { uniform: 'size' },
  sizeAttenuation: { updateShader: true },
  sortParticles: {},
  alphaTest: { updateShader: true },
  useTexture: { updateShader: true },
  forceTransparent: {},
  edgeBleach: { uniform: true }
}, BufferParameterTypes)

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
  parameterTypes = PointBufferParameterTypes
  get defaultParameters() { return PointBufferDefaultParameters }
  parameters: PointBufferParameters

  vertexShader = 'Point.vert'
  fragmentShader ='Point.frag'

  isPoint = true
  tex: DataTexture

  /**
   * @param  {Object} data - attribute object
   * @param  {Float32Array} data.position - positions
   * @param  {Float32Array} data.color - colors
   * @param  {BufferParameters} params - parameter object
   */
  constructor (data: BufferData, params: Partial<PointBufferParameters> = {}) {
    super(data, params)

    this.addUniforms({
      'size': { value: this.parameters.pointSize },
      'canvasHeight': { value: 1.0 },
      'pixelRatio': { value: 1.0 },
      'map': { value: null }
    })
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
    this.tex = makePointTexture({ delta: this.parameters.edgeBleach })
  }

  getDefines (type?: BufferTypes) {
    const defines = super.getDefines(type)

    if (this.parameters.sizeAttenuation) {
      defines.USE_SIZEATTENUATION = 1
    }

    if (this.parameters.useTexture) {
      defines.USE_MAP = 1
    }

    if (this.parameters.alphaTest > 0 && this.parameters.alphaTest <= 1) {
      defines.ALPHATEST = this.parameters.alphaTest.toPrecision(2)
    }

    return defines
  }

  setUniforms (data: any) {
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
}

BufferRegistry.add('point', PointBuffer)

export default PointBuffer
