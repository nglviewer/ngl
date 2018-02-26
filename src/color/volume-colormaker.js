/**
 * @file Volume Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from '../../lib/three.es6.js'
import { lerp } from '../math/math-utils.js'

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

/**
 * Color by volume position
 */
class VolumeColormaker extends Colormaker {
  constructor (params) {
    super(params)

    var volume = this.volume

    if (volume && volume.inverseMatrix) {
      var valueScale = this.getScale()
      var inverseMatrix = volume.inverseMatrix
      var data = volume.data
      var nx = volume.nx
      var ny = volume.ny
      var nxy = nx * ny
      var vec = new Vector3()

      this.positionColor = function (coords) {
        vec.copy(coords)
        vec.applyMatrix4(inverseMatrix)

                // position of grid cell
        var x0 = Math.floor(vec.x)
        var y0 = Math.floor(vec.y)
        var z0 = Math.floor(vec.z)

                // Indices
        var i = ((((z0 * ny) + y0) * nx) + x0)
        var i1 = i + 1
        var iy = i + nx
        var iz = i + nxy
        var i1y = iy + 1
        var i1z = iz + 1
        var iyz = iy + nxy
        var i1yz = iyz + 1

                // Values
        var v = data[ i ]
        var v1 = data[ i1 ]
        var vy = data[ iy ]
        var vz = data[ iz ]
        var v1y = data[ i1y ]
        var v1z = data[ i1z ]
        var vyz = data[ iyz ]
        var v1yz = data[ i1yz ]

                // Position of point in fraction of grid
        var xd = vec.x - x0
        var yd = vec.y - y0
        var zd = vec.z - z0

                // 1st Dimension
        var c00 = lerp(v, v1, xd)
        var c01 = lerp(vz, v1z, xd)
        var c10 = lerp(vy, v1y, xd)
        var c11 = lerp(vyz, v1yz, xd)

                // 2nd Dimension
        var c0 = lerp(c00, c10, yd)
        var c1 = lerp(c01, c11, yd)

                // 3rd Dimension
        var c = lerp(c0, c1, zd)

        return valueScale(c)
      }
    } else {
      var colorValue = this.value
      this.positionColor = function () { return colorValue }
    }
  }

    /**
     * return the color for coordinates in space
     * @param  {Vector3} coords - xyz coordinates
     * @return {Integer} hex coords color
     */
  positionColor (/* coords */) {}
}

ColormakerRegistry.add('volume', VolumeColormaker)

export default VolumeColormaker
