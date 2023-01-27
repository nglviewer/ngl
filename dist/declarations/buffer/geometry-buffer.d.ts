/**
 * @file Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4, BufferGeometry } from 'three';
import MeshBuffer from './mesh-buffer';
import { BufferParameters, BufferData } from './buffer';
/**
 * Geometry buffer. Base class for geometry-based buffers. Used to draw
 * geometry primitives given a mesh.
 * @interface
 */
declare abstract class GeometryBuffer extends MeshBuffer {
    updateNormals: boolean;
    geoPosition: Float32Array;
    geoNormal: Float32Array;
    geoIndex?: Uint32Array | Uint16Array;
    positionCount: number;
    geoPositionCount: number;
    transformedGeoPosition: Float32Array;
    transformedGeoNormal: Float32Array;
    meshPosition: Float32Array;
    meshColor: Float32Array;
    meshIndex: Uint32Array | Uint16Array;
    meshNormal: Float32Array;
    /**
     * @param {Object} data - buffer data
     * @param {Float32Array} data.position - positions
     * @param {Float32Array} data.color - colors
     * @param {Float32Array} data.radius - radii
     * @param {Picker} [data.picking] - picking ids
     * @param {BufferParameters} [params] - parameters object
     * @param {BufferGeometry} geo - geometry object
     */
    constructor(data: BufferData, params: Partial<BufferParameters> | undefined, geo: BufferGeometry);
    abstract applyPositionTransform(matrix: Matrix4, i: number, i3?: number): void;
    setAttributes(data?: Partial<BufferData>, initNormals?: boolean): void;
    makeIndex(): void;
}
export default GeometryBuffer;
