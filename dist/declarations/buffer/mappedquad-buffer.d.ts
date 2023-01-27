/**
 * @file Mapped Quad Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { BufferParameters, BufferData } from './buffer';
import MappedBuffer from './mapped-buffer';
/**
 * Mapped Quad buffer. Draws screen-aligned quads. Used to render impostors.
 * @interface
 */
declare class MappedQuadBuffer extends MappedBuffer {
    constructor(data: BufferData, params?: Partial<BufferParameters>);
    get mapping(): Float32Array;
    get mappingIndices(): Uint16Array;
    get mappingIndicesSize(): number;
    get mappingSize(): number;
    get mappingItemSize(): number;
}
export default MappedQuadBuffer;
