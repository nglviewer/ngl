/**
 * @file Sphere Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import '../shader/SphereImpostor.vert';
import '../shader/SphereImpostor.frag';
import MappedQuadBuffer from './mappedquad-buffer';
import { SphereBufferData } from './sphere-buffer';
import { BufferParameters } from './buffer';
/**
 * Sphere impostor buffer.
 *
 * @example
 * var sphereImpostorBuffer = new SphereImpostorBuffer({
 *   position: new Float32Array([ 0, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
declare class SphereImpostorBuffer extends MappedQuadBuffer {
    isImpostor: boolean;
    vertexShader: string;
    fragmentShader: string;
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.color - colors
     * @param  {Float32Array} data.radius - radii
     * @param {Picker} [data.picking] - picking ids
     * @param  {BufferParameters} params - parameter object
     */
    constructor(data: SphereBufferData, params?: Partial<BufferParameters>);
}
export default SphereImpostorBuffer;
