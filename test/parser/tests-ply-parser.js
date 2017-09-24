
import StringStreamer from '../../src/streamer/string-streamer.js'
import PlyParser from '../../src/parser/ply-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/ply-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = path.join(__dirname, '/../data/cube.ply')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var plyParser = new PlyParser(streamer)
      return plyParser.parse().then(function (surface) {
        assert.strictEqual(surface.size, 36)
        assert.strictEqual(surface.position.length, 108)
        assert.strictEqual(surface.normal.length, 108)
      })
    })
  })
})
