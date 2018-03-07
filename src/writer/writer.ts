/**
 * @file Writer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults, download } from '../utils'

/**
 * Base class for writers
 * @interface
 */
abstract class Writer {
  readonly mimeType: string
  readonly defaultName: string
  readonly defaultExt: string

  /**
   * @abstract
   * @return {Anything} the data to be written
   */
  abstract getData (): any

  /**
   * Get a blob with the written data
   * @return {Blob} the blob
   */
  getBlob () {
    return new Blob([ this.getData() ], { type: this.mimeType })
  }

  /**
   * Trigger a download of the
   * @param  {[type]} name [description]
   * @param  {[type]} ext  [description]
   * @return {[type]}      [description]
   */
  download (name?: string, ext?: string) {
    name = defaults(name, this.defaultName)
    ext = defaults(ext, this.defaultExt)

    download(this.getBlob(), `${name}.${ext}`)
  }
}

export default Writer