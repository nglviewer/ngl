
import BinaryStreamer from '../../src/streamer/binary-streamer'
import MrcParser from '../../src/parser/mrc-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/mrc-parser', function () {
  describe('parsing mode 2', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/3pqr.ccp4')
      var bin = fs.readFileSync(file)
      var streamer = new BinaryStreamer(bin)
      var mrcParser = new MrcParser(streamer, {})
      return mrcParser.parse().then(function (volume) {
        expect(volume.nx).toBe(69)
        expect(volume.ny).toBe(100)
        expect(volume.nz).toBe(59)
      })
    })
  })

  describe('parsing mode 0', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/3pqr-mode0.ccp4')
      var bin = fs.readFileSync(file)
      var streamer = new BinaryStreamer(bin)
      var mrcParser = new MrcParser(streamer, {})
      return mrcParser.parse().then(function (volume) {
        expect(volume.nx).toBe(69)
        expect(volume.ny).toBe(100)
        expect(volume.nz).toBe(59)
      })
    })
  })
})
