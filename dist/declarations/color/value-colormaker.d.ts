/**
 * @file Value Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker, { VolumeColormakerParams, ColormakerScale } from './colormaker';
/**
 * Color by volume value
 */
declare class ValueColormaker extends Colormaker {
    valueScale: ColormakerScale;
    constructor(params: VolumeColormakerParams);
    /**
     * return the color for a volume cell
     * @param  {Integer} index - volume cell index
     * @return {Integer} hex cell color
     */
    volumeColor(index: number): number;
}
export default ValueColormaker;
