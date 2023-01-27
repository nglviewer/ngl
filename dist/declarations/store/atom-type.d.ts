/**
 * @file Atom Type
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Structure from '../structure/structure';
/**
 * Atom type
 */
declare class AtomType {
    readonly structure: Structure;
    readonly atomname: string;
    element: string;
    number: number;
    vdw: number;
    covalent: number;
    /**
     * @param {Structure} structure - the structure object
     * @param {String} atomname - the name of the atom
     * @param {String} element - the chemical element
     */
    constructor(structure: Structure, atomname: string, element?: string);
    getDefaultValence(): number;
    getValenceList(): number[];
    getOuterShellElectronCount(): number;
    isMetal(): boolean;
    isNonmetal(): boolean;
    isMetalloid(): boolean;
    isHalogen(): boolean;
    isDiatomicNonmetal(): boolean;
    isPolyatomicNonmetal(): boolean;
    isAlkaliMetal(): boolean;
    isAlkalineEarthMetal(): boolean;
    isNobleGas(): boolean;
    isTransitionMetal(): boolean;
    isPostTransitionMetal(): boolean;
    isLanthanide(): boolean;
    isActinide(): boolean;
}
export default AtomType;
