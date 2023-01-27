/**
 * @file Image Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Matrix4, DataTexture } from 'three';
import '../shader/Image.vert';
import '../shader/Image.frag';
import { Picker } from '../utils/picker';
import Buffer, { BufferTypes } from './buffer';
declare type ImageFilterTypes = 'nearest' | 'linear' | 'cubic-bspline' | 'cubic-catmulrom' | 'cubic-mitchell';
export interface ImageBufferData {
    position: Float32Array;
    imageData: Uint8Array;
    width: number;
    height: number;
    picking?: Picker;
}
export declare const ImageBufferDefaultParameters: {
    filter: ImageFilterTypes;
    forceTransparent: boolean;
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
export declare type ImageBufferParameters = typeof ImageBufferDefaultParameters;
export declare const ImageBufferParameterTypes: {
    filter: {
        updateShader: boolean;
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
/**
 * Image buffer. Draw a single image. Optionally interpolate.
 */
declare class ImageBuffer extends Buffer {
    parameterTypes: {
        filter: {
            updateShader: boolean;
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
        filter: ImageFilterTypes;
        forceTransparent: boolean;
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
    parameters: ImageBufferParameters;
    alwaysTransparent: boolean;
    hasWireframe: boolean;
    vertexShader: string;
    fragmentShader: string;
    tex: DataTexture;
    pickingTex: DataTexture;
    /**
     * @param {Object} data - buffer data
     * @param {Float32Array} data.position - image position
     * @param {Float32Array} data.imageData - image data, rgba channels
     * @param {Float32Array} data.width - image width
     * @param {Float32Array} data.height - image height
     * @param {Picker} [data.picking] - picking ids
     * @param {BufferParameters} [params] - parameters object
     */
    constructor(data: ImageBufferData, params: ImageBufferParameters);
    getDefines(type: BufferTypes): import("../shader/shader-utils").ShaderDefines;
    updateTexture(): void;
    makeMaterial(): void;
    setUniforms(data: any): void;
}
export default ImageBuffer;
