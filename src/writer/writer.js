/**
 * @file Writer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults, download } from '../utils.js'

/**
 * Base class for writers
 * @interface
 */
class Writer {
  /**
   * @abstract
   * @return {String} the default mime type
   */
  get mimeType () {}

  /**
   * @abstract
   * @return {String} the default file name
   */
  get defaultName () {}

  /**
   * @abstract
   * @return {String} the default file extension
   */
  get defaultExt () {}

  /**
   * @abstract
   * @return {Anything} the data to be written
   */
  getData () {}

  /**
   * Get a blob with the written data
   * @return {Blob} the blob
   */
  getBlob () {
    return new window.Blob([ this.getData() ], { type: this.mimeType })
  }

  /**
   * Trigger a download of the
   * @param  {[type]} name [description]
   * @param  {[type]} ext  [description]
   * @return {[type]}      [description]
   */
  download (name, ext) {
    name = defaults(name, this.defaultName)
    ext = defaults(ext, this.defaultExt)

    download(this.getBlob(), `${name}.${ext}`)
  }
}

export default Writer
