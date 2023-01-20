
import StringStreamer from '../../src/streamer/string-streamer'
import SdfParser from '../../src/parser/sdf-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/sdf-parser', function () {
  describe('parsing V2000', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/01W_ideal.sdf')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var sdfParser = new SdfParser(streamer)
      return sdfParser.parse().then(function (structure) {
        expect(structure.atomCount).toBe(32)
        expect(structure.bondCount).toBe(32)
        expect(structure.atomStore.formalCharge).toBeTruthy()
        expect(structure.atomStore.formalCharge[0]).toBe(-1)
        expect(structure.atomStore.formalCharge[1]).toBe(1)
        expect(structure.atomStore.formalCharge[2]).toBe(0)
      })
    })
  })

  describe('parsing V3000', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/v3000.sdf')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var sdfParser = new SdfParser(streamer)
      return sdfParser.parse().then(function (structure) {
        expect(structure.modelStore.count).toBe(2)
        expect(structure.atomCount).toBe(45)
        expect(structure.bondCount).toBe(45)
        expect(structure.atomStore.count).toBe(45)
        expect(structure.atomStore.formalCharge).toBeTruthy()
        expect(structure.bondStore.count).toBe(45)
        expect(structure.atomStore.formalCharge[20]).toBe(1)
        expect(structure.atomStore.formalCharge[22]).toBe(-1)
        expect(structure.atomStore.formalCharge[24]).toBe(-1)
        expect(structure.atomStore.formalCharge[25]).toBe(0)
      })
    })
  })

  describe('parsing mixed V2000/V3000 sdf file', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/v3000.sdf')
      var str = fs.readFileSync(file, 'utf-8')
      file = join(__dirname, '/../data/01W_ideal.sdf')
      str = str.trimRight() + '\n' + fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var sdfParser = new SdfParser(streamer)
      return sdfParser.parse().then(function (structure) {
        expect(structure.modelStore.count).toBe(3)
      })
    })
  })
})
