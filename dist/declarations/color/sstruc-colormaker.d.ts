/**
 * @file Sstruc Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { StuctureColormakerParams } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
import ResidueProxy from '../proxy/residue-proxy';
/**
 * Color by secondary structure
 */
declare class SstrucColormaker extends Colormaker {
    residueProxy: ResidueProxy;
    constructor(params: StuctureColormakerParams);
    atomColor(ap: AtomProxy): number;
}
export default SstrucColormaker;
