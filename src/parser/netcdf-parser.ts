/**
 * @file Netcdf Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import Parser, { ParserParameters } from './parser'
import NetcdfReader from '../utils/netcdf-reader'
import Streamer from '../streamer/streamer';

class NetcdfParser extends Parser {
  constructor (streamer: Streamer, params?: Partial<ParserParameters>) {
    const p = params || {}

    super(streamer, p)

    this.netcdf = {
      name: this.name,
      path: this.path,
      data: undefined
    }
  }

  get type () { return 'netcdf' }
  get __objName () { return 'netcdf' }
  get isBinary () { return true }

  _parse () {
    if (Debug) Log.time('NetcdfParser._parse ' + this.name)

    this.netcdf.data = new NetcdfReader(this.streamer.data)

    if (Debug) Log.timeEnd('NetcdfParser._parse ' + this.name)
  }
}

ParserRegistry.add('netcdf', NetcdfParser)

export default NetcdfParser
