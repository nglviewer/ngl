
import StringStreamer from '../../src/streamer/string-streamer'
import DxParser from '../../src/parser/dx-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/dx-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '../../data/esp.dx')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var dxParser = new DxParser(streamer, {})
      return dxParser.parse().then(function (volume) {
        expect(volume.nz).toBe(57)
        expect(volume.ny).toBe(52)
        expect(volume.nx).toBe(26)
      })
    })
  })
})
