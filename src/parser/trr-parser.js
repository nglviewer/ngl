/**
 * @file Trr Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Debug, Log, ParserRegistry } from '../globals'
import { ensureBuffer } from '../utils'
import TrajectoryParser from './trajectory-parser'

class TrrParser extends TrajectoryParser {
  get type () { return 'trr' }
  get isBinary () { return true }

  _parse () {
    // https://github.com/gromacs/gromacs/blob/master/src/gromacs/fileio/trrio.cpp

    if (Debug) Log.time('TrrParser._parse ' + this.name)

    const bin = ensureBuffer(this.streamer.data)
    const dv = new DataView(bin)

    const f = this.frames
    const coordinates = f.coordinates
    const boxes = f.boxes
    const times = f.times

    let offset = 0

    while (true) {
      // const magicnum = dv.getInt32(offset)
      // const i1 = dv.getFloat32(offset + 4)
      offset += 8

      const versionSize = dv.getInt32(offset)
      offset += 4
      offset += versionSize

      // const irSize = dv.getInt32(offset)
      // const eSize = dv.getInt32(offset + 4)
      const boxSize = dv.getInt32(offset + 8)
      const virSize = dv.getInt32(offset + 12)
      const presSize = dv.getInt32(offset + 16)
      // const topSize = dv.getInt32(offset + 20)
      // const symSize = dv.getInt32(offset + 24)
      const coordSize = dv.getInt32(offset + 28)
      const velocitySize = dv.getInt32(offset + 32)
      const forceSize = dv.getInt32(offset + 36)
      const natoms = dv.getInt32(offset + 40)
      // const step = dv.getInt32(offset + 44)
      // const nre = dv.getInt32(offset + 48)
      offset += 52

      const floatSize = boxSize / 9
      const natoms3 = natoms * 3

      // let lambda
      if (floatSize === 8) {
        times.push(dv.getFloat64(offset))
        // lambda = dv.getFloat64(offset + 8)
      } else {
        times.push(dv.getFloat32(offset))
        // lambda = dv.getFloat32(offset + 4)
      }
      offset += 2 * floatSize

      if (boxSize) {
        const box = new Float32Array(9)
        if (floatSize === 8) {
          for (let i = 0; i < 9; ++i) {
            box[i] = dv.getFloat64(offset) * 10
            offset += 8
          }
        } else {
          for (let i = 0; i < 9; ++i) {
            box[i] = dv.getFloat32(offset) * 10
            offset += 4
          }
        }
        boxes.push(box)
      }

      // ignore, unused
      offset += virSize

      // ignore, unused
      offset += presSize

      if (coordSize) {
        let frameCoords
        if (floatSize === 8) {
          frameCoords = new Float32Array(natoms3)
          for (let i = 0; i < natoms3; ++i) {
            frameCoords[i] = dv.getFloat64(offset) * 10
            offset += 8
          }
        } else {
          const tmp = new Uint32Array(bin, offset, natoms3)
          for (let i = 0; i < natoms3; ++i) {
            const value = tmp[i]
            tmp[i] = (
              ((value & 0xFF) << 24) | ((value & 0xFF00) << 8) |
              ((value >> 8) & 0xFF00) | ((value >> 24) & 0xFF)
            )
          }
          frameCoords = new Float32Array(bin, offset, natoms3)
          for (let i = 0; i < natoms3; ++i) {
            frameCoords[i] *= 10
            offset += 4
          }
        }
        coordinates.push(frameCoords)
      }

      // ignore, unused
      offset += velocitySize

      // ignore, unused
      offset += forceSize

      if (offset >= bin.byteLength) break
    }

    if (times.length >= 1) {
      f.timeOffset = times[0]
    }
    if (times.length >= 2) {
      f.deltaTime = times[1] - times[0]
    }

    if (Debug) Log.timeEnd('TrrParser._parse ' + this.name)
  }
}

ParserRegistry.add('trr', TrrParser)

export default TrrParser
