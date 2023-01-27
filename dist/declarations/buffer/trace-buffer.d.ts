/**
 * @file Trace Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import '../shader/Line.vert';
import '../shader/Line.frag';
import Buffer, { BufferParameters, BufferData } from './buffer';
/**
 * Trace buffer. Draws a series of lines.
 */
declare class TraceBuffer extends Buffer {
    isLine: boolean;
    vertexShader: string;
    fragmentShader: string;
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.color - colors
     * @param  {BufferParameters} params - parameter object
     */
    constructor(data: BufferData, params?: Partial<BufferParameters>);
    setAttributes(data: Partial<BufferData>): void;
}
export default TraceBuffer;
