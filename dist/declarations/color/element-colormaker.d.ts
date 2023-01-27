/**
 * @file Element Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { ColormakerParameters } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by element
 */
declare class ElementColormaker extends Colormaker {
    constructor(params: ColormakerParameters);
    atomColor(a: AtomProxy): number;
}
export default ElementColormaker;
