
import StringStreamer from '../../src/streamer/string-streamer.js'
import SdfParser from '../../src/parser/sdf-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/sdf-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = path.join(__dirname, '/../data/01W_ideal.sdf')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var sdfParser = new SdfParser(streamer)
      return sdfParser.parse().then(function (structure) {
        assert.strictEqual(structure.atomCount, 32)
        assert.strictEqual(structure.bondCount, 32)
        assert.exists(structure.atomStore.formalCharge)
        assert.strictEqual(structure.atomStore.formalCharge[0], -1)
        assert.strictEqual(structure.atomStore.formalCharge[1], 1)
        assert.strictEqual(structure.atomStore.formalCharge[2], 0)
      })
    })
  })
})
