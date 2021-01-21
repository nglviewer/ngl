
import StringStreamer from '../../src/streamer/string-streamer'
import CsvParser from '../../src/parser/csv-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/csv-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/sample.csv')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var csvParser = new CsvParser(streamer, {})
      return csvParser.parse().then(function (csv) {
        expect('col1row1Value').toBe(csv.data[ 0 ][ 0 ])
        expect('col2row3Value').toBe(csv.data[ 2 ][ 1 ])
      })
    })
  })
})
