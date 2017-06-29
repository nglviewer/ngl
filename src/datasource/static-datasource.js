/**
 * @file Static Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { getFileInfo, getAbsolutePath } from '../utils.js'

const reProtocol = /^((http|https|ftp):)*\/\//

function StaticDatasource (baseUrl) {
  baseUrl = baseUrl || ''

  this.getUrl = function (src) {
    const info = getFileInfo(src)
    let url = baseUrl + info.path
    if (!reProtocol.test(baseUrl)) {
      url = getAbsolutePath(url)
    }
    return url
  }
}

export default StaticDatasource
