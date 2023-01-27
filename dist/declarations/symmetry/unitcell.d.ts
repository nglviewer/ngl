/**
 * @file Unitcell
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Matrix4 } from 'three';
import { UnitcellPicker } from '../utils/picker';
import Structure from '../structure/structure';
export interface UnitcellParams {
    a: number;
    b: number;
    c: number;
    alpha: number;
    beta: number;
    gamma: number;
    spacegroup: string;
    cartToFrac?: Matrix4;
}
export interface UnitcellDataParams {
    colorValue?: string | number;
    radius?: number;
}
/**
 * Unitcell class
 */
declare class Unitcell {
    a: number;
    b: number;
    c: number;
    alpha: number;
    beta: number;
    gamma: number;
    spacegroup: string;
    cartToFrac: Matrix4;
    fracToCart: Matrix4;
    volume: number;
    /**
     * @param  {Object} params - unitcell parameters
     * @param  {Number} params.a - length a
     * @param  {Number} params.b - length b
     * @param  {Number} params.c - length c
     * @param  {Number} params.alpha - angle alpha
     * @param  {Number} params.beta - angle beta
     * @param  {Number} params.gamma - angle gamma
     * @param  {String} params.spacegroup - spacegroup
     * @param  {Matrix4} [params.cartToFrac] - transformation matrix from
     *                                         cartesian to fractional coordinates
     * @param  {Matrix4} [params.scale] - alias for `params.cartToFrac`
     */
    constructor(params?: UnitcellParams);
    getPosition(structure: Structure): Float32Array;
    getCenter(structure: Structure): Vector3;
    getData(structure: Structure, params?: UnitcellDataParams): {
        vertex: {
            position: Float32Array;
            color: import("../types").NumberArray;
            radius: Float32Array;
            picking: UnitcellPicker;
        };
        edge: {
            position1: Float32Array;
            position2: Float32Array;
            color: import("../types").NumberArray;
            color2: import("../types").NumberArray;
            radius: Float32Array;
            picking: UnitcellPicker;
        };
    };
}
export default Unitcell;
