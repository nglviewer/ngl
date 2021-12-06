/**
 * @file Static Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { getAbsolutePath } from '../utils'
import { getFileInfo } from '../loader/loader-utils'
import Datasource from './datasource'

const reProtocol = /^((http|https|ftp):)*\/\//

class StaticDatasource extends Datasource {
  baseUrl: string

  constructor (baseUrl: string = '') {
    super()
    this.baseUrl = baseUrl
  }

  getUrl (src: string) {
    const info = getFileInfo(src)
    let url = this.baseUrl + info.path
    if (!reProtocol.test(this.baseUrl)) {
      url = getAbsolutePath(url)
    }
    return url
  }

  getExt (src: string) {
    return getFileInfo(src).ext
  }
}

export default StaticDatasource
