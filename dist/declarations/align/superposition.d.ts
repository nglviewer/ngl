/**
 * @file Superposition
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4 } from 'three';
import { Matrix } from '../math/matrix-utils';
import Structure from '../structure/structure';
declare class Superposition {
    coords1t: Matrix;
    coords2t: Matrix;
    transformationMatrix: Matrix4;
    mean1: number[];
    mean2: number[];
    A: Matrix;
    W: Matrix;
    U: Matrix;
    V: Matrix;
    VH: Matrix;
    R: Matrix;
    private tmp;
    private c;
    constructor(atoms1: Structure | Float32Array, atoms2: Structure | Float32Array);
    _superpose(coords1: Matrix, coords2: Matrix): void;
    prepCoords(atoms: Structure | Float32Array, coords: Matrix, n: number, is4X4: boolean): void;
    transform(atoms: Structure | Float32Array): number | Matrix4 | undefined;
}
export default Superposition;
