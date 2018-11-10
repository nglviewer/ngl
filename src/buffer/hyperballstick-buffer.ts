/**
 * @file Hyperball Stick Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

// @ts-ignore: unused import required for declaration only
import { Vector3, Matrix4 } from 'three'
import { ExtensionFragDepth } from '../globals'
import { calculateMinArray } from '../math/array-utils'
import CylinderGeometryBuffer, { CylinderGeometryBufferDefaultParameters } from './cylindergeometry-buffer'
import HyperballStickImpostorBuffer, { HyperballStickImpostorBufferDefaultParameters } from './hyperballstickimpostor-buffer'
import { BufferData } from './buffer'

export interface HyperballStickBufferData extends BufferData {
  position1: Float32Array
  position2: Float32Array
  color2: Float32Array
  radius: Float32Array
  radius2: Float32Array
}

export const HyperballStickBufferDefaultParameters = Object.assign({
  disableImpostor: false
}, CylinderGeometryBufferDefaultParameters, HyperballStickImpostorBufferDefaultParameters)
export type HyperballStickBufferParameters = typeof HyperballStickBufferDefaultParameters

/**
 * Hyperball stick buffer. Depending on the value {@link ExtensionFragDepth} and
 * `params.disableImpostor` the constructor returns either a
 * {@link CylinderGeometryBuffer} or a {@link HyperballStickImpostorBuffer}
 * @implements {Buffer}
 *
 * @example
 * var hyperballStickBuffer = new HyperballStickBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 2, 2, 2 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ]),
 *   radius: new Float32Array([ 1 ]),
 *   radius2: new Float32Array([ 2 ])
 * });
 */
class HyperballStickBuffer {
  /**
   * @param  {Object} data - attribute object
   * @param  {Float32Array} data.position1 - from positions
   * @param  {Float32Array} data.position2 - to positions
   * @param  {Float32Array} data.color - from colors
   * @param  {Float32Array} data.color2 - to colors
   * @param  {Float32Array} data.radius - from radii
   * @param  {Float32Array} data.radius2 - to radii
   * @param  {Float32Array} data.picking - picking ids
   * @param  {BufferParameters} params - parameter object
   */
  constructor (data: HyperballStickBufferData, params: Partial<HyperballStickBufferParameters> = {}) {
    if (!ExtensionFragDepth || (params && params.disableImpostor)) {
      data.radius = calculateMinArray(data.radius, data.radius2)
      return new CylinderGeometryBuffer(data, params)
    } else {
      return new HyperballStickImpostorBuffer(data, params)
    }
  }
}

export default HyperballStickBuffer
