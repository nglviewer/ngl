/**
 * @file Atomindex Colormaker
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'

import { ColormakerRegistry } from '../globals'
import Colormaker, { StuctureColormakerParams, ColormakerScale, manageColor } from './colormaker'
import AtomProxy from '../proxy/atom-proxy'
import SpatialHash from '../geometry/spatial-hash'

// from CHARMM
const partialCharges: { [k: string]: { [k: string]: number } } = {
  'ARG': {
    'CD': 0.1,
    'CZ': 0.5,
    'NE': -0.1
  },
  'ASN': {
    'CG': 0.55,
    'OD1': -0.55
  },
  'ASP': {
    'CB': -0.16,
    'CG': 0.36,
    'OD1': -0.6,
    'OD2': -0.6
  },
  'CYS': {
    'CB': 0.19,
    'SG': -0.19
  },
  'GLN': {
    'CD': 0.55,
    'OE1': -0.55
  },
  'GLU': {
    'CD': 0.36,
    'CG': -0.16,
    'OE1': -0.6,
    'OE2': -0.6
  },
  'HIS': {
    'CB': 0.1,
    'CD2': 0.2,
    'CE1': 0.45,
    'CG': 0.15,
    'ND1': 0.05,
    'NE2': 0.05
  },
  'LYS': {
    'CE': 0.25,
    'NZ': 0.75
  },
  'MET': {
    'CE': 0.06,
    'CG': 0.06,
    'SD': -0.12
  },
  'PTR': {
    'C': 0.55,
    'CA': 0.1,
    'CZ': 0.25,
    'N': -0.35,
    'O': -0.55,
    'O1P': -0.85,
    'O2P': -0.85,
    'O3P': -0.85,
    'OG1': -1.1,
    'P': 1.4
  },
  'SEP': {
    'C': 0.55,
    'CA': 0.1,
    'CB': 0.25,
    'N': -0.35,
    'O': -0.55,
    'O1P': -0.85,
    'O2P': -0.85,
    'O3P': -0.85,
    'OG1': -1.1,
    'P': 1.4
  },
  'SER': {
    'CB': 0.25,
    'OG': -0.25
  },
  'THR': {
    'CB': 0.25,
    'OG1': -0.25
  },
  'TPO': {
    'C': 0.55,
    'CA': 0.1,
    'CB': 0.25,
    'N': -0.35,
    'O': -0.55,
    'OG1': -1.1,
    'O1P': -0.85,
    'O2P': -0.85,
    'O3P': -0.85,
    'P': 1.4
  },
  'TRP': {
    'CD1': 0.06,
    'CD2': 0.1,
    'CE2': -0.04,
    'CE3': -0.03,
    'CG': -0.03,
    'NE1': -0.06
  },
  'TYR': {
    'CZ': 0.25,
    'OH': -0.25
  },
  'backbone': {
    'C': 0.55,
    'O': -0.55,
    'N': -0.35,
    'CA': 0.1
  }
}

const maxRadius = 12.0
const nHBondDistance = 1.04
const nHCharge = 0.25

/**
 * Populates position vector with location of implicit or explicit H
 * Returns position or undefined if not able to locate H
 *
 * @param {AtomProxy} ap - the nitrogen atom
 * @param {Vector3} [position] - optional target
 * @return {Vectors|undefined} the hydrogen atom position
 */
function backboneNHPosition (ap: AtomProxy, position = new Vector3()) {
  let h = false
  let ca = false
  let c = false
  position.set(2 * ap.x, 2 * ap.y, 2 * ap.z)

  ap.eachBondedAtom(function (a2: AtomProxy) {
    // Any time we detect H, reset position and skip
    // future tests
    if (h) return
    if (a2.atomname === 'H') {
      position.set(a2.x, a2.y, a2.z)
      h = true
      return
    }
    if (!ca && a2.atomname === 'CA') {
      position.sub(a2 as any)  // TODO
      ca = true
    } else if (!c && a2.atomname === 'C') {
      c = true
      position.sub(a2 as any)  // TODO
    }
  })

  if (h) { return position }

  if (ca && c) {
    position.normalize()
    position.multiplyScalar(nHBondDistance)
    position.add(ap as any)
    return position
  }
}

/**
 * Takes an array of Vector3 objects and
 * converts to an object that looks like an AtomStore
 *
 * @param {Vector3[]} positions - array of positions
 * @return {Object} AtomStore-like object
 */
function buildStoreLike (positions: Vector3[]) {
  const n = positions.length
  const x = new Float32Array(n)
  const y = new Float32Array(n)
  const z = new Float32Array(n)

  for (let i = 0; i < positions.length; i++) {
    const v = positions[ i ]
    x[ i ] = v.x
    y[ i ] = v.y
    z[ i ] = v.z
  }

  return { x: x, y: y, z: z, count: n }
}

function chargeForAtom (a: AtomProxy): number {
  if (a.partialCharge !== null) return a.partialCharge
  if (!a.isProtein()) { return 0.0 }
  return (
    (partialCharges[ a.resname ] &&
        partialCharges[ a.resname ][ a.atomname ]) ||
    partialCharges[ 'backbone' ][ a.atomname ] || 0.0
  )
}

/**
 * Color a surface by electrostatic charge. This is a highly approximate
 * calculation! The partial charges are CHARMM with hydrogens added to heavy
 * atoms and hydrogen positions generated for amides.
 *
 * __Name:__ _electrostatic_
 *
 * @example
 * stage.loadFile( "rcsb://3dqb" ).then( function( o ){
 *     o.addRepresentation( "surface", { colorScheme: "electrostatic" } );
 *     o.autoView();
 * } );
 */
class ElectrostaticColormaker extends Colormaker {
  scale: ColormakerScale
  hHash: SpatialHash
  hash: SpatialHash
  charges: Float32Array
  hStore: { x: Float32Array, y: Float32Array, z: Float32Array, count: number }
  atomProxy: AtomProxy

  delta = new Vector3()
  hCharges: number[] = []

  constructor (params: StuctureColormakerParams) {
    super(params)

    if (!params.scale) {
      this.parameters.scale = 'rwb'
    }
    if (!params.domain) {
      this.parameters.domain = [ -50, 50 ]
    }

    this.scale = this.getScale()

    this.charges = new Float32Array(params.structure.atomCount)
    const hPositions: Vector3[] = []

    params.structure.eachAtom((ap: AtomProxy) => {
      this.charges[ ap.index ] = chargeForAtom(ap) * ap.occupancy
      if (ap.atomname === 'N') {

        // In the specific case where N forms two bonds to
        // CA and C, try and place a dummy hydrogen

        if (ap.bondCount >= 3) return; // Skip if 3 bonds already (e.g. PRO)

        if (ap.bondToElementCount(1)) return; // Skip if any H specificed

        const hPos = backboneNHPosition(ap)
        if (hPos !== undefined) {
          hPositions.push(hPos)
          this.hCharges.push(nHCharge * ap.occupancy)
        }
      }
    })

    const bbox = params.structure.getBoundingBox()
    bbox.expandByScalar(nHBondDistance) // Worst case

    // SpatialHash requires x,y,z and count
    this.hStore = buildStoreLike(hPositions)
    this.hHash = new SpatialHash(this.hStore as any, bbox)  // TODO
    this.hash = new SpatialHash(params.structure.atomStore, bbox)
  }

  @manageColor
  positionColor (v: Vector3) {

    const charges = this.charges
    const hCharges = this.hCharges

    let p = 0.0
    this.hash.eachWithin(v.x, v.y, v.z, maxRadius, (atomIndex, dSq) => {
      const charge = charges[atomIndex]
      if (charge === 0.0) return
      p += charge / dSq
    })

    this.hHash.eachWithin(v.x, v.y, v.z, maxRadius, (atomIndex, dSq) => {
      const charge = hCharges[atomIndex]
      if (charge === 0.0) return
      p += charge / dSq
    })

    return this.scale(p * 332) // 332 to convert to kcal/mol
  }
}

ColormakerRegistry.add('electrostatic', ElectrostaticColormaker as any)

export default ElectrostaticColormaker
