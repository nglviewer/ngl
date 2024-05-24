/**
 * @file Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Matrix4, BufferGeometry, Uniform, Group, LineSegments, Points, Mesh, ShaderMaterial } from 'three';
import { GenericColor, TypedArray } from '../types';
import { ShaderDefines } from '../shader/shader-utils';
import { Picker } from '../utils/picker';
export declare type BufferSide = 'front' | 'back' | 'double';
export declare type BufferTypes = 'picking' | 'background';
export declare type BufferMaterials = 'material' | 'wireframeMaterial' | 'pickingMaterial';
export interface _BufferAttribute {
    type: 'f' | 'v2' | 'v3' | 'c';
    value?: TypedArray;
}
export declare type Uniforms = {
    [k: string]: Uniform | {
        value: any;
    };
};
export declare const BufferDefaultParameters: {
    opaqueBack: boolean;
    side: BufferSide;
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
export declare type BufferParameters = Omit<typeof BufferDefaultParameters, 'diffuse' | 'interiorColor'> & {
    diffuse: GenericColor;
    interiorColor: GenericColor;
};
export declare const BufferParameterTypes: {
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
export interface BufferData {
    position?: Float32Array;
    position1?: Float32Array;
    color?: Float32Array;
    index?: Uint32Array | Uint16Array;
    normal?: Float32Array;
    picking?: Picker;
    primitiveId?: Float32Array;
}
/**
 * Buffer class. Base class for buffers.
 * @interface
 */
declare class Buffer {
    parameterTypes: {
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
        opaqueBack: boolean;
        side: BufferSide;
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
    parameters: BufferParameters;
    uniforms: Uniforms;
    pickingUniforms: Uniforms;
    private _positionDataSize;
    geometry: BufferGeometry<import("three").NormalBufferAttributes>;
    indexVersion: number;
    wireframeIndexVersion: number;
    group: Group<import("three").Object3DEventMap>;
    wireframeGroup: Group<import("three").Object3DEventMap>;
    pickingGroup: Group<import("three").Object3DEventMap>;
    vertexShader: string;
    fragmentShader: string;
    isImpostor: boolean;
    isText: boolean;
    isSurface: boolean;
    isPoint: boolean;
    isLine: boolean;
    dynamic: boolean;
    visible: boolean;
    picking?: Picker;
    material: ShaderMaterial;
    wireframeMaterial: ShaderMaterial;
    pickingMaterial: ShaderMaterial;
    wireframeIndex?: Uint32Array | Uint16Array;
    wireframeIndexCount: number;
    wireframeGeometry?: BufferGeometry;
    /**
     * @param {Object} data - attribute object
     * @param {Float32Array} data.position - positions
     * @param {Float32Array} data.color - colors
     * @param {Uint32Array|Uint16Array} data.index - triangle indices
     * @param {Picker} [data.picking] - picking ids
     * @param {BufferParameters} params - parameters object
     */
    constructor(data: BufferData, params?: Partial<BufferParameters>);
    set matrix(m: Matrix4);
    get matrix(): Matrix4;
    get transparent(): boolean;
    get size(): number;
    get attributeSize(): number;
    get pickable(): boolean;
    setMatrix(m: Matrix4): void;
    initIndex(index: Uint32Array | Uint16Array): void;
    makeMaterial(): void;
    makeWireframeGeometry(): void;
    makeWireframeIndex(): void;
    updateWireframeIndex(): void;
    getRenderOrder(): number;
    _getMesh(materialName: BufferMaterials): LineSegments<BufferGeometry<import("three").NormalBufferAttributes>, ShaderMaterial> | Points<BufferGeometry<import("three").NormalBufferAttributes>, ShaderMaterial> | Mesh<BufferGeometry<import("three").NormalBufferAttributes>, ShaderMaterial, import("three").Object3DEventMap>;
    getMesh(): LineSegments<BufferGeometry<import("three").NormalBufferAttributes>, ShaderMaterial> | Points<BufferGeometry<import("three").NormalBufferAttributes>, ShaderMaterial> | Mesh<BufferGeometry<import("three").NormalBufferAttributes>, ShaderMaterial, import("three").Object3DEventMap>;
    getWireframeMesh(): LineSegments<BufferGeometry<import("three").NormalBufferAttributes>, ShaderMaterial>;
    getPickingMesh(): LineSegments<BufferGeometry<import("three").NormalBufferAttributes>, ShaderMaterial> | Points<BufferGeometry<import("three").NormalBufferAttributes>, ShaderMaterial> | Mesh<BufferGeometry<import("three").NormalBufferAttributes>, ShaderMaterial, import("three").Object3DEventMap>;
    getShader(name: string, type?: BufferTypes): string;
    getVertexShader(type?: BufferTypes): string;
    getFragmentShader(type?: BufferTypes): string;
    getDefines(type?: BufferTypes): ShaderDefines;
    getParameters(): BufferParameters;
    addUniforms(uniforms: Uniforms): void;
    addAttributes(attributes: {
        [k: string]: _BufferAttribute;
    }): void;
    updateRenderOrder(): void;
    updateShader(): void;
    /**
     * Set buffer parameters
     * @param {BufferParameters} params - buffer parameters object
     * @return {undefined}
     */
    setParameters(params: Partial<BufferParameters>): void;
    /**
     * Sets buffer attributes
     * @param {Object} data - An object where the keys are the attribute names
     *      and the values are the attribute data.
     * @example
     * var buffer = new Buffer();
     * buffer.setAttributes({ attrName: attrData });
     */
    setAttributes(data: any): void;
    setUniforms(data: any): void;
    setProperties(data: any): void;
    /**
     * Set buffer visibility
     * @param {Boolean} value - visibility value
     * @return {undefined}
     */
    setVisibility(value: boolean): void;
    /**
     * Free buffer resources
     * @return {undefined}
     */
    dispose(): void;
    /**
     * Customize JSON serialization to avoid circular references
     */
    toJSON(): any;
}
export default Buffer;
