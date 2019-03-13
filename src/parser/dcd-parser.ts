/**
 * @file Dcd Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import { uint8ToString, ensureBuffer } from '../utils'
import TrajectoryParser from './trajectory-parser'

const charmmTimeUnitFactor = 20.45482949774598

interface DcdHeader {
  NSET: number,
  ISTART: number,
  NSAVC: number,
  NAMNF: number,
  DELTA: number,
  TITLE: string,
  NATOM: number
}

class DcdParser extends TrajectoryParser {
  get type () { return 'dcd' }
  get isBinary () { return true }

  _parse () {
    // http://www.ks.uiuc.edu/Research/vmd/plugins/molfile/dcdplugin.html

    // The DCD format is structured as follows
    //   (FORTRAN UNFORMATTED, with Fortran data type descriptions):
    // HDR     NSET    ISTRT   NSAVC   5-ZEROS NATOM-NFREAT    DELTA   9-ZEROS
    // `CORD'  #files  step 1  step    zeroes  (zero)          timestep  (zeroes)
    //                         interval
    // C*4     INT     INT     INT     5INT    INT             DOUBLE  9INT
    // ==========================================================================
    // NTITLE          TITLE
    // INT (=2)        C*MAXTITL
    //                 (=32)
    // ==========================================================================
    // NATOM
    // #atoms
    // INT
    // ==========================================================================
    // X(I), I=1,NATOM         (DOUBLE)
    // Y(I), I=1,NATOM
    // Z(I), I=1,NATOM
    // ==========================================================================

    if (Debug) Log.time('DcdParser._parse ' + this.name)

    const bin = ensureBuffer(this.streamer.data)
    const dv = new DataView(bin)

    const f = this.frames
    const coordinates = f.coordinates
    const boxes = f.boxes
    const header: Partial<DcdHeader> = {}

    let nextPos = 0

    // header block

    const intView = new Int32Array(bin, 0, 23)
    const ef = intView[ 0 ] !== dv.getInt32(0) // endianess flag
    // swap byte order when big endian (84 indicates little endian)
    if (intView[ 0 ] !== 84) {
      const n = bin.byteLength
      for (let i = 0; i < n; i += 4) {
        dv.setFloat32(i, dv.getFloat32(i), true)
      }
    }
    if (intView[ 0 ] !== 84) {
      Log.error('dcd bad format, header block start')
    }
    // format indicator, should read 'CORD'
    const formatString = String.fromCharCode(
      dv.getUint8(4), dv.getUint8(5),
      dv.getUint8(6), dv.getUint8(7)
    )
    if (formatString !== 'CORD') {
      Log.error('dcd bad format, format string')
    }
    let isCharmm = false
    let extraBlock = false
    let fourDims = false
    // version field in charmm, unused in X-PLOR
    if (intView[ 22 ] !== 0) {
      isCharmm = true
      if (intView[ 12 ] !== 0) extraBlock = true
      if (intView[ 13 ] === 1) fourDims = true
    }
    header.NSET = intView[ 2 ]
    header.ISTART = intView[ 3 ]
    header.NSAVC = intView[ 4 ]
    header.NAMNF = intView[ 10 ]
    if (isCharmm) {
      header.DELTA = dv.getFloat32(44, ef)
    } else {
      header.DELTA = dv.getFloat64(44, ef)
    }
    if (intView[ 22 ] !== 84) {
      Log.error('dcd bad format, header block end')
    }
    nextPos = nextPos + 21 * 4 + 8

    // title block

    const titleLength = dv.getInt32(nextPos, ef)
    const titlePos = nextPos + 1
    if ((titleLength - 4) % 80 !== 0) {
      Log.error('dcd bad format, title block start')
    }
    header.TITLE = uint8ToString(
      new Uint8Array(bin, titlePos, titleLength)
    )
    if (dv.getInt32(titlePos + titleLength + 4 - 1, ef) !== titleLength) {
      Log.error('dcd bad format, title block end')
    }
    nextPos = nextPos + titleLength + 8

    // natom block

    if (dv.getInt32(nextPos, ef) !== 4) {
      Log.error('dcd bad format, natom block start')
    }
    header.NATOM = dv.getInt32(nextPos + 4, ef)
    if (dv.getInt32(nextPos + 8, ef) !== 4) {
      Log.error('dcd bad format, natom block end')
    }
    nextPos = nextPos + 4 + 8

    // fixed atoms block

    if (header.NAMNF > 0) {
      // TODO read coordinates and indices of fixed atoms
      Log.error('dcd format with fixed atoms unsupported, aborting')
      return
    }

    // frames

    const natom = header.NATOM
    const natom4 = natom * 4

    for (let i = 0, n = header.NSET; i < n; ++i) {
      if (extraBlock) {
        nextPos += 4 // block start
        // unitcell: A, alpha, B, beta, gamma, C (doubles)
        const box = new Float32Array(9)
        box[ 0 ] = dv.getFloat64(nextPos, ef)
        box[ 4 ] = dv.getFloat64(nextPos + 2 * 8, ef)
        box[ 8 ] = dv.getFloat64(nextPos + 5 * 8, ef)
        boxes.push(box)
        nextPos += 48
        nextPos += 4 // block end
      }

      // xyz coordinates
      const coord = new Float32Array(natom * 3)
      for (let j = 0; j < 3; ++j) {
        if (dv.getInt32(nextPos, ef) !== natom4) {
          Log.error('dcd bad format, coord block start', i, j)
        }
        nextPos += 4 // block start
        const c = new Float32Array(bin, nextPos, natom)
        for (let k = 0; k < natom; ++k) {
          coord[ 3 * k + j ] = c[ k ]
        }
        nextPos += natom4
        if (dv.getInt32(nextPos, ef) !== natom4) {
          Log.error('dcd bad format, coord block end', i, j)
        }
        nextPos += 4 // block end
      }
      coordinates.push(coord)

      if (fourDims) {
        const bytes = dv.getInt32(nextPos, ef)
        nextPos += 4 + bytes + 4 // block start + skip + block end
      }
    }

    if (header.DELTA) {
      f.deltaTime = header.DELTA * charmmTimeUnitFactor
    }
    if (header.ISTART >= 1) {
      f.timeOffset = (header.ISTART - 1) * f.deltaTime
    }

    // console.log(header)
    // console.log(header.TITLE)
    // console.log('isCharmm', isCharmm, 'extraBlock', extraBlock, 'fourDims, fourDims)

    if (Debug) Log.timeEnd('DcdParser._parse ' + this.name)
  }
}

ParserRegistry.add('dcd', DcdParser)

export default DcdParser
