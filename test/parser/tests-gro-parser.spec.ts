
import StringStreamer from '../../src/streamer/string-streamer'
import GroParser from '../../src/parser/gro-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/gro-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/1crn.gro')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var groParser = new GroParser(streamer, {})
      return groParser.parse().then(function (structure) {
        expect(structure.atomCount).toBe(327)
        expect(structure.bondCount).toBe(334)
      })
    })
  })
})
