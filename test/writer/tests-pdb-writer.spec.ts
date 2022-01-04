
import StringStreamer from '../../src/streamer/string-streamer'
import PdbParser from '../../src/parser/pdb-parser'
import PdbWriter from '../../src/writer/pdb-writer'

import { join } from 'path'
import * as fs from 'fs'

const LINES_1CRN = 3 + 327 + 1    // HEADER + ATOM + END
const CHARS_1CRN = LINES_1CRN * 81 - 1 // 80 COL + line breaks - No final line break

describe('writer/pdb-writer', function () {
  describe('writing', function () {
    it('getData', function () {
      var file = join(__dirname, '/../data/1crn.pdb')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var pdbWriter = new PdbWriter(structure)
        var string = pdbWriter.getData()
        expect(string.length).toBe(CHARS_1CRN)
        var lines = string.split('\n')
        expect(lines.length).toBe(LINES_1CRN)
      })
    })

    it('formatsCharges', function () {
      var file = join(__dirname, '/../data/charged.pdb')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var pdbWriter = new PdbWriter(structure)
        var string = pdbWriter.getData()
        var lines = string.split('\n')
        // Cut out ATOM lines and check charges match input
        lines = lines.filter(line => line.startsWith('ATOM'))
        expect(lines[0].substr(0, 4)).toBe('ATOM')
        expect(lines[0].substr(77, 3)).toBe('N1+')
        expect(lines[1].substr(77, 3)).toBe('C  ')
        expect(lines[8].substr(77, 3)).toBe('O1-')
      })
    })

    it('getBlob', function () {
      var file = join(__dirname, '/../data/1crn.pdb')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var pdbWriter = new PdbWriter(structure)
        var blob = pdbWriter.getBlob()
        expect(blob.type).toBe('text/plain')
        expect(blob.size).toBe(CHARS_1CRN)
      })
    })
  })
})
