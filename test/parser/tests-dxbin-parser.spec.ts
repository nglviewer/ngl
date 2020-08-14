
import BinaryStreamer from '../../src/streamer/binary-streamer'
import DxbinParser from '../../src/parser/dxbin-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/dxbin-parser', function () {
  describe('parsing', function () {
    it.skip('basic', function () {
      var file = join(__dirname, '/../data/TODO.dxbin')
      var bin = fs.readFileSync(file)
      var streamer = new BinaryStreamer(bin)
      var dxbinParser = new DxbinParser(streamer)
      return dxbinParser.parse().then(function (volume) {
        expect(volume.nx).toBe(40)
        expect(volume.ny).toBe(40)
        expect(volume.nz).toBe(40)
      })
    })
  })
})
