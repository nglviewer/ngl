/**
 * @file Random Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

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
  atomColor () {
    return randomColor()
  }

    /**
     * get color for volume cell
     * @return {Integer} random hex color
     */
  volumeColor () {
    return randomColor()
  }

    /**
     * get color for coordinates in space
     * @return {Integer} random hex color
     */
  positionColor () {
    return randomColor()
  }
}

ColormakerRegistry.add('random', RandomColormaker)

export default RandomColormaker
