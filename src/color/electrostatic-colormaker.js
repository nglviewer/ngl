/**
 * @file Atomindex Colormaker
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @private
 */

import { Vector3 } from '../../lib/three.es6.js'

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'
import SpatialHash from '../geometry/spatial-hash.js'

// from CHARMM
const partialCharges = {
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
function backboneNHPosition (ap, position) {
  position = position || new Vector3()

  let h = false
  var ca = false
  var c = false
  position.set(2 * ap.x, 2 * ap.y, 2 * ap.z)

  ap.eachBondedAtom(function (a2) {
    // Any time we detect H, reset position and skip
    // future tests
    if (h) return
    if (a2.atomname === 'H') {
      position.set(a2)
      h = true
      return
    }
    if (!ca && a2.atomname === 'CA') {
      position.sub(a2)
      ca = true
    } else if (!c && a2.atomname === 'C') {
      c = true
      position.sub(a2)
    }
  })

  if (h) { return position }

  if (ca && c) {
    position.normalize()
    position.multiplyScalar(nHBondDistance)
    position.add(ap)
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
function buildStoreLike (positions) {
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
  constructor (params) {
    super(params)

    if (!params.scale) {
      this.scale = 'rwb'
    }
    if (!params.domain) {
      this.domain = [ -0.5, 0, 0.5 ]
    }

    const scale = this.getScale()

    function chargeForAtom (a) {
      if (!a.isProtein()) { return 0.0 }
      return (
        (partialCharges[ a.resname ] &&
            partialCharges[ a.resname ][ a.atomname ]) ||
        partialCharges[ 'backbone' ][ a.atomname ] || 0.0
      )
    }

    const structure = this.structure
    const charges = new Float32Array(structure.atomCount)
    const hPositions = []
    const hCharges = []

    structure.eachAtom(ap => {
      charges[ ap.index ] = chargeForAtom(ap) * ap.occupancy
      if (ap.atomname === 'N') {
        const hPos = backboneNHPosition(ap)
        if (hPos !== undefined) {
          hPositions.push(hPos)
          hCharges.push(nHCharge * ap.occupancy)
        }
      }
    })

    const bbox = this.structure.getBoundingBox()
    bbox.expandByScalar(nHBondDistance) // Worst case

    // SpatialHash requires x,y,z and count
    const hStore = buildStoreLike(hPositions)
    const hHash = new SpatialHash(hStore, bbox)
    const hash = new SpatialHash(this.structure.atomStore, bbox)

    const ap = this.atomProxy
    const delta = new Vector3()
    const maxRadius2 = maxRadius * maxRadius

    this.positionColor = function (v) {
      let p = 0.0
      const neighbours = hash.within(v.x, v.y, v.z, maxRadius)

      for (let i = 0; i < neighbours.length; i++) {
        const neighbour = neighbours[ i ]
        const charge = charges[ neighbour ]
        if (charge !== 0.0) {
          ap.index = neighbour
          delta.x = v.x - ap.x
          delta.y = v.y - ap.y
          delta.z = v.z - ap.z
          const r2 = delta.lengthSq()
          if (r2 < maxRadius2) {
            p += charge / r2
          }
        }
      }

      const hNeighbours = hHash.within(v.x, v.y, v.z, maxRadius)
      for (let i = 0; i < hNeighbours.length; i++) {
        const neighbour = hNeighbours[ i ]
        delta.x = v.x - hStore.x[ neighbour ]
        delta.y = v.y - hStore.y[ neighbour ]
        delta.z = v.z - hStore.z[ neighbour ]
        const r2 = delta.lengthSq()
        if (r2 < maxRadius2) {
          p += hCharges[ neighbour ] / r2
        }
      }
      return scale(p)
    }
  }
}

ColormakerRegistry.add('electrostatic', ElectrostaticColormaker)

export default ElectrostaticColormaker
