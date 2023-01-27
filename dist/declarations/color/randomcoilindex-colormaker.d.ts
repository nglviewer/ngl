/**
 * @file Randomcoilindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by random coil index
 */
declare class RandomcoilindexColormaker extends Colormaker {
    rciScale: ColormakerScale;
    rciDict: {
        [k: string]: number | undefined;
    };
    constructor(params: StuctureColormakerParams);
    atomColor(atom: AtomProxy): number;
}
export default RandomcoilindexColormaker;
