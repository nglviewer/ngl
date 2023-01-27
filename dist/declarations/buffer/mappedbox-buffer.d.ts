/**
 * @file Mapped Box Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { BufferParameters, BufferData } from './buffer';
import MappedBuffer from './mapped-buffer';
/**
 * Mapped Box buffer. Draws boxes. Used to render general imposters.
 * @interface
 */
declare class MappedBoxBuffer extends MappedBuffer {
    constructor(data: BufferData, params?: Partial<BufferParameters>);
    get mapping(): Float32Array;
    get mappingIndices(): Uint16Array;
    get mappingIndicesSize(): number;
    get mappingSize(): number;
    get mappingItemSize(): number;
}
export default MappedBoxBuffer;
