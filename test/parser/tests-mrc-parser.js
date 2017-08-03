
import BinaryStreamer from '../../src/streamer/binary-streamer.js'
import MrcParser from '../../src/parser/mrc-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/mrc-parser', function () {
  describe('parsing mode 2', function () {
    it('basic', function () {
      var file = path.join(__dirname, '/../data/3pqr.ccp4')
      var bin = fs.readFileSync(file)
      var streamer = new BinaryStreamer(bin)
      var mrcParser = new MrcParser(streamer)
      return mrcParser.parse().then(function (volume) {
        assert.strictEqual(volume.nx, 69)
        assert.strictEqual(volume.ny, 100)
        assert.strictEqual(volume.nz, 59)
      })
    })
  })

  describe('parsing mode 0', function () {
    it('basic', function () {
      var file = path.join(__dirname, '/../data/3pqr-mode0.ccp4')
      var bin = fs.readFileSync(file)
      var streamer = new BinaryStreamer(bin)
      var mrcParser = new MrcParser(streamer)
      return mrcParser.parse().then(function (volume) {
        assert.strictEqual(volume.nx, 69)
        assert.strictEqual(volume.ny, 100)
        assert.strictEqual(volume.nz, 59)
      })
    })
  })
})
