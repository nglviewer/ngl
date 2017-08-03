
import StringStreamer from '../../src/streamer/string-streamer.js'
import TextParser from '../../src/parser/text-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/text-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var sampleText = 'Moin world!'
      var file = path.join(__dirname, '/../data/sample.txt')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var textParser = new TextParser(streamer)
      return textParser.parse().then(function (text) {
        assert.strictEqual(sampleText, text.data, 'Passed!')
      })
    })
  })
})
