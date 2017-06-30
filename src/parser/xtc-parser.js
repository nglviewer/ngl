/**
 * @file Xtc Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals.js'
import TrajectoryParser from './trajectory-parser.js'

const MagicInts = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64,
  80, 101, 128, 161, 203, 256, 322, 406, 512, 645, 812, 1024, 1290,
  1625, 2048, 2580, 3250, 4096, 5060, 6501, 8192, 10321, 13003,
  16384, 20642, 26007, 32768, 41285, 52015, 65536, 82570, 104031,
  131072, 165140, 208063, 262144, 330280, 416127, 524287, 660561,
  832255, 1048576, 1321122, 1664510, 2097152, 2642245, 3329021,
  4194304, 5284491, 6658042, 8388607, 10568983, 13316085, 16777216
]
const FirstIdx = 9
const LastIdx = MagicInts.length

function sizeOfInt (size) {
  let num = 1
  let numOfBits = 0
  while (size >= num && numOfBits < 32) {
    numOfBits++
    num <<= 1
  }
  return numOfBits
}

const _tmpBytes = new Uint8Array(32)

function sizeOfInts (numOfInts, sizes) {
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

function decodeBits (buf, cbuf, numOfBits) {
  const mask = (1 << numOfBits) - 1
  const lastBB = new Uint32Array(buf.subarray(1, 3));
  let cnt = buf[0]
  let num = 0

  while (numOfBits >= 8) {
    lastBB[1] = (lastBB[1] << 8) | cbuf[cnt++];
    num |= (lastBB[1] >> lastBB[0]) << (numOfBits - 8);
    numOfBits -= 8;
  }

  if (numOfBits > 0) {
    if (lastBB[0] < numOfBits) {
      lastBB[0] += 8;
      lastBB[1] = (lastBB[1] << 8) | cbuf[cnt++];
    }
    lastBB[0] -= numOfBits;
    num |= (lastBB[1] >> lastBB[0]) & ((1 << numOfBits) -1);
  }

  num &= mask;
  buf[0] = cnt;
  buf[1] = lastBB[0];
  buf[2] = lastBB[1];

  return num;
}

const _tmpIntBytes = new Int32Array(32)

function decodeInts (buf, cbuf, numOfInts, numOfBits, sizes, nums) {
  let numOfBytes = 0
  _tmpIntBytes[1] = 0
  _tmpIntBytes[2] = 0
  _tmpIntBytes[3] = 0

  while (numOfBits > 8) {
    // this is inversed??? why??? because of the endiannness???
    _tmpIntBytes[numOfBytes++] = decodeBits(buf, cbuf, 8)
    numOfBits -= 8
  }

  if (numOfBits > 0) {
    _tmpIntBytes[numOfBytes++] = decodeBits(buf, cbuf, numOfBits)
  }

  for (let i=numOfInts-1; i>0; i--) {
    let num = 0
    for (let j=numOfBytes-1; j>=0; j--) {
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

function toBigEndian32 (buffer, offset, n, cf) {
  var arr = new Uint32Array(buffer, offset, n), i, value;
  for (i=0; i<n; i++) {
    value = arr[i];
    arr[i] = (((value & 0xFF) << 24) | ((value & 0xFF00) << 8) | ((value >> 8) & 0xFF00) | ((value >> 24) & 0xFF));
  }
  return new cf(buffer, offset, n);
}

class XtcParser extends TrajectoryParser {
  get type () { return 'xtc' }

  _parse () {
    // https://github.com/gromacs/gromacs/blob/master/src/gromacs/fileio/xtcio.cpp
    // https://github.com/gromacs/gromacs/blob/master/src/gromacs/fileio/libxdrf.cpp

    if (Debug) Log.time('XtcParser._parse ' + this.name)

    var bin = this.streamer.data
    if (bin instanceof Uint8Array) {
      bin = bin.buffer
    }
    var dv = new DataView(bin)

    var f = this.frames
    var coordinates = f.coordinates
    var boxes = f.boxes
    // var header = {}

    let getFloat = toBigEndian32
    let lsize
    let precision
    let minMaxInt
    let sizeint
    let bitsizeint
    let bitsize
    let smallidx
    let maxidx
    let minidx
    let smaller
    let smallnum
    let sizesmall
    let larger
    let buf8
    let rndup
    let invPrecision
    let run
    let i
    let thiscoord
    let prevcoord
    let flag
    let isSmaller
    let k
    let lfp
    let adz

    let offset = 0
    const buf = new Int32Array(3);

    while (true) {
      let frameCoords

      let tmp = toBigEndian32(bin, offset, 3, Int32Array);

      offset += 12;
      const magicnum = tmp[0];
      const natoms = tmp[1];
      const step = tmp[2];

      const natoms3 = natoms * 3

      tmp = getFloat(bin, offset, 10, Float32Array); offset += 40;
      // TODO
      // frame.time = tmp[0];
      // frame.box = tmp.subarray(1);

      if (natoms <= 9) {  // no compression

        frameCoords = getFloat(bin, offset, natoms3, Float32Array); offset += natoms*4;

      } else {
        buf[0] = buf[1] = buf[2] = 0.0;
        sizeint = [0, 0, 0];
        sizesmall = [0, 0, 0];
        bitsizeint = [0, 0, 0];
        thiscoord = [0, 0, 0];
        prevcoord = [0, 0, 0];

        frameCoords = new Float32Array(natoms3);
        lfp = 0;

        lsize = toBigEndian32(bin, offset, 1, Int32Array)[0];
        offset += 4;
        precision = getFloat(bin, offset, 1, Float32Array)[0];
        offset += 4;

        minMaxInt = toBigEndian32(bin, offset, 6, Int32Array);
        offset += 24;
        sizeint[0] = minMaxInt[3] - minMaxInt[0]+1;
        sizeint[1] = minMaxInt[4] - minMaxInt[1]+1;
        sizeint[2] = minMaxInt[5] - minMaxInt[2]+1;

        if ((sizeint[0] | sizeint[1] | sizeint[2] ) > 0xffffff) {
          bitsizeint[0] = sizeOfInt(sizeint[0]);
          bitsizeint[1] = sizeOfInt(sizeint[1]);
          bitsizeint[2] = sizeOfInt(sizeint[2]);
          bitsize = 0; /* flag the use of large sizes */
        } else {
          bitsize = sizeOfInts(3, sizeint);
        }

        smallidx = toBigEndian32(bin, offset, 1, Int32Array)[0];
        offset += 4;
        //if (smallidx == 0) {alert("Undocumented error 1"); return;}

        tmp = smallidx+8;
        maxidx = (LastIdx<tmp) ? LastIdx : tmp;
        minidx = maxidx - 8; /* often this equal smallidx */
        tmp = smallidx-1;
        tmp = (FirstIdx>tmp) ? FirstIdx : tmp;
        smaller = (MagicInts[tmp] / 2) | 0;
        smallnum = (MagicInts[smallidx] / 2) | 0;

        sizesmall[0] = sizesmall[1] = sizesmall[2] = MagicInts[smallidx] ;
        larger = MagicInts[maxidx];

        adz = toBigEndian32(bin, offset, 1, Int32Array)[0];
        offset += 4;
        adz = Math.ceil(adz/4)*4;
        //if (tmp == 0) {alert("Undocumented error 2"); return;}

        //buf = new Int32Array(bin, offset);
        //buf8 = new Uint8Array(bin, offset);

        //tmp += 3; rndup = tmp%4;
        //for (i=tmp+rndup-1; i>=tmp; i--) buf8[i] = 0;

        // now unpack buf2...

        invPrecision = 1.0 / precision;
        run = 0;
        i = 0;

        buf8 = new Uint8Array(bin, offset); // 229...

        thiscoord[0] = thiscoord[1] = thiscoord[2] = 0;

        while (i < lsize) {
          if (bitsize == 0) {
            thiscoord[0] = decodeBits(buf, buf8, bitsizeint[0]);
            thiscoord[1] = decodeBits(buf, buf8, bitsizeint[1]);
            thiscoord[2] = decodeBits(buf, buf8, bitsizeint[2]);
          } else {
            decodeInts(buf, buf8, 3, bitsize, sizeint, thiscoord)
          }

          i++;

          thiscoord[0] += minMaxInt[0];
          thiscoord[1] += minMaxInt[1];
          thiscoord[2] += minMaxInt[2];

          prevcoord[0] = thiscoord[0];
          prevcoord[1] = thiscoord[1];
          prevcoord[2] = thiscoord[2];

          flag = decodeBits(buf, buf8, 1);
          isSmaller = 0;

          if (flag == 1) {
            run = decodeBits(buf, buf8, 5);
            isSmaller = run % 3;
            run -= isSmaller;
            isSmaller--;
          }

          // if ((lfp-ptrstart)+run > size3){
          //   fprintf(stderr, "(xdrfile error) Buffer overrun during decompression.\n");
          //   return 0;
          // }

          if (run > 0) {
            thiscoord[0] = thiscoord[1] = thiscoord[2] = 0;

            for (k=0; k<run; k+=3) {
              decodeInts(buf, buf8, 3, smallidx, sizesmall, thiscoord);
              i++;

              thiscoord[0] += prevcoord[0] - smallnum;
              thiscoord[1] += prevcoord[1] - smallnum;
              thiscoord[2] += prevcoord[2] - smallnum;

              if (k == 0) {
                // interchange first with second atom for
                // better compression of water molecules
                tmp = thiscoord[0];
                thiscoord[0] = prevcoord[0];
                prevcoord[0] = tmp;

                tmp = thiscoord[1];
                thiscoord[1] = prevcoord[1];
                prevcoord[1] = tmp;

                tmp = thiscoord[2];
                thiscoord[2] = prevcoord[2];
                prevcoord[2] = tmp;

                frameCoords[lfp++] = prevcoord[0] * invPrecision;
                frameCoords[lfp++] = prevcoord[1] * invPrecision;
                frameCoords[lfp++] = prevcoord[2] * invPrecision;
              } else {
                prevcoord[0] = thiscoord[0];
                prevcoord[1] = thiscoord[1];
                prevcoord[2] = thiscoord[2];
              }
              frameCoords[lfp++] = thiscoord[0] * invPrecision;
              frameCoords[lfp++] = thiscoord[1] * invPrecision;
              frameCoords[lfp++] = thiscoord[2] * invPrecision;
            }
          } else {
            frameCoords[lfp++] = thiscoord[0] * invPrecision;
            frameCoords[lfp++] = thiscoord[1] * invPrecision;
            frameCoords[lfp++] = thiscoord[2] * invPrecision;
          }

          smallidx += isSmaller;

          if (isSmaller < 0) {
            smallnum = smaller;
            if (smallidx > FirstIdx){
              smaller = (MagicInts[smallidx - 1] /2) | 0;
            } else {
              smaller = 0;
            }
          } else if (isSmaller > 0) {
            smaller = smallnum;
            smallnum = (MagicInts[smallidx] / 2) | 0;
          }
          sizesmall[0] = sizesmall[1] = sizesmall[2] = MagicInts[smallidx];

          if (sizesmall[0]==0 || sizesmall[1]==0 || sizesmall[2]==0) {
            console.error("(xdrfile error) Undefined error.");
            return;
          }
        }
        offset += adz;
      }

      for (let c=0; c<natoms3; c++){
        frameCoords[c] *= 10
      }

      coordinates.push(frameCoords)

      if (offset >= bin.byteLength) break;
    }

    if (Debug) Log.timeEnd('XtcParser._parse ' + this.name)
  }
}

ParserRegistry.add('xtc', XtcParser)

export default XtcParser
