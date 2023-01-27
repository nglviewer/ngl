/**
 * @file Cylinder Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Matrix4 } from 'three';
import CylinderGeometryBuffer, { CylinderGeometryBufferParameters } from './cylindergeometry-buffer';
import CylinderImpostorBuffer, { CylinderImpostorBufferParameters } from './cylinderimpostor-buffer';
import { BufferData } from './buffer';
export interface CylinderBufferData extends BufferData {
    position1: Float32Array;
    position2: Float32Array;
    color2: Float32Array;
    radius: Float32Array;
}
export declare const CylinderBufferDefaultParameters: {
    disableImpostor: boolean;
} & {
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
} & {
    openEnded: boolean;
};
export declare type CylinderBufferParameters = (CylinderGeometryBufferParameters & {
    disableImpostor: boolean;
}) | (CylinderImpostorBufferParameters & {
    disableImpostor: boolean;
});
/**
 * Cylinder buffer. Depending on the value {@link ExtensionFragDepth} and
 * `params.disableImpostor` the constructor returns either a
 * {@link CylinderGeometryBuffer} or a {@link CylinderImpostorBuffer}
 * @implements {Buffer}
 *
 * @example
 * var cylinderBuffer = new CylinderBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 1, 1, 1 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ]),
 *   radius: new Float32Array([ 1 ])
 * });
 */
declare const CylinderBuffer: {
    new (data: CylinderBufferData, params: Partial<CylinderBufferParameters>): CylinderGeometryBuffer | CylinderImpostorBuffer;
};
declare type CylinderBuffer = CylinderGeometryBuffer | CylinderImpostorBuffer;
export default CylinderBuffer;
