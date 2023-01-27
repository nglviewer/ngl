/**
 * @file Helixbundle
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { AtomPicker } from '../utils/picker';
import { RadiusParams } from '../utils/radius-factory';
import Helixorient, { HelixPosition } from './helixorient';
import Polymer from '../proxy/polymer';
import { ColormakerParameters } from '../color/colormaker';
export interface Axis {
    axis: Float32Array;
    center: Float32Array;
    begin: Float32Array;
    end: Float32Array;
    color: Float32Array;
    picking: AtomPicker;
    size: Float32Array;
    residueOffset: number[];
    residueCount: number[];
}
declare class Helixbundle {
    readonly polymer: Polymer;
    helixorient: Helixorient;
    position: HelixPosition;
    constructor(polymer: Polymer);
    getAxis(localAngle: number, centerDist: number, ssBorder: boolean, colorParams: {
        scheme: string;
    } & ColormakerParameters, radiusParams: RadiusParams): Axis;
}
export default Helixbundle;
