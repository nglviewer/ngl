/**
 * @file Parser Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ParserRegistry } from '../globals.js'
import Loader from './loader.js'

/**
 * Parser loader class
 * @extends Loader
 */
class ParserLoader extends Loader {
  /**
   * Load parsed object
   * @return {Promise} resolves to the loaded & parsed {@link Structure},
   *                   {@link Volume}, {@link Surface} or data object
   */
  load () {
    var ParserClass = ParserRegistry.get(this.ext)
    var parser = new ParserClass(this.streamer, this.params)

    return parser.parse()
  }
}

export default ParserLoader
