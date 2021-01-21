/**
 * @file Csv Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { defaults } from '../utils'
import { ParserRegistry } from '../globals'
import Parser, { ParserParameters } from './parser'
import Streamer from '../streamer/streamer';

export interface CsvParserParameters extends ParserParameters {
  delimiter: string
  comment: string
  columnNames: boolean
}
/**
 * CSV parser
 */
class CsvParser extends Parser {
  /**
     * [constructor description]
     * @param  {Streamer} streamer - the streamer object
     * @param  {Object} params - parameter object
     * @param  {Char} params.delimiter - delimiter character
     * @param  {Char} params.comment - comment character
     * @param  {Boolean} params.columnNames - use first data line as column names
     */
  constructor (streamer: Streamer, params?: Partial<CsvParserParameters>) {
    const p = params || {}

    super(streamer, p)

    this.delimiter = defaults(p.delimiter, ',')
    this.comment = defaults(p.comment, '#')
    this.columnNames = defaults(p.columnNames, false)

    this.table = {
      name: this.name,
      path: this.path,
      columnNames: [],
      data: []
    }
  }

  get type () { return 'csv' }
  get __objName () { return 'table' }

  _parse () {
    const data = this.table.data
    const reDelimiter = new RegExp('\\s*' + this.delimiter + '\\s*')

    let j = 0

    this.streamer.eachChunkOfLines(chunk => {
      const n = chunk.length

      for (let i = 0; i < n; ++i) {
        const line = chunk[ i ].trim()
        if (line.startsWith(this.comment)) continue
        const values = line.split(reDelimiter)

        if (j === 0) {
          this.table.columnNames = values
        } else if (line) {
          data.push(values)
        }
        ++j
      }
    })
  }
}

ParserRegistry.add('csv', CsvParser)

export default CsvParser
