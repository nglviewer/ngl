/**
 * @file Moleculetype Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by molecule type
 */
declare class MoleculetypeColormaker extends Colormaker {
    atomColor(a: AtomProxy): 8374655 | 16629894 | 12496596 | 3697840 | 16777113 | 15729279 | 12540695;
}
export default MoleculetypeColormaker;
