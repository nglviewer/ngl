/**
 * @file PDB Europe Datasource
 * @author Paul Pillot <paul.pillot@tandemai.com>
 * @private
 */

import { Log, DatasourceRegistry } from '../globals'
import { getFileInfo } from '../loader/loader-utils'
import Datasource from './datasource'

const baseUrl = '//www.ebi.ac.uk/pdbe/entry-files/download/'

// Examples:
//https://www.ebi.ac.uk/pdbe/entry-files/download/5z6y_updated.cif
//https://www.ebi.ac.uk/pdbe/entry-files/download/pdb5z6y.ent
//https://www.ebi.ac.uk/pdbe/entry-files/download/5z6y.bcif

class PDBeDatasource extends Datasource {
  getUrl (src: string) {
    // valid path are
    // XXXX.pdb, XXXX.ent, XXXX.cif, XXXX.bcif
    // XXXX defaults to XXXX.bcif
    const info = getFileInfo(src)
    let pdbid = info.name.indexOf('_') > -1 ? info.name : info.name.substring(0, 4) // Allow extended pdb codes
    let url
    switch (info.ext) {
        case 'cif':
            url = baseUrl + pdbid + '_updated.cif'  // "Updated mmcif" files contain connectivity
            break
        case 'pdb':
        case 'ent':
            if (!pdbid.startsWith('pdb')) {
                pdbid = 'pdb' + pdbid
            }
            url = baseUrl + pdbid + '.ent'
            break
        case 'bcif':
            url = baseUrl + info.path
            break
        case '':
            url = baseUrl + pdbid + '.bcif'
            break
        default:
            Log.warn('unsupported ext', info.ext)
            url = baseUrl + pdbid + '.bcif'
    }
    return 'https://' + url
  }

  getExt (src: string) {
    const ext = getFileInfo(src).ext
    return ext ? ext : 'mmtf'
  }
}

DatasourceRegistry.add('pdbe', new PDBeDatasource())

export default PDBeDatasource
