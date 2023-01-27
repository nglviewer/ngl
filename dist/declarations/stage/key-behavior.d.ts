/**
 * @file Key Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Stage from './stage';
import Viewer from '../viewer/viewer';
import KeyControls from '../controls/key-controls';
declare class KeyBehavior {
    readonly stage: Stage;
    viewer: Viewer;
    controls: KeyControls;
    domElement: HTMLCanvasElement;
    /**
     * @param {Stage} stage - the stage object
     */
    constructor(stage: Stage);
    /**
     * handle key down
     * @param  {Event} event - key event
     * @return {undefined}
     */
    _onKeydown(): void;
    /**
     * handle key up
     * @param  {Event} event - key event
     * @return {undefined}
     */
    _onKeyup(): void;
    /**
     * handle key press
     * @param  {Event} event - key event
     * @return {undefined}
     */
    _onKeypress(event: KeyboardEvent): void;
    _focusDomElement(): void;
    dispose(): void;
}
export default KeyBehavior;
