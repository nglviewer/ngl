
import StringStreamer from '../../src/streamer/string-streamer.js'
import PdbParser from '../../src/parser/pdb-parser.js'
import PdbWriter from '../../src/writer/pdb-writer.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('writer/pdb-writer', function () {
  describe('writing', function () {
    it('getData', function () {
      var file = path.join(__dirname, '/../data/1crn.pdb')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var pdbWriter = new PdbWriter(structure)
        var string = pdbWriter.getData()
        assert.strictEqual(string.length, 26156)
        var lines = string.split('\n')
        assert.strictEqual(lines.length, 331)
      })
    })

    // skip because there is no Blob in node.js
    it.skip('getBlob', function () {
      var file = path.join(__dirname, '/../data/1crn.pdb')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var pdbWriter = new PdbWriter(structure)
        var blob = pdbWriter.getBlob()
        assert.strictEqual(blob.type, 'text/plain')
        assert.strictEqual(blob.size, 26156)
      })
    })
  })
})
