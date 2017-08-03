
import StringStreamer from '../../src/streamer/string-streamer.js'
import GroParser from '../../src/parser/gro-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/gro-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = path.join(__dirname, '/../data/1crn.gro')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var groParser = new GroParser(streamer)
      return groParser.parse().then(function (structure) {
        assert.strictEqual(structure.atomCount, 327)
        assert.strictEqual(structure.bondCount, 334)
      })
    })
  })
})
