/**
 * @file Static Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { getFileInfo, getAbsolutePath } from '../utils.js'
import Datasource from './datasource.js'

const reProtocol = /^((http|https|ftp):)*\/\//

class StaticDatasource extends Datasource {
  constructor (baseUrl) {
    super()
    this.baseUrl = baseUrl || ''
  }

  getUrl (src) {
    const info = getFileInfo(src)
    let url = this.baseUrl + info.path
    if (!reProtocol.test(this.baseUrl)) {
      url = getAbsolutePath(url)
    }
    return url
  }
}

export default StaticDatasource
