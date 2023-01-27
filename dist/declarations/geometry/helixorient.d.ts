/**
 * @file Helixorient
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3 } from 'three';
import { ColormakerParameters } from '../color/colormaker';
import { AtomPicker } from '../utils/picker';
import { RadiusParams } from '../utils/radius-factory';
import Polymer from '../proxy/polymer';
export interface HelixIterator {
    size: number;
    next: () => Vector3;
    get: (idx: number) => Vector3;
    reset: () => void;
}
export interface HelixPosition {
    center: Float32Array;
    axis: Float32Array;
    bending: Float32Array;
    radius: Float32Array;
    rise: Float32Array;
    twist: Float32Array;
    resdir: Float32Array;
}
declare class Helixorient {
    readonly polymer: Polymer;
    size: number;
    constructor(polymer: Polymer);
    getCenterIterator(smooth?: number): HelixIterator;
    getColor(params: {
        scheme: string;
    } & ColormakerParameters): {
        color: Float32Array;
    };
    getPicking(): {
        picking: AtomPicker;
    };
    getSize(params: RadiusParams): {
        size: Float32Array;
    };
    getPosition(): HelixPosition;
}
export default Helixorient;
