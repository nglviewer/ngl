/**
 * @file Licorice Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import BallAndStickRepresentation, { BallAndStickRepresentationParameters } from './ballandstick-representation';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
/**
 * Licorice representation object ({@link BallAndStickRepresentation} with `aspectRatio` fixed at 1.0)
 */
declare class LicoriceRepresentation extends BallAndStickRepresentation {
    /**
     * Create Licorice representation object
     * @param {Structure} structure - the structure to be represented
     * @param {Viewer} viewer - a viewer object
     * @param {BallAndStickRepresentationParameters} params - ball and stick representation parameters
     */
    constructor(structure: Structure, viewer: Viewer, params: Partial<BallAndStickRepresentationParameters>);
    init(params: Partial<BallAndStickRepresentationParameters>): void;
}
export default LicoriceRepresentation;
