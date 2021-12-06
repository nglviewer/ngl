
import StringStreamer from '../../src/streamer/string-streamer'
import JsonParser from '../../src/parser/json-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/json-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/sample.json')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var jsonParser = new JsonParser(streamer, { string: true })
      return jsonParser.parse().then(function (json) {
        expect(42).toBe(json.data.foo)
      })
    })
  })
})
