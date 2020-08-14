
import BinaryStreamer from '../../src/streamer/binary-streamer'
import NetcdfParser from '../../src/parser/netcdf-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/netcdf-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/DPDP.nc')
      var bin = fs.readFileSync(file)
      var streamer = new BinaryStreamer(bin)
      var netcdfParser = new NetcdfParser(streamer, {})
      return netcdfParser.parse().then(function (netcdf) {
        var h = netcdf.data.header
        expect(2).toBe(h.version)
        expect([
          { name: 'title', type: 'char', value: '' },
          { name: 'application', type: 'char', value: 'AMBER' },
          { name: 'program', type: 'char', value: 'sander' },
          { name: 'programVersion', type: 'char', value: '9.0' },
          { name: 'Conventions', type: 'char', value: 'AMBER' },
          { name: 'ConventionVersion', type: 'char', value: '1.0' }
        ]).toEqual(h.globalAttributes)
      })
    })
  })
})
