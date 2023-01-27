/**
 * @file Hydrophobicity Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { ColormakerParameters, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by hydrophobicity
 */
declare class HydrophobicityColormaker extends Colormaker {
    hfScale: ColormakerScale;
    resHF: {
        [k: string]: number;
    };
    defaultResidueHydrophobicity: number;
    constructor(params: ColormakerParameters);
    atomColor(a: AtomProxy): number;
}
export default HydrophobicityColormaker;
