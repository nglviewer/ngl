/**
 * @file Modelindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by model index
 */
declare class ModelindexColormaker extends Colormaker {
    modelindexScale: ColormakerScale;
    constructor(params: StuctureColormakerParams);
    atomColor(a: AtomProxy): number;
}
export default ModelindexColormaker;
