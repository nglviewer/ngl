
import StringStreamer from '../../src/streamer/string-streamer'
import ObjParser from '../../src/parser/obj-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/obj-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/cube.obj')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var objParser = new ObjParser(streamer)
      return objParser.parse().then(function (surface) {
        expect(surface.size).toBe(36)
        expect(surface.position.length).toBe(108)
        expect(surface.normal.length).toBe(108)
      })
    })
  })
})
