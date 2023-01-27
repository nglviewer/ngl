/**
 * @file Mouse Observer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector2 } from 'three';
import { Signal } from 'signals';
import Viewer from '../viewer/viewer';
import MouseControls from '../controls/mouse-controls';
declare type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export interface MouseSignals {
    moved: Signal;
    scrolled: Signal;
    dragged: Signal;
    dropped: Signal;
    clicked: Signal;
    hovered: Signal;
    doubleClicked: Signal;
}
export interface MouseParams {
    hoverTimeout?: number;
    handleScroll?: boolean;
    doubleClickSpeed?: number;
}
/**
 * Mouse observer
 *
 * @example
 * // listen to mouse moving (and touch-moving) events
 * mouseObserver.moved.moved.add( function( deltaX, deltaY ){ ... } );
 *
 * @example
 * // listen to scrolling (and pinching) events
 * mouseObserver.signals.scrolled.add( function( delta ){ ... } );
 *
 * @example
 * // listen to dragging (and touch-dragging) events
 * mouseObserver.signals.dragged.add( function( deltaX, deltaY ){ ... } );
 *
 * @example
 * // listen to clicking (and tapping) events
 * mouseObserver.signals.clicked.add( function(){ ... } );
 *
 * @example
 * // listen to double clicking (and double tapping) events
 * mouseObserver.signals.doubleClicked.add( function(){ ... } );
 *
 * @example
 * // listen to hovering events
 * mouseObserver.signals.hovered.add( function(){ ... } );
 */
declare class MouseObserver {
    readonly domElement: HTMLCanvasElement;
    signals: MouseSignals;
    hoverTimeout: number;
    handleScroll: boolean;
    doubleClickSpeed: number;
    viewer: Viewer;
    mouse: MouseObserver;
    controls: MouseControls;
    position: Vector2;
    prevPosition: Vector2;
    down: Vector2;
    canvasPosition: Vector2;
    prevClickCP: Vector2;
    moving: boolean;
    hovering: boolean;
    scrolled: boolean;
    lastMoved: number;
    which?: number | undefined;
    buttons?: number | undefined;
    pressed?: boolean | undefined;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    doubleClickPending: boolean;
    lastClicked: number;
    overElement: boolean;
    lastTouchDistance: number;
    private frameRequest;
    /**
     * @param  {Element} domElement - the dom element to observe mouse events in
     * @param  {Object} params - parameters object
     * @param  {Integer} params.hoverTimeout - timeout in ms until the {@link MouseSignals.hovered}
     *                                         signal is fired, set to -1 to ignore hovering
     * @param  {Boolean} params.handleScroll - whether or not to handle scroll events
     * @param  {Integer} params.doubleClickSpeed - max time in ms to trigger double click
     */
    constructor(domElement: HTMLCanvasElement, params?: MouseParams);
    get key(): number;
    setParameters(params?: MouseParams): void;
    /**
     * listen to mouse actions
     * @emits {MouseSignals.clicked} when clicked
     * @emits {MouseSignals.hovered} when hovered
     * @return {undefined}
     */
    _listen(): void;
    /**
     * handle mouse scroll
     * @emits {MouseSignals.scrolled} when scrolled
     * @param  {Event} event - mouse event
     * @return {undefined}
     */
    _onMousewheel(event: Optional<WheelEvent, 'detail'> & {
        wheelDelta?: number;
        wheelDeltaY?: number;
    }): void;
    /**
     * handle mouse move
     * @emits {MouseSignals.moved} when moved
     * @emits {MouseSignals.dragged} when dragged
     * @param  {Event} event - mouse event
     * @return {undefined}
     */
    _onMousemove(event: MouseEvent): void;
    _onMousedown(event: MouseEvent): void;
    /**
     * handle mouse up
     * @emits {MouseSignals.doubleClicked} when double clicked
     * @emits {MouseSignals.dropped} when dropped
     * @param  {Event} event - mouse event
     * @return {undefined}
     */
    _onMouseup(event: MouseEvent): void;
    _onContextmenu(event: MouseEvent): void;
    _onTouchstart(event: TouchEvent): void;
    _onTouchend(event: TouchEvent): void;
    _onTouchmove(event: TouchEvent): void;
    _distance(): number;
    _setCanvasPosition(event: any): void;
    _setKeys(event: MouseEvent | TouchEvent): void;
    dispose(): void;
}
export default MouseObserver;
