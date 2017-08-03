
import BinaryStreamer from '../../src/streamer/binary-streamer.js'
import NetcdfParser from '../../src/parser/netcdf-parser.js'

import { assert } from 'chai'
import path from 'path'
import fs from 'fs'

describe('parser/netcdf-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = path.join(__dirname, '/../data/DPDP.nc')
      var bin = fs.readFileSync(file)
      var streamer = new BinaryStreamer(bin)
      var netcdfParser = new NetcdfParser(streamer)
      return netcdfParser.parse().then(function (netcdf) {
        var h = netcdf.data.header
        assert.strictEqual(2, h.version, 'Passed!')
        assert.deepEqual([
          { name: 'title', type: 'char', value: '' },
          { name: 'application', type: 'char', value: 'AMBER' },
          { name: 'program', type: 'char', value: 'sander' },
          { name: 'programVersion', type: 'char', value: '9.0' },
          { name: 'Conventions', type: 'char', value: 'AMBER' },
          { name: 'ConventionVersion', type: 'char', value: '1.0' }
        ], h.globalAttributes)
      })
    })
  })
})
