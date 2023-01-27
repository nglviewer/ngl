/**
 * @file Chainindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by chain index
 */
declare class ChainindexColormaker extends Colormaker {
    scalePerModel: {
        [k: number]: ColormakerScale;
    };
    constructor(params: StuctureColormakerParams);
    atomColor(a: AtomProxy): number;
}
export default ChainindexColormaker;
