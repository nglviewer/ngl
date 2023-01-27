/**
 * @file Random Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker from './colormaker';
/**
 * Class by random color
 */
declare class RandomColormaker extends Colormaker {
    /**
     * get color for an atom
     * @return {Integer} random hex color
     */
    atomColor(): number;
    /**
     * get color for volume cell
     * @return {Integer} random hex color
     */
    volumeColor(): number;
    /**
     * get color for coordinates in space
     * @return {Integer} random hex color
     */
    positionColor(): number;
}
export default RandomColormaker;
