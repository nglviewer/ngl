
import StringStreamer from '../../src/streamer/string-streamer'
import TextParser from '../../src/parser/text-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/text-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var sampleText = 'Moin world!'
      var file = join(__dirname, '/../data/sample.txt')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var textParser = new TextParser(streamer)
      return textParser.parse().then(function (text) {
        expect(sampleText).toBe(text.data)
      })
    })
  })
})
