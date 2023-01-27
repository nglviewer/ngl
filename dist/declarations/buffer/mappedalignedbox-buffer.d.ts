/**
 * @file Mapped Aligned Box Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { BufferParameters, BufferData } from './buffer';
import MappedBuffer from './mapped-buffer';
/**
 * Mapped Aligned box buffer. Draws boxes where one side is always screen-space aligned.
 * Used to render cylinder imposters.
 * @interface
 */
declare class MappedAlignedBoxBuffer extends MappedBuffer {
    constructor(data: BufferData, params?: Partial<BufferParameters>);
    get mapping(): Float32Array;
    get mappingIndices(): Uint16Array;
    get mappingIndicesSize(): number;
    get mappingSize(): number;
    get mappingItemSize(): number;
}
export default MappedAlignedBoxBuffer;
