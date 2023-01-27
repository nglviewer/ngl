/**
 * @file Mouse Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { MouseActionPresets, MouseActionCallback } from './mouse-actions';
import Stage from '../stage/stage';
import MouseObserver from '../stage/mouse-observer';
export declare type MouseControlPreset = keyof typeof MouseActionPresets;
export interface MouseControlsParams {
    preset?: MouseControlPreset;
    disabled?: boolean;
}
export declare type MouseActionType = '' | 'scroll' | 'drag' | 'click' | 'doubleClick' | 'hover' | 'clickPick' | 'hoverPick';
export interface MouseAction {
    type: MouseActionType;
    key: number;
    button: number;
    callback: MouseActionCallback;
}
/**
 * Mouse controls
 */
declare class MouseControls {
    readonly stage: Stage;
    actionList: MouseAction[];
    mouse: MouseObserver;
    disabled: boolean;
    /**
     * @param {Stage} stage - the stage object
     * @param {Object} [params] - the parameters
     * @param {String} params.preset - one of "default", "pymol", "coot"
     * @param {String} params.disabled - flag to disable all actions
     */
    constructor(stage: Stage, params?: MouseControlsParams);
    run(type: MouseActionType, ...args: any[]): void;
    /**
     * Add a new mouse action triggered by an event, key and button combination.
     * The {@link MouseActions} class provides a number of static methods for
     * use as callback functions.
     *
     * @example
     * // change ambient light intensity on mouse scroll
     * // while the ctrl and shift keys are pressed
     * stage.mouseControls.add( "scroll-ctrl+shift", function( stage, delta ){
     *     var ai = stage.getParameters().ambientIntensity;
     *     stage.setParameters( { ambientIntensity: Math.max( 0, ai + delta / 50 ) } );
     * } );
     *
     * @example
     * // Call the MouseActions.zoomDrag method on mouse drag events
     * // with left and right mouse buttons simultaneous
     * stage.mouseControls.add( "drag-left+right", MouseActions.zoomDrag );
     *
     * @param {TriggerString} triggerStr - the trigger for the action
     * @param {function(stage: Stage, ...args: Any)} callback - the callback function for the action
     * @return {undefined}
     */
    add(triggerStr: string, callback: MouseActionCallback): void;
    /**
     * Remove a mouse action. The trigger string can contain an asterix (*)
     * as a wildcard for any key or mouse button. When the callback function
     * is given, only actions that call that function are removed.
     *
     * @example
     * // remove actions triggered solely by a scroll event
     * stage.mouseControls.remove( "scroll" );
     *
     * @example
     * // remove actions triggered by a scroll event, including
     * // those requiring a key pressed or mouse button used
     * stage.mouseControls.remove( "scroll-*" );
     *
     * @example
     * // remove actions triggered by a scroll event
     * // while the shift key is pressed
     * stage.mouseControls.remove( "scroll-shift" );
     *
     * @param {TriggerString} triggerStr - the trigger for the action
     * @param {Function} [callback] - the callback function for the action
     * @return {undefined}
     */
    remove(triggerStr: string, callback?: MouseActionCallback): void;
    /**
     * Set mouse action preset
     * @param  {String} name - one of "default", "pymol", "coot"
     * @return {undefined}
     */
    preset(name: MouseControlPreset): void;
    /**
     * Remove all mouse actions
     * @return {undefined}
     */
    clear(): void;
}
export default MouseControls;
