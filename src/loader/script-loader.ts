/**
 * @file Script Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Loader from './loader'
import Script from '../script'

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
        this.streamer.asText(), this.parameters.name, this.parameters.path
      )
    })
  }
}

export default ScriptLoader
