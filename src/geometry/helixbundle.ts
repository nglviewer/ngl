/**
 * @file Helixbundle
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { ColormakerRegistry } from '../globals'
import { AtomPicker } from '../utils/picker'
import RadiusFactory, { RadiusParams } from '../utils/radius-factory'
import Helixorient, { HelixPosition } from './helixorient'
import { calculateMeanVector3, projectPointOnVector } from '../math/vector-utils'
import Polymer from '../proxy/polymer'
import { ColormakerParameters } from '../color/colormaker';

export interface Axis {
  axis: Float32Array
  center: Float32Array
  begin: Float32Array
  end: Float32Array
  color: Float32Array
  picking: AtomPicker
  size: Float32Array
  residueOffset: number[]
  residueCount: number[]
}

class Helixbundle {
  helixorient: Helixorient;
  position: HelixPosition;

  constructor (readonly polymer: Polymer) {

    this.helixorient = new Helixorient(polymer)
    this.position = this.helixorient.getPosition()
  }

  getAxis (localAngle: number, centerDist: number, ssBorder: boolean, colorParams: { scheme: string} & ColormakerParameters, radiusParams: RadiusParams): Axis {
    localAngle = localAngle || 30
    centerDist = centerDist || 2.5
    ssBorder = ssBorder === undefined ? false : ssBorder

    const polymer = this.polymer
    const structure = polymer.structure
    const n = polymer.residueCount
    const residueIndexStart = polymer.residueIndexStart

    const pos = this.position

    const cp = colorParams || {}
    cp.structure = structure

    const colormaker = ColormakerRegistry.getScheme(cp)

    const radiusFactory = new RadiusFactory(radiusParams)

    let j = 0
    let k = 0

    const axis: number[] = []
    const center: number[] = []
    const beg: number[] = []
    const end: number[] = []
    const col: number[] = []
    const pick = []
    const size = []
    const residueOffset = []
    const residueCount = []

    let tmpAxis = new Float32Array(n * 3)
    let tmpCenter = new Float32Array(n * 3)

    let _axis, _center
    const _beg = new Vector3()
    const _end = new Vector3()

    const rp1 = structure.getResidueProxy()
    const rp2 = structure.getResidueProxy()
    const ap = structure.getAtomProxy()

    const c1 = new Vector3()
    const c2 = new Vector3()

    let split = false

    for (let i = 0; i < n; ++i) {
      rp1.index = residueIndexStart + i
      c1.fromArray(pos.center as any, i * 3)

      if (i === n - 1) {
        split = true
      } else {
        rp2.index = residueIndexStart + i + 1
        c2.fromArray(pos.center as any, i * 3 + 3)

        if (ssBorder && rp1.sstruc !== rp2.sstruc) {
          split = true
        } else if (c1.distanceTo(c2) > centerDist) {
          split = true
        } else if (pos.bending[ i ] > localAngle) {
          split = true
        }
      }

      if (split) {
        if (i - j < 4) {
          j = i
          split = false
          continue
        }

        ap.index = rp1.traceAtomIndex

        // ignore first and last axis
        tmpAxis = pos.axis.subarray(j * 3 + 3, i * 3)
        tmpCenter = pos.center.subarray(j * 3, i * 3 + 3)

        _axis = calculateMeanVector3(tmpAxis).normalize()
        _center = calculateMeanVector3(tmpCenter)

        _beg.fromArray(tmpCenter as any)
        projectPointOnVector(_beg, _axis, _center)

        _end.fromArray(tmpCenter as any, tmpCenter.length - 3)
        projectPointOnVector(_end, _axis, _center)

        _axis.subVectors(_end, _beg)

        _axis.toArray(axis as any, k)
        _center.toArray(center as any, k)
        _beg.toArray(beg as any, k)
        _end.toArray(end as any, k)

        colormaker.atomColorToArray(ap, col, k)

        pick.push(ap.index)

        size.push(radiusFactory.atomRadius(ap))

        residueOffset.push(residueIndexStart + j)
        residueCount.push(residueIndexStart + i + 1 - j)

        k += 3
        j = i
        split = false
      }
    }

    const picking = new Float32Array(pick)

    return {
      axis: new Float32Array(axis),
      center: new Float32Array(center),
      begin: new Float32Array(beg),
      end: new Float32Array(end),
      color: new Float32Array(col),
      picking: new AtomPicker(picking, structure),
      size: new Float32Array(size),
      residueOffset: residueOffset,
      residueCount: residueCount
    }
  }
}

export default Helixbundle
