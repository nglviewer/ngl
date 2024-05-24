/**
 * @file ChemComp Map
 * @author Paul Pillot <paul.pillot@tandemai.com>
 * @private
 */
import Structure from "../structure/structure";
import { ResidueBonds } from "../structure/structure-utils";
interface ChemCompBonds {
    atom1: string[];
    atom2: string[];
    bondOrders: number[];
}
declare class ChemCompMap {
    readonly structure: Structure;
    dict: {
        [resname: string]: {
            chemCompType: string;
            bonds?: ChemCompBonds;
        };
    };
    constructor(structure: Structure);
    add(resname: string, chemCompType: string, bonds?: ChemCompBonds): void;
    addBond(resname: string, atom1: string, atom2: string, bondOrder: number): void;
    getBonds(resname: string, atomList: number[]): ResidueBonds | undefined;
}
export default ChemCompMap;
