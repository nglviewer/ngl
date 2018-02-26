
import StringStreamer from '../../src/streamer/string-streamer.js'
import XmlParser from '../../src/parser/xml-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/xml-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = path.join(__dirname, '/../data/3dqbInfo.xml')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var xmlParser = new XmlParser(streamer)
      return xmlParser.parse().then(function (xml) {
        var descr = xml.data.root
        var pdb = descr.children[ 0 ]
        var id = pdb.attributes.structureId
        assert.strictEqual('3DQB', id, 'Passed!')
      })
    })
  })
})
