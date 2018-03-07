/**
 * @file Uniform Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker from './colormaker'

/**
 * Color by uniform color
 */
class UniformColormaker extends Colormaker {
  atomColor () {
    return this.parameters.value
  }

  bondColor () {
    return this.parameters.value
  }

  valueColor () {
    return this.parameters.value
  }

  volumeColor () {
    return this.parameters.value
  }
}

ColormakerRegistry.add('uniform', UniformColormaker as any)

export default UniformColormaker
