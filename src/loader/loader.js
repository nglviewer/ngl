/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ParserRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import FileStreamer from '../streamer/file-streamer.js'
import NetworkStreamer from '../streamer/network-streamer.js'

/**
 * Loader parameter object.
 * @typedef {Object} LoaderParameters - loader parameters
 * @property {String} ext - file extension, determines file type
 * @property {Boolean} compressed - flag data as compressed
 * @property {Boolean} binary - flag data as binary
 * @property {String} name - set data name
 */

/**
 * Loader base class
 */
class Loader {
  /**
   * Construct a loader object
   * @param  {String|File|Blob} src - data source, string is interpreted as an URL
   * @param  {LoaderParameters} params - parameters object
   */
  constructor (src, params) {
    const p = Object.assign({}, params)

    this.compressed = defaults(p.compressed, false)
    this.binary = defaults(p.binary, ParserRegistry.isBinary(p.ext))
    this.name = defaults(p.name, '')
    this.ext = defaults(p.ext, '')
    this.dir = defaults(p.dir, '')
    this.path = defaults(p.path, '')
    this.protocol = defaults(p.protocol, '')

    this.params = params

    //

    const streamerParams = {
      compressed: this.compressed,
      binary: this.binary,
      json: ParserRegistry.isJson(this.ext),
      xml: ParserRegistry.isXml(this.ext)
    }

    if ((typeof File !== 'undefined' && src instanceof window.File) ||
        (typeof Blob !== 'undefined' && src instanceof window.Blob)
    ) {
      this.streamer = new FileStreamer(src, streamerParams)
    } else {
      this.streamer = new NetworkStreamer(src, streamerParams)
    }

    if (typeof p.onProgress === 'function') {
      this.streamer.onprogress = p.onprogress
    }
  }

  /**
   * Load data
   * @abstract
   * @return {Promise} resolves to the loaded data {@link Object}
   */
  load () {
    return Promise.reject(new Error('not implemented'))
  }
}

export default Loader
