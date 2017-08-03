
import StringStreamer from '../../src/streamer/string-streamer.js'
import CubeParser from '../../src/parser/cube-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/cube-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = path.join(__dirname, '/../data/h2o-elf.cube')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var cubeParser = new CubeParser(streamer)
      return cubeParser.parse().then(function (volume) {
        assert.strictEqual(volume.nx, 40)
        assert.strictEqual(volume.ny, 40)
        assert.strictEqual(volume.nz, 40)
      })
    })
  })
})
