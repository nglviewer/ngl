/**
 * @file PubChem Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Log, DatasourceRegistry } from '../globals.js'
import { getFileInfo, getProtocol } from '../utils.js'
import Datasource from './datasource.js'

const baseUrl = '//pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/'
const suffixUrl = '/SDF?record_type=3d'

class PubchemDatasource extends Datasource {
  getUrl (src) {
    const info = getFileInfo(src)
    const cid = info.name
    let url
    if (!info.ext || info.ext === 'sdf') {
      url = baseUrl + cid + suffixUrl
    } else {
      Log.warn('unsupported ext', info.ext)
      url = baseUrl + cid + suffixUrl
    }
    return getProtocol() + url
  }

  getExt (src) {
    const info = getFileInfo(src)
    if (!info.ext || info.ext === 'sdf') {
      return 'sdf'
    }
  }
}

DatasourceRegistry.add('pubchem', new PubchemDatasource())

export default PubchemDatasource
