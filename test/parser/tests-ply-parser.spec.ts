
import StringStreamer from '../../src/streamer/string-streamer'
import PlyParser from '../../src/parser/ply-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/ply-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/cube.ply')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var plyParser = new PlyParser(streamer)
      return plyParser.parse().then(function (surface) {
        expect(surface.size).toBe(36)
        expect(surface.position.length).toBe(108)
        expect(surface.normal.length).toBe(108)
      })
    })
  })
})
