/**
 * @file Selection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Signal } from 'signals';
import { SelectionTest, SelectionRule } from './selection-test';
export declare type SelectionSignals = {
    stringChanged: Signal;
};
/**
 * Selection
 */
declare class Selection {
    signals: SelectionSignals;
    string: string;
    selection: SelectionRule;
    test: SelectionTest;
    residueTest: SelectionTest;
    chainTest: SelectionTest;
    modelTest: SelectionTest;
    atomOnlyTest: SelectionTest;
    residueOnlyTest: SelectionTest;
    chainOnlyTest: SelectionTest;
    modelOnlyTest: SelectionTest;
    /**
     * Create Selection
     * @param {String} string - selection string, see {@tutorial selection-language}
     */
    constructor(string?: string);
    get type(): string;
    setString(string?: string, silent?: boolean): void;
    isAllSelection(): boolean;
    isNoneSelection(): boolean;
}
export default Selection;
