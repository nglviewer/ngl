import { UnitcellParams } from './../../src/symmetry/unitcell';

import StringStreamer from '../../src/streamer/string-streamer'
import PdbParser from '../../src/parser/pdb-parser'

import { join } from 'path'
import * as fs from 'fs'
import Unitcell from '../../src/symmetry/unitcell'

const unitcellDict: Partial<{
  a: number
  b: number
  c: number
  alpha: number
  beta: number
  gamma: number
  spacegroup: string
}> = {}

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

    it('unit cell transformation', function () {

      unitcellDict.a = 31.0219;
      unitcellDict.b = 11.0735;
      unitcellDict.c = 23.9944;
      unitcellDict.alpha = 90.0000;
      unitcellDict.beta = 106.9654;
      unitcellDict.gamma = 90.0000;
      unitcellDict.spacegroup = "";

      var unitcell = new Unitcell(unitcellDict as UnitcellParams);
 
      expect(unitcell).toBeInstanceOf(Unitcell);
      expect(unitcell.cartToFrac.elements[0]).toBe(0.03223529184221469);
      expect(unitcell.cartToFrac.elements[1]).toBe(0);
      expect(unitcell.fracToCart.elements[0]).toBe(31.0219);
      expect(unitcell.fracToCart.elements[1]).toBe(0);
    })
  })
})
