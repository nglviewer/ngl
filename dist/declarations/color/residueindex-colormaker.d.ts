/**
 * @file Residueindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by residue index
 */
declare class ResidueindexColormaker extends Colormaker {
    scalePerChain: {
        [k: number]: ColormakerScale;
    };
    constructor(params: StuctureColormakerParams);
    atomColor(a: AtomProxy): number;
}
export default ResidueindexColormaker;
