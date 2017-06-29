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
  16384, 20642, 26007, 32768, 41285, 52015, 65536,82570, 104031,
  131072, 165140, 208063, 262144, 330280, 416127, 524287, 660561,
  832255, 1048576, 1321122, 1664510, 2097152, 2642245, 3329021,
  4194304, 5284491, 6658042, 8388607, 10568983, 13316085, 16777216
];
const FirstIdx = 9;
const LastIdx = MagicInts.length;

function sizeOfInt(size) {
  var num = 1, num_of_bits = 0;

  while (size >= num && num_of_bits < 32)
  {
    num_of_bits++;
    num <<= 1;
  }
  return num_of_bits;
};

function xtc_sizeofints(num_of_ints, sizes) {
  var i, num, num_of_bytes, num_of_bits, bytes=new Uint8Array(32), bytecnt, tmp;
  num_of_bytes = 1; bytes[0] = 1; num_of_bits = 0;

  for (i=0; i<num_of_ints; i++) {
    tmp = 0;
    for (bytecnt=0; bytecnt<num_of_bytes; bytecnt++) {
      tmp = bytes[bytecnt] * sizes[i] + tmp;
      bytes[bytecnt] = tmp & 0xff;
      tmp >>= 8;
    }
    while (tmp != 0) {
      bytes[bytecnt++] = tmp & 0xff;
      tmp >>= 8;
    }
    num_of_bytes = bytecnt;
  }
  num = 1;
  num_of_bytes--;
  while (bytes[num_of_bytes] >= num) {
    num_of_bits++;
    num *= 2;
  }
  return num_of_bits + num_of_bytes * 8;
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



    if (Debug) Log.timeEnd('XtcParser._parse ' + this.name)
  }
}

ParserRegistry.add('xtc', XtcParser)

export default XtcParser
