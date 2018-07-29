/**
 * @file Mrc Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Matrix4 } from 'three'

import { Debug, Log, ParserRegistry } from '../globals'
import { ensureBuffer } from '../utils'
import VolumeParser from './volume-parser'

interface MrcHeader {
  MAP: string,
  MACHST: number [],
  NX: number,
  NY: number,
  NZ: number,
  MODE: number,
  NXSTART: number,
  NYSTART: number,
  NZSTART: number,
  MX: number,
  MY: number,
  MZ: number,
  xlen: number,
  ylen: number,
  zlen: number,
  alpha: number,
  beta: number,
  gamma: number,
  MAPC: number,
  MAPR: number,
  MAPS: number,
  DMIN: number,
  DMAX: number,
  DMEAN: number,
  ISPG: number,
  NSYMBT: number,
  LSKFLG: number,
  originX: number,
  originY: number,
  originZ: number,
  ARMS: number
}

class MrcParser extends VolumeParser {
  get type () { return 'mrc' }
  get isBinary () { return true }

  _parse () {
    // MRC
    // http://ami.scripps.edu/software/mrctools/mrc_specification.php
    // http://www2.mrc-lmb.cam.ac.uk/research/locally-developed-software/image-processing-software/#image
    // http://bio3d.colorado.edu/imod/doc/mrc_format.txt

    // CCP4 (MAP)
    // http://www.ccp4.ac.uk/html/maplib.html

    // MRC format does not use the skew transformation header records (words 25-37)
    // CCP4 format does not use the ORIGIN header records (words 50-52)

    if (Debug) Log.time('MrcParser._parse ' + this.name)

    const v = this.volume
    const header: Partial<MrcHeader> = {}

    const bin = ensureBuffer(this.streamer.data)
    const intView = new Int32Array(bin, 0, 56)
    const floatView = new Float32Array(bin, 0, 56)
    const dv = new DataView(bin)

    // 53  MAP         Character string 'MAP ' to identify file type
    header.MAP = String.fromCharCode(
      dv.getUint8(52 * 4), dv.getUint8(52 * 4 + 1),
      dv.getUint8(52 * 4 + 2), dv.getUint8(52 * 4 + 3)
    )

    // 54  MACHST      Machine stamp indicating machine type which wrote file
    //                 17 and 17 for big-endian or 68 and 65 for little-endian
    header.MACHST = [ dv.getUint8(53 * 4), dv.getUint8(53 * 4 + 1) ]

    // swap byte order when big endian
    if (header.MACHST[ 0 ] === 17 && header.MACHST[ 1 ] === 17) {
      const n = bin.byteLength
      for (let i = 0; i < n; i += 4) {
        dv.setFloat32(i, dv.getFloat32(i), true)
      }
    }

    header.NX = intView[ 0 ] // NC - columns (fastest changing)
    header.NY = intView[ 1 ] // NR - rows
    header.NZ = intView[ 2 ] // NS - sections (slowest changing)

    // mode
    //  0 image : signed 8-bit bytes range -128 to 127
    //  1 image : 16-bit halfwords
    //  2 image : 32-bit reals
    //  3 transform : complex 16-bit integers
    //  4 transform : complex 32-bit reals
    //  6 image : unsigned 16-bit range 0 to 65535
    // 16 image: unsigned char * 3 (for rgb data, non-standard)
    //
    // Note: Mode 2 is the normal mode used in the CCP4 programs.
    //       Other modes than 2 and 0 may NOT WORK
    header.MODE = intView[ 3 ]

    // start
    header.NXSTART = intView[ 4 ] // NCSTART - first column
    header.NYSTART = intView[ 5 ] // NRSTART - first row
    header.NZSTART = intView[ 6 ] // NSSTART - first section

    // intervals
    header.MX = intView[ 7 ] // intervals along x
    header.MY = intView[ 8 ] // intervals along y
    header.MZ = intView[ 9 ] // intervals along z

    // cell length (Angstroms in CCP4)
    header.xlen = floatView[ 10 ] * this.voxelSize
    header.ylen = floatView[ 11 ] * this.voxelSize
    header.zlen = floatView[ 12 ] * this.voxelSize

    // cell angle (Degrees)
    header.alpha = floatView[ 13 ]
    header.beta = floatView[ 14 ]
    header.gamma = floatView[ 15 ]

    // axis correspondence (1,2,3 for X,Y,Z)
    header.MAPC = intView[ 16 ] // column
    header.MAPR = intView[ 17 ] // row
    header.MAPS = intView[ 18 ] // section

    // density statistics
    header.DMIN = floatView[ 19 ]
    header.DMAX = floatView[ 20 ]
    header.DMEAN = floatView[ 21 ]

    // space group number 0 or 1 (default=0)
    header.ISPG = intView[ 22 ]

    // number of bytes used for symmetry data (0 or 80)
    header.NSYMBT = intView[ 23 ]

    // Flag for skew transformation, =0 none, =1 if foll
    header.LSKFLG = intView[ 24 ]

    // 26-34  SKWMAT  Skew matrix S (in order S11, S12, S13, S21 etc) if
    //                LSKFLG .ne. 0.
    // 35-37  SKWTRN  Skew translation t if LSKFLG != 0.
    //                Skew transformation is from standard orthogonal
    //                coordinate frame (as used for atoms) to orthogonal
    //                map frame, as Xo(map) = S * (Xo(atoms) - t)

    // 38      future use       (some of these are used by the MSUBSX routines
    //  .          "              in MAPBRICK, MAPCONT and FRODO)
    //  .          "   (all set to zero by default)
    //  .          "
    // 52          "

    // 50-52 origin in X,Y,Z used for transforms
    header.originX = floatView[ 49 ]
    header.originY = floatView[ 50 ]
    header.originZ = floatView[ 51 ]

    // 53  MAP         Character string 'MAP ' to identify file type
    // => see top of this parser

    // 54  MACHST      Machine stamp indicating machine type which wrote file
    // => see top of this parser

    // Rms deviation of map from mean density
    header.ARMS = floatView[ 54 ]

    // 56      NLABL           Number of labels being used
    // 57-256  LABEL(20,10)    10  80 character text labels (ie. A4 format)

    v.header = header

    // Log.log( header );

    let data
    if (header.MODE === 2) {
      data = new Float32Array(
        bin, 256 * 4 + header.NSYMBT,
        header.NX * header.NY * header.NZ
      )
    } else if (header.MODE === 0) {
      data = new Float32Array(new Int8Array(
        bin, 256 * 4 + header.NSYMBT,
        header.NX * header.NY * header.NZ
      ))

      // based on uglymol (https://github.com/uglymol/uglymol) by Marcin Wojdyr (wojdyr)
      // if the file was converted by mapmode2to0 - scale the data
      if (intView[ 39 ] === -128 && intView[ 40 ] === 127) {
        // scaling f(x)=b1*x+b0 such that f(-128)=min and f(127)=max
        const b1 = (header.DMAX - header.DMIN) / 255.0
        const b0 = 0.5 * (header.DMIN + header.DMAX + b1)
        for (let j = 0, jl = data.length; j < jl; ++j) {
          data[ j ] = b1 * data[ j ] + b0
        }
      }
    } else {
      Log.error('MrcParser unknown mode', header.MODE)
    }

    v.setData(data, header.NX, header.NY, header.NZ)
    if (header.ARMS !== 0) {
      v.setStats(header.DMIN, header.DMAX, header.DMEAN, header.ARMS)
    }

    if (Debug) Log.timeEnd('MrcParser._parse ' + this.name)
  }

  getMatrix () {
    const h = this.volume.header

    const basisX = [
      h.xlen,
      0,
      0
    ]

    const basisY = [
      h.ylen * Math.cos(Math.PI / 180.0 * h.gamma),
      h.ylen * Math.sin(Math.PI / 180.0 * h.gamma),
      0
    ]

    const basisZ = [
      h.zlen * Math.cos(Math.PI / 180.0 * h.beta),
      h.zlen * (
        Math.cos(Math.PI / 180.0 * h.alpha) -
        Math.cos(Math.PI / 180.0 * h.gamma) *
        Math.cos(Math.PI / 180.0 * h.beta)
      ) / Math.sin(Math.PI / 180.0 * h.gamma),
      0
    ]
    basisZ[ 2 ] = Math.sqrt(
      h.zlen * h.zlen * Math.sin(Math.PI / 180.0 * h.beta) *
      Math.sin(Math.PI / 180.0 * h.beta) - basisZ[ 1 ] * basisZ[ 1 ]
    )

    const basis = [ [], basisX, basisY, basisZ ]
    const nxyz = [ 0, h.MX, h.MY, h.MZ ]
    const mapcrs = [ 0, h.MAPC, h.MAPR, h.MAPS ]

    const matrix = new Matrix4()

    matrix.set(
      basis[ mapcrs[1] ][0] / nxyz[ mapcrs[1] ],
      basis[ mapcrs[2] ][0] / nxyz[ mapcrs[2] ],
      basis[ mapcrs[3] ][0] / nxyz[ mapcrs[3] ],
      0,
      basis[ mapcrs[1] ][1] / nxyz[ mapcrs[1] ],
      basis[ mapcrs[2] ][1] / nxyz[ mapcrs[2] ],
      basis[ mapcrs[3] ][1] / nxyz[ mapcrs[3] ],
      0,
      basis[ mapcrs[1] ][2] / nxyz[ mapcrs[1] ],
      basis[ mapcrs[2] ][2] / nxyz[ mapcrs[2] ],
      basis[ mapcrs[3] ][2] / nxyz[ mapcrs[3] ],
      0,
      0, 0, 0, 1
    )

    matrix.setPosition(new Vector3(
      h.originX, h.originY, h.originZ
    ))

    matrix.multiply(new Matrix4().makeTranslation(
      h.NXSTART, h.NYSTART, h.NZSTART
    ))

    return matrix
  }
}

ParserRegistry.add('mrc', MrcParser)
ParserRegistry.add('ccp4', MrcParser)
ParserRegistry.add('map', MrcParser)

export default MrcParser
