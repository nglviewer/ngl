/**
 * @file Bond Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import Structure from '../structure/structure'
import BondStore from '../store/bond-store'
import AtomProxy from '../proxy/atom-proxy'

/**
 * Bond proxy
 */
class BondProxy {
  index: number

  bondStore: BondStore

  private _v12: Vector3
  private _v13: Vector3
  private _ap1: AtomProxy
  private _ap2: AtomProxy
  private _ap3: AtomProxy

  /**
   * @param {Structure} structure - the structure
   * @param {Integer} index - the index
   */
  constructor (readonly structure: Structure, index = 0) {
    this.index = index
    this.bondStore = structure.bondStore

    this._v12 = new Vector3()
    this._v13 = new Vector3()
    this._ap1 = this.structure.getAtomProxy()
    this._ap2 = this.structure.getAtomProxy()
    this._ap3 = this.structure.getAtomProxy()
  }

  /**
   * @type {AtomProxy}
   */
  get atom1 () {
    return this.structure.getAtomProxy(this.atomIndex1)
  }

  /**
   * @type {AtomProxy}
   */
  get atom2 () {
    return this.structure.getAtomProxy(this.atomIndex2)
  }

  /**
   * @type {Integer}
   */
  get atomIndex1 () {
    return this.bondStore.atomIndex1[ this.index ]
  }
  set atomIndex1 (value) {
    this.bondStore.atomIndex1[ this.index ] = value
  }

  /**
   * @type {Integer}
   */
  get atomIndex2 () {
    return this.bondStore.atomIndex2[ this.index ]
  }
  set atomIndex2 (value) {
    this.bondStore.atomIndex2[ this.index ] = value
  }

  /**
   * @type {Integer}
   */
  get bondOrder () {
    return this.bondStore.bondOrder[ this.index ]
  }
  set bondOrder (value) {
    this.bondStore.bondOrder[ this.index ] = value
  }

  getOtherAtomIndex (atomIndex: number) {
    return atomIndex === this.atomIndex1 ? this.atomIndex2 : this.atomIndex1
  }

  getOtherAtom (atom: AtomProxy) {
    return this.structure.getAtomProxy(this.getOtherAtomIndex(atom.index))
  }

  /**
   * Get reference atom index for the bond
   * @return {Integer|undefined} atom index, or `undefined` if unavailable
   */
  getReferenceAtomIndex () {
    const ap1 = this._ap1
    const ap2 = this._ap2
    ap1.index = this.atomIndex1
    ap2.index = this.atomIndex2
    if (ap1.residueIndex !== ap2.residueIndex) {
      return undefined  // Bond between residues, for now ignore (could detect)
    }
    const typeAtomIndex1 = ap1.index - ap1.residueAtomOffset
    const typeAtomIndex2 = ap2.index - ap2.residueAtomOffset
    const residueType = ap1.residueType
    const ix = residueType.getBondReferenceAtomIndex(typeAtomIndex1, typeAtomIndex2)
    if (ix !== undefined) {
      return ix + ap1.residueAtomOffset
    } else {
      console.warn('No reference atom found', ap1.index, ap2.index)
    }
  }

  /**
   * calculate shift direction for displaying double/triple bonds
   * @param  {Vector3} [v] pre-allocated output vector
   * @return {Vector3} the shift direction vector
   */
  calculateShiftDir (v = new Vector3()) {
    const ap1 = this._ap1
    const ap2 = this._ap2
    const ap3 = this._ap3
    const v12 = this._v12
    const v13 = this._v13

    ap1.index = this.atomIndex1
    ap2.index = this.atomIndex2
    const ai3 = this.getReferenceAtomIndex()

    v12.subVectors(ap1 as any, ap2 as any).normalize()  // TODO
    if (ai3 !== undefined) {
      ap3.index = ai3
      v13.subVectors(ap1 as any, ap3 as any)  // TODO
    } else {
      v13.copy(ap1 as any)  // no reference point, use origin  // TODO
    }
    v13.normalize()

    // make sure v13 and v12 are not colinear
    let dp = v12.dot(v13)
    if (1 - Math.abs(dp) < 1e-5) {
      v13.set(1, 0, 0)
      dp = v12.dot(v13)
      if (1 - Math.abs(dp) < 1e-5) {
        v13.set(0, 1, 0)
        dp = v12.dot(v13)
      }
    }

    return v.copy(v13.sub(v12.multiplyScalar(dp))).normalize()
  }

  qualifiedName () {
    return this.atomIndex1 + '=' + this.atomIndex2
  }

  /**
   * Clone object
   * @return {BondProxy} cloned bond
   */
  clone () {
    return new BondProxy(this.structure, this.index)
  }

  toObject () {
    return {
      atomIndex1: this.atomIndex1,
      atomIndex2: this.atomIndex2,
      bondOrder: this.bondOrder
    }
  }
}

export default BondProxy
