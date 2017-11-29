/**
 * @file MDsrv Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { getFileInfo } from '../utils.js'
import { autoLoad } from '../loader/loader-utils.js'
import Datasource from './datasource.js'

class MdsrvDatasource extends Datasource {
  constructor (baseUrl) {
    super()
    this.baseUrl = baseUrl || ''
  }

  getListing (path) {
    path = path || ''
    let url = this.baseUrl + 'dir/' + path
    if (url[url.length - 1] !== '/') url += '/'
    return autoLoad(url, {
      ext: 'json'
    }).then(function (jsonData) {
      return {
        path: path,
        data: jsonData.data
      }
    })
  }

  getUrl (src) {
    const info = getFileInfo(src)
    return this.baseUrl + 'file/' + info.path + info.query
  }

  getCountUrl (src) {
    const info = getFileInfo(src)
    return this.baseUrl + 'traj/numframes/' + info.path + info.query
  }

  getFrameUrl (src, frameIndex) {
    const info = getFileInfo(src)
    return this.baseUrl + 'traj/frame/' + frameIndex + '/' + info.path + info.query
  }

  getFrameParams (src, atomIndices) {
    return 'atomIndices=' + atomIndices.join(';')
  }

  getPathUrl (src, atomIndex) {
    const info = getFileInfo(src)
    return this.baseUrl + 'traj/path/' + atomIndex + '/' + info.path + info.query
  }
}

export default MdsrvDatasource
