
import BinaryStreamer from '../../src/streamer/binary-streamer'
import MsgpackParser from '../../src/parser/msgpack-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/msgpack-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/1crn.mmtf')
      var bin = fs.readFileSync(file)
      var streamer = new BinaryStreamer(bin)
      var msgpackParser = new MsgpackParser(streamer, {})
      return msgpackParser.parse().then(function (msgpack) {
        var d = msgpack.data
        expect(1.5).toBe(d.resolution)
        expect(d.experimentalMethods).toEqual(['X-RAY DIFFRACTION'])
      })
    })
  })
})
