
import BinaryStreamer from '../../src/streamer/binary-streamer'
import DcdParser from '../../src/parser/dcd-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/dcd-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/ala3.dcd')
      var bin = fs.readFileSync(file)
      var streamer = new BinaryStreamer(bin)
      var dcdParser = new DcdParser(streamer, {})
      return dcdParser.parse().then(function (frames) {
        expect(frames.coordinates.length).toBe(256)
        expect(frames.coordinates[ 0 ].length).toBe(126)
        expect(frames.boxes.length).toBe(0)
      })
    })
  })
})
