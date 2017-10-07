/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ParserRegistry } from '../globals'
import { createParams } from '../utils'
import { Partial } from '../types'
import FileStreamer from '../streamer/file-streamer'
import NetworkStreamer from '../streamer/network-streamer'
import { LoaderParameters, LoaderInput } from './loader-utils'

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
abstract class Loader {
  parameters: LoaderParameters
  streamer: FileStreamer | NetworkStreamer

  /**
   * Construct a loader object
   * @param  {String|File|Blob} src - data source, string is interpreted as an URL
   * @param  {LoaderParameters} params - parameters object
   */
  constructor (src: LoaderInput, params: Partial<LoaderParameters> = {}) {
    this.parameters = createParams(params, {
      ext: '',
      compressed: false,
      binary: ParserRegistry.isBinary(params.ext || ''),
      name: '',

      dir: '',
      path: '',
      protocol: ''
    } as LoaderParameters)

    const streamerParams = {
      compressed: this.parameters.compressed as string|false,
      binary: this.parameters.binary,
      json: ParserRegistry.isJson(this.parameters.ext),
      xml: ParserRegistry.isXml(this.parameters.ext)
    }

    if ((typeof File !== 'undefined' && src instanceof File) ||
        (typeof Blob !== 'undefined' && src instanceof Blob)
    ) {
      this.streamer = new FileStreamer(src, streamerParams)
    } else {
      this.streamer = new NetworkStreamer(src, streamerParams)
    }
  }

  /**
   * Load data
   * @abstract
   * @return {Promise} resolves to the loaded data {@link Object}
   */
  abstract load (): Promise<any>
}

export default Loader
