/**
 * @file Ribbon Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import '../shader/Ribbon.vert';
import MeshBuffer from './mesh-buffer';
import { BufferParameters, BufferData } from './buffer';
export interface RibbonBufferData extends BufferData {
    normal: Float32Array;
    dir: Float32Array;
    size: Float32Array;
}
/**
 * Ribbon buffer. Draws a thin ribbon.
 */
declare class RibbonBuffer extends MeshBuffer {
    vertexShader: string;
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.normal - normals
     * @param  {Float32Array} data.dir - binormals
     * @param  {Float32Array} data.color - colors
     * @param  {Float32Array} data.size - sizes
     * @param  {Picker} data.picking - picking ids
     * @param  {BufferParameters} params - parameter object
     */
    constructor(data: RibbonBufferData, params?: Partial<BufferParameters>);
    setAttributes(data?: Partial<RibbonBufferData>): void;
    makeIndex(): void;
}
export default RibbonBuffer;
