/**
 * @file Xtc Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import { ensureBuffer } from '../utils'
import TrajectoryParser from './trajectory-parser'
import { NumberArray } from '../types';

const MagicInts = new Uint32Array([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64,
  80, 101, 128, 161, 203, 256, 322, 406, 512, 645, 812, 1024, 1290,
  1625, 2048, 2580, 3250, 4096, 5060, 6501, 8192, 10321, 13003,
  16384, 20642, 26007, 32768, 41285, 52015, 65536, 82570, 104031,
  131072, 165140, 208063, 262144, 330280, 416127, 524287, 660561,
  832255, 1048576, 1321122, 1664510, 2097152, 2642245, 3329021,
  4194304, 5284491, 6658042, 8388607, 10568983, 13316085, 16777216
])
const FirstIdx = 9
// const LastIdx = MagicInts.length

function sizeOfInt (size: number) {
  let num = 1
  let numOfBits = 0
  while (size >= num && numOfBits < 32) {
    numOfBits++
    num <<= 1
  }
  return numOfBits
}

const _tmpBytes = new Uint8Array(32)

function sizeOfInts (numOfInts: number, sizes: Int32Array) {
  let numOfBytes = 1
  let numOfBits = 0
  _tmpBytes[0] = 1
  for (let i = 0; i < numOfInts; i++) {
    let bytecnt
    let tmp = 0
    for (bytecnt = 0; bytecnt < numOfBytes; bytecnt++) {
      tmp += _tmpBytes[bytecnt] * sizes[i]
      _tmpBytes[bytecnt] = tmp & 0xff
      tmp >>= 8
    }
    while (tmp !== 0) {
      _tmpBytes[bytecnt++] = tmp & 0xff
      tmp >>= 8
    }
    numOfBytes = bytecnt
  }
  let num = 1
  numOfBytes--
  while (_tmpBytes[numOfBytes] >= num) {
    numOfBits++
    num *= 2
  }
  return numOfBits + numOfBytes * 8
}

function decodeBits (buf: Int32Array, cbuf: Uint8Array, numOfBits: number, buf2: Uint32Array) {
  const mask = (1 << numOfBits) - 1
  let lastBB0 = buf2[1]
  let lastBB1 = buf2[2]
  let cnt = buf[0]
  let num = 0

  while (numOfBits >= 8) {
    lastBB1 = (lastBB1 << 8) | cbuf[cnt++]
    num |= (lastBB1 >> lastBB0) << (numOfBits - 8)
    numOfBits -= 8
  }

  if (numOfBits > 0) {
    if (lastBB0 < numOfBits) {
      lastBB0 += 8
      lastBB1 = (lastBB1 << 8) | cbuf[cnt++]
    }
    lastBB0 -= numOfBits
    num |= (lastBB1 >> lastBB0) & ((1 << numOfBits) - 1)
  }

  num &= mask
  buf[0] = cnt
  buf[1] = lastBB0
  buf[2] = lastBB1

  return num
}

const _tmpIntBytes = new Int32Array(32)

function decodeInts (buf: Int32Array, cbuf: Uint8Array, numOfInts: number, numOfBits: number, sizes: NumberArray, nums: Float32Array, buf2: Uint32Array) {
  let numOfBytes = 0
  _tmpIntBytes[1] = 0
  _tmpIntBytes[2] = 0
  _tmpIntBytes[3] = 0

  while (numOfBits > 8) {
    // this is inversed??? why??? because of the endiannness???
    _tmpIntBytes[numOfBytes++] = decodeBits(buf, cbuf, 8, buf2)
    numOfBits -= 8
  }

  if (numOfBits > 0) {
    _tmpIntBytes[numOfBytes++] = decodeBits(buf, cbuf, numOfBits, buf2)
  }

  for (let i = numOfInts - 1; i > 0; i--) {
    let num = 0
    for (let j = numOfBytes - 1; j >= 0; j--) {
      num = (num << 8) | _tmpIntBytes[j]
      const p = (num / sizes[i]) | 0
      _tmpIntBytes[j] = p
      num = num - p * sizes[i]
    }
    nums[i] = num
  }
  nums[0] = (
    _tmpIntBytes[0] |
    (_tmpIntBytes[1] << 8) |
    (_tmpIntBytes[2] << 16) |
    (_tmpIntBytes[3] << 24)
  )
}

class XtcParser extends TrajectoryParser {
  get type () { return 'xtc' }
  get isBinary () { return true }

  _parse () {
    // https://github.com/gromacs/gromacs/blob/master/src/gromacs/fileio/xtcio.cpp
    // https://github.com/gromacs/gromacs/blob/master/src/gromacs/fileio/libxdrf.cpp

    if (Debug) Log.time('XtcParser._parse ' + this.name)

    const bin = ensureBuffer(this.streamer.data)
    const dv = new DataView(bin)

    const f = this.frames
    const coordinates = f.coordinates
    const boxes = f.boxes
    const times = f.times

    const minMaxInt = new Int32Array(6)
    const sizeint = new Int32Array(3)
    const bitsizeint = new Int32Array(3)
    const sizesmall = new Uint32Array(3)
    const thiscoord = new Float32Array(3)
    const prevcoord = new Float32Array(3)

    let offset = 0
    const buf = new Int32Array(3)
    const buf2 = new Uint32Array(buf.buffer)

    while (true) {
      let frameCoords: NumberArray

      // const magicnum = dv.getInt32(offset)
      const natoms = dv.getInt32(offset + 4)
      // const step = dv.getInt32(offset + 8)
      offset += 12

      const natoms3 = natoms * 3

      times.push(dv.getFloat32(offset))
      offset += 4

      const box = new Float32Array(9)
      for (let i = 0; i < 9; ++i) {
        box[i] = dv.getFloat32(offset) * 10
        offset += 4
      }
      boxes.push(box)

      if (natoms <= 9) { // no compression
        frameCoords = new Float32Array(natoms)
        for (let i = 0; i < natoms; ++i) {
          frameCoords[i] = dv.getFloat32(offset)
          offset += 4
        }
      } else {
        buf[0] = buf[1] = buf[2] = 0.0
        sizeint[0] = sizeint[1] = sizeint[2] = 0
        sizesmall[0] = sizesmall[1] = sizesmall[2] = 0
        bitsizeint[0] = bitsizeint[1] = bitsizeint[2] = 0
        thiscoord[0] = thiscoord[1] = thiscoord[2] = 0
        prevcoord[0] = prevcoord[1] = prevcoord[2] = 0

        frameCoords = new Float32Array(natoms3)
        let lfp = 0

        const lsize = dv.getInt32(offset)
        offset += 4
        const precision = dv.getFloat32(offset)
        offset += 4

        minMaxInt[0] = dv.getInt32(offset)
        minMaxInt[1] = dv.getInt32(offset + 4)
        minMaxInt[2] = dv.getInt32(offset + 8)
        minMaxInt[3] = dv.getInt32(offset + 12)
        minMaxInt[4] = dv.getInt32(offset + 16)
        minMaxInt[5] = dv.getInt32(offset + 20)
        sizeint[0] = minMaxInt[3] - minMaxInt[0] + 1
        sizeint[1] = minMaxInt[4] - minMaxInt[1] + 1
        sizeint[2] = minMaxInt[5] - minMaxInt[2] + 1
        offset += 24

        let bitsize
        if ((sizeint[0] | sizeint[1] | sizeint[2]) > 0xffffff) {
          bitsizeint[0] = sizeOfInt(sizeint[0])
          bitsizeint[1] = sizeOfInt(sizeint[1])
          bitsizeint[2] = sizeOfInt(sizeint[2])
          bitsize = 0 // flag the use of large sizes
        } else {
          bitsize = sizeOfInts(3, sizeint)
        }

        let smallidx = dv.getInt32(offset)
        offset += 4
        // if (smallidx == 0) {alert("Undocumented error 1"); return;}

        // let tmpIdx = smallidx + 8
        // const maxidx = (LastIdx < tmpIdx) ? LastIdx : tmpIdx
        // const minidx = maxidx - 8  // often this equal smallidx
        let tmpIdx = smallidx - 1
        tmpIdx = (FirstIdx > tmpIdx) ? FirstIdx : tmpIdx
        let smaller = (MagicInts[tmpIdx] / 2) | 0
        let smallnum = (MagicInts[smallidx] / 2) | 0

        sizesmall[0] = sizesmall[1] = sizesmall[2] = MagicInts[smallidx]
        // larger = MagicInts[maxidx]

        let adz = Math.ceil(dv.getInt32(offset) / 4) * 4
        offset += 4
        // if (tmpIdx == 0) {alert("Undocumented error 2"); return;}

        // buf = new Int32Array(bin, offset);
        // buf8 = new Uint8Array(bin, offset);

        // tmpIdx += 3; rndup = tmpIdx%4;
        // for (i=tmpIdx+rndup-1; i>=tmpIdx; i--) buf8[i] = 0;

        // now unpack buf2...

        const invPrecision = 1.0 / precision
        let run = 0
        let i = 0

        const buf8 = new Uint8Array(bin, offset) // 229...

        thiscoord[0] = thiscoord[1] = thiscoord[2] = 0

        while (i < lsize) {
          if (bitsize === 0) {
            thiscoord[0] = decodeBits(buf, buf8, bitsizeint[0], buf2)
            thiscoord[1] = decodeBits(buf, buf8, bitsizeint[1], buf2)
            thiscoord[2] = decodeBits(buf, buf8, bitsizeint[2], buf2)
          } else {
            decodeInts(buf, buf8, 3, bitsize, sizeint, thiscoord, buf2)
          }

          i++

          thiscoord[0] += minMaxInt[0]
          thiscoord[1] += minMaxInt[1]
          thiscoord[2] += minMaxInt[2]

          prevcoord[0] = thiscoord[0]
          prevcoord[1] = thiscoord[1]
          prevcoord[2] = thiscoord[2]

          const flag = decodeBits(buf, buf8, 1, buf2)
          let isSmaller = 0

          if (flag === 1) {
            run = decodeBits(buf, buf8, 5, buf2)
            isSmaller = run % 3
            run -= isSmaller
            isSmaller--
          }

          // if ((lfp-ptrstart)+run > size3){
          //   fprintf(stderr, "(xdrfile error) Buffer overrun during decompression.\n");
          //   return 0;
          // }

          if (run > 0) {
            thiscoord[0] = thiscoord[1] = thiscoord[2] = 0

            for (let k = 0; k < run; k += 3) {
              decodeInts(buf, buf8, 3, smallidx, sizesmall, thiscoord, buf2)
              i++

              thiscoord[0] += prevcoord[0] - smallnum
              thiscoord[1] += prevcoord[1] - smallnum
              thiscoord[2] += prevcoord[2] - smallnum

              if (k === 0) {
                // interchange first with second atom for
                // better compression of water molecules
                let tmpSwap = thiscoord[0]
                thiscoord[0] = prevcoord[0]
                prevcoord[0] = tmpSwap

                tmpSwap = thiscoord[1]
                thiscoord[1] = prevcoord[1]
                prevcoord[1] = tmpSwap

                tmpSwap = thiscoord[2]
                thiscoord[2] = prevcoord[2]
                prevcoord[2] = tmpSwap

                frameCoords[lfp++] = prevcoord[0] * invPrecision
                frameCoords[lfp++] = prevcoord[1] * invPrecision
                frameCoords[lfp++] = prevcoord[2] * invPrecision
              } else {
                prevcoord[0] = thiscoord[0]
                prevcoord[1] = thiscoord[1]
                prevcoord[2] = thiscoord[2]
              }
              frameCoords[lfp++] = thiscoord[0] * invPrecision
              frameCoords[lfp++] = thiscoord[1] * invPrecision
              frameCoords[lfp++] = thiscoord[2] * invPrecision
            }
          } else {
            frameCoords[lfp++] = thiscoord[0] * invPrecision
            frameCoords[lfp++] = thiscoord[1] * invPrecision
            frameCoords[lfp++] = thiscoord[2] * invPrecision
          }

          smallidx += isSmaller

          if (isSmaller < 0) {
            smallnum = smaller
            if (smallidx > FirstIdx) {
              smaller = (MagicInts[smallidx - 1] / 2) | 0
            } else {
              smaller = 0
            }
          } else if (isSmaller > 0) {
            smaller = smallnum
            smallnum = (MagicInts[smallidx] / 2) | 0
          }
          sizesmall[0] = sizesmall[1] = sizesmall[2] = MagicInts[smallidx]

          if (sizesmall[0] === 0 || sizesmall[1] === 0 || sizesmall[2] === 0) {
            console.error('(xdrfile error) Undefined error.')
            return
          }
        }
        offset += adz
      }

      for (let c = 0; c < natoms3; c++) {
        frameCoords[c] *= 10
      }

      coordinates.push(frameCoords)

      if (offset >= bin.byteLength) break
    }

    if (times.length >= 1) {
      f.timeOffset = times[0]
    }
    if (times.length >= 2) {
      f.deltaTime = times[1] - times[0]
    }

    if (Debug) Log.timeEnd('XtcParser._parse ' + this.name)
  }
}

ParserRegistry.add('xtc', XtcParser)

export default XtcParser
