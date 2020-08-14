
import StringStreamer from '../../src/streamer/string-streamer'
import CubeParser from '../../src/parser/cube-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/cube-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/h2o-elf.cube')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var cubeParser = new CubeParser(streamer, {})
      return cubeParser.parse().then(function (volume) {
        expect(volume.nx).toBe(40)
        expect(volume.ny).toBe(40)
        expect(volume.nz).toBe(40)
      })
    })
  })
})
