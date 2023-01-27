/**
 * @file Volume Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3 } from 'three';
import Colormaker, { VolumeColormakerParams, ColormakerScale } from './colormaker';
/**
 * Color by volume position
 */
declare class VolumeColormaker extends Colormaker {
    valueScale: ColormakerScale;
    vec: Vector3;
    constructor(params: VolumeColormakerParams);
    /**
     * return the color for coordinates in space
     * @param  {Vector3} coords - xyz coordinates
     * @return {Integer} hex coords color
     */
    positionColor(coords: Vector3): number;
}
export default VolumeColormaker;
