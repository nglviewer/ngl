import StringStreamer from '../../src/streamer/string-streamer.js'
import SdfParser from '../../src/parser/sdf-parser.js'
import SdfWriter from '../../src/writer/sdf-writer.js'

import { assert } from 'chai'
import fs from 'fs'
import path from 'path'

function rtrim (s) { return s.replace(/\s+$/, '') }

describe('writer/sdf-writer', function () {
  let lines, structure

  before(function () {
    const file = path.join(__dirname, '/../data/01W_ideal.sdf')
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
      assert.exists(structure)
    })
  })

  describe('basic', function () {
    let writer

    before(function () {
      writer = new SdfWriter(structure)
    })

    it('correct-header', function () {
      assert.equal(writer.idString, '01W')
      assert.equal(writer.titleString, '  CCTOOLS-0722170728')
    })

    it('correct-counts', function () {
      assert.equal(
        writer.countsString,
        ' 32 32  0  0  0  0  0  0  0  0999 V2000')
    })

    it('correct-atom-line', function () {
      const ap = structure.getAtomProxy();
      // First three atoms test positive, negative, neutral
      [0, 1, 2].forEach(function (i) {
        ap.index = i
        const expected = rtrim(lines[i + 4])
        assert.equal(writer.formatAtom(ap), expected)
      })
    })

    it('throws-if-atom-line-too-long', function () {
      const ap = structure.getAtomProxy()
      ap.index = 0
      const realX = ap.x
      ap.x = 1e10
      assert.throws(function () { writer.formatAtom(ap) })
      ap.x = realX
    })

    it('correct-bond-line', function () {
      const bp = structure.getBondProxy()
      bp.index = 0
      assert.equal(writer.formatBond(bp), rtrim(lines[36]))
    })

    it('correct-charges', function () {
      assert.equal(
        writer.chargeLines[0],
        'M  CHG  6   1  -1   2   1   9   1  10  -1  17   1  20  -1')
    })

    it('writes-correct-length', function () {
      const str = writer.getData()
      assert.equal(str.trim().split('\n').length, 71)
    })
  })
  describe.skip('multi-component-files', function () {
    // TODO: No support for this yet!
  })
  describe.skip('throws-for-large-structures', function () {
    // TODO: No support yet!
  })
})
