/**
 * @file Geoquality Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { StuctureColormakerParams } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by validation gometry quality
 */
declare class GeoqualityColormaker extends Colormaker {
    geoAtomDict: {
        [k: string]: {
            [k: string]: number;
        };
    };
    geoDict: {
        [k: string]: number | undefined;
    };
    constructor(params: StuctureColormakerParams);
    atomColor(atom: AtomProxy): 9474192 | 2188972 | 16703627 | 16018755 | 10813478;
}
export default GeoqualityColormaker;
