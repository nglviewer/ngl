/**
 * @file Viewer Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Scene, Camera, Object3D, WebGLRenderer } from 'three';
import Viewer from './viewer';
/**
 * Image parameter object.
 * @typedef {Object} ImageParameters - image generation parameters
 * @property {Boolean} trim - trim the image
 * @property {Integer} factor - scaling factor to apply to the viewer canvas
 * @property {Boolean} antialias - antialias the image
 * @property {Boolean} transparent - transparent image background
 */
export declare const ImageDefaultParameters: {
    trim: boolean;
    factor: number;
    antialias: boolean;
    transparent: boolean;
    onProgress: Function | undefined;
};
export declare type ImageParameters = typeof ImageDefaultParameters;
/**
 * Make image from what is shown in a viewer canvas
 * @param  {Viewer} viewer - the viewer
 * @param  {ImageParameters} params - parameters object
 * @return {Promise} A Promise object that resolves to an image {@link Blob}.
 */
export declare function makeImage(viewer: Viewer, params?: Partial<ImageParameters>): Promise<Blob>;
export declare function sortProjectedPosition(scene: Scene, camera: Camera): void;
export declare function updateMaterialUniforms(group: Object3D, camera: Camera, renderer: WebGLRenderer, cDist: number, bRadius: number): void;
export declare function updateCameraUniforms(group: Object3D, camera: Camera): void;
