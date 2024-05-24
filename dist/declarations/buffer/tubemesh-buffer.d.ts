/**
 * @file Tube Mesh Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Matrix4 } from 'three';
import MeshBuffer from './mesh-buffer';
import { BufferData, BufferParameters } from './buffer';
export interface TubeMeshBufferData extends BufferData {
    binormal: Float32Array;
    tangent: Float32Array;
    size: Float32Array;
}
export declare const TubeMeshBufferDefaultParameters: {
    radialSegments: number;
    capped: boolean;
    aspectRatio: number;
} & {
    opaqueBack: boolean;
    side: import("./buffer").BufferSide;
    opacity: number;
    depthWrite: boolean;
    clipNear: number;
    clipRadius: number;
    clipCenter: Vector3;
    flatShaded: boolean;
    wireframe: boolean;
    roughness: number;
    metalness: number;
    diffuse: number;
    diffuseInterior: boolean;
    useInteriorColor: boolean;
    interiorColor: number;
    interiorDarkening: number;
    forceTransparent: boolean;
    matrix: Matrix4;
    disablePicking: boolean;
    sortParticles: boolean;
    background: boolean;
};
export declare type TubeMeshBufferParameters = BufferParameters & {
    radialSegments: number;
    capped: boolean;
    aspectRatio: number;
};
/**
 * Tube mesh buffer. Draws a tube.
 */
declare class TubeMeshBuffer extends MeshBuffer {
    get defaultParameters(): {
        radialSegments: number;
        capped: boolean;
        aspectRatio: number;
    } & {
        opaqueBack: boolean;
        side: import("./buffer").BufferSide;
        opacity: number;
        depthWrite: boolean;
        clipNear: number;
        clipRadius: number;
        clipCenter: Vector3;
        flatShaded: boolean;
        wireframe: boolean;
        roughness: number;
        metalness: number;
        diffuse: number;
        diffuseInterior: boolean;
        useInteriorColor: boolean;
        interiorColor: number;
        interiorDarkening: number;
        forceTransparent: boolean;
        matrix: Matrix4;
        disablePicking: boolean;
        sortParticles: boolean;
        background: boolean;
    };
    parameters: TubeMeshBufferParameters;
    capVertices: number;
    capTriangles: number;
    size2: number;
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.normal - normals
     * @param  {Float32Array} data.binormal - binormals
     * @param  {Float32Array} data.tangent - tangents
     * @param  {Float32Array} data.color - colors
     * @param  {Float32Array} data.size - sizes
     * @param  {Picker} data.picking - picking ids
     * @param  {BufferParameters} params - parameter object
     */
    constructor(data: TubeMeshBufferData, params?: Partial<TubeMeshBufferParameters>);
    setAttributes(data?: Partial<TubeMeshBufferData>): void;
    makeIndex(): void;
}
export default TubeMeshBuffer;
