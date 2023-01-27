/**
 * @file Radius Factory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import AtomProxy from '../proxy/atom-proxy';
export declare const RadiusFactoryTypes: {
    '': string;
    vdw: string;
    covalent: string;
    sstruc: string;
    bfactor: string;
    size: string;
    data: string;
    explicit: string;
};
export declare type RadiusType = keyof typeof RadiusFactoryTypes;
export interface RadiusParams {
    type?: RadiusType;
    scale?: number;
    size?: number;
    data?: {
        [k: number]: number;
    };
}
declare class RadiusFactory {
    max: number;
    static types: {
        '': string;
        vdw: string;
        covalent: string;
        sstruc: string;
        bfactor: string;
        size: string;
        data: string;
        explicit: string;
    };
    readonly type: RadiusType;
    readonly scale: number;
    readonly size: number;
    readonly data: {
        [k: number]: number;
    };
    constructor(params?: RadiusParams);
    atomRadius(a: AtomProxy): number;
}
export default RadiusFactory;
