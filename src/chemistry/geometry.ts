/**
 * @file Geometry
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { Vector3 } from 'three'

import { Elements } from '../structure/structure-constants'
import { degToRad } from '../math/math-utils'
import AtomProxy from '../proxy/atom-proxy'

// Changed numbering so they're mostly inline with coordination number
// from VSEPR
export const enum AtomGeometry {
  Spherical = 0,
  Terminal = 1,
  Linear = 2,
  Trigonal = 3,
  Tetrahedral = 4,
  TrigonalBiPyramidal = 5,
  Octahedral = 6,
  SquarePlanar = 7, // Okay, it breaks down somewhere!
  Unknown = 8
}

export function assignGeometry (totalCoordination: number): AtomGeometry {
  switch(totalCoordination){
    case 0:
      return AtomGeometry.Spherical
    case 1:
      return AtomGeometry.Terminal
    case 2:
      return AtomGeometry.Linear
    case 3:
      return AtomGeometry.Trigonal
    case 4:
      return AtomGeometry.Tetrahedral
    default:
      return AtomGeometry.Unknown
  }
}

export const Angles = new Map<AtomGeometry, number>([
  [ AtomGeometry.Linear, degToRad(180) ],
  [ AtomGeometry.Trigonal, degToRad(120) ],
  [ AtomGeometry.Tetrahedral, degToRad(109.4721) ],
  [ AtomGeometry.Octahedral, degToRad(90) ]
])

/**
 * Calculate the angles x-1-2 for all x where x is a heavy atom bonded to ap1.
 * @param  {AtomProxy} ap1 First atom (angle centre)
 * @param  {AtomProxy} ap2 Second atom
 * @return {number[]}        Angles in radians
 */
export function calcAngles (ap1: AtomProxy, ap2: AtomProxy): number[] {
  let angles: number[] = []
  const d1 = new Vector3()
  const d2 = new Vector3()
  d1.subVectors(ap2 as any, ap1 as any)
  ap1.eachBondedAtom( x => {
    if (x.number !== Elements.H) {
      d2.subVectors(x as any, ap1 as any)
      angles.push(d1.angleTo(d2))
    }
   })
  return angles
}

/**
 * Find two neighbours of ap1 to define a plane (if possible) and
 * measure angle out of plane to ap2
 * @param  {AtomProxy} ap1 First atom (angle centre)
 * @param  {AtomProxy} ap2 Second atom (out-of-plane)
 * @return {number}        Angle from plane to second atom
 */
export function calcPlaneAngle (ap1: AtomProxy, ap2: AtomProxy): number | undefined {
  const x1 = ap1.clone()

  const v12 = new Vector3()
  v12.subVectors(ap2 as any, ap1 as any)

  const neighbours = [new Vector3(), new Vector3()]
  let ni = 0
  ap1.eachBondedAtom( x => {
    if (ni > 1) { return }
    if (x.number !== Elements.H) {
      x1.index = x.index
      neighbours[ni++].subVectors(x as any, ap1 as any)
    }
  })
  if (ni === 1) {
    x1.eachBondedAtom( x => {
      if (ni > 1) { return }
      if (x.number !== Elements.H && x.index !== ap1.index){
        neighbours[ni++].subVectors(x as any, ap1 as any)
      }
    })
  }
  if (ni !== 2) {
    return
  }

  const cp = neighbours[0].cross(neighbours[1])
  return Math.abs((Math.PI / 2) - cp.angleTo(v12))
}
