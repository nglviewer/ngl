/**
 * @file Symmetry Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4 } from 'three';
export declare function getSymmetryOperations(spacegroup: string): {
    [k: string]: Matrix4;
};
