/**
 * @file Ellipsoid Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Matrix4 } from 'three';
import GeometryBuffer from './geometry-buffer';
import { BufferData } from './buffer';
export interface EllipsoidBufferData extends BufferData {
    majorAxis: Float32Array;
    minorAxis: Float32Array;
    radius: Float32Array;
}
export declare const EllipsoidBufferDefaultParameters: {
    sphereDetail: number;
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
export declare type EllipsoidBufferParameters = typeof EllipsoidBufferDefaultParameters;
/**
 * Ellipsoid buffer. Draws ellipsoids.
 *
 * @example
 * var ellipsoidBuffer = new EllipsoidBuffer({
 *   position: new Float32Array([ 0, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   radius: new Float32Array([ 1 ]),
 *   majorAxis: new Float32Array([ 1, 1, 0 ]),
 *   minorAxis: new Float32Array([ 0.5, 0, 0.5 ]),
 * });
 */
declare class EllipsoidBuffer extends GeometryBuffer {
    updateNormals: boolean;
    get defaultParameters(): {
        sphereDetail: number;
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
    parameters: EllipsoidBufferParameters;
    _majorAxis: Float32Array;
    _minorAxis: Float32Array;
    _radius: Float32Array;
    constructor(data: EllipsoidBufferData, params?: Partial<EllipsoidBufferParameters>);
    applyPositionTransform(matrix: Matrix4, i: number, i3: number): void;
    setAttributes(data?: Partial<EllipsoidBufferData>, initNormals?: boolean): void;
}
export default EllipsoidBuffer;
