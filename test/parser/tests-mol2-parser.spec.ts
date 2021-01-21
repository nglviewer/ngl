
import StringStreamer from '../../src/streamer/string-streamer'
import Mol2Parser from '../../src/parser/mol2-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/mol2-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/adrenalin.mol2')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var mol2Parser = new Mol2Parser(streamer, {})
      return mol2Parser.parse().then(function (structure) {
        expect(structure.atomCount).toBe(26)
        expect(structure.bondCount).toBe(26)
      })
    })
  })
})
