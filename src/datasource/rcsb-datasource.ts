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
const bcifBaseUrl = '//models.rcsb.org/'

class RcsbDatasource extends Datasource {
  getUrl (src: string) {
    // valid path are
    // XXXX.pdb, XXXX.pdb.gz, XXXX.cif, XXXX.cif.gz, XXXX.mmtf, XXXX.bb.mmtf
    // XXXX defaults to XXXX.cif
    const info = getFileInfo(src)
    const pdbid = info.name.indexOf('_') > -1 ? info.name : info.name.substring(0, 4) // Allow extended pdb codes and alphafold codes
    let url
    if ([ 'pdb', 'cif' ].includes(info.ext) &&
        (info.compressed === false || info.compressed === 'gz')
    ) {
      url = baseUrl + info.path
    } else if (info.ext === 'mmtf') {
      Log.warn('MMTF files distribution is discontinued by RCSB PDB as of July 2, 2024.\n Consider using bcif format instead. See https://www.rcsb.org/news/65a1af31c76ca3abcc925d0c for the deprecation notice')
      if (info.base.endsWith('.bb')) {
        url = mmtfReducedUrl + pdbid
      } else {
        url = mmtfFullUrl + pdbid
      }
    } else if (info.ext === 'bcif' &&
        (info.compressed === false || info.compressed === 'gz')
    ) {
      url = bcifBaseUrl + info.path
    } else if (!info.ext) {
      Log.warn('mmCif files available from RCSB PDB lack connectivity information.\n Consider using PDBe as the data provider for using "Updated mmCif files" that contain residues connectivity records.')
      url = bcifBaseUrl + pdbid + '.bcif.gz'
    } else {
      Log.warn('unsupported ext', info.ext)
      url = bcifBaseUrl + pdbid + '.bcif.gz'
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
