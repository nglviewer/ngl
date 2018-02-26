
import BinaryStreamer from '../../src/streamer/binary-streamer.js'
import MsgpackParser from '../../src/parser/msgpack-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/msgpack-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = path.join(__dirname, '/../data/1crn.mmtf')
      var bin = fs.readFileSync(file)
      var streamer = new BinaryStreamer(bin)
      var msgpackParser = new MsgpackParser(streamer)
      return msgpackParser.parse().then(function (msgpack) {
        var d = msgpack.data
        assert.strictEqual(1.5, d.resolution, 'Passed!')
        assert.deepEqual(['X-RAY DIFFRACTION'], d.experimentalMethods)
      })
    })
  })
})
