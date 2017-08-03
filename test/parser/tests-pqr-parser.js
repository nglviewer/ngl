
import StringStreamer from '../../src/streamer/string-streamer.js'
import PqrParser from '../../src/parser/pqr-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/pqr-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = path.join(__dirname, '/../data/3NJW.pqr')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pqrParser = new PqrParser(streamer)
      return pqrParser.parse().then(function (structure) {
        assert.strictEqual(structure.atomCount, 346)
        assert.strictEqual(structure.bondCount, 330)
      })
    })
  })
})
