/**
 * @file Text Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { CanvasTexture, Vector3, Matrix4 } from 'three';
import '../shader/SDFFont.vert';
import '../shader/SDFFont.frag';
import MappedQuadBuffer from './mappedquad-buffer';
import { BufferData, BufferTypes, BufferParameters } from './buffer';
import { GenericColor } from '../types';
declare type TextFonts = 'sans-serif' | 'monospace' | 'serif';
declare type TextStyles = 'normal' | 'italic';
declare type TextWeights = 'normal' | 'bold';
export declare const TextAtlasDefaultParams: {
    font: TextFonts;
    size: number;
    style: TextStyles;
    variant: "normal";
    weight: TextWeights;
    outline: number;
    width: number;
    height: number;
};
export declare type TextAtlasParams = typeof TextAtlasDefaultParams;
export declare type TextAtlasMap = {
    x: number;
    y: number;
    w: number;
    h: number;
};
export declare class TextAtlas {
    parameters: TextAtlasParams;
    gamma: number;
    mapped: {
        [k: string]: TextAtlasMap;
    };
    scratchW: number;
    scratchH: number;
    currentX: number;
    currentY: number;
    cutoff: number;
    padding: number;
    radius: number;
    gridOuter: Float64Array;
    gridInner: Float64Array;
    f: Float64Array;
    d: Float64Array;
    z: Float64Array;
    v: Int16Array;
    paddedSize: number;
    middle: number;
    texture: CanvasTexture;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    lineHeight: number;
    maxWidth: number;
    colors: string[];
    scratch: Uint8Array;
    canvas2: HTMLCanvasElement;
    context2: CanvasRenderingContext2D;
    data: Uint8Array;
    placeholder: TextAtlasMap;
    constructor(params?: Partial<TextAtlasParams>);
    map(text: string): TextAtlasMap;
    get(text: string): TextAtlasMap;
    draw(text: string): void;
}
/**
 * Text buffer parameter object.
 * @typedef {Object} TextBufferParameters - text buffer parameters
 *
 * @property {Float} opacity - translucency: 1 is fully opaque, 0 is fully transparent
 * @property {Integer} clipNear - position of camera near/front clipping plane
 *                                in percent of scene bounding box
 * @property {String} labelType - type of the label, one of:
 *                                 "atomname", "atomindex", "occupancy", "bfactor",
 *                                 "serial", "element", "atom", "resname", "resno",
 *                                 "res", "text", "qualified". When set to "text", the
 *                                 `labelText` list is used.
 * @property {String[]} labelText - list of label strings, must set `labelType` to "text"
 *                                   to take effect
 * @property {String} fontFamily - font family, one of: "sans-serif", "monospace", "serif"
 * @property {String} fontStyle - font style, "normal" or "italic"
 * @property {String} fontWeight - font weight, "normal" or "bold"
 * @property {Float} xOffset - offset in x-direction
 * @property {Float} yOffset - offset in y-direction
 * @property {Float} zOffset - offset in z-direction (i.e. in camera direction)
 * @property {String} attachment - attachment of the label, one of:
 *                                 "bottom-left", "bottom-center", "bottom-right",
 *                                 "middle-left", "middle-center", "middle-right",
 *                                 "top-left", "top-center", "top-right"
 * @property {Boolean} showBorder - show border/outline
 * @property {Color} borderColor - color of the border/outline
 * @property {Float} borderWidth - width of the border/outline
 * @property {Boolean} showBackground - show background rectangle
 * @property {Color} backgroundColor - color of the background
 * @property {Float} backgroundMargin - width of the background
 * @property {Float} backgroundOpacity - opacity of the background
 * @property {Boolean} fixedSize - show text with a fixed pixel size
 */
export interface TextBufferData extends BufferData {
    size: Float32Array;
    text: string[];
}
declare type TextAttachments = 'bottom-left' | 'bottom-center' | 'bottom-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'top-left' | 'top-center' | 'top-right';
export declare const TextBufferDefaultParameters: {
    fontFamily: TextFonts;
    fontStyle: TextStyles;
    fontWeight: TextWeights;
    fontSize: number;
    xOffset: number;
    yOffset: number;
    zOffset: number;
    attachment: TextAttachments;
    showBorder: boolean;
    borderColor: string | number;
    borderWidth: number;
    showBackground: boolean;
    backgroundColor: string | number;
    backgroundMargin: number;
    backgroundOpacity: number;
    forceTransparent: boolean;
    fixedSize: boolean;
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
export declare type TextBufferParameters = BufferParameters & {
    fontFamily: TextFonts;
    fontStyle: TextStyles;
    fontWeight: TextWeights;
    fontSize: number;
    xOffset: number;
    yOffset: number;
    zOffset: number;
    attachment: TextAttachments;
    showBorder: boolean;
    borderColor: GenericColor;
    borderWidth: number;
    showBackground: boolean;
    backgroundColor: GenericColor;
    backgroundMargin: number;
    backgroundOpacity: number;
    forceTransparent: boolean;
    fixedSize: boolean;
};
/**
 * Text buffer. Renders screen-aligned text strings.
 *
 * @example
 * var textBuffer = new TextBuffer({
 *   position: new Float32Array([ 0, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   size: new Float32Array([ 2 ]),
 *   text: [ "Hello" ]
 * });
 */
declare class TextBuffer extends MappedQuadBuffer {
    parameterTypes: {
        fontFamily: {
            uniform: boolean;
        };
        fontStyle: {
            uniform: boolean;
        };
        fontWeight: {
            uniform: boolean;
        };
        fontSize: {
            uniform: boolean;
        };
        xOffset: {
            uniform: boolean;
        };
        yOffset: {
            uniform: boolean;
        };
        zOffset: {
            uniform: boolean;
        };
        showBorder: {
            uniform: boolean;
        };
        borderColor: {
            uniform: boolean;
        };
        borderWidth: {
            uniform: boolean;
        };
        backgroundColor: {
            uniform: boolean;
        };
        backgroundOpacity: {
            uniform: boolean;
        };
        fixedSize: {
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
        fontFamily: TextFonts;
        fontStyle: TextStyles;
        fontWeight: TextWeights;
        fontSize: number;
        xOffset: number;
        yOffset: number;
        zOffset: number;
        attachment: TextAttachments;
        showBorder: boolean;
        borderColor: string | number;
        borderWidth: number;
        showBackground: boolean;
        backgroundColor: string | number;
        backgroundMargin: number;
        backgroundOpacity: number;
        forceTransparent: boolean;
        fixedSize: boolean;
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
    parameters: TextBufferParameters;
    alwaysTransparent: boolean;
    hasWireframe: boolean;
    isText: boolean;
    vertexShader: string;
    fragmentShader: string;
    text: string[];
    positionCount: number;
    texture: CanvasTexture;
    textAtlas: TextAtlas;
    /**
     * @param  {Object} data - attribute object
     * @param  {Float32Array} data.position - positions
     * @param  {Float32Array} data.color - colors
     * @param  {Float32Array} data.size - sizes
     * @param  {String[]} data.text - text strings
     * @param  {TextBufferParameters} params - parameters object
     */
    constructor(data: TextBufferData, params?: Partial<TextBufferParameters>);
    makeMaterial(): void;
    setAttributes(data?: Partial<TextBufferData>): void;
    makeTexture(): void;
    makeMapping(): void;
    getDefines(type: BufferTypes): import("../shader/shader-utils").ShaderDefines;
    setUniforms(data: any): void;
}
export default TextBuffer;
