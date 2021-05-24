/**
 * @file Volume Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'
import { lerp } from '../math/math-utils'

import { ColormakerRegistry } from '../globals'
import Colormaker, { VolumeColormakerParams, ColormakerScale, manageColor } from './colormaker'

/**
 * Color by volume position
 */
class VolumeColormaker extends Colormaker {
  valueScale: ColormakerScale
  vec = new Vector3()

  constructor (params: VolumeColormakerParams) {
    super(params)
    this.valueScale = this.getScale()
  }

  /**
   * return the color for coordinates in space
   * @param  {Vector3} coords - xyz coordinates
   * @return {Integer} hex coords color
   */
  @manageColor
  positionColor (coords: Vector3) {
    const volume = this.parameters.volume as any  // TODO

    if (!volume || !volume.inverseMatrix) {
      return this.parameters.value
    }

    const vec = this.vec
    const data = volume.data
    const nx = volume.nx
    const ny = volume.ny
    const nxy = nx * ny

    vec.copy(coords)
    vec.applyMatrix4(volume.inverseMatrix)

    // position of grid cell
    const x0 = Math.floor(vec.x)
    const y0 = Math.floor(vec.y)
    const z0 = Math.floor(vec.z)

    // Indices
    const i = ((((z0 * ny) + y0) * nx) + x0)
    const i1 = i + 1
    const iy = i + nx
    const iz = i + nxy
    const i1y = iy + 1
    const i1z = iz + 1
    const iyz = iy + nxy
    const i1yz = iyz + 1

    // Values
    const v = data[ i ]
    const v1 = data[ i1 ]
    const vy = data[ iy ]
    const vz = data[ iz ]
    const v1y = data[ i1y ]
    const v1z = data[ i1z ]
    const vyz = data[ iyz ]
    const v1yz = data[ i1yz ]

    // Position of point in fraction of grid
    const xd = vec.x - x0
    const yd = vec.y - y0
    const zd = vec.z - z0

    // 1st Dimension
    const c00 = lerp(v, v1, xd)
    const c01 = lerp(vz, v1z, xd)
    const c10 = lerp(vy, v1y, xd)
    const c11 = lerp(vyz, v1yz, xd)

    // 2nd Dimension
    const c0 = lerp(c00, c10, yd)
    const c1 = lerp(c01, c11, yd)

    // 3rd Dimension
    const c = lerp(c0, c1, zd)

    return this.valueScale(c)
  }
}

ColormakerRegistry.add('volume', VolumeColormaker as any)

export default VolumeColormaker
