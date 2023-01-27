/**
 * @file Geometry
 * @author Fred Ludlow <Fred.Ludlow@astx.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import AtomProxy from '../proxy/atom-proxy';
export declare const enum AtomGeometry {
    Spherical = 0,
    Terminal = 1,
    Linear = 2,
    Trigonal = 3,
    Tetrahedral = 4,
    TrigonalBiPyramidal = 5,
    Octahedral = 6,
    SquarePlanar = 7,
    Unknown = 8
}
export declare function assignGeometry(totalCoordination: number): AtomGeometry;
export declare const Angles: Map<AtomGeometry, number>;
/**
 * Calculate the angles x-1-2 for all x where x is a heavy atom bonded to ap1.
 * @param  {AtomProxy} ap1 First atom (angle centre)
 * @param  {AtomProxy} ap2 Second atom
 * @return {number[]}        Angles in radians
 */
export declare function calcAngles(ap1: AtomProxy, ap2: AtomProxy): number[];
/**
 * Find two neighbours of ap1 to define a plane (if possible) and
 * measure angle out of plane to ap2
 * @param  {AtomProxy} ap1 First atom (angle centre)
 * @param  {AtomProxy} ap2 Second atom (out-of-plane)
 * @return {number}        Angle from plane to second atom
 */
export declare function calcPlaneAngle(ap1: AtomProxy, ap2: AtomProxy): number | undefined;
