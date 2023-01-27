/**
 * @file Validation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Color } from 'three';
import { ClashPicker } from '../utils/picker';
import Structure from '../structure/structure';
declare class Validation {
    readonly name: string;
    readonly path: string;
    rsrzDict: {
        [k: string]: number;
    };
    rsccDict: {
        [k: string]: number;
    };
    /**
     * Random Coil Index (RCI) - evaluates the proximity of residue structural
     * and dynamic properties to the properties of flexible random coil regions
     * from NMR chemical shifts.
     *
     * Mark V. Berjanskii and David S. Wishart (2005)
     * A Simple Method To Predict Protein Flexibility Using Secondary Chemical Shifts
     * J. Am. Chem. Soc., 2005, 127 (43), pp 14970–14971
     * http://pubs.acs.org/doi/abs/10.1021/ja054842f
     *
     * Mark V. Berjanskii and David S. Wishart (2008)
     * Application of the random coil index to studying protein flexibility.
     * J Biomol NMR. 2008 Jan;40(1):31-48. Epub 2007 Nov 6.
     * http://www.springerlink.com/content/2966482w10306126/
     */
    rciDict: {
        [k: string]: number;
    };
    clashDict: {
        [k: string]: {
            [k: string]: string;
        };
    };
    clashArray: {
        [k: string]: string;
    }[];
    geoDict: {
        [k: string]: number;
    };
    geoAtomDict: {
        [k: string]: {
            [k: string]: number;
        };
    };
    atomDict: {
        [k: string]: boolean | number;
    };
    clashSele: string;
    constructor(name: string, path: string);
    get type(): string;
    fromXml(xml: XMLDocument): void;
    getClashData(params: {
        color: number | string | Color;
        structure: Structure;
    }): {
        position1: Float32Array;
        position2: Float32Array;
        color: Float32Array;
        color2: Float32Array;
        radius: Float32Array;
        picking: ClashPicker;
    };
}
export default Validation;
