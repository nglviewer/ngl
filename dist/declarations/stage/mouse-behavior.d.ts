/**
 * @file Mouse Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Stage from './stage';
import MouseObserver from './mouse-observer';
import Viewer from '../viewer/viewer';
import MouseControls from '../controls/mouse-controls';
declare class MouseBehavior {
    readonly stage: Stage;
    viewer: Viewer;
    mouse: MouseObserver;
    controls: MouseControls;
    domElement: HTMLCanvasElement;
    constructor(stage: Stage);
    _onMove(): void;
    _onScroll(delta: number): void;
    _onDrag(dx: number, dy: number): void;
    _onClick(x: number, y: number): void;
    _onDblclick(x: number, y: number): void;
    _onHover(x: number, y: number): void;
    dispose(): void;
}
export default MouseBehavior;
