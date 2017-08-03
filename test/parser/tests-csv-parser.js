
import StringStreamer from '../../src/streamer/string-streamer.js'
import CsvParser from '../../src/parser/csv-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/csv-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = path.join(__dirname, '/../data/sample.csv')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var csvParser = new CsvParser(streamer)
      return csvParser.parse().then(function (csv) {
        assert.strictEqual('col1row1Value', csv.data[ 0 ][ 0 ], 'Passed!')
        assert.strictEqual('col2row3Value', csv.data[ 2 ][ 1 ], 'Passed!')
      })
    })
  })
})
