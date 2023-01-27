/**
 * @file Occupancy Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { ColormakerParameters, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by occupancy
 */
declare class OccupancyColormaker extends Colormaker {
    occupancyScale: ColormakerScale;
    constructor(params: ColormakerParameters);
    atomColor(a: AtomProxy): number;
}
export default OccupancyColormaker;
