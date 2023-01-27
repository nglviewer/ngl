/**
 * @file Entityindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { StuctureColormakerParams, ColormakerScale } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
/**
 * Color by entity index
 */
declare class EntityindexColormaker extends Colormaker {
    entityindexScale: ColormakerScale;
    constructor(params: StuctureColormakerParams);
    atomColor(a: AtomProxy): number;
}
export default EntityindexColormaker;
