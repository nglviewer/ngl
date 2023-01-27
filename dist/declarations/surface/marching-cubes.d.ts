/**
 * @file Marching Cubes
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
interface MarchingCubes {
    new (field: number[], nx: number, ny: number, nz: number, atomindex: number[]): void;
    triangulate: (_isolevel: number, _noNormals: boolean, _box: number[][] | undefined, _contour: boolean, _wrap: boolean) => {
        position: Float32Array;
        normal: undefined | Float32Array;
        index: Uint32Array | Uint16Array;
        atomindex: Int32Array | undefined;
        contour: boolean;
    };
}
declare function MarchingCubes(this: MarchingCubes, field: number[], nx: number, ny: number, nz: number, atomindex: number[]): void;
export default MarchingCubes;
