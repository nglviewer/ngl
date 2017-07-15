/**
 * @file Plugin Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Loader from './loader.js'
import { autoLoad } from './loader-utils.js'
import Script from '../script.js'

/**
 * Plugin loader class
 * @extends Loader
 */
class PluginLoader extends Loader {
  /**
   * Load plugin
   * @return {Promise} resolves to the loaded plugin {@link Script}
   */
  load () {
    var basePath
    if (this.protocol) {
      basePath = this.protocol + '://' + this.dir
    } else {
      basePath = this.dir
    }

    return this.streamer.read().then(() => {
      var manifest = JSON.parse(this.streamer.asText())
      var promiseList = []

      manifest.files.map(function (name) {
        promiseList.push(
          autoLoad(basePath + name, {
            ext: 'text', useWorker: false
          })
        )
      })

      return Promise.all(promiseList).then(dataList => {
        var text = dataList.reduce(function (text, value) {
          return text + '\n\n' + value.data
        }, '')
        text += manifest.source || ''

        return new Script(text, this.name, this.path)
      })
    })
  }
}

export default PluginLoader
