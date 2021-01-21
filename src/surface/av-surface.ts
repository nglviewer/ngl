/**
 * @file AV Surface
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */

import { getSurfaceGrid } from './surface-utils'
import { VolumeSurface } from './volume'
import { uniformArray } from '../math/array-utils'
import {
  computeBoundingBox, v3multiplyScalar, v3cross, v3normalize
} from '../math/vector-utils'
import { defaults } from '../utils'
import { NumberArray } from '../types';


/**
 * Modifed from SpatialHash
 *
 * Main differences are:
 * - Optimized grid size to ensure we only ever need to look +/-1 cell
 * - Aware of atomic radii and will only output atoms within rAtom + rExtra
 *   (see withinRadii method)
 *
 * (Uses rounding rather than bitshifting as consequence of arbitrary grid size)
 * @class
 * @param {Float32Array} atomsX - x coordinates
 * @param {Float32Array} atomsY - y coordinates
 * @param {Float32Array} atomsZ - z coordinates
 * @param {Float32Array} atomsR - atom radii
 * @param {Float32Array} min - xyz min coordinates
 * @param {Float32Array} max - xyz max coordinates
 * @param {Float} maxDistance - max distance
 */
export interface iAVHash {
  neighbourListLength: number
  withinRadii: (x: number, y: number, z: number, rExtra: number, out: Int32Array) => void
}


function makeAVHash (atomsX: Float32Array, atomsY: Float32Array, atomsZ: Float32Array, atomsR: Float32Array, min: Float32Array, max: Float32Array, maxDistance: number): iAVHash {
  maxDistance = Math.max(0.1, maxDistance) // Avoid maxDistance of zero, see #802
  var nAtoms = atomsX.length

  var minX = min[ 0 ]
  var minY = min[ 1 ]
  var minZ = min[ 2 ]

  var maxX = max[ 0 ]
  var maxY = max[ 1 ]
  var maxZ = max[ 2 ]

  function hashFunc (w: number, minW: number) {
    return Math.floor((w - minW) / maxDistance)
  }

  var iDim = hashFunc(maxX, minX) + 1
  var jDim = hashFunc(maxY, minY) + 1
  var kDim = hashFunc(maxZ, minZ) + 1

  var nCells = iDim * jDim * kDim

  var jkDim = jDim * kDim

  /* Get cellID for cartesian x,y,z */
  var cellID = function (x: number, y: number, z: number) {
    return (((hashFunc(x, minX) * jDim) + hashFunc(y, minY)) * kDim) + hashFunc(z, minZ)
  }

  /* Initial building, could probably be optimized further */
  var preHash = [] // preHash[ cellID ] = [ atomId1, atomId2 ];

  for (var i = 0; i < nAtoms; i++) {
    var cid = cellID(atomsX[ i ], atomsY[ i ], atomsZ[ i ])

    if (preHash[ cid ] === undefined) {
      preHash[ cid ] = [ i ]
    } else {
      preHash[ cid ].push(i)
    }
  }

  var cellOffsets = new Uint32Array(nCells)
  var cellLengths = new Uint16Array(nCells)
  var data = new Uint32Array(nAtoms)

  var offset = 0
  var maxCellLength = 0

  for (i = 0; i < nCells; i++) {
    var start = cellOffsets[ i ] = offset

    var subArray = preHash[ i ]

    if (subArray !== undefined) {
      for (var j = 0; j < subArray.length; j++) {
        data[ offset ] = subArray[ j ]
        offset++
      }
    }

    var cellLength = offset - start
    cellLengths[ i ] = cellLength

    if (cellLength > maxCellLength) { maxCellLength = cellLength }
  }

  // Maximum number of neighbours we could ever produce (27 adjacent cells of equal population)
  const neighbourListLength = (27 * maxCellLength) + 1

  /**
   * Populate the supplied out array with atom indices that are within rAtom + rExtra
   * of x,y,z
   *
   * -1 in out array indicates the end of the list
   *
   * @param  {Float} x - x coordinate
   * @param  {Float} y - y coordinate
   * @param  {Float} z - z coordinate
   * @param  {Float} rExtra - additional radius
   * @param  {Float32Array} out - pre-allocated output array
   * @return {undefined}
   */
  const withinRadii = function (x: number, y: number, z: number, rExtra: number, out: Int32Array) {
    var outIdx = 0

    var nearI = hashFunc(x, minX)
    var nearJ = hashFunc(y, minY)
    var nearK = hashFunc(z, minZ)

    var loI = Math.max(0, nearI - 1)
    var loJ = Math.max(0, nearJ - 1)
    var loK = Math.max(0, nearK - 1)

    var hiI = Math.min(iDim, nearI + 2)
    var hiJ = Math.min(jDim, nearJ + 2)
    var hiK = Math.min(kDim, nearK + 2)

    for (var i = loI; i < hiI; ++i) {
      var iOffset = i * jkDim

      for (var j = loJ; j < hiJ; ++j) {
        var jOffset = j * kDim

        for (var k = loK; k < hiK; ++k) {
          var cid = iOffset + jOffset + k

          var cellStart = cellOffsets[ cid ]
          var cellEnd = cellStart + cellLengths[ cid ]

          for (var dataIndex = cellStart; dataIndex < cellEnd; dataIndex++) {
            var atomIndex = data[ dataIndex ]
            var dx = atomsX[ atomIndex ] - x
            var dy = atomsY[ atomIndex ] - y
            var dz = atomsZ[ atomIndex ] - z
            var rSum = atomsR[ atomIndex ] + rExtra

            if ((dx * dx + dy * dy + dz * dz) <= (rSum * rSum)) {
              out[ outIdx++ ] = data[ dataIndex ]
            }
          }
        }
      }
    }
    // Add terminator
    out[ outIdx ] = -1
  }
  return {
    neighbourListLength: neighbourListLength,
    withinRadii: withinRadii
  }
}

interface AVSurface {
  getSurface: (type: string, probeRadius: number, scaleFactor: number, cutoff: number, setAtomID: boolean, smooth: number, contour: boolean) => any
}
function AVSurface (this: AVSurface, coordList: Float32Array, radiusList: Float32Array, indexList: Uint16Array|Uint32Array) {
  // Field generation method adapted from AstexViewer (Mike Hartshorn)
  // by Fred Ludlow.
  // Other parts based heavily on NGL (Alexander Rose) EDT Surface class
  //
  // Should work as a drop-in alternative to EDTSurface (though some of
  // the EDT paramters are not relevant in this method).

  const nAtoms = radiusList.length

  const x = new Float32Array(nAtoms)
  const y = new Float32Array(nAtoms)
  const z = new Float32Array(nAtoms)

  for (let i = 0; i < nAtoms; i++) {
    const ci = 3 * i
    x[ i ] = coordList[ ci ]
    y[ i ] = coordList[ ci + 1 ]
    z[ i ] = coordList[ ci + 2 ]
  }

  let bbox = computeBoundingBox(coordList)
  if (coordList.length === 0) {
    bbox[ 0 ].set([ 0, 0, 0 ])
    bbox[ 1 ].set([ 0, 0, 0 ])
  }
  const min = bbox[0]
  const max = bbox[1]

  let r: Float32Array, r2: Float32Array // Atom positions, expanded radii (squared)
  let maxRadius: number

  // Parameters
  let probeRadius: number, scaleFactor: number, setAtomID: boolean, probePositions: number

  // Cache last value for obscured test
  let lastClip = -1

  // Grid params
  let dim: Float32Array, matrix: Float32Array, grid: NumberArray, atomIndex: Int32Array

  // grid indices -> xyz coords
  let gridx: Float32Array, gridy: Float32Array, gridz: Float32Array

  // Lookup tables:
  let sinTable: Float32Array, cosTable: Float32Array

  // Spatial Hash
  let hash: iAVHash

  // Neighbour array to be filled by hash
  let neighbours: Int32Array

  // Vectors for Torus Projection
  const atob = new Float32Array([ 0.0, 0.0, 0.0 ])
  const mid = new Float32Array([ 0.0, 0.0, 0.0 ])
  const n1 = new Float32Array([ 0.0, 0.0, 0.0 ])
  const n2 = new Float32Array([ 0.0, 0.0, 0.0 ])

  let ngTorus: number

  function init (_probeRadius?: number, _scaleFactor?: number, _setAtomID?: boolean, _probePositions?: number) {
    probeRadius = defaults(_probeRadius, 1.4)
    scaleFactor = defaults(_scaleFactor, 2.0)
    setAtomID = defaults(_setAtomID, true)
    probePositions = defaults(_probePositions, 30)

    r = new Float32Array(nAtoms)
    r2 = new Float32Array(nAtoms)

    for (let i = 0; i < r.length; ++i) {
      var rExt = radiusList[ i ] + probeRadius
      r[ i ] = rExt
      r2[ i ] = rExt * rExt
    }

    maxRadius = 0
    for (let j = 0; j < r.length; ++j) {
      if (r[ j ] > maxRadius) maxRadius = r[ j ]
    }

    initializeGrid()
    initializeAngleTables()
    initializeHash()

    lastClip = -1
  }

  function fillGridDim (a: Float32Array, start: number, step: number) {
    for (let i = 0; i < a.length; i++) {
      a[i] = start + (step * i)
    }
  }

  function initializeGrid () {
    const surfGrid = getSurfaceGrid(
      min, max, maxRadius, scaleFactor, 0.0
    )

    scaleFactor = surfGrid.scaleFactor
    dim = surfGrid.dim
    matrix = surfGrid.matrix

    ngTorus = Math.max(5, 2 + Math.floor(probeRadius * scaleFactor))

    grid = uniformArray(dim[0] * dim[1] * dim[2], -1001.0)

    atomIndex = new Int32Array(grid.length)

    gridx = new Float32Array(dim[0])
    gridy = new Float32Array(dim[1])
    gridz = new Float32Array(dim[2])

    fillGridDim(gridx, min[0], 1 / scaleFactor)
    fillGridDim(gridy, min[1], 1 / scaleFactor)
    fillGridDim(gridz, min[2], 1 / scaleFactor)
  }

  function initializeAngleTables () {
    var theta = 0.0
    var step = 2 * Math.PI / probePositions

    cosTable = new Float32Array(probePositions)
    sinTable = new Float32Array(probePositions)
    for (var i = 0; i < probePositions; i++) {
      cosTable[ i ] = Math.cos(theta)
      sinTable[ i ] = Math.sin(theta)
      theta += step
    }
  }

  function initializeHash () {
    hash = makeAVHash(x, y, z, r, min, max, 2.01 * maxRadius)
    neighbours = new Int32Array(hash.neighbourListLength)
  }

  function obscured (x: number, y: number, z: number, a: number, b: number) {
    // Is the point at x,y,z obscured by any of the atoms
    // specifeid by indices in neighbours. Ignore indices
    // a and b (these are the relevant atoms in projectPoints/Torii)

    // Cache the last clipped atom (as very often the same one in
    // subsequent calls)
    let ai: number

    if (lastClip !== -1) {
      ai = lastClip
      if (ai !== a && ai !== b && singleAtomObscures(ai, x, y, z)) {
        return ai
      } else {
        lastClip = -1
      }
    }

    var ni = 0
    ai = neighbours[ ni ]
    while (ai >= 0) {
      if (ai !== a && ai !== b && singleAtomObscures(ai, x, y, z)) {
        lastClip = ai
        return ai
      }
      ai = neighbours[ ++ni ]
    }

    lastClip = -1

    return -1
  }

  function singleAtomObscures (ai: number, x: number, y: number, z: number) {
    var ci = 3 * ai
    var ra2 = r2[ ai ]
    var dx = coordList[ ci ] - x
    var dy = coordList[ ci + 1 ] - y
    var dz = coordList[ ci + 2 ] - z
    var d2 = dx * dx + dy * dy + dz * dz

    return d2 < ra2
  }

  function projectPoints () {
    // For each atom:
    //     Iterate over a subsection of the grid, for each point:
    //         If current value < 0.0, unvisited, set positive
    //
    //         In any case: Project this point onto surface of the atomic sphere
    //         If this projected point is not obscured by any other atom
    //             Calcualte delta distance and set grid value to minimum of
    //             itself and delta

    // Should we alias frequently accessed closure variables??
    // Assume JS engine capable of optimizing this
    // anyway...

    for (var i = 0; i < nAtoms; i++) {
      var ax = x[ i ]
      var ay = y[ i ]
      var az = z[ i ]
      var ar = r[ i ]
      var ar2 = r2[ i ]

      hash.withinRadii(ax, ay, az, ar, neighbours)

      // Number of grid points, round this up...
      var ng = Math.ceil(ar * scaleFactor)

      // Center of the atom, mapped to grid points (take floor)
      var iax = Math.floor(scaleFactor * (ax - min[ 0 ]))
      var iay = Math.floor(scaleFactor * (ay - min[ 1 ]))
      var iaz = Math.floor(scaleFactor * (az - min[ 2 ]))

      // Extents of grid to consider for this atom
      var minx = Math.max(0, iax - ng)
      var miny = Math.max(0, iay - ng)
      var minz = Math.max(0, iaz - ng)

      // Add two to these points:
      // - iax are floor'd values so this ensures coverage
      // - these are loop limits (exclusive)
      var maxx = Math.min(dim[ 0 ], iax + ng + 2)
      var maxy = Math.min(dim[ 1 ], iay + ng + 2)
      var maxz = Math.min(dim[ 2 ], iaz + ng + 2)

      for (var ix = minx; ix < maxx; ix++) {
        var dx = gridx[ ix ] - ax
        var xoffset = dim[ 1 ] * dim[ 2 ] * ix

        for (var iy = miny; iy < maxy; iy++) {
          var dy = gridy[ iy ] - ay
          var dxy2 = dx * dx + dy * dy
          var xyoffset = xoffset + dim[ 2 ] * iy

          for (var iz = minz; iz < maxz; iz++) {
            var dz = gridz[ iz ] - az
            var d2 = dxy2 + dz * dz

            if (d2 < ar2) {
              var idx = iz + xyoffset

              if (grid[idx] < 0.0) {
                // Unvisited, make positive
                grid[ idx ] = -grid[ idx ]
              }
              // Project on to the surface of the sphere
              // sp is the projected point ( dx, dy, dz ) * ( ra / d )
              var d = Math.sqrt(d2)
              var ap = ar / d
              var spx = dx * ap
              var spy = dy * ap
              var spz = dz * ap

              spx += ax
              spy += ay
              spz += az

              if (obscured(spx, spy, spz, i, -1) === -1) {
                var dd = ar - d
                if (dd < grid[ idx ]) {
                  grid[ idx ] = dd
                  if (setAtomID) atomIndex[ idx ] = i
                }
              }
            }
          }
        }
      }
    }
  }

  function projectTorii () {
    for (var i = 0; i < nAtoms; i++) {
      hash.withinRadii(x[ i ], y[ i ], z[ i ], r[ i ], neighbours)
      var ia = 0
      var ni = neighbours[ ia ]
      while (ni >= 0) {
        if (i < ni) {
          projectTorus(i, ni)
        }
        ni = neighbours[ ++ia ]
      }
    }
  }

  function projectTorus (a: number, b: number) {
    var r1 = r[ a ]
    var r2 = r[ b ]
    var dx = atob[ 0 ] = x[ b ] - x[ a ]
    var dy = atob[ 1 ] = y[ b ] - y[ a ]
    var dz = atob[ 2 ] = z[ b ] - z[ a ]
    var d2 = dx * dx + dy * dy + dz * dz

    // This check now redundant as already done in AVHash.withinRadii
    // if( d2 > (( r1 + r2 ) * ( r1 + r2 )) ){ return; }

    var d = Math.sqrt(d2)

    // Find angle between a->b vector and the circle
    // of their intersection by cosine rule
    var cosA = (r1 * r1 + d * d - r2 * r2) / (2.0 * r1 * d)

    // distance along a->b at intersection
    var dmp = r1 * cosA

    v3normalize(atob, atob)

    // Create normal to line
    normalToLine(n1 as any, atob)
    v3normalize(n1, n1)

    // Cross together for second normal vector
    v3cross(n2, atob, n1)
    v3normalize(n2, n2)

    // r is radius of circle of intersection
    var rInt = Math.sqrt(r1 * r1 - dmp * dmp)

    v3multiplyScalar(n1, n1, rInt)
    v3multiplyScalar(n2, n2, rInt)
    v3multiplyScalar(atob, atob, dmp)

    mid[ 0 ] = atob[ 0 ] + x[ a ]
    mid[ 1 ] = atob[ 1 ] + y[ a ]
    mid[ 2 ] = atob[ 2 ] + z[ a ]

    lastClip = -1

    var ng = ngTorus

    for (var i = 0; i < probePositions; i++) {
      var cost = cosTable[ i ]
      var sint = sinTable[ i ]

      var px = mid[ 0 ] + cost * n1[ 0 ] + sint * n2[ 0 ]
      var py = mid[ 1 ] + cost * n1[ 1 ] + sint * n2[ 1 ]
      var pz = mid[ 2 ] + cost * n1[ 2 ] + sint * n2[ 2 ]

      if (obscured(px, py, pz, a, b) === -1) {
        // As above, iterate over our grid...
        // px, py, pz in grid coords
        var iax = Math.floor(scaleFactor * (px - min[ 0 ]))
        var iay = Math.floor(scaleFactor * (py - min[ 1 ]))
        var iaz = Math.floor(scaleFactor * (pz - min[ 2 ]))

        var minx = Math.max(0, iax - ng)
        var miny = Math.max(0, iay - ng)
        var minz = Math.max(0, iaz - ng)

        var maxx = Math.min(dim[ 0 ], iax + ng + 2)
        var maxy = Math.min(dim[ 1 ], iay + ng + 2)
        var maxz = Math.min(dim[ 2 ], iaz + ng + 2)

        for (var ix = minx; ix < maxx; ix++) {
          dx = px - gridx[ ix ]
          var xoffset = dim[ 1 ] * dim[ 2 ] * ix

          for (var iy = miny; iy < maxy; iy++) {
            dy = py - gridy[ iy ]
            var dxy2 = dx * dx + dy * dy
            var xyoffset = xoffset + dim[ 2 ] * iy

            for (var iz = minz; iz < maxz; iz++) {
              dz = pz - gridz[ iz ]
              d2 = dxy2 + dz * dz
              var idx = iz + xyoffset
              var current = grid[ idx ]

              if (current > 0.0 && d2 < (current * current)) {
                grid[ idx ] = Math.sqrt(d2)
                if (setAtomID) {
                  // Is this grid point closer to a or b?
                  // Take dot product of atob and gridpoint->p (dx, dy, dz)
                  const dp = dx * atob[ 0 ] + dy * atob [ 1 ] + dz * atob[ 2 ]
                  atomIndex[ idx ] = dp < 0.0 ? b : a
                }
              }
            }
          }
        }
      }
    }
  }

  function normalToLine (out: Int32Array, p: Float32Array) {
    out[ 0 ] = out[ 1 ] = out[ 2 ] = 1.0
    if (p[ 0 ] !== 0) {
      out[ 0 ] = (p[ 1 ] + p[ 2 ]) / -p[ 0 ]
    } else if (p[ 1 ] !== 0) {
      out[ 1 ] = (p[ 0 ] + p[ 2 ]) / -p[ 1 ]
    } else if (p[ 2 ] !== 0) {
      out[ 2 ] = (p[ 0 ] + p[ 1 ]) / -p[ 2 ]
    }
    return out
  }

  function fixNegatives () {
    for (var i = 0; i < grid.length; i++) {
      if (grid[ i ] < 0) grid[ i ] = 0
    }
  }

  function fixAtomIDs () {
    for (var i = 0; i < atomIndex.length; i++) {
      atomIndex[ i ] = indexList[ atomIndex[ i ] ]
    }
  }

  function getVolume (probeRadius: number, scaleFactor: number, setAtomID: boolean) {
    // Basic steps are:
    // 1) Initialize
    // 2) Project points
    // 3) Project torii

    console.time('AVSurface.getVolume')

    console.time('AVSurface.init')
    init(probeRadius, scaleFactor, setAtomID)
    console.timeEnd('AVSurface.init')

    console.time('AVSurface.projectPoints')
    projectPoints()
    console.timeEnd('AVSurface.projectPoints')

    console.time('AVSurface.projectTorii')
    projectTorii()
    console.timeEnd('AVSurface.projectTorii')
    fixNegatives()
    fixAtomIDs()

    console.timeEnd('AVSurface.getVolume')
  }

  this.getSurface = function (type: string, probeRadius: number, scaleFactor: number, cutoff: number, setAtomID: boolean, smooth: number, contour: boolean) {
    // type and cutoff left in for compatibility with EDTSurface.getSurface
    // function signature

    getVolume(probeRadius, scaleFactor, setAtomID)

    var volsurf = new (VolumeSurface as any)(
      grid, dim[ 2 ], dim[ 1 ], dim[ 0 ], atomIndex
    ) as VolumeSurface

    return volsurf.getSurface!(probeRadius, false, undefined, matrix, contour)
  }
}
Object.assign(AVSurface, {__deps: [
  getSurfaceGrid, VolumeSurface, uniformArray, computeBoundingBox,
  v3multiplyScalar, v3cross, v3normalize,
  makeAVHash,
  defaults
]})

export { AVSurface, makeAVHash }
