/**
 * @file Mapped Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Buffer, { BufferParameters, BufferData } from './buffer';
export declare type MappingType = 'v2' | 'v3';
/**
 * Mapped buffer. Sends mapping attribute to the GPU and repeats data in
 * others attributes. Used to render imposters.
 * @interface
 */
declare abstract class MappedBuffer extends Buffer {
    index: Uint32Array | Uint16Array;
    constructor(mappingType: MappingType, data: BufferData, params?: Partial<BufferParameters>);
    abstract get mapping(): Float32Array;
    abstract get mappingIndices(): Uint32Array | Uint16Array;
    abstract get mappingIndicesSize(): number;
    abstract get mappingSize(): number;
    abstract get mappingItemSize(): number;
    get attributeSize(): number;
    get indexSize(): number;
    addAttributes(attributes: any): void;
    getAttributeIndex(dataIndex: number): number;
    setAttributes(data: any): void;
    makeMapping(): void;
    makeIndex(): void;
}
export default MappedBuffer;
