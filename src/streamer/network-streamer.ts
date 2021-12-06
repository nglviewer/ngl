/**
 * @file Network Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Streamer from './streamer'

class NetworkStreamer extends Streamer {
  _read () {
    return new Promise((resolve, reject) => {
      const url = this.src
      const xhr = new XMLHttpRequest()

      xhr.open('GET', url, true)

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 304 ||
            // when requesting from local file system
            // the status in Google Chrome/Chromium is 0
            xhr.status === 0
        ) {
          try {
            resolve(xhr.response)
          } catch (e) {
            reject(e)
          }
        } else {
          reject(xhr.statusText)
        }
      }, false)

      // if (typeof this.onprogress === 'function') {
      //   xhr.addEventListener('progress', event => this.onprogress(event), false);
      // }

      xhr.addEventListener('error', event => reject('network error'), false)

      if (this.isBinary()) {
        xhr.responseType = 'arraybuffer'
      } else if (this.json) {
        xhr.responseType = 'json'
      } else if (this.xml) {
        xhr.responseType = 'document'
      } else {
        xhr.responseType = 'text'
      }
      // xhr.crossOrigin = true;

      xhr.send()
    })
  }
}

export default NetworkStreamer
