/**
 * @file Key Actions
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Stage from '../stage/stage';
export declare type KeyActionCallback = (stage: Stage) => void;
/**
 * Key actions provided as static methods
 */
declare class KeyActions {
    /**
     * Stage auto view
     */
    static autoView(stage: Stage): void;
    /**
     * Toggle stage animations
     */
    static toggleAnimations(stage: Stage): void;
    /**
     * Toggle stage rocking
     */
    static toggleRock(stage: Stage): void;
    /**
     * Toggle stage spinning
     */
    static toggleSpin(stage: Stage): void;
    /**
     * Toggle anti-aliasing
     */
    static toggleAntialiasing(stage: Stage): void;
}
declare type KeyActionPreset = [string, KeyActionCallback][];
export declare const KeyActionPresets: {
    default: KeyActionPreset;
};
export default KeyActions;
