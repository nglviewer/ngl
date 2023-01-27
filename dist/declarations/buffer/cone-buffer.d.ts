/**
 * @file Cone Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4, Vector3 } from 'three';
import GeometryBuffer from './geometry-buffer';
import { BufferData } from './buffer';
export interface ConeBufferData extends BufferData {
    position1: Float32Array;
    position2: Float32Array;
    radius: Float32Array;
}
export declare const ConeBufferDefaultParameters: {
    radialSegments: number;
    openEnded: boolean;
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
export declare type ConeBufferParameters = typeof ConeBufferDefaultParameters;
/**
 * Cone geometry buffer.
 *
 * @example
 * var coneBuffer = new ConeBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 1, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
declare class ConeBuffer extends GeometryBuffer {
    updateNormals: boolean;
    get defaultParameters(): {
        radialSegments: number;
        openEnded: boolean;
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
    parameters: ConeBufferParameters;
    _position: Float32Array;
    _position1: Float32Array;
    _position2: Float32Array;
    _radius: Float32Array;
    /**
     * @param {Object} data - buffer data
     * @param {Float32Array} data.position1 - from positions
     * @param {Float32Array} data.position2 - to positions
     * @param {Float32Array} data.color - colors
     * @param {Float32Array} data.radius - radii
     * @param {Picker} [data.picking] - picking ids
     * @param {BufferParameters} [params] - parameters object
     */
    constructor(data: ConeBufferData, params?: Partial<ConeBufferParameters>);
    applyPositionTransform(matrix: Matrix4, i: number, i3: number): void;
    setAttributes(data?: Partial<ConeBufferData>, initNormals?: boolean): void;
}
export default ConeBuffer;
