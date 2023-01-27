/**
 * @file Trackball Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Stage from '../stage/stage';
import MouseObserver from '../stage/mouse-observer';
import Viewer from '../viewer/viewer';
import ViewerControls from './viewer-controls';
import AtomProxy from '../proxy/atom-proxy';
import Component from '../component/component';
export interface TrackballControlsParams {
    rotateSpeed?: number;
    zoomSpeed?: number;
    panSpeed?: number;
}
/**
 * Trackball controls
 */
declare class TrackballControls {
    readonly stage: Stage;
    viewer: Viewer;
    mouse: MouseObserver;
    controls: ViewerControls;
    rotateSpeed: number;
    zoomSpeed: number;
    panSpeed: number;
    constructor(stage: Stage, params?: TrackballControlsParams);
    get component(): Component | undefined;
    get atom(): AtomProxy | undefined;
    private _setPanVector;
    private _getRotateXY;
    private _getCameraRotation;
    private _transformPanVector;
    zoom(delta: number): void;
    pan(x: number, y: number): void;
    panComponent(x: number, y: number): void;
    panAtom(x: number, y: number): void;
    rotate(x: number, y: number): void;
    zRotate(x: number, y: number): void;
    rotateComponent(x: number, y: number): void;
}
export default TrackballControls;
