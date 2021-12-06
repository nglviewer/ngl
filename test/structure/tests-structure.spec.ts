
import StringStreamer from '../../src/streamer/string-streamer'
import PdbParser from '../../src/parser/pdb-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('structure/structure', function () {
  describe('iteration', function () {
    it('polymer no chains', function () {
      var file = join(__dirname, '/../data/BaceCgProteinAtomistic.pdb')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var i = 0
        structure.eachPolymer(function () {
          i += 1
        })
        expect(i).toBe(3)
      })
    })
  })
})
