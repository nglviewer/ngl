/**
 * @file Vector Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4, Vector3 } from 'three';
import '../shader/Line.vert';
import '../shader/Line.frag';
import Buffer, { BufferData, BufferParameters } from './buffer';
import { GenericColor } from '../types';
export interface VectorBufferData extends BufferData {
    vector: Float32Array;
}
export declare const VectorBufferDefaultParameters: {
    scale: number;
    color: string;
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
export declare type VectorBufferParameters = BufferParameters & {
    scale: number;
    color: GenericColor;
};
/**
 * Vector buffer. Draws vectors as lines.
 */
declare class VectorBuffer extends Buffer {
    get defaultParameters(): {
        scale: number;
        color: string;
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
    parameters: VectorBufferParameters;
    isLine: boolean;
    vertexShader: string;
    fragmentShader: string;
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.vector - vectors
     * @param  {BufferParameters} params - parameter object
     */
    constructor(data: VectorBufferData, params?: Partial<VectorBufferParameters>);
    setAttributes(data?: Partial<VectorBufferData>): void;
}
export default VectorBuffer;
