/**
 * @file Tetrahedron Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4 } from 'three';
import GeometryBuffer from './geometry-buffer';
import { BufferData, BufferParameters } from './buffer';
export interface TetrahedronBufferData extends BufferData {
    heightAxis: Float32Array;
    depthAxis: Float32Array;
    size: Float32Array;
}
/**
 * Tetrahedron buffer. Draws tetrahedrons.
 *
 * @example
 * var tetrahedronBuffer = new TetrahedronBuffer({
 *   position: new Float32Array([ 0, 3, 0, -2, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 1, 0, 1, 0 ]),
 *   size: new Float32Array([ 2, 1.5 ]),
 *   heightAxis: new Float32Array([ 0, 1, 1, 0, 2, 0 ]),
 *   depthAxis: new Float32Array([ 1, 0, 1, 0, 0, 2 ])
 * })
 */
declare class TetrahedronBuffer extends GeometryBuffer {
    updateNormals: boolean;
    _heightAxis: Float32Array;
    _depthAxis: Float32Array;
    _size: Float32Array;
    constructor(data: TetrahedronBufferData, params?: Partial<BufferParameters>);
    applyPositionTransform(matrix: Matrix4, i: number, i3: number): void;
    setAttributes(data?: Partial<TetrahedronBufferData>, initNormals?: boolean): void;
}
export default TetrahedronBuffer;
