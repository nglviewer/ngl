/**
 * @file Sphere Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Matrix4 } from 'three';
import GeometryBuffer from './geometry-buffer';
import { SphereBufferData } from './sphere-buffer';
import { BufferParameters } from './buffer';
export declare const SphereGeometryBufferDefaultParameters: {
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
export declare type SphereGeometryBufferParameters = BufferParameters & {
    sphereDetail: number;
};
/**
 * Sphere geometry buffer.
 *
 * @example
 * var sphereGeometryBuffer = new SphereGeometryBuffer({
 *   position: new Float32Array([ 0, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
declare class SphereGeometryBuffer extends GeometryBuffer {
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
    parameters: SphereGeometryBufferParameters;
    private _radius;
    /**
     * @param {Object} data - attribute object
     * @param {Float32Array} data.position - positions
     * @param {Float32Array} data.color - colors
     * @param {Float32Array} data.radius - radii
     * @param {Picker} [data.picking] - picking ids
     * @param {BufferParameters} params - parameter object
     */
    constructor(data: SphereBufferData, params?: Partial<SphereGeometryBufferParameters>);
    applyPositionTransform(matrix: Matrix4, i: number): void;
    setAttributes(data?: Partial<SphereBufferData>, initNormals?: boolean): void;
}
export default SphereGeometryBuffer;
