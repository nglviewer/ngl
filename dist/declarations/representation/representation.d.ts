/**
 * @file Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Color, Vector3, Matrix4 } from 'three';
import Counter from '../utils/counter';
import Viewer from '../viewer/viewer';
import { BufferParameters, BufferSide, default as Buffer } from '../buffer/buffer';
import { ColorData, ColormakerParameters, ColorMode } from '../color/colormaker';
import { GenericColor } from '../types';
export interface RepresentationParameters {
    name: string;
    lazy: boolean;
    clipNear: number;
    clipRadius: number;
    clipCenter: Vector3;
    flatShaded: boolean;
    opacity: number;
    depthWrite: boolean;
    side: BufferSide;
    wireframe: boolean;
    colorData: ColorData;
    colorScheme: string;
    colorScale: string | number[];
    colorReverse: boolean;
    colorValue: GenericColor;
    colorDomain: number[];
    colorMode: ColorMode;
    colorSpace: 'sRGB' | 'linear';
    roughness: number;
    metalness: number;
    diffuse: GenericColor;
    diffuseInterior: boolean;
    useInteriorColor: boolean;
    interiorColor: GenericColor;
    interiorDarkening: number;
    disablePicking: boolean;
    matrix: Matrix4;
    quality: string;
    visible: boolean;
    color: GenericColor;
    sphereDetail: number;
    radialSegments: number;
    openEnded: boolean;
    disableImpostor: boolean;
    [key: string]: any;
}
/**
 * Representation parameter object.
 * @typedef {Object} RepresentationParameters - representation parameters
 * @property {Boolean} [lazy] - only build & update the representation when visible
 *                            otherwise defer changes until set visible again
 * @property {Integer} [clipNear] - position of camera near/front clipping plane
 *                                in percent of scene bounding box
 * @property {Integer} [clipRadius] - radius of clipping sphere
 * @property {Vector3} [clipCenter] - position of for spherical clipping
 * @property {Boolean} [flatShaded] - render flat shaded
 * @property {Float} [opacity] - translucency: 1 is fully opaque, 0 is fully transparent
 * @property {Boolean} [depthWrite] - depth write
 * @property {String} [side] - which triangle sides to render, "front" front-side,
 *                            "back" back-side, "double" front- and back-side
 * @property {Boolean} [wireframe] - render as wireframe
 * @property {ColorData} [colorData] - atom or bond indexed data for coloring
 * @property {String} [colorScheme] - color scheme
 * @property {String} [colorScale] - color scale, either a string for a
 *                                 predefined scale or an array of
 *                                 colors to be used as the scale
 * @property {Boolean} [colorReverse] - reverse color scale
 * @property {Color} [colorValue] - color value
 * @property {Integer[]} [colorDomain] - scale value range
 * @property {Integer} colorDomain.0 - min value
 * @property {Integer} colorDomain.1 - max value
 * @property {String} [colorMode] - color mode, one of rgb, hsv, hsl, hsi, lab, hcl
 * @property {Float} [roughness] - how rough the material is, between 0 and 1
 * @property {Float} [metalness] - how metallic the material is, between 0 and 1
 * @property {Color} [diffuse] - diffuse color for lighting
 * @property {Boolean} [diffuseInterior] - diffuse interior, i.e. ignore normal
 * @property {Boolean} [useInteriorColor] - use interior color
 * @property {Color} [interiorColor] - interior color
 * @property {Float} [interiorDarkening] - interior darkening: 0 no darking, 1 fully darkened
 * @property {Boolean} [disablePicking] - disable picking
 */
/**
 * Representation object
 * @interface
 * @param {Object} object - the object to be represented
 * @param {Viewer} viewer - a viewer object
 * @param {RepresentationParameters} [params] - representation parameters
 */
declare class Representation {
    parameters: any;
    type: string;
    viewer: Viewer;
    tasks: Counter;
    private queue;
    bufferList: Buffer[];
    lazy: boolean;
    lazyProps: {
        build: boolean;
        bufferParams: BufferParameters | {};
        what: {};
    };
    protected name: string;
    protected clipNear: number;
    protected clipRadius: number;
    protected clipCenter: Vector3;
    protected flatShaded: boolean;
    protected opacity: number;
    protected depthWrite: boolean;
    protected side: BufferSide;
    protected wireframe: boolean;
    protected colorData: ColorData;
    protected colorScheme: string;
    protected colorScale: string | string[];
    protected colorReverse: boolean;
    protected colorValue: number;
    protected colorDomain: number[];
    protected colorMode: ColorMode;
    protected roughness: number;
    protected metalness: number;
    protected diffuse: GenericColor;
    protected diffuseInterior?: boolean;
    protected useInteriorColor?: boolean;
    protected interiorColor: GenericColor;
    protected interiorDarkening: number;
    protected disablePicking: boolean;
    protected sphereDetail: number;
    protected radialSegments: number;
    protected openEnded: boolean;
    protected disableImpostor: boolean;
    protected disposed: boolean;
    protected matrix: Matrix4;
    private quality;
    visible: boolean;
    protected manualAttach: () => any;
    protected toBePrepared: boolean;
    [key: string]: any;
    constructor(object: any, viewer: Viewer, params: Partial<RepresentationParameters>);
    init(params: Partial<RepresentationParameters>): void;
    getColorParams(p?: {
        [k: string]: any;
    }): {
        scheme: string;
        [k: string]: any;
    } & ColormakerParameters;
    getBufferParams(p?: {
        [k: string]: any;
    }): {
        clipNear: number;
        clipRadius: number;
        clipCenter: Vector3;
        flatShaded: boolean;
        opacity: number;
        depthWrite: boolean;
        side: BufferSide;
        wireframe: boolean;
        roughness: number;
        metalness: number;
        diffuse: GenericColor;
        diffuseInterior: boolean | undefined;
        useInteriorColor: boolean | undefined;
        interiorColor: GenericColor;
        interiorDarkening: number;
        matrix: Matrix4;
        disablePicking: boolean;
    } & {
        [k: string]: any;
    };
    setColor(value: number | string | Color | undefined, p?: Partial<RepresentationParameters>): this;
    prepare(cb: () => void): void;
    create(): void;
    update(what?: any): void;
    build(updateWhat?: {
        [k: string]: boolean;
    }): void;
    make(updateWhat?: boolean, callback?: () => void): void;
    attach(callback: () => void): void;
    /**
     * Set the visibility of the representation
     * @param {Boolean} value - visibility flag
     * @param {Boolean} [noRenderRequest] - whether or not to request a re-render from the viewer
     * @return {Representation} this object
     */
    setVisibility(value: boolean, noRenderRequest?: boolean): Representation;
    /**
     * Set the visibility of the representation
     * @param {RepresentationParameters} params - parameters object
     * @param {Object} [what] - buffer data attributes to be updated,
     *                        note that this needs to be implemented in the
     *                        derived classes. Generally it allows more
     *                        fine-grained control over updating than
     *                        forcing a rebuild.
     * @param {Boolean} what.position - update position data
     * @param {Boolean} what.color - update color data
     * @param {Boolean} [rebuild] - whether or not to rebuild the representation
     * @return {Representation} this object
     */
    setParameters(params: Partial<RepresentationParameters>, what?: {
        [propName: string]: any;
    }, rebuild?: boolean): this;
    updateParameters(bufferParams?: BufferParameters | {}, what?: any): void;
    getParameters(): Partial<RepresentationParameters>;
    clear(): void;
    dispose(): void;
}
export default Representation;
