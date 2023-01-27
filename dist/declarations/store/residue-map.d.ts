/**
 * @file Residue Map
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from '../structure/structure';
import { ResidueBonds } from '../structure/structure-utils';
import ResidueType from './residue-type';
declare class ResidueMap {
    readonly structure: Structure;
    dict: {
        [k: string]: number;
    };
    list: ResidueType[];
    constructor(structure: Structure);
    add(resname: string, atomTypeIdList: number[], hetero: boolean, chemCompType?: string, bonds?: ResidueBonds): number;
    get(id: number): ResidueType;
}
export default ResidueMap;
