
import StringStreamer from '../../src/streamer/string-streamer'
import PqrParser from '../../src/parser/pqr-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/pqr-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/3NJW.pqr')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pqrParser = new PqrParser(streamer)
      return pqrParser.parse().then(function (structure) {
        expect(structure.atomCount).toBe(346)
        expect(structure.bondCount).toBe(330)
      })
    })
  })
})
