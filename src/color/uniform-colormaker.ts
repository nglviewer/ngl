/**
 * @file Uniform Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ColormakerRegistry } from '../globals'
import Colormaker, { manageColor } from './colormaker'

/**
 * Color by uniform color
 */
class UniformColormaker extends Colormaker {
  @manageColor
  atomColor () {
    return this.parameters.value
  }

  @manageColor
  bondColor () {
    return this.parameters.value
  }

  @manageColor
  valueColor () {
    return this.parameters.value
  }

  @manageColor
  volumeColor () {
    return this.parameters.value
  }
}

ColormakerRegistry.add('uniform', UniformColormaker as any)

export default UniformColormaker
