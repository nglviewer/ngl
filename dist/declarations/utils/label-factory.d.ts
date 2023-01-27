/**
 * @file Label Factory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import AtomProxy from '../proxy/atom-proxy';
export declare const LabelFactoryTypes: {
    '': string;
    atomname: string;
    atomindex: string;
    occupancy: string;
    bfactor: string;
    serial: string;
    element: string;
    atom: string;
    resname: string;
    resno: string;
    res: string;
    residue: string;
    text: string;
    format: string;
    qualified: string;
};
export declare type LabelType = keyof typeof LabelFactoryTypes;
declare class LabelFactory {
    readonly type: LabelType;
    readonly text: {
        [k: number]: string;
    };
    readonly format: string;
    static types: {
        '': string;
        atomname: string;
        atomindex: string;
        occupancy: string;
        bfactor: string;
        serial: string;
        element: string;
        atom: string;
        resname: string;
        resno: string;
        res: string;
        residue: string;
        text: string;
        format: string;
        qualified: string;
    };
    errorLogged: boolean;
    constructor(type: LabelType, text?: {
        [k: number]: string;
    }, format?: string);
    atomLabel(a: AtomProxy): string;
}
export default LabelFactory;
