/**
 * @file Kin Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Parser from './parser';
interface RibbonObject {
    labelArray: string[];
    positionArray: number[];
    breakArray: boolean[];
    colorArray: number[];
    name?: string;
    masterArray: any[];
}
interface Kinemage {
    kinemage?: number;
    onewidth?: any;
    '1viewid'?: string;
    pdbfile?: string;
    text: string;
    texts: string[];
    captions: string[];
    caption: string;
    groupDict: {
        [k: string]: {
            [k: string]: boolean;
        };
    };
    subgroupDict: {
        [k: string]: any;
    };
    masterDict: {
        [k: string]: {
            indent: boolean;
            visible: boolean;
        };
    };
    pointmasterDict: {
        [k: string]: any;
    };
    dotLists: DotList[];
    vectorLists: VectorList[];
    ballLists: any[];
    ribbonLists: RibbonObject[];
}
interface DotList {
    name?: string;
    masterArray: any[];
    labelArray: any[];
    positionArray: any[];
    colorArray: any[];
}
interface VectorList {
    name?: string;
    masterArray: any[];
    label1Array: string[];
    label2Array: string[];
    position1Array: number[];
    position2Array: number[];
    color1Array: number[];
    color2Array: number[];
    width: number[];
}
declare class KinParser extends Parser {
    kinemage: Kinemage;
    get type(): string;
    get __objName(): string;
    _parse(): void;
}
export default KinParser;
