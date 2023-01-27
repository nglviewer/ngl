/**
 * @file Line Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import '../shader/Line.vert';
import '../shader/Line.frag';
import Buffer, { BufferParameters, BufferData } from './buffer';
export interface LineBufferData extends BufferData {
    position1: Float32Array;
    position2: Float32Array;
    color2: Float32Array;
}
/**
 * Line buffer. Draws lines with a fixed width in pixels.
 *
 * @example
 * var lineBuffer = new LineBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 1, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ])
 * });
 */
declare class LineBuffer extends Buffer {
    isLine: boolean;
    vertexShader: string;
    fragmentShader: string;
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position1 - from positions
     * @param  {Float32Array} data.position2 - to positions
     * @param  {Float32Array} data.color - from colors
     * @param  {Float32Array} data.color2 - to colors
     * @param  {BufferParameters} params - parameter object
     */
    constructor(data: LineBufferData, params?: Partial<BufferParameters>);
    setAttributes(data?: Partial<LineBufferData>): void;
}
export default LineBuffer;
