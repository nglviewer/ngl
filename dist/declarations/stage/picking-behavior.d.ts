/**
 * @file Picking Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Stage from './stage';
import MouseObserver from './mouse-observer';
import Viewer from '../viewer/viewer';
import MouseControls from '../controls/mouse-controls';
declare class PickingBehavior {
    readonly stage: Stage;
    viewer: Viewer;
    mouse: MouseObserver;
    controls: MouseControls;
    constructor(stage: Stage);
    _onClick(x: number, y: number): void;
    _onHover(x: number, y: number): void;
    dispose(): void;
}
export default PickingBehavior;
