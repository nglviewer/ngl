/*
import StringStreamer from '../../src/streamer/string-streamer.js'
import PdbParser from '../../src/parser/pdb-parser.js'
*/
import StlWriter from '../../src/writer/stl-writer.js'

import { assert } from 'chai'
// import path from 'path'
// import fs from 'fs'

describe('writer/stl-writer', function () {
  describe('writing', function () {
    it('getData', function () {
      var surf = {
        normal: [0, 0, 1, 0, 0, 1, 0, 0, 1],
        index: [0, 1, 2],
        position: [0, 0, 0, 0, 1, 0, 0, 0, 1]
      }
      var stl = new StlWriter(surf)
      var string = stl.getData()
      assert.strictEqual(string.indexOf('solid surface'), 0, 'stl 1st line')
      var lines = string.split('\n')
      assert.strictEqual(lines.length, 9)
      assert.strictEqual(lines[1], 'facet normal 0 0 1', 'facet declaration')
      assert.strictEqual(lines[2], 'outer loop', 'loop declaration')
      assert.strictEqual(lines[3], '    vertex 0 0 0', 'vertex declaration')
    })

    // skip because there is no Blob in node.js
    /*
    it.skip('getBlob', function () {
      var file = path.join(__dirname, '/../data/1crn.pdb')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pdbParser = new PdbParser(streamer)
      pdbParser.parse(function (structure) {
        var pdbWriter = new PdbWriter(structure)
        var blob = pdbWriter.getBlob()
        assert.strictEqual(blob.type, 'text/plain')
        assert.strictEqual(blob.size, 26156)
      })
    })
    */
  })
})
