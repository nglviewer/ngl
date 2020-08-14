
import StringStreamer from '../../src/streamer/string-streamer'
import SdfParser from '../../src/parser/sdf-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/sdf-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/01W_ideal.sdf')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var sdfParser = new SdfParser(streamer)
      return sdfParser.parse().then(function (structure) {
        expect(structure.atomCount).toBe(32)
        expect(structure.bondCount).toBe(32)
        expect(structure.atomStore.formalCharge).toBeTruthy()
        expect(structure.atomStore.formalCharge[0]).toBe(-1)
        expect(structure.atomStore.formalCharge[1]).toBe(1)
        expect(structure.atomStore.formalCharge[2]).toBe(0)
      })
    })
  })
})
