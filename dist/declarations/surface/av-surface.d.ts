/**
 * @file AV Surface
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */
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
    neighbourListLength: number;
    withinRadii: (x: number, y: number, z: number, rExtra: number, out: Int32Array) => void;
}
declare function makeAVHash(atomsX: Float32Array, atomsY: Float32Array, atomsZ: Float32Array, atomsR: Float32Array, min: Float32Array, max: Float32Array, maxDistance: number): iAVHash;
interface AVSurface {
    getSurface: (type: string, probeRadius: number, scaleFactor: number, cutoff: number, setAtomID: boolean, smooth: number, contour: boolean) => any;
}
declare function AVSurface(this: AVSurface, coordList: Float32Array, radiusList: Float32Array, indexList: Uint16Array | Uint32Array): void;
export { AVSurface, makeAVHash };
