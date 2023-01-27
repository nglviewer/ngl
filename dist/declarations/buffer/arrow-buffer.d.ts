/**
 * @file Arrow Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4, Vector3, Group } from 'three';
import { Picker } from '../utils/picker';
import { CylinderBufferData } from './cylinder-buffer';
import CylinderGeometryBuffer from './cylindergeometry-buffer';
import ConeBuffer, { ConeBufferData } from './cone-buffer';
import GeometryGroup from '../viewer/geometry-group';
import { BufferData } from './buffer';
export interface ArrowBufferData extends BufferData {
    position1: Float32Array;
    position2: Float32Array;
    radius: Float32Array;
}
export declare const ArrowBufferDefaultParameters: {
    aspectRatio: number;
    radialSegments: number;
    openEnded: boolean;
    disableImpostor: boolean;
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
export declare type ArrowBufferParameters = typeof ArrowBufferDefaultParameters;
/**
 * Arrow buffer. Draws arrows made from a cylinder and a cone.
 * @implements {Buffer}
 *
 * @example
 * var arrowBuffer = new ArrowBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 10, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
declare class ArrowBuffer {
    parameters: ArrowBufferParameters;
    get defaultParameters(): {
        aspectRatio: number;
        radialSegments: number;
        openEnded: boolean;
        disableImpostor: boolean;
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
    cylinderBuffer: CylinderGeometryBuffer;
    coneBuffer: ConeBuffer;
    splitPosition: Float32Array;
    cylinderRadius: Float32Array;
    geometry: GeometryGroup;
    picking?: Picker;
    group: Group;
    wireframeGroup: Group;
    pickingGroup: Group;
    visible: boolean;
    /**
     * @param {Object} data - buffer data
     * @param {Float32Array} data.position1 - from positions
     * @param {Float32Array} data.position2 - to positions
     * @param {Float32Array} data.color - colors
     * @param {Float32Array} data.radius - radii
     * @param {Picker} [data.picking] - picking ids
     * @param {BufferParameters} [params] - parameters object
     */
    constructor(data: ArrowBufferData, params?: Partial<ArrowBufferParameters>);
    set matrix(m: Matrix4);
    get matrix(): Matrix4;
    get pickable(): boolean;
    makeAttributes(data?: Partial<ArrowBufferData>): {
        cylinder: Partial<CylinderBufferData>;
        cone: Partial<ConeBufferData>;
    };
    getMesh(): Group;
    getWireframeMesh(): Group;
    getPickingMesh(): Group;
    setAttributes(data?: Partial<ArrowBufferData>): void;
    /**
     * Set buffer parameters
     * @param {BufferParameters} params - buffer parameters object
     * @return {undefined}
     */
    setParameters(params?: Partial<ArrowBufferParameters>): void;
    setVisibility(value: boolean): void;
    dispose(): void;
}
export default ArrowBuffer;
