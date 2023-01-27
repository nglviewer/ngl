/**
 * @file Selection Test
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import AtomProxy from '../proxy/atom-proxy';
import ResidueProxy from '../proxy/residue-proxy';
import ChainProxy from '../proxy/chain-proxy';
import ModelProxy from '../proxy/model-proxy';
export declare type ProxyEntity = AtomProxy | ResidueProxy | ChainProxy | ModelProxy;
export declare type SelectionTest = false | ((e: ProxyEntity) => boolean | -1);
export declare type SelectionOperator = 'AND' | 'OR';
export interface SelectionRule {
    keyword?: any;
    atomname?: string;
    element?: string;
    atomindex?: number[];
    altloc?: string;
    inscode?: string;
    resname?: string | string[];
    sstruc?: string;
    resno?: number | [number, number];
    chainname?: string;
    model?: number;
    error?: string;
    rules?: SelectionRule[];
    negate?: boolean;
    operator?: SelectionOperator;
}
declare function makeAtomTest(selection: SelectionRule, atomOnly?: boolean): SelectionTest;
declare function makeResidueTest(selection: SelectionRule, residueOnly?: boolean): SelectionTest;
declare function makeChainTest(selection: SelectionRule, chainOnly?: boolean): SelectionTest;
declare function makeModelTest(selection: SelectionRule, modelOnly?: boolean): SelectionTest;
export { makeAtomTest, makeResidueTest, makeChainTest, makeModelTest };
