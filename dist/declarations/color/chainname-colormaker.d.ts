/**
 * @file Chainname Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
export declare type ChainnameDict = {
    [k: string]: number;
};
/**
 * Color by chain name
 */
declare class ChainnameColormaker extends Colormaker {
    chainnameDictPerModel: {
        [k: number]: ChainnameDict;
    };
    scalePerModel: {
        [k: number]: ColormakerScale;
    };
    constructor(params: StuctureColormakerParams);
    atomColor(a: AtomProxy): number;
}
export default ChainnameColormaker;
