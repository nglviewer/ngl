/**
 * @file RCSB Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Log, DatasourceRegistry } from '../globals'
import { getFileInfo } from '../loader/loader-utils'
import Datasource from './datasource'

const baseUrl = '//files.rcsb.org/download/'
const bcifBaseUrl = '//models.rcsb.org/'
const protocol = 'https:'

class RcsbDatasource extends Datasource {
  getUrl (src: string) {
    // valid path are
    // XXXX.pdb, XXXX.pdb.gz, XXXX.cif, XXXX.cif.gz, XXXX.mmtf, XXXX.bb.mmtf
    // XXXX defaults to XXXX.cif
    const info = getFileInfo(src)
    const pdbid = info.name.indexOf('_') > -1 ? info.name : info.name.substring(0, 4) // Allow extended pdb codes and alphafold codes
    if ([ 'pdb', 'cif' ].includes(info.ext) &&
        (info.compressed === false || info.compressed === 'gz')
    ) {
      return protocol + baseUrl + info.path
    }

    if (info.ext === 'mmtf') {
      Log.warn('MMTF files distribution has been discontinued by RCSB PDB as of July 2024.\n Defaulting to bcif format instead. See https://www.rcsb.org/news/65a1af31c76ca3abcc925d0c for the deprecation notice')
      if (info.base.endsWith('.bb')) {
        Log.warn('Backbone only files are not available from RCSB PDB anymore.')
      }
      info.ext = ''
    }

    if (!info.ext) {
      Log.warn('mmCif files available from RCSB PDB lack connectivity information.\n Consider using PDBe as the data provider for using "Updated mmCif files" that contain residues connectivity records.')
    } else {
      Log.warn('unsupported ext', info.ext)
    }

    return protocol + bcifBaseUrl + pdbid + '.bcif.gz'
  }

  getExt (src: string) {
    const ext = getFileInfo(src).ext
    return ext ? ext : 'bcif'
  }
}

DatasourceRegistry.add('rcsb', new RcsbDatasource())

export default RcsbDatasource
