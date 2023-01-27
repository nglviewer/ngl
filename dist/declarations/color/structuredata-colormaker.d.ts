/**
 * @file Colordata Colormaker
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */
import Colormaker, { ColorData, ColormakerScale, StuctureColormakerParams } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
import BondProxy from '../proxy/bond-proxy';
declare class StructuredataColormaker extends Colormaker {
    atomData?: ColorData['atomData'];
    bondData?: ColorData['bondData'];
    scale: ColormakerScale;
    constructor(params: StuctureColormakerParams);
    atomColor(a: AtomProxy): number;
    bondColor(bond: BondProxy, fromTo: boolean): number;
}
export default StructuredataColormaker;
