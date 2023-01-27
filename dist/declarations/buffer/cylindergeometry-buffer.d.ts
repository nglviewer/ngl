/**
 * @file Cylinder Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4, Vector3 } from 'three';
import GeometryBuffer from './geometry-buffer';
import { CylinderBufferData } from './cylinder-buffer';
import { BufferParameters } from './buffer';
export declare const CylinderGeometryBufferDefaultParameters: {
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
export declare type CylinderGeometryBufferParameters = BufferParameters & {
    radialSegments: number;
    openEnded: boolean;
};
/**
 * Cylinder geometry buffer.
 *
 * @example
 * var cylinderGeometryBuffer = new CylinderGeometryBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 1, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
declare class CylinderGeometryBuffer extends GeometryBuffer {
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
    parameters: CylinderGeometryBufferParameters;
    __center: Float32Array;
    _position: Float32Array;
    _color: Float32Array;
    _from: Float32Array;
    _to: Float32Array;
    _radius: Float32Array;
    /**
     * @param {Object} data - buffer data
     * @param {Float32Array} data.position1 - from positions
     * @param {Float32Array} data.position2 - to positions
     * @param {Float32Array} data.color - from colors
     * @param {Float32Array} data.color2 - to colors
     * @param {Float32Array} data.radius - radii
     * @param {Picker} [data.picking] - picking ids
     * @param {BufferParameters} [params] - parameters object
     */
    constructor(data: CylinderBufferData, params?: Partial<CylinderGeometryBufferParameters>);
    applyPositionTransform(matrix: Matrix4, i: number, i3: number): void;
    setAttributes(data?: Partial<CylinderBufferData>, initNormals?: boolean): void;
}
export default CylinderGeometryBuffer;
