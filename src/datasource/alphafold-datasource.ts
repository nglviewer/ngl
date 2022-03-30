/**
 * @file Alphafold Datasource
 * @author Fredric Johansson <fredric@fredricj.se>
 * @private
 */

import { Log, DatasourceRegistry } from '../globals'
import { getProtocol } from '../utils'
import { getFileInfo } from '../loader/loader-utils'
import Datasource from './datasource'

const baseUrl = '//alphafold.ebi.ac.uk/files/AF-'
const suffixURL = '-F1-model_v2.pdb'

class AlphafoldDatasource extends Datasource {
    getUrl (src: string) {
        const info = getFileInfo(src)
        const uniprotid = info.name
        let url
        if (!info.ext || info.ext === 'pdb') {
            url = baseUrl + uniprotid + suffixURL
        } else {
            Log.warn('unsupported AF ext', info.ext)
            url = baseUrl + uniprotid + suffixURL
        }
        return getProtocol() + url
    }

    getExt (src: string) {
        const ext = getFileInfo(src).ext
        return ext ? ext : 'pdb'
    }
}

DatasourceRegistry.add('alphafold', new AlphafoldDatasource())

export default AlphafoldDatasource
