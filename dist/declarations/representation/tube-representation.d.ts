/**
 * @file Tube Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import CartoonRepresentation, { CartoonRepresentationParameters } from './cartoon-representation';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
/**
 * Tube Representation
 */
declare class TubeRepresentation extends CartoonRepresentation {
    constructor(structure: Structure, viewer: Viewer, params: Partial<CartoonRepresentationParameters>);
    init(params: Partial<CartoonRepresentationParameters>): void;
    getSplineParams(): {
        subdiv: number;
        tension: number;
        directional: boolean;
        smoothSheet: boolean;
    } & Partial<CartoonRepresentationParameters>;
}
export default TubeRepresentation;
