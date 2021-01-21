/**
 * @file Parser Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ParserRegistry } from '../globals'
import Loader from './loader'
import { LoaderParameters, LoaderInput } from './loader-utils'

export interface ParserParams {
  voxelSize?: number
  firstModelOnly?: boolean
  asTrajectory?: boolean
  cAlphaOnly?: boolean
  name?: string
  path?: string
  delimiter?: string
  comment?: string
  columnNames?: string
}

/**
 * Parser loader class
 * @extends Loader
 */
class ParserLoader extends Loader {
  parserParams: ParserParams

  constructor (src: LoaderInput, params: Partial<LoaderParameters> & ParserParams = {}) {
    super(src, params)
    this.parserParams = {
      voxelSize: params.voxelSize,
      firstModelOnly: params.firstModelOnly,
      asTrajectory: params.asTrajectory,
      cAlphaOnly: params.cAlphaOnly,
      delimiter: params.delimiter,
      comment: params.comment,
      columnNames: params.columnNames,
      name: this.parameters.name,
      path: this.parameters.path
    }
  }

  /**
   * Load parsed object
   * @return {Promise} resolves to the loaded & parsed {@link Structure},
   *                   {@link Volume}, {@link Surface} or data object
   */
  load () {
    var ParserClass = ParserRegistry.get(this.parameters.ext)
    var parser = new ParserClass(this.streamer, this.parserParams)

    return parser.parse()
  }
}

export default ParserLoader
