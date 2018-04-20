/**
 * @file RCSB Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Log, DatasourceRegistry } from '../globals'
import { getProtocol } from '../utils'
import { getFileInfo } from '../loader/loader-utils'
import Datasource from './datasource'

const baseUrl = '//files.rcsb.org/download/'
const mmtfBaseUrl = '//mmtf.rcsb.org/v1.0/'
const mmtfFullUrl = mmtfBaseUrl + 'full/'
const mmtfReducedUrl = mmtfBaseUrl + 'reduced/'

class RcsbDatasource extends Datasource {
  getUrl (src: string) {
    // valid path are
    // XXXX.pdb, XXXX.pdb.gz, XXXX.cif, XXXX.cif.gz, XXXX.mmtf, XXXX.bb.mmtf
    // XXXX defaults to XXXX.cif
    const info = getFileInfo(src)
    const pdbid = info.name.substr(0, 4)
    let url
    if ([ 'pdb', 'cif' ].includes(info.ext) &&
        (info.compressed === false || info.compressed === 'gz')
    ) {
      url = baseUrl + info.path
    } else if (info.ext === 'mmtf') {
      if (info.base.endsWith('.bb')) {
        url = mmtfReducedUrl + pdbid
      } else {
        url = mmtfFullUrl + pdbid
      }
    } else if (!info.ext) {
      url = mmtfFullUrl + pdbid
    } else {
      Log.warn('unsupported ext', info.ext)
      url = mmtfFullUrl + pdbid
    }
    return getProtocol() + url
  }

  getExt (src: string) {
    const ext = getFileInfo(src).ext
    return ext ? ext : 'mmtf'
  }
}

DatasourceRegistry.add('rcsb', new RcsbDatasource())

export default RcsbDatasource
