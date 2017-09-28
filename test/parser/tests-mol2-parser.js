
import StringStreamer from '../../src/streamer/string-streamer.js'
import Mol2Parser from '../../src/parser/mol2-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/mol2-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = path.join(__dirname, '/../data/adrenalin.mol2')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var mol2Parser = new Mol2Parser(streamer)
      return mol2Parser.parse().then(function (structure) {
        assert.strictEqual(structure.atomCount, 26)
        assert.strictEqual(structure.bondCount, 26)
      })
    })
  })
})
