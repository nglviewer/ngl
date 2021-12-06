import StringStreamer from '../../src/streamer/string-streamer'
import SdfParser from '../../src/parser/sdf-parser'
import SdfWriter from '../../src/writer/sdf-writer'
import Structure from '../../src/structure/structure'

import * as fs from 'fs'
import { join } from 'path'

function rtrim (s: string) { return s.replace(/\s+$/, '') }

describe('writer/sdf-writer', function () {
  let lines: string[], structure: Structure

  beforeAll(function () {
    const file = join(__dirname, '/../data/01W_ideal.sdf')
    const str = fs.readFileSync(file, 'utf-8')
    lines = str.split('\n')
    const streamer = new StringStreamer(str)
    const sdfParser = new SdfParser(streamer)
    return sdfParser.parse().then(function (s) {
      structure = s
    })
  })

  // Double check structure loaded...
  describe('structure', function () {
    it('should-exist', function () {
      expect(structure).toBeDefined()
    })
  })

  describe('basic', function () {
    let writer: SdfWriter

    beforeAll(function () {
      writer = new SdfWriter(structure)
    })

    it('correct-header', function () {
      expect(writer.idString).toBe('01W')
      expect(writer.titleString).toBe('  CCTOOLS-0722170728')
    })

    it('correct-counts', function () {
      expect(writer.countsString).toBe(' 32 32  0  0  0  0  0  0  0  0999 V2000')
    })

    it('correct-atom-line', function () {
      const ap = structure.getAtomProxy();
      // First three atoms test positive, negative, neutral
      [0, 1, 2].forEach(function (i) {
        ap.index = i
        const expected = rtrim(lines[i + 4])
        expect(writer.formatAtom(ap)).toBe(expected)
      })
    })

    it('throws-if-atom-line-too-long', function () {
      const ap = structure.getAtomProxy()
      ap.index = 0
      const realX = ap.x
      ap.x = 1e10
      expect(function () { writer.formatAtom(ap) }).toThrowError()
      ap.x = realX
    })

    it('correct-bond-line', function () {
      const bp = structure.getBondProxy()
      bp.index = 0
      expect(writer.formatBond(bp)).toBe(rtrim(lines[36]))
    })

    it('correct-charges', function () {
      expect(writer.chargeLines[0]).toBe('M  CHG  6   1  -1   2   1   9   1  10  -1  17   1  20  -1')
    })

    it('writes-correct-length', function () {
      const str = writer.getData()
      expect(str.trim().split('\n').length).toBe(71)
    })
  })
  describe.skip('multi-component-files', function () {
    // TODO: No support for this yet!
  })
  describe.skip('throws-for-large-structures', function () {
    // TODO: No support yet!
  })
})
