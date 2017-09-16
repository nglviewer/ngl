/**
 * @file Kdtree
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { Debug, Log } from '../globals'
import _Kdtree from '../utils/kdtree'
import Structure from '../structure/structure'
import AtomProxy from '../proxy/atom-proxy'
import ResidueProxy from '../proxy/residue-proxy'

function euclideanDistSq(a: number[], b: number[]) {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  const dz = a[2] - b[2]
  return dx * dx + dy * dy + dz * dz
}

function euclideanDist(a: number[], b: number[]) {
  return Math.sqrt(euclideanDistSq(a, b))
}

const pointArray = new Float32Array(3)

class Kdtree {
  points: Float32Array
  atomIndices: Uint32Array
  kdtree: _Kdtree

  constructor(structure: Structure|ResidueProxy, useSquaredDist = false) {
    if (Debug) Log.time('Kdtree build')

    const metric = useSquaredDist ? euclideanDistSq : euclideanDist

    const points = new Float32Array(structure.atomCount * 3)
    const atomIndices = new Uint32Array(structure.atomCount)
    let i = 0

    structure.eachAtom(function (ap) {
      points[ i + 0 ] = ap.x
      points[ i + 1 ] = ap.y
      points[ i + 2 ] = ap.z
      atomIndices[ i / 3 ] = ap.index
      i += 3
    })

    this.atomIndices = atomIndices
    this.points = points
    this.kdtree = new _Kdtree(points, metric)

    if (Debug) Log.timeEnd('Kdtree build')

      // console.log("this.kdtree.verify()", this.kdtree.verify())
  }

  nearest (point: number[]|Vector3, maxNodes: number, maxDistance: number) {
    // Log.time( "Kdtree nearest" );

    if (point instanceof Vector3) {
      point.toArray(pointArray as any)
    } else if (point instanceof AtomProxy) {
      point.positionToArray(pointArray)
    }

    const nodeList = this.kdtree.nearest(pointArray, maxNodes, maxDistance)

    const indices = this.kdtree.indices
    const nodes = this.kdtree.nodes
    const atomIndices = this.atomIndices
    const resultList = []

    for (let i = 0, n = nodeList.length; i < n; ++i) {
      const d = nodeList[ i ]
      const nodeIndex = d[ 0 ]
      const dist = d[ 1 ]

      resultList.push({
        index: atomIndices[ indices[ nodes[ nodeIndex ] ] ],
        distance: dist
      })
    }

    // Log.timeEnd( "Kdtree nearest" );

    return resultList
  }
}

export default Kdtree
