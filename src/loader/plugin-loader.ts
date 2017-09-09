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
    let basePath: string
    if (this.parameters.protocol) {
      basePath = this.parameters.protocol + '://' + this.parameters.dir
    } else {
      basePath = this.parameters.dir
    }

    return this.streamer.read().then(() => {
      const manifest = JSON.parse(this.streamer.asText())
      const promiseList: Promise<any>[] = []

      manifest.files.map(function (name: string) {
        promiseList.push(
          autoLoad(basePath + name, { ext: 'text' })
        )
      })

      return Promise.all(promiseList).then(dataList => {
        var text = dataList.reduce(function (text, value) {
          return text + '\n\n' + value.data
        }, '')
        text += manifest.source || ''

        return new Script(text, this.parameters.name, this.parameters.path)
      })
    })
  }
}

export default PluginLoader
