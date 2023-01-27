/**
 * @file Animation Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Stage from './stage';
import Viewer from '../viewer/viewer';
import Stats from '../viewer/stats';
import AnimationControls from '../controls/animation-controls';
declare class AnimationBehavior {
    readonly stage: Stage;
    viewer: Viewer;
    animationControls: AnimationControls;
    constructor(stage: Stage);
    _onTick(stats: Stats): void;
    dispose(): void;
}
export default AnimationBehavior;
