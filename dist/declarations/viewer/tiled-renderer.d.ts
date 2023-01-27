/**
 * @file Tiled Renderer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Camera, WebGLRenderer } from 'three';
import Viewer from './viewer';
export interface TiledRendererParams {
    factor?: number;
    antialias?: boolean;
    onProgress?: Function;
    onFinish?: Function;
}
declare class TiledRenderer {
    canvas: HTMLCanvasElement;
    private _width;
    private _height;
    private _n;
    private _factor;
    private _antialias;
    private _viewerSampleLevel;
    private _viewer;
    private _onProgress?;
    private _onFinish?;
    private _ctx;
    constructor(renderer: WebGLRenderer, camera: Camera, viewer: Viewer, params: TiledRendererParams);
    private _renderTile;
    private _finalize;
    render(): void;
    renderAsync(): void;
}
export default TiledRenderer;
