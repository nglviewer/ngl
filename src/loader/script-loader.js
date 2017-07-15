/**
 * @file Script Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Loader from './loader.js'
import Script from '../script.js'

/**
 * Script loader class
 * @extends Loader
 */
class ScriptLoader extends Loader {
  /**
   * Load script
   * @return {Promise} resolves to the loaded {@link Script}
   */
  load () {
    return this.streamer.read().then(() => {
      return new Script(
        this.streamer.asText(), this.name, this.path
      )
    })
  }
}

export default ScriptLoader
