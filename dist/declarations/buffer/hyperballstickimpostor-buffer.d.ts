/**
 * @file Hyperball Stick Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4, Vector3 } from 'three';
import '../shader/HyperballStickImpostor.vert';
import '../shader/HyperballStickImpostor.frag';
import MappedBoxBuffer from './mappedbox-buffer';
import { BufferData, BufferParameters } from './buffer';
export interface HyperballStickImpostorBufferData extends BufferData {
    position1: Float32Array;
    position2: Float32Array;
    color2: Float32Array;
    radius: Float32Array;
    radius2: Float32Array;
}
export declare const HyperballStickImpostorBufferDefaultParameters: {
    shrink: number;
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
export declare type HyperballStickImpostorBufferParameters = BufferParameters & {
    shrink: number;
};
/**
 * Hyperball stick impostor buffer.
 *
 * @example
 * var hyperballStickImpostorBuffer = new HyperballStickImpostorBuffer({
 *   position1: new Float32Array([ 0, 0, 0 ]),
 *   position2: new Float32Array([ 2, 2, 2 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   color2: new Float32Array([ 0, 1, 0 ]),
 *   radius: new Float32Array([ 1 ]),
 *   radius2: new Float32Array([ 2 ])
 * });
 */
declare class HyperballStickImpostorBuffer extends MappedBoxBuffer {
    parameterTypes: {
        shrink: {
            uniform: boolean;
        };
    } & {
        opaqueBack: {
            updateShader: boolean;
        };
        side: {
            updateShader: boolean;
            property: boolean;
        };
        opacity: {
            uniform: boolean;
        };
        depthWrite: {
            property: boolean;
        };
        clipNear: {
            updateShader: boolean;
            property: boolean;
        };
        clipRadius: {
            updateShader: boolean;
            uniform: boolean;
        };
        clipCenter: {
            uniform: boolean;
        };
        flatShaded: {
            updateShader: boolean;
        };
        background: {
            updateShader: boolean;
        };
        wireframe: {
            updateVisibility: boolean;
        };
        roughness: {
            uniform: boolean;
        };
        metalness: {
            uniform: boolean;
        };
        diffuse: {
            uniform: boolean;
        };
        diffuseInterior: {
            updateShader: boolean;
        };
        useInteriorColor: {
            updateShader: boolean;
        };
        interiorColor: {
            uniform: boolean;
        };
        interiorDarkening: {
            uniform: boolean;
        };
        matrix: {};
    };
    get defaultParameters(): {
        shrink: number;
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
    parameters: HyperballStickImpostorBufferParameters;
    isImpostor: boolean;
    vertexShader: string;
    fragmentShader: string;
    constructor(data: HyperballStickImpostorBufferData, params?: Partial<HyperballStickImpostorBufferParameters>);
}
export default HyperballStickImpostorBuffer;
