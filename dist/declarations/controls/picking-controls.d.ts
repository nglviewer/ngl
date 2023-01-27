/**
 * @file Picking Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import PickingProxy from './picking-proxy';
import Stage from '../stage/stage';
import Viewer from '../viewer/viewer';
/**
 * Picking controls
 */
declare class PickingControls {
    readonly stage: Stage;
    viewer: Viewer;
    constructor(stage: Stage);
    /**
     * get picking data
     * @param {Number} x - canvas x coordinate
     * @param {Number} y - canvas y coordinate
     * @return {PickingProxy|undefined} picking proxy
     */
    pick(x: number, y: number): PickingProxy | undefined;
}
export default PickingControls;
