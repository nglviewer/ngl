/**
 * @file MDsrv Datasource
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { autoLoad, getFileInfo } from '../loader/loader-utils'
import Datasource from './datasource'

class MdsrvDatasource extends Datasource {
  baseUrl: string

  constructor (baseUrl: string = '') {
    super()
    this.baseUrl = baseUrl
  }

  getListing (path: string = '') {
    let url = `${this.baseUrl}dir/${path}`
    if (url[url.length - 1] !== '/') url += '/'
    return autoLoad(url, {
      ext: 'json'
    }).then((jsonData: any) => ({
      path: path,
      data: jsonData.data
    }))
  }

  getUrl (src: string) {
    const info = getFileInfo(src)
    return `${this.baseUrl}file/${info.path}${info.query}`
  }

  getCountUrl (src: string) {
    const info = getFileInfo(src)
    return `${this.baseUrl}traj/numframes/${info.path}${info.query}`
  }

  getFrameUrl (src: string, frameIndex: number|string) {
    const info = getFileInfo(src)
    return `${this.baseUrl}traj/frame/${frameIndex}/${info.path}${info.query}`
  }

  getFrameParams (src: string, atomIndices: (number|string)[]) {
    return `atomIndices=${atomIndices.join(';')}`
  }

  getPathUrl (src: string, atomIndex: number|string) {
    const info = getFileInfo(src)
    return `${this.baseUrl}traj/path/${atomIndex}/${info.path}${info.query}`
  }

  getExt (src: string) {
    return getFileInfo(src).ext
  }
}

export default MdsrvDatasource
