/**
 * @file Stage
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Box3 } from 'three';
import { Signal } from 'signals';
import Counter from '../utils/counter';
import Viewer from '../viewer/viewer';
import { ImageParameters } from '../viewer/viewer-utils';
import MouseObserver from './mouse-observer';
import TrackballControls from '../controls/trackball-controls';
import PickingControls from '../controls/picking-controls';
import ViewerControls from '../controls/viewer-controls';
import AnimationControls from '../controls/animation-controls';
import MouseControls from '../controls/mouse-controls';
import KeyControls from '../controls/key-controls';
import PickingBehavior from './picking-behavior';
import MouseBehavior from './mouse-behavior';
import AnimationBehavior from './animation-behavior';
import KeyBehavior from './key-behavior';
import Component, { ComponentParameters } from '../component/component';
import RepresentationElement from '../component/representation-element';
import ComponentCollection from '../component/component-collection';
import RepresentationCollection from '../component/representation-collection';
import { LoaderParameters } from '../loader/loader-utils';
import { ParserParams } from '../loader/parser-loader';
import AtomProxy from '../proxy/atom-proxy';
import Animation from '../animation/animation';
import Structure from '../structure/structure';
import Surface from '../surface/surface';
import Volume from '../surface/volume';
import Shape from '../geometry/shape';
import { GenericColor } from '../types';
declare global {
    interface Document {
        mozFullScreen: boolean;
        mozFullScreenEnabled: boolean;
        mozFullScreenElement: Element;
        mozCancelFullScreen(): void;
        msFullscreenEnabled: boolean;
        msFullscreenElement: Element;
        msExitFullscreen(): void;
    }
    interface Element {
        mozRequestFullScreen(): void;
        msRequestFullscreen(): void;
    }
}
/**
 * Stage parameter object.
 * @typedef {Object} StageParameters - stage parameters
 * @property {Color} backgroundColor - background color
 * @property {Integer} sampleLevel - sampling level for antialiasing, between -1 and 5;
 *                                   -1: no sampling, 0: only sampling when not moving
 * @property {Boolean} workerDefault - default value for useWorker parameter of representations
 * @property {Float} rotateSpeed - camera-controls rotation speed, between 0 and 10
 * @property {Float} zoomSpeed - camera-controls zoom speed, between 0 and 10
 * @property {Float} panSpeed - camera-controls pan speed, between 0 and 10
 * @property {Float} clipNear - position of camera near/front clipping plane
 *                                in percent of scene bounding box
 * @property {Float} clipFar - position of camera far/back clipping plane
 *                               in percent of scene bounding box
 * @property {Float} clipDist - camera clipping distance in Angstrom
 * @property {String} clipMode - how to interpret clipNear/Far and fogNear/Far values: "scene" for scene-relative, "camera" for camera-relative
 * @property {String} clipScale - "relative" or "absolute": interpret clipNear/Far and fogNear/Far as percentage of bounding box or absolute Angstroms (ignored when clipMode==camera)
 * @property {Float} fogNear - position of the start of the fog effect
 *                               in percent of scene bounding box
 * @property {Float} fogFar - position where the fog is in full effect
 *                              in percent of scene bounding box
 * @property {String} cameraType - type of camera, either 'persepective' or 'orthographic'
 * @property {Float} cameraFov - perspective camera field of view in degree, between 15 and 120
 * @property {Float} cameraEyeSep - stereo camera eye seperation
 * @property {Color} lightColor - point light color
 * @property {Float} lightIntensity - point light intensity
 * @property {Color} ambientColor - ambient light color
 * @property {Float} ambientIntensity - ambient light intensity
 * @property {Integer} hoverTimeout - timeout for hovering
 */
export interface StageSignals {
    parametersChanged: Signal;
    fullscreenChanged: Signal;
    componentAdded: Signal;
    componentRemoved: Signal;
    clicked: Signal;
    hovered: Signal;
}
export declare type RenderQualityType = 'auto' | 'low' | 'medium' | 'high';
export declare const StageDefaultParameters: {
    impostor: boolean;
    quality: RenderQualityType;
    workerDefault: boolean;
    sampleLevel: number;
    backgroundColor: GenericColor;
    rotateSpeed: number;
    zoomSpeed: number;
    panSpeed: number;
    clipNear: number;
    clipFar: number;
    clipDist: number;
    clipMode: string;
    clipScale: string;
    fogNear: number;
    fogFar: number;
    cameraFov: number;
    cameraEyeSep: number;
    cameraType: "perspective" | "orthographic" | "stereo";
    lightColor: GenericColor;
    lightIntensity: number;
    ambientColor: GenericColor;
    ambientIntensity: number;
    hoverTimeout: number;
    tooltip: boolean;
    mousePreset: "default" | "pymol" | "coot" | "astexviewer";
};
export declare type StageParameters = typeof StageDefaultParameters;
export interface StageLoadFileParams extends LoaderParameters {
    defaultRepresentation: boolean;
    assembly: string;
}
/**
 * Stage class, central for creating molecular scenes with NGL.
 *
 * @example
 * var stage = new Stage( "elementId", { backgroundColor: "white" } );
 */
declare class Stage {
    signals: StageSignals;
    parameters: StageParameters;
    /**
     * Counter that keeps track of various potentially long-running tasks,
     * including file loading and surface calculation.
     */
    tasks: Counter;
    compList: Component[];
    defaultFileParams: {};
    logList: string[];
    transformComponent?: Component;
    transformAtom?: AtomProxy;
    viewer: Viewer;
    tooltip: HTMLElement;
    lastFullscreenElement: HTMLElement;
    mouseObserver: MouseObserver;
    viewerControls: ViewerControls;
    trackballControls: TrackballControls;
    pickingControls: PickingControls;
    animationControls: AnimationControls;
    mouseControls: MouseControls;
    keyControls: KeyControls;
    pickingBehavior: PickingBehavior;
    mouseBehavior: MouseBehavior;
    animationBehavior: AnimationBehavior;
    keyBehavior: KeyBehavior;
    spinAnimation: Animation;
    rockAnimation: Animation;
    constructor(idOrElement: string | HTMLElement, params?: Partial<StageParameters>);
    /**
     * Set stage parameters
     */
    setParameters(params?: Partial<StageParameters>): this;
    log(msg: string): void;
    /**
     * Get stage parameters
     */
    getParameters(): {
        impostor: boolean;
        quality: RenderQualityType;
        workerDefault: boolean;
        sampleLevel: number;
        backgroundColor: GenericColor;
        rotateSpeed: number;
        zoomSpeed: number;
        panSpeed: number;
        clipNear: number;
        clipFar: number;
        clipDist: number;
        clipMode: string;
        clipScale: string;
        fogNear: number;
        fogFar: number;
        cameraFov: number;
        cameraEyeSep: number;
        cameraType: "perspective" | "orthographic" | "stereo";
        lightColor: GenericColor;
        lightIntensity: number;
        ambientColor: GenericColor;
        ambientIntensity: number;
        hoverTimeout: number;
        tooltip: boolean;
        mousePreset: "default" | "pymol" | "coot" | "astexviewer";
    };
    /**
     * Create default representations for the given component
     * @param  {StructureComponent|SurfaceComponent} object - component to create the representations for
     * @return {undefined}
     */
    defaultFileRepresentation(component: Component): void;
    /**
     * Load a file onto the stage
     *
     * @example
     * // load from URL
     * stage.loadFile( "http://files.rcsb.org/download/5IOS.cif" );
     *
     * @example
     * // load binary data in CCP4 format via a Blob
     * var binaryBlob = new Blob( [ ccp4Data ], { type: 'application/octet-binary'} );
     * stage.loadFile( binaryBlob, { ext: "ccp4" } );
     *
     * @example
     * // load string data in PDB format via a Blob
     * var stringBlob = new Blob( [ pdbData ], { type: 'text/plain'} );
     * stage.loadFile( stringBlob, { ext: "pdb" } );
     *
     * @example
     * // load a File object
     * stage.loadFile( file );
     *
     * @example
     * // load from URL and add a 'ball+stick' representation with double/triple bonds
     * stage.loadFile( "http://files.rcsb.org/download/1crn.cif" ).then( function( comp ){
     *     comp.addRepresentation( "ball+stick", { multipleBond: true } );
     * } );
     *
     * @param  {String|File|Blob} path - either a URL or an object containing the file data
     * @param  {LoaderParameters} params - loading parameters
     * @param  {Boolean} params.asTrajectory - load multi-model structures as a trajectory
     * @return {Promise} A Promise object that resolves to a {@link StructureComponent},
     *                   a {@link SurfaceComponent} or a {@link ScriptComponent} object,
     *                   depending on the type of the loaded file.
     */
    loadFile(path: string | File | Blob, params?: Partial<StageLoadFileParams & ParserParams>): Promise<void | Component>;
    loadScript(path: string | File | Blob): any;
    /**
     * Add the given component to the stage
     * @param {Component} component - the component to add
     * @return {undefined}
     */
    addComponent(component: Component): void;
    /**
     * Create a component from the given object and add to the stage
     */
    addComponentFromObject(object: Structure | Surface | Volume | Shape, params?: Partial<ComponentParameters>): void | Component;
    /**
     * Remove the given component
     * @param  {Component} component - the component to remove
     * @return {undefined}
     */
    removeComponent(component: Component): void;
    /**
     * Remove all components from the stage
     */
    removeAllComponents(): void;
    /**
     * Handle any size-changes of the container element
     * @return {undefined}
     */
    handleResize(): void;
    /**
     * Set width and height
     * @param {String} width - CSS width value
     * @param {String} height - CSS height value
     * @return {undefined}
     */
    setSize(width: string, height: string): void;
    /**
     * Toggle fullscreen
     * @param  {Element} [element] - document element to put into fullscreen,
     *                               defaults to the viewer container
     * @return {undefined}
     */
    toggleFullscreen(element: HTMLElement): void;
    /**
     * Set spin
     * @param {Boolean} flag - if true start rocking and stop spinning
     * @return {undefined}
     */
    setSpin(flag: boolean): void;
    /**
     * Set rock
     * @param {Boolean} flag - if true start rocking and stop spinning
     * @return {undefined}
     */
    setRock(flag: boolean): void;
    /**
     * Toggle spin
     * @return {undefined}
     */
    toggleSpin(): void;
    /**
     * Toggle rock
     * @return {undefined}
     */
    toggleRock(): void;
    /**
     * Get the current focus from the current clipNear value expressed
     * as 0 (full view) to 100 (completely clipped)
     * Negative values may be returned in some cases.
     *
     * In 'camera' clipMode focus isn't applicable, this method returns 0.0
     *
     * @return {number} focus
     */
    getFocus(): number;
    /**
     * Set the focus, a value of 0 sets clipping planes to show full scene,
     * while a value of 100 will compltely clip the scene.
     *
     * @param {number} value focus
     */
    setFocus(value: number): void;
    getZoomForBox(boundingBox: Box3): number;
    getBox(): Box3;
    getZoom(): number;
    getCenter(optionalTarget?: Vector3): Vector3;
    /**
     * Add a zoom and a move animation with automatic targets
     * @param  {Integer} duration - animation time in milliseconds
     * @return {undefined}
     */
    autoView(duration?: number): void;
    /**
     * Make image from what is shown in a viewer canvas
     */
    makeImage(params?: Partial<ImageParameters>): Promise<Blob>;
    setImpostor(value: boolean): void;
    setQuality(value: RenderQualityType): void;
    /**
     * Iterator over each component and executing the callback
     */
    eachComponent(callback: (comp: Component) => void, type?: string): void;
    /**
     * Iterator over each representation and executing the callback
     */
    eachRepresentation(callback: (reprElem: RepresentationElement, comp: Component) => void, type?: string): void;
    /**
     * Get collection of components by name
     */
    getComponentsByName(name: string | RegExp): ComponentCollection;
    /**
     * Get collection of components by object
     */
    getComponentsByObject(object: Structure | Surface | Volume | Shape): ComponentCollection;
    /**
     * Get collection of representations by name
     */
    getRepresentationsByName(name: string | RegExp): RepresentationCollection;
    measureClear(): void;
    measureUpdate(): void;
    /**
     * Cleanup when disposing of a stage object
     */
    dispose(): void;
}
export default Stage;
