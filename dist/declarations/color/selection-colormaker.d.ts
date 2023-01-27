/**
 * @file Selection Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Selection from '../selection/selection';
import Colormaker, { ColormakerParameters } from './colormaker';
import AtomProxy from '../proxy/atom-proxy';
import Structure from '../structure/structure';
export declare type SelectionSchemeData = [string, string, ColormakerParameters | undefined];
/**
 * Color based on {@link Selection}
 */
declare class SelectionColormaker extends Colormaker {
    colormakerList: any[];
    selectionList: Selection[];
    constructor(params: {
        structure: Structure;
        dataList: SelectionSchemeData[];
    } & Partial<ColormakerParameters>);
    atomColor(a: AtomProxy): any;
}
export default SelectionColormaker;
