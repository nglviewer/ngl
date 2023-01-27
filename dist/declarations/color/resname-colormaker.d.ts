/**
 * @file Resname Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by residue name
 */
declare class ResnameColormaker extends Colormaker {
    atomColor(a: AtomProxy): number;
}
export default ResnameColormaker;
