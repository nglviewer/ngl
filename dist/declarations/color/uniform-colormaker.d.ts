/**
 * @file Uniform Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Colormaker from './colormaker';
/**
 * Color by uniform color
 */
declare class UniformColormaker extends Colormaker {
    atomColor(): number;
    bondColor(): number;
    valueColor(): number;
    volumeColor(): number;
}
export default UniformColormaker;
