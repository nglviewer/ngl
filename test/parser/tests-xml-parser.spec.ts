
import StringStreamer from '../../src/streamer/string-streamer'
import XmlParser from '../../src/parser/xml-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/xml-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/3dqbInfo.xml')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var xmlParser = new XmlParser(streamer)
      return xmlParser.parse().then(function (xml) {
        var descr = xml.data.root
        var pdb = descr.children[ 0 ]
        var id = pdb.attributes.structureId
        expect('3DQB').toBe(id)
      })
    })
  })
})
