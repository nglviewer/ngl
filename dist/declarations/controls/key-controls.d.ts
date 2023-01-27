/**
 * @file Key Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { KeyActionPresets, KeyActionCallback } from './key-actions';
import Stage from '../stage/stage';
export declare type KeyControlPreset = keyof typeof KeyActionPresets;
export interface KeyControlsParams {
    preset?: KeyControlPreset;
    disabled?: boolean;
}
export interface KeyAction {
    key: string;
    callback: KeyActionCallback;
}
/**
 * Mouse controls
 */
declare class KeyControls {
    readonly stage: Stage;
    actionList: KeyAction[];
    disabled: boolean;
    /**
     * @param {Stage} stage - the stage object
     * @param {Object} [params] - the parameters
     * @param {String} params.preset - one of "default"
     * @param {String} params.disabled - flag to disable all actions
     */
    constructor(stage: Stage, params?: KeyControlsParams);
    run(key: string): void;
    /**
     * Add a key action triggered by pressing the given character.
     * The {@link KeyActions} class provides a number of static methods for
     * use as callback functions.
     *
     * @example
     * // call KeyActions.toggleRock when "k" is pressed
     * stage.keyControls.remove( "k", KeyActions.toggleRock );
     *
     * @param {Char} char - the key/character
     * @param {Function} callback - the callback function for the action
     * @return {undefined}
     */
    add(char: string, callback: KeyActionCallback): void;
    /**
     * Remove a key action. When the callback function
     * is given, only actions that call that function are removed.
     *
     * @example
     * // remove all actions triggered by pressing "k"
     * stage.keyControls.remove( "k" );
     *
     * @example
     * // remove action `toggleRock` triggered by pressing "k"
     * stage.keyControls.remove( "k", toggleRock );
     *
     * @param {Char} char - the key/character
     * @param {Function} [callback] - the callback function for the action
     * @return {undefined}
     */
    remove(char: string, callback: KeyActionCallback): void;
    /**
     * Set key action preset
     * @param  {String} name - one of "default"
     * @return {undefined}
     */
    preset(name: KeyControlPreset): void;
    /**
     * Remove all key actions
     * @return {undefined}
     */
    clear(): void;
}
export default KeyControls;
