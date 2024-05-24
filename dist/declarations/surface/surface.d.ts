/**
 * @file Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Box3, BufferGeometry, Group } from 'three';
import { AtomPicker, SurfacePicker } from '../utils/picker';
import { ColormakerParameters } from '../color/colormaker';
import { Structure, Volume } from '../ngl';
export interface SurfaceData {
    position: Float32Array;
    index: Uint32Array | Uint16Array | undefined;
    normal: Float32Array;
    color: Float32Array;
    atomindex: Int32Array;
    contour: boolean;
}
/**
 * Surface
 */
declare class Surface {
    name: string;
    path: string;
    position: Float32Array;
    index: Uint32Array | Uint16Array | undefined;
    normal: Float32Array | undefined;
    color: Float32Array | undefined;
    atomindex: Int32Array | undefined;
    contour: boolean;
    center: Vector3;
    boundingBox: Box3;
    size: number;
    info: {
        type?: string;
        probeRadius?: number;
        scaleFactor?: number;
        smooth?: number;
        cutoff?: number;
        isolevel?: number;
        volume?: Volume;
    };
    /**
     * @param {String} name - surface name
     * @param {String} path - source path
     * @param {Object} data - surface data
     * @param {Float32Array} data.position - surface positions
     * @param {Int32Array} data.index - surface indices
     * @param {Float32Array} data.normal - surface normals
     * @param {Float32Array} data.color - surface colors
     * @param {Int32Array} data.atomindex - atom indices
     * @param {boolean} data.contour - contour mode flag
     */
    constructor(name: string, path: string, data?: SurfaceData);
    get type(): string;
    /**
     * set surface data
     * @param {Float32Array} position - surface positions
     * @param {Int32Array} index - surface indices
     * @param {Float32Array} normal - surface normals
     * @param {Float32Array} color - surface colors
     * @param {Int32Array} atomindex - atom indices
     * @param {boolean} contour - contour mode flag
     * @return {undefined}
     */
    set(position: Float32Array, index: Uint32Array | Uint16Array | undefined, normal: Float32Array | undefined, color: Float32Array | undefined, atomindex: Int32Array | undefined, contour?: boolean): void;
    fromGeometry(geometry: BufferGeometry | Group): void;
    getPosition(): Float32Array;
    getColor(params: ColormakerParameters & {
        scheme: string;
    }): Float32Array;
    getPicking(structure?: Structure): AtomPicker | SurfacePicker;
    getNormal(): Float32Array | undefined;
    getSize(size: number, scale: number): Float32Array;
    getIndex(): Uint16Array | Uint32Array | undefined;
    getFilteredIndex(sele: string, structure: Structure): Uint16Array | Uint32Array | undefined;
    getAtomindex(): Int32Array | undefined;
    dispose(): void;
}
export default Surface;
