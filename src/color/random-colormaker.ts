/**
 * @file Random Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { manageColor } from './colormaker'

function randomColor () {
  return Math.random() * 0xFFFFFF
}

/**
 * Class by random color
 */
class RandomColormaker extends Colormaker {
  /**
   * get color for an atom
   * @return {Integer} random hex color
   */
  @manageColor
  atomColor () {
    return randomColor()
  }

  /**
   * get color for volume cell
   * @return {Integer} random hex color
   */
  @manageColor
  volumeColor () {
    return randomColor()
  }

  /**
   * get color for coordinates in space
   * @return {Integer} random hex color
   */
  @manageColor
  positionColor () {
    return randomColor()
  }
}

ColormakerRegistry.add('random', RandomColormaker as any)

export default RandomColormaker
