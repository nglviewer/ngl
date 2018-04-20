/**
 * @file Pass Through Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { DatasourceRegistry } from '../globals'
import { getFileInfo } from '../loader/loader-utils'
import Datasource from './datasource'

class PassThroughDatasource extends Datasource {
  getUrl (path: string) {
    return path
  }

  getExt (path: string) {
    return getFileInfo(path).ext
  }
}

DatasourceRegistry.add('ftp', new PassThroughDatasource())
DatasourceRegistry.add('http', new PassThroughDatasource())
DatasourceRegistry.add('https', new PassThroughDatasource())

export default PassThroughDatasource
