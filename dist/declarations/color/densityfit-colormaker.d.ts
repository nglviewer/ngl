/**
 * @file Densityfit Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by validation density fit
 */
declare class DensityfitColormaker extends Colormaker {
    rsrzScale: ColormakerScale;
    rsccScale: ColormakerScale;
    rsrzDict: {
        [k: string]: number | undefined;
    };
    rsccDict: {
        [k: string]: number | undefined;
    };
    constructor(params: StuctureColormakerParams);
    atomColor(atom: AtomProxy): number;
}
export default DensityfitColormaker;
