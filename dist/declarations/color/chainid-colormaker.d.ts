/**
 * @file Chainid Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
export declare type ChainidDict = {
    [k: string]: number;
};
/**
 * Color by chain id
 */
declare class ChainidColormaker extends Colormaker {
    chainidDictPerModel: {
        [k: number]: ChainidDict;
    };
    scalePerModel: {
        [k: number]: ColormakerScale;
    };
    constructor(params: StuctureColormakerParams);
    atomColor(a: AtomProxy): number;
}
export default ChainidColormaker;
