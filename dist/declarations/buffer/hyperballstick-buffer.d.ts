/**
 * @file Hyperball Stick Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Matrix4 } from 'three';
import CylinderGeometryBuffer, { CylinderGeometryBufferParameters } from './cylindergeometry-buffer';
import HyperballStickImpostorBuffer, { HyperballStickImpostorBufferParameters } from './hyperballstickimpostor-buffer';
import { BufferData } from './buffer';
export interface HyperballStickBufferData extends BufferData {
    position1: Float32Array;
    position2: Float32Array;
    color2: Float32Array;
    radius: Float32Array;
    radius2: Float32Array;
}
export declare const HyperballStickBufferDefaultParameters: {
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
    shrink: number;
};
export declare type HyperballStickBufferParameters = HyperballStickImpostorBufferParameters & CylinderGeometryBufferParameters & {
    disableImpostor: boolean;
};
/**
 * Hyperball stick buffer. Depending on the value {@link ExtensionFragDepth} and
 * `params.disableImpostor` the constructor returns either a
 * {@link CylinderGeometryBuffer} or a {@link HyperballStickImpostorBuffer}
 * @implements {Buffer}
 *
 * @example
 * var hyperballStickBuffer = new HyperballStickBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 2, 2, 2 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ]),
 *   radius: new Float32Array([ 1 ]),
 *   radius2: new Float32Array([ 2 ])
 * });
 */
declare const HyperballStickBuffer: {
    new (data: HyperballStickBufferData, params: Partial<HyperballStickBufferParameters>): CylinderGeometryBuffer | HyperballStickImpostorBuffer;
};
declare type HyperballStickBuffer = CylinderGeometryBuffer | HyperballStickImpostorBuffer;
export default HyperballStickBuffer;
