/**
 * @file Helixorient
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { ColormakerRegistry } from '../globals'
import { ColormakerParameters } from '../color/colormaker'
import { AtomPicker } from '../utils/picker'
import RadiusFactory, { RadiusParams } from '../utils/radius-factory'
import { copyArray } from '../math/array-utils'
import { projectPointOnVector } from '../math/vector-utils'
import Polymer from '../proxy/polymer'

export interface HelixIterator {
  size: number
  next: () => Vector3
  get: (idx: number) => Vector3
  reset: () => void
}

export interface HelixPosition {
  center: Float32Array
  axis: Float32Array
  bending: Float32Array
  radius: Float32Array
  rise: Float32Array
  twist: Float32Array
  resdir: Float32Array
}

class Helixorient {
  size: number

  constructor (readonly polymer: Polymer) {
    this.size = polymer.residueCount
  }

  getCenterIterator (smooth = 0): HelixIterator {
    const center = this.getPosition().center
    const size = center.length / 3

    let i = 0
    let j = -1

    const cache = [
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3()
    ]

    function next (this: HelixIterator) {
      const vector = this.get(j)
      j += 1
      return vector
    }

    function get (idx: number) {
      idx = Math.min(size - 1, Math.max(0, idx))
      const v = cache[ i % 4 ]
      const idx3 = 3 * idx
      v.fromArray(center as any, idx3)  // TODO
      if (smooth) {
        const w = Math.min(smooth, idx, size - idx - 1)
        for (let k = 1; k <= w; ++k) {
          const l = k * 3
          const t = (w + 1 - k) / (w + 1)
          v.x += t * center[ idx3 - l + 0 ] + t * center[ idx3 + l + 0 ]
          v.y += t * center[ idx3 - l + 1 ] + t * center[ idx3 + l + 1 ]
          v.z += t * center[ idx3 - l + 2 ] + t * center[ idx3 + l + 2 ]
        }
        v.x /= w + 1
        v.y /= w + 1
        v.z /= w + 1
      }
      i += 1
      return v
    }

    function reset () {
      i = 0
      j = -1
    }

    return { size, next, get, reset }
  }

  getColor (params: { scheme: string } & ColormakerParameters) {
    const polymer = this.polymer
    const structure = polymer.structure
    const n = polymer.residueCount
    const residueIndexStart = polymer.residueIndexStart

    const col = new Float32Array(n * 3)

    const p = params || {}
    p.structure = structure

    const colormaker = ColormakerRegistry.getScheme(p)

    const rp = structure.getResidueProxy()
    const ap = structure.getAtomProxy()

    for (let i = 0; i < n; ++i) {
      rp.index = residueIndexStart + i
      ap.index = rp.traceAtomIndex

      colormaker.atomColorToArray(ap, col, i * 3)
    }

    return {
      'color': col
    }
  }

  getPicking () {
    const polymer = this.polymer
    const structure = polymer.structure
    const n = polymer.residueCount
    const residueIndexStart = polymer.residueIndexStart

    const pick = new Float32Array(n)
    const rp = structure.getResidueProxy()

    for (let i = 0; i < n; ++i) {
      rp.index = residueIndexStart + i
      pick[ i ] = rp.traceAtomIndex
    }

    return {
      'picking': new AtomPicker(pick, structure)
    }
  }

  getSize (params: RadiusParams) {
    const polymer = this.polymer
    const structure = polymer.structure
    const n = polymer.residueCount
    const residueIndexStart = polymer.residueIndexStart

    const size = new Float32Array(n)
    const radiusFactory = new RadiusFactory(params)

    const rp = structure.getResidueProxy()
    const ap = structure.getAtomProxy()

    for (let i = 0; i < n; ++i) {
      rp.index = residueIndexStart + i
      ap.index = rp.traceAtomIndex
      size[ i ] = radiusFactory.atomRadius(ap)
    }

    return { size }
  }

  getPosition (): HelixPosition {
    const polymer = this.polymer
    const structure = polymer.structure
    const n = polymer.residueCount
    const n3 = n - 3

    const center = new Float32Array(3 * n)
    const axis = new Float32Array(3 * n)
    const diff = new Float32Array(n)
    const radius = new Float32Array(n)
    const rise = new Float32Array(n)
    const twist = new Float32Array(n)
    const resdir = new Float32Array(3 * n)

    const r12 = new Vector3()
    const r23 = new Vector3()
    const r34 = new Vector3()

    const diff13 = new Vector3()
    const diff24 = new Vector3()

    const v1 = new Vector3()
    const v2 = new Vector3()
    const vt = new Vector3()

    const _axis = new Vector3()
    const _prevAxis = new Vector3()

    const _resdir = new Vector3()
    const _center = new Vector3(0, 0, 0)

    const type = 'trace'
    const a1 = structure.getAtomProxy()
    const a2 = structure.getAtomProxy(polymer.getAtomIndexByType(0, type))
    const a3 = structure.getAtomProxy(polymer.getAtomIndexByType(1, type))
    const a4 = structure.getAtomProxy(polymer.getAtomIndexByType(2, type))

    for (let i = 0; i < n3; ++i) {
      a1.index = a2.index
      a2.index = a3.index
      a3.index = a4.index
      a4.index = polymer.getAtomIndexByType(i + 3, type)!  // TODO

      const j = 3 * i

      // ported from GROMACS src/tools/gmx_helixorient.c

      r12.subVectors(a2 as any, a1 as any)  // TODO
      r23.subVectors(a3 as any, a2 as any)  // TODO
      r34.subVectors(a4 as any, a3 as any)  // TODO

      diff13.subVectors(r12, r23)
      diff24.subVectors(r23, r34)

      _axis.crossVectors(diff13, diff24).normalize()
      _axis.toArray(axis as any, j)  // TODO

      if (i > 0) {
        diff[ i ] = _axis.angleTo(_prevAxis)
      }

      const tmp = Math.cos(diff13.angleTo(diff24))
      twist[ i ] = 180.0 / Math.PI * Math.acos(tmp)

      const diff13Length = diff13.length()
      const diff24Length = diff24.length()

      radius[ i ] = (
        Math.sqrt(diff24Length * diff13Length) /
        // clamp, to avoid instabilities for when
        // angle between diff13 and diff24 is near 0
        Math.max(2.0, 2.0 * (1.0 - tmp))
      )

      rise[ i ] = Math.abs(r23.dot(_axis))

      //

      v1.copy(diff13).multiplyScalar(radius[ i ] / diff13Length)
      v2.copy(diff24).multiplyScalar(radius[ i ] / diff24Length)

      v1.subVectors(a2 as any, v1)  // TODO
      v2.subVectors(a3 as any, v2)  // TODO

      v1.toArray(center as any, j + 3)  // TODO
      v2.toArray(center as any, j + 6)  // TODO

      //

      _resdir.subVectors(a1 as any, _center)  // TODO
      _resdir.toArray(resdir as any, j)  // TODO

      _prevAxis.copy(_axis)
      _center.copy(v1)
    }

    //

    // calc axis as dir of second and third center pos
    // project first traceAtom onto axis to get first center pos
    v1.fromArray(center as any, 3)  // TODO
    v2.fromArray(center as any, 6)  // TODO
    _axis.subVectors(v1, v2).normalize()
      // _center.copy( res[ 0 ].getTraceAtom() );
    a1.index = polymer.getAtomIndexByType(0, type)!  // TODO
    _center.copy(a1 as any)  // TODO
    vt.copy(a1 as any)  // TODO
    projectPointOnVector(vt, _axis, v1)
    vt.toArray(center as any, 0)  // TODO

    // calc first resdir
    _resdir.subVectors(_center, v1)
    _resdir.toArray(resdir as any, 0)  // TODO

    // calc axis as dir of n-1 and n-2 center pos
    // project last traceAtom onto axis to get last center pos
    v1.fromArray(center as any, 3 * n - 6)  // TODO
    v2.fromArray(center as any, 3 * n - 9)  // TODO
    _axis.subVectors(v1, v2).normalize()
    // _center.copy( res[ n - 1 ].getTraceAtom() );
    a1.index = polymer.getAtomIndexByType(n - 1, type)!  // TODO
    _center.copy(a1 as any)  // TODO
    vt.copy(a1 as any)  // TODO
    projectPointOnVector(vt, _axis, v1)
    vt.toArray(center as any, 3 * n - 3)  // TODO

    // calc last three resdir
    for (let i = n - 3; i < n; ++i) {
      v1.fromArray(center as any, 3 * i)  // TODO
      // _center.copy( res[ i ].getTraceAtom() );
      a1.index = polymer.getAtomIndexByType(i, type)!  // TODO
      _center.copy(a1 as any)  // TODO

      _resdir.subVectors(_center, v1)
      _resdir.toArray(resdir as any, 3 * i)  // TODO
    }

    // average measures to define them on the residues

    const resRadius = new Float32Array(n)
    const resTwist = new Float32Array(n)
    const resRise = new Float32Array(n)
    const resBending = new Float32Array(n)

    resRadius[ 1 ] = radius[ 0 ]
    resTwist[ 1 ] = twist[ 0 ]
    resRise[ 1 ] = radius[ 0 ]

    for (let i = 2; i < n - 2; ++i) {
      resRadius[ i ] = 0.5 * (radius[ i - 2 ] + radius[ i - 1 ])
      resTwist[ i ] = 0.5 * (twist[ i - 2 ] + twist[ i - 1 ])
      resRise[ i ] = 0.5 * (rise[ i - 2 ] + rise[ i - 1 ])

      v1.fromArray(axis as any, 3 * (i - 2))  // TODO
      v2.fromArray(axis as any, 3 * (i - 1))  // TODO
      resBending[ i ] = 180.0 / Math.PI * Math.acos(Math.cos(v1.angleTo(v2)))
    }

    resRadius[ n - 2 ] = radius[ n - 4 ]
    resTwist[ n - 2 ] = twist[ n - 4 ]
    resRise[ n - 2 ] = rise[ n - 4 ]

    // average helix axes to define them on the residues

    const resAxis = new Float32Array(3 * n)

    copyArray(axis, resAxis, 0, 0, 3)
    copyArray(axis, resAxis, 0, 3, 3)

    for (let i = 2; i < n - 2; ++i) {
      v1.fromArray(axis as any, 3 * (i - 2))  // TODO
      v2.fromArray(axis as any, 3 * (i - 1))  // TODO

      _axis.addVectors(v2, v1).multiplyScalar(0.5).normalize()
      _axis.toArray(resAxis as any, 3 * i)  // TODO
    }

    copyArray(axis, resAxis, 3 * n - 12, 3 * n - 6, 3)
    copyArray(axis, resAxis, 3 * n - 12, 3 * n - 3, 3)

    return {
      center,
      axis: resAxis,
      bending: resBending,
      radius: resRadius,
      rise: resRise,
      twist: resTwist,
      resdir: resdir
    }
  }

}

export default Helixorient
