/**
 * @file Dxbin Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import { uint8ToLines, ensureBuffer } from '../utils'
import DxParser from './dx-parser'

class DxbinParser extends DxParser {
  get type () { return 'dxbin' }
  get isBinary () { return true }

  _parse () {
    // https://github.com/Electrostatics/apbs-pdb2pqr/issues/216

    if (Debug) Log.time('DxbinParser._parse ' + this.name)

    const bin = ensureBuffer(this.streamer.data)
    const headerLines = uint8ToLines(new Uint8Array(bin, 0, 1000))
    const headerInfo = this.parseHeaderLines(headerLines)
    const header = this.volume.header
    const headerByteCount = headerInfo.headerByteCount

    const size = header.nx * header.ny * header.nz
    const dv = new DataView(bin)
    const data = new Float32Array(size)

    for (let i = 0; i < size; ++i) {
      data[ i ] = dv.getFloat64(i * 8 + headerByteCount, true)
    }

    this.volume.setData(data, header.nz, header.ny, header.nx)

    if (Debug) Log.timeEnd('DxbinParser._parse ' + this.name)
  }
}

ParserRegistry.add('dxbin', DxbinParser)

export default DxbinParser
