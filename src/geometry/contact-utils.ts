/**
 * @file Contact Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { radToDeg } from '../math/math-utils'
import Contact from './contact'
import Selection from '../selection/selection'
import Structure from '../structure/structure'
import AtomProxy from '../proxy/atom-proxy'

function polarContacts (structure: Structure, maxDistance = 3.5, maxAngle = 40) {

  const donorSelection = new Selection(
    '( ARG and ( .NE or .NH1 or .NH2 ) ) or ' +
    '( ASP and .ND2 ) or ' +
    '( GLN and .NE2 ) or ' +
    '( HIS and ( .ND1 or .NE2 ) ) or ' +
    '( LYS and .NZ ) or ' +
    '( SER and .OG ) or ' +
    '( THR and .OG1 ) or ' +
    '( TRP and .NE1 ) or ' +
    '( TYR and .OH ) or ' +
    '( PROTEIN and .N )'
  )

  const acceptorSelection = new Selection(
    '( ASN and .OD1 ) or ' +
    '( ASP and ( OD1 or .OD2 ) ) or ' +
    '( GLN and .OE1 ) or ' +
    '( GLU and ( .OE1 or .OE2 ) ) or ' +
    '( HIS and ( .ND1 or .NE2 ) ) or ' +
    '( SER and .OG ) or ' +
    '( THR and .OG1 ) or ' +
    '( TYR and .OH ) or ' +
    '( PROTEIN and .O )'
  )

  const donorView = structure.getView(donorSelection)
  const acceptorView = structure.getView(acceptorSelection)

  const contact = new Contact(donorView, acceptorView)
  const data = contact.within(maxDistance)
  const bondStore = data.bondStore

  const ap1 = structure.getAtomProxy()
  const ap2 = structure.getAtomProxy()
  const atomCA = structure.getAtomProxy()
  const atomC = structure.getAtomProxy()
  const rp = structure.getResidueProxy()
  const rpPrev = structure.getResidueProxy()
  const v1 = new Vector3()
  const v2 = new Vector3()

  const checkAngle = function (atom1: AtomProxy, atom2: AtomProxy, oName: string, cName: string) {
    let atomO, atomN

    if (atom1.atomname === oName) {
      atomO = atom1
      atomN = atom2
    } else {
      atomO = atom2
      atomN = atom1
    }

    rp.index = atomO.residueIndex
    const atomC = rp.getAtomIndexByName(cName)

    v1.subVectors(atomC as any, atomO as any)
    v2.subVectors(atomC as any, atomN as any)

    return radToDeg(v1.angleTo(v2)) < maxAngle
  }

  for (let i = 0, il = bondStore.count; i < il; ++i) {
    ap1.index = bondStore.atomIndex1[ i ]
    ap2.index = bondStore.atomIndex2[ i ]

    if ((ap1.atomname === 'O' && ap2.atomname === 'N') ||
        (ap1.atomname === 'N' && ap2.atomname === 'O')
    ) {
      // ignore backbone to backbone contacts
      data.bondSet.clear(i)
      continue
    } else if (ap1.atomname === 'N' || ap2.atomname === 'N') {
      let atomN, atomX

      if (ap1.atomname === 'N') {
        atomN = ap1
        atomX = ap2
      } else {
        atomN = ap2
        atomX = ap1
      }

      rp.index = atomN.residueIndex
      const caIdx = rp.getAtomIndexByName('CA')
      if (caIdx === undefined) continue
      atomCA.index = caIdx

      var prevRes = rp.getPreviousConnectedResidue(rpPrev)
      if (prevRes === undefined) continue

      atomC.index = prevRes.getAtomIndexByName('C')
      if (atomC.index === undefined) continue

      v1.subVectors(atomN as any, atomC as any)
      v2.subVectors(atomN as any, atomCA as any)
      v1.add(v2).multiplyScalar(0.5)
      v2.subVectors(atomX as any, atomN as any)

      if (radToDeg(v1.angleTo(v2)) > maxAngle) {
        data.bondSet.clear(i)
      }
    } else if (
      (ap1.atomname === 'OH' && ap1.resname === 'TYR') ||
      (ap2.atomname === 'OH' && ap2.resname === 'TYR')
    ) {
      if (!checkAngle(ap1, ap2, 'OH', 'CZ')) {
        data.bondSet.clear(i)
      }
    }
  }

  return {
    atomSet: data.atomSet,
    bondSet: data.bondSet,
    bondStore: data.bondStore
  }
}

function polarBackboneContacts (structure: Structure, maxDistance = 3.5, maxAngle = 40) {
  const donorSelection = new Selection(
    '( PROTEIN and .N )'
  )

  const acceptorSelection = new Selection(
    '( PROTEIN and .O )'
  )

  const donorView = structure.getView(donorSelection)
  const acceptorView = structure.getView(acceptorSelection)

  const contact = new Contact(donorView, acceptorView)
  const data = contact.within(maxDistance)
  const bondStore = data.bondStore

  const ap1 = structure.getAtomProxy()
  const ap2 = structure.getAtomProxy()
  const atomCA = structure.getAtomProxy()
  const atomC = structure.getAtomProxy()
  const rp = structure.getResidueProxy()
  const rpPrev = structure.getResidueProxy()
  const v1 = new Vector3()
  const v2 = new Vector3()

  for (let i = 0, il = bondStore.count; i < il; ++i) {
    ap1.index = bondStore.atomIndex1[ i ]
    ap2.index = bondStore.atomIndex2[ i ]

    let atomN, atomO

    if (ap1.atomname === 'N') {
      atomN = ap1
      atomO = ap2
    } else {
      atomN = ap2
      atomO = ap1
    }

    rp.index = atomN.residueIndex

    const caIdx = rp.getAtomIndexByName('CA')
    if (caIdx === undefined) continue
    atomCA.index = caIdx

    var prevRes = rp.getPreviousConnectedResidue(rpPrev)
    if (prevRes === undefined) continue

    atomC.index = prevRes.getAtomIndexByName('C')
    if (atomC.index === undefined) continue

    v1.subVectors(atomN as any, atomC as any)
    v2.subVectors(atomN as any, atomCA as any)
    v1.add(v2).multiplyScalar(0.5)
    v2.subVectors(atomO as any, atomN as any)

    // Log.log( radToDeg( v1.angleTo( v2 ) ) );

    if (radToDeg(v1.angleTo(v2)) > maxAngle) {
      data.bondSet.clear(i)
    }
  }

  return {
    atomSet: data.atomSet,
    bondSet: data.bondSet,
    bondStore: data.bondStore
  }
}

export {
  polarContacts,
  polarBackboneContacts
}
