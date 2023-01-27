/**
 * @file Atom Map
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import AtomType from './atom-type';
import Structure from '../structure/structure';
declare class AtomMap {
    readonly structure: Structure;
    dict: {
        [k: string]: number;
    };
    list: AtomType[];
    constructor(structure: Structure);
    add(atomname: string, element?: string): number;
    get(id: number): AtomType;
}
export default AtomMap;
