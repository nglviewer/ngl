
import StringStreamer from '../../src/streamer/string-streamer.js'
import DxParser from '../../src/parser/dx-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/dx-parser', function () {
  describe('parsing', function () {
    it.skip('basic', function () {
      var file = path.join(__dirname, '/../data/TODO.dx')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var dxParser = new DxParser(streamer)
      return dxParser.parse().then(function (volume) {
        assert.strictEqual(volume.nx, 40)
        assert.strictEqual(volume.ny, 40)
        assert.strictEqual(volume.nz, 40)
      })
    })
  })
})
