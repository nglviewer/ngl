import StringStreamer from '../../src/streamer/string-streamer'
import PdbqtParser from '../../src/parser/pdbqt-parser'
import { Structure } from '../../src/ngl'


import { join } from 'path'
import * as fs from 'fs'


describe('parser/pdb-parser', function () {
  describe('parsing', function () {
    it('translates PDBQT special atom types to elements', function() {
      const file = join(__dirname, '/../data/1xdn_gln.pdbqt')
      const str = fs.readFileSync(file, 'utf-8')
      const streamer = new StringStreamer(str)
      const pdbqtParser = new PdbqtParser(streamer)
      return pdbqtParser.parse().then(function (structure: Structure) {
        const ap = structure.getAtomProxy()
        ap.index = 3
        expect(ap.element).toBe('O')
        ap.index = 12
        expect(ap.element).toBe('H')
      })
    })
  })
})
