/**
 * @file Pass Through Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { DatasourceRegistry } from '../globals.js'
import Datasource from './datasource.js'

class PassThroughDatasource extends Datasource {
  getUrl (path) {
    return path
  }
}

DatasourceRegistry.add('ftp', new PassThroughDatasource())
DatasourceRegistry.add('http', new PassThroughDatasource())
DatasourceRegistry.add('https', new PassThroughDatasource())

export default PassThroughDatasource
