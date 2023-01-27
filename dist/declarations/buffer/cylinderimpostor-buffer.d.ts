/**
 * @file Cylinder Impostor Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4, Vector3 } from 'three';
import '../shader/CylinderImpostor.vert';
import '../shader/CylinderImpostor.frag';
import MappedAlignedBoxBuffer from './mappedalignedbox-buffer';
import { BufferParameters, BufferTypes } from './buffer';
import { CylinderBufferData } from './cylinder-buffer';
export declare const CylinderImpostorBufferDefaultParameters: {
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
export declare type CylinderImpostorBufferParameters = BufferParameters & {
    openEnded: boolean;
};
/**
 * Cylinder impostor buffer.
 *
 * @example
 * var cylinderimpostorBuffer = new CylinderImpostorBuffer({
 *     position1: new Float32Array([ 0, 0, 0 ]),
 *     position2: new Float32Array([ 1, 1, 1 ]),
 *     color: new Float32Array([ 1, 0, 0 ]),
 *     color2: new Float32Array([ 0, 1, 0 ]),
 *     radius: new Float32Array([ 1 ])
 * });
 */
declare class CylinderImpostorBuffer extends MappedAlignedBoxBuffer {
    parameterTypes: {
        openEnded: {
            updateShader: boolean;
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
    parameters: CylinderImpostorBufferParameters;
    isImpostor: boolean;
    vertexShader: string;
    fragmentShader: string;
    /**
     * make cylinder impostor buffer
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position1 - from positions
     * @param  {Float32Array} data.position2 - to positions
     * @param  {Float32Array} data.color - from colors
     * @param  {Float32Array} data.color2 - to colors
     * @param  {Float32Array} data.radius - radii
     * @param  {Picker} data.picking - picking ids
     * @param  {BufferParameters} params - parameter object
     */
    constructor(data: CylinderBufferData, params?: Partial<CylinderImpostorBufferParameters>);
    getDefines(type?: BufferTypes): any;
}
export default CylinderImpostorBuffer;
