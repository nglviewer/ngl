/**
 * @file Rope Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import CartoonRepresentation, { CartoonRepresentationParameters } from './cartoon-representation';
import Spline from '../geometry/spline';
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import Polymer from '../proxy/polymer';
/**
 * Rope Representation
 */
declare class RopeRepresentation extends CartoonRepresentation {
    protected smooth: number;
    constructor(structure: Structure, viewer: Viewer, params: Partial<CartoonRepresentationParameters> & {
        smooth: number;
    });
    init(params: Partial<CartoonRepresentationParameters>): void;
    getSpline(polymer: Polymer): Spline;
}
export default RopeRepresentation;
