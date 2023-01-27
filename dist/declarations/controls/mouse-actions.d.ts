/**
 * @file Mouse Actions
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import PickingProxy from './picking-proxy';
import Stage from '../stage/stage';
export declare type ScrollCallback = (stage: Stage, delta: number) => void;
export declare type DragCallback = (stage: Stage, dx: number, dy: number) => void;
export declare type PickCallback = (stage: Stage, pickingProxy: PickingProxy) => void;
export declare type MouseActionCallback = ScrollCallback | DragCallback | PickCallback;
/**
 * Mouse actions provided as static methods
 */
declare class MouseActions {
    /**
     * Zoom scene based on scroll-delta
     * @param {Stage} stage - the stage
     * @param {Number} delta - amount to zoom
     * @return {undefined}
     */
    static zoomScroll(stage: Stage, delta: number): void;
    /**
     * Move near clipping plane based on scroll-delta
     * @param {Stage} stage - the stage
     * @param {Number} delta - amount to move clipping plane
     * @return {undefined}
     */
    static clipNearScroll(stage: Stage, delta: number): void;
    /**
     * Move clipping planes based on scroll-delta.
     * @param {Stage} stage - the stage
     * @param {Number} delta - direction to move planes
     * @return {undefined}
     */
    static focusScroll(stage: Stage, delta: number): void;
    /**
     * Zoom scene based on scroll-delta and
     * move focus planes based on camera position (zoom)
     * @param {Stage} stage - the stage
     * @param {Number} delta - amount to move focus planes and zoom
     * @return {undefined}
     */
    static zoomFocusScroll(stage: Stage, delta: number): void;
    /**
     * Change isolevel of volume surfaces based on scroll-delta
     * @param {Stage} stage - the stage
     * @param {Number} delta - amount to change isolevel
     * @return {undefined}
     */
    static isolevelScroll(stage: Stage, delta: number): void;
    /**
     * Pan scene based on mouse coordinate changes
     * @param {Stage} stage - the stage
     * @param {Number} dx - amount to pan in x direction
     * @param {Number} dy - amount to pan in y direction
     * @return {undefined}
     */
    static panDrag(stage: Stage, dx: number, dy: number): void;
    /**
     * Rotate scene based on mouse coordinate changes
     * @param {Stage} stage - the stage
     * @param {Number} dx - amount to rotate in x direction
     * @param {Number} dy - amount to rotate in y direction
     * @return {undefined}
     */
    static rotateDrag(stage: Stage, dx: number, dy: number): void;
    /**
     * Rotate scene around z axis based on mouse coordinate changes
     * @param {Stage} stage - the stage
     * @param {Number} dx - amount to rotate in x direction
     * @param {Number} dy - amount to rotate in y direction
     * @return {undefined}
     */
    static zRotateDrag(stage: Stage, dx: number, dy: number): void;
    /**
     * Zoom scene based on mouse coordinate changes
     * @param {Stage} stage - the stage
     * @param {Number} dx - amount to zoom
     * @param {Number} dy - amount to zoom
     * @return {undefined}
     */
    static zoomDrag(stage: Stage, dx: number, dy: number): void;
    /**
     * Zoom scene based on mouse coordinate changes and
     * move focus planes based on camera position (zoom)
     * @param {Stage} stage - the stage
     * @param {Number} dx - amount to zoom and focus
     * @param {Number} dy - amount to zoom and focus
     * @return {undefined}
     */
    static zoomFocusDrag(stage: Stage, dx: number, dy: number): void;
    /**
     * Pan picked component based on mouse coordinate changes
     * @param {Stage} stage - the stage
     * @param {Number} dx - amount to pan in x direction
     * @param {Number} dy - amount to pan in y direction
     * @return {undefined}
     */
    static panComponentDrag(stage: Stage, dx: number, dy: number): void;
    /**
     * Pan picked atom based on mouse coordinate changes
     * @param {Stage} stage - the stage
     * @param {Number} dx - amount to pan in x direction
     * @param {Number} dy - amount to pan in y direction
     * @return {undefined}
     */
    static panAtomDrag(stage: Stage, dx: number, dy: number): void;
    /**
     * Rotate picked component based on mouse coordinate changes
     * @param {Stage} stage - the stage
     * @param {Number} dx - amount to rotate in x direction
     * @param {Number} dy - amount to rotate in y direction
     * @return {undefined}
     */
    static rotateComponentDrag(stage: Stage, dx: number, dy: number): void;
    /**
     * Move picked element to the center of the screen
     * @param {Stage} stage - the stage
     * @param {PickingProxy} pickingProxy - the picking data object
     * @return {undefined}
     */
    static movePick(stage: Stage, pickingProxy: PickingProxy): void;
    /**
     * Show tooltip with information of picked element
     * @param {Stage} stage - the stage
     * @param {PickingProxy} pickingProxy - the picking data object
     * @return {undefined}
     */
    static tooltipPick(stage: Stage, pickingProxy: PickingProxy): void;
    static measurePick(stage: Stage, pickingProxy: PickingProxy): void;
}
declare type MouseActionPreset = [string, MouseActionCallback][];
export declare const MouseActionPresets: {
    default: MouseActionPreset;
    pymol: MouseActionPreset;
    coot: MouseActionPreset;
    astexviewer: MouseActionPreset;
};
export default MouseActions;
