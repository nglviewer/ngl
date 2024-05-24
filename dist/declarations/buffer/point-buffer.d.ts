/**
 * @file Point Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { DataTexture, Vector3, Matrix4 } from 'three';
import '../shader/Point.vert';
import '../shader/Point.frag';
import Buffer, { BufferData, BufferTypes, BufferParameters } from './buffer';
export declare const PointBufferDefaultParameters: {
    pointSize: number;
    sizeAttenuation: boolean;
    sortParticles: boolean;
    alphaTest: number;
    useTexture: boolean;
    forceTransparent: boolean;
    edgeBleach: number;
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
export declare type PointBufferParameters = BufferParameters & {
    pointSize: number;
    sizeAttenuation: boolean;
    sortParticles: boolean;
    alphaTest: number;
    useTexture: boolean;
    forceTransparent: boolean;
    edgeBleach: number;
};
/**
 * Point buffer. Draws points. Optionally textured.
 *
 * @example
 * var pointBuffer = new PointBuffer( {
 *     position: new Float32Array( [ 0, 0, 0 ] ),
 *     color: new Float32Array( [ 1, 0, 0 ] )
 * } );
 */
declare class PointBuffer extends Buffer {
    parameterTypes: {
        pointSize: {
            uniform: string;
        };
        sizeAttenuation: {
            updateShader: boolean;
        };
        sortParticles: {};
        alphaTest: {
            uniform: boolean;
        };
        useTexture: {
            updateShader: boolean;
        };
        forceTransparent: {};
        edgeBleach: {
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
        pointSize: number;
        sizeAttenuation: boolean;
        sortParticles: boolean;
        alphaTest: number;
        useTexture: boolean;
        forceTransparent: boolean;
        edgeBleach: number;
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
    parameters: PointBufferParameters;
    vertexShader: string;
    fragmentShader: string;
    isPoint: boolean;
    tex: DataTexture;
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.color - colors
     * @param  {BufferParameters} params - parameter object
     */
    constructor(data: BufferData, params?: Partial<PointBufferParameters>);
    makeMaterial(): void;
    makeTexture(): void;
    getDefines(type?: BufferTypes): import("../shader/shader-utils").ShaderDefines;
    setUniforms(data: any): void;
    dispose(): void;
}
export default PointBuffer;
