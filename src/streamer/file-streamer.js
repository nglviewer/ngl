/**
 * @file File Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Streamer from './streamer.js'

class FileStreamer extends Streamer {
  get type () { return 'file' }

  get __srcName () { return 'file' }

  _read (callback) {
    let reader

    if (typeof importScripts === 'function') {
      // Use FileReaderSync within Worker

      reader = new window.FileReaderSync()
      let data
      if (this.binary || this.compressed) {
        data = reader.readAsArrayBuffer(this.file)
      } else {
        data = reader.readAsText(this.file)
      }

        //

      callback(data)
    } else {
      reader = new window.FileReader()

      //

      reader.onload = function (event) {
        callback(event.target.result)
      }

      //

      if (typeof this.onprogress === 'function') {
        reader.onprogress = event => {
          this.onprogress(event)
        }
      }

      //

      if (typeof this.onerror === 'function') {
        reader.onerror = event => {
          this.onerror(event)
        }
      }

      //

      if (this.binary || this.compressed) {
        reader.readAsArrayBuffer(this.file)
      } else {
        reader.readAsText(this.file)
      }
    }
  }
}

export default FileStreamer
