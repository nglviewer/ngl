/**
 * @file Uniform Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals.js'
import Colormaker from './colormaker.js'

/**
 * Color by uniform color
 */
class UniformColormaker extends Colormaker {
  atomColor () {
    return this.value
  }

  bondColor () {
    return this.value
  }

  valueColor () {
    return this.value
  }

  volumeColor () {
    return this.value
  }
}

ColormakerRegistry.add('uniform', UniformColormaker)

export default UniformColormaker
