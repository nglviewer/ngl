
import StringStreamer from '../../src/streamer/string-streamer'
import PdbParser from '../../src/parser/pdb-parser'
import CifParser from '../../src/parser/cif-parser'
import Structure from '../../src/structure/structure'
import StructureView from '../../src/structure/structure-view'
import Selection from '../../src/selection/selection'
import { kwd } from '../../src/selection/selection-constants'


import { join } from 'path'
import * as fs from 'fs'
import AtomProxy from '../../src/proxy/atom-proxy'


describe('selection/selection', function () {
  describe('parsing', function () {
    it('chain', function () {
      var sele = ':A'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'chainname': 'A' }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('chain resno range', function () {
      var sele = '1-100:A'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'AND',
        'rules': [
          { 'chainname': 'A' },
          { 'resno': [ 1, 100 ] }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('HOH or .OH', function () {
      var sele = 'HOH or .OH'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'resname': 'HOH' },
          { 'atomname': 'OH' }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('modelindex', function () {
      var sele = '/1'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'model': 1 }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('altloc', function () {
      var sele = '%A'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'altloc': 'A' }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('inscode', function () {
      var sele = '^C'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'inscode': 'C' }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('parens', function () {
      var sele = '10-15 or ( backbone and ( 30-35 or 40-45 ) )'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'resno': [ 10, 15 ] },
          {
            'operator': 'AND',
            'rules': [
              { 'keyword': kwd.BACKBONE },
              {
                'operator': 'OR',
                'rules': [
                  { 'resno': [ 30, 35 ] },
                  { 'resno': [ 40, 45 ] }
                ]
              }
            ]
          }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('no parens', function () {
      var sele = '10-15 or backbone and 30-35 or 40-45'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'resno': [ 10, 15 ] },
          {
            'operator': 'AND',
            'rules': [
              { 'keyword': kwd.BACKBONE },
              { 'resno': [ 30, 35 ] }
            ]
          },
          { 'resno': [ 40, 45 ] }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('outer parens', function () {
      var sele = '( 10-15 or backbone )'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'resno': [ 10, 15 ] },
          { 'keyword': kwd.BACKBONE }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('parsing error resi', function () {
      var sele = '( foobar )'
      var selection = new Selection(sele)
      var selectionObj = {
        'error': 'resi must be an integer'
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('parsing error atomname', function () {
      var sele = '.FOOBAR'
      var selection = new Selection(sele)
      var selectionObj = {
        'error': 'atomname must be one to four characters'
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('parsing multi-char chain', function () {
      var sele = ':ABJ/0'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'AND',
        'rules': [
          { 'model': 0 },
          { 'chainname': 'ABJ' }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('parsing error model', function () {
      var sele = '/Q'
      var selection = new Selection(sele)
      var selectionObj = {
        'error': 'model must be an integer'
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('parsing error resi range', function () {
      var sele = '1-2-3'
      var selection = new Selection(sele)
      var selectionObj = {
        'error': "resi range must contain one '-'"
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('negate simple', function () {
      var sele = 'not 10-15'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'negate': true,
        'rules': [
          { 'resno': [ 10, 15 ] }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('negate or', function () {
      var sele = 'MET or not 10-15'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'resname': 'MET' },
          {
            'operator': undefined,
            'negate': true,
            'rules': [
              { 'resno': [ 10, 15 ] }
            ]
          }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('negate parens', function () {
      var sele = 'MET or not ( 10-15 )'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'resname': 'MET' },
          {
            'operator': undefined,
            'negate': true,
            'rules': [
              {
                'operator': undefined,
                'rules': [
                  { 'resno': [ 10, 15 ] }
                ]
              }
            ]
          }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('negate parens 2', function () {
      var sele = 'MET or not ( 10-15 and 15-20 )'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'resname': 'MET' },
          {
            'operator': undefined,
            'negate': true,
            'rules': [
              {
                'operator': 'AND',
                'rules': [
                  { 'resno': [ 10, 15 ] },
                  { 'resno': [ 15, 20 ] }
                ]
              }
            ]
          }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('negate parens 3', function () {
      var sele = 'MET or not ( 10-15 and 15-20 ) or GLU'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'resname': 'MET' },
          {
            'operator': undefined,
            'negate': true,
            'rules': [
              {
                'operator': 'AND',
                'rules': [
                  { 'resno': [ 10, 15 ] },
                  { 'resno': [ 15, 20 ] }
                ]
              }
            ]
          },
          { 'resname': 'GLU' }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('negate parens 4', function () {
      var sele = 'MET or not ( 10-15 and 15-20 ) and GLU'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'resname': 'MET' },
          {
            'operator': 'AND',
            'rules': [
              {
                'operator': undefined,
                'negate': true,
                'rules': [
                  {
                    'operator': 'AND',
                    'rules': [
                      { 'resno': [ 10, 15 ] },
                      { 'resno': [ 15, 20 ] }
                    ]
                  }
                ]
              },
              { 'resname': 'GLU' }
            ]
          }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('negate parens 5', function () {
      var sele = '1-100 and not ( MET or GLU ) or 300-330'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          {
            'operator': 'AND',
            'rules': [
              { 'resno': [ 1, 100 ] },
              {
                'operator': undefined,
                'negate': true,
                'rules': [
                  {
                    'operator': 'OR',
                    'rules': [
                      { 'resname': 'MET' },
                      { 'resname': 'GLU' }
                    ]
                  }
                ]
              }
            ]
          },
          { 'resno': [ 300, 330 ] }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('not backbone or .CA', function () {
      var sele = 'not backbone or .CA'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          {
            'operator': undefined,
            'negate': true,
            'rules': [
              { 'keyword': kwd.BACKBONE }
            ]
          },
          { 'atomname': 'CA' }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('.CA or not backbone', function () {
      var sele = '.CA or not backbone'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'atomname': 'CA' },
          {
            'operator': undefined,
            'negate': true,
            'rules': [
              { 'keyword': kwd.BACKBONE }
            ]
          }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('MET or GLY', function () {
      var sele = 'MET or GLY'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'resname': 'MET' },
          { 'resname': 'GLY' }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('not ( MET ) or GLY', function () {
      var sele = 'not ( MET ) or GLY'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          {
            'operator': undefined,
            'negate': true,
            'rules': [
              {
                'operator': undefined,
                'rules': [
                  { 'resname': 'MET' }
                ]
              }
            ]
          },
          { 'resname': 'GLY' }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('not ( MET or GLY )', function () {
      var sele = 'not ( MET or GLY )'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'negate': true,
        'rules': [
          {
            'operator': 'OR',
            'rules': [
              { 'resname': 'MET' },
              { 'resname': 'GLY' }
            ]
          }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('not ( MET )', function () {
      var sele = 'not ( MET )'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'negate': true,
        'rules': [
          {
            'operator': undefined,
            'rules': [
              { 'resname': 'MET' }
            ]
          }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('not not MET', function () {
      var sele = 'not not MET'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'negate': true,
        'rules': [
          {
            'operator': undefined,
            'negate': true,
            'rules': [
              { 'resname': 'MET' }
            ]
          }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('not not not MET', function () {
      var sele = 'not not not MET'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'negate': true,
        'rules': [
          {
            'operator': undefined,
            'negate': true,
            'rules': [
              {
                'operator': undefined,
                'negate': true,
                'rules': [
                  { 'resname': 'MET' }
                ]
              }
            ]
          }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('MET or sidechain', function () {
      var sele = 'MET or sidechain'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'resname': 'MET' },
          { 'keyword': kwd.SIDECHAIN }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('MET or not sidechain', function () {
      var sele = 'MET or not sidechain'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'resname': 'MET' },
          {
            'operator': undefined,
            'negate': true,
            'rules': [
              { 'keyword': kwd.SIDECHAIN }
            ]
          }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('element H', function () {
      var sele = '_H'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'element': 'H' }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('(CYS and .CA) or (CYS and hydrogen)', function () {
      var sele = '(CYS and .CA) or (CYS and hydrogen)'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          {
            'operator': 'AND',
            'rules': [
              { 'resname': 'CYS' },
              { 'atomname': 'CA' }
            ]
          },
          {
            'operator': 'AND',
            'rules': [
              { 'resname': 'CYS' },
              { 'operator': 'OR',
                'rules': [
                  { 'element': 'H' },
                  { 'element': 'D' }
                ]
              }
            ]
          }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('atomindex @1,2,3', function () {
      var sele = '@1,2,3'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'atomindex': [ 1, 2, 3 ] }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('atomindex @1,13,2 OR protein', function () {
      var sele = '@1,13,2 OR protein'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'OR',
        'rules': [
          { 'atomindex': [ 1, 2, 13 ] },
          { 'keyword': kwd.PROTEIN }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('atomindex @0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19', function () {
      var sele = '@0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'atomindex': [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ] }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('[123]', function () {
      var sele = '[123]'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'resname': '123' }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('15^C:A.N%A/0', function () {
      var sele = '15^C:A.N%A/0'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': 'AND',
        'rules': [
          { 'model': 0 },
          { 'altloc': 'A' },
          { 'atomname': 'N' },
          { 'chainname': 'A' },
          { 'inscode': 'C' },
          { 'resno': 15 }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('negative resno -143', function () {
      var sele = '-143'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'resno': -143 }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('negative resno range -12-14', function () {
      var sele = '-12-14'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'resno': [ -12, 14 ] }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('negative resno range -12--8', function () {
      var sele = '-12--8'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'resno': [ -12, -8 ] }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('bonded', function () {
      var sele = 'bonded'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'keyword': kwd.BONDED }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('ring', function () {
      var sele = 'ring'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'keyword': kwd.RING }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })

    it('resname list', function () {
      var sele = '[ALA,MET,GLU]'
      var selection = new Selection(sele)
      var selectionObj = {
        'operator': undefined,
        'rules': [
          { 'resname': [ 'ALA', 'MET', 'GLU' ] }
        ]
      }
      expect(selection.selection).toEqual(selectionObj)
    })
  })

  function getNthSelectedAtom (structure: Structure|StructureView, nth: number) {
    var i = 0
    var atomProxy = structure.getAtomProxy()
    structure.eachAtom(function (ap: AtomProxy) {
      if (i === nth) atomProxy.index = ap.index
      ++i
    })
    return atomProxy
  }

  describe('selection', function () {
    var _1crnPdb: string

    beforeAll(function () {
      _1crnPdb = fs.readFileSync(join(__dirname, '../data/1crn.pdb'), 'utf-8')
    })

    it('backbone', function () {
      var sele = 'backbone'
      var selection = new Selection(sele)
      var streamer = new StringStreamer(_1crnPdb)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure: Structure) {
        // Cannot use structure.getView as this function is
        // patched in in JS (to avoid circular imports)
        var sview = new StructureView(structure, selection)
        var ap = getNthSelectedAtom(sview, 0)
        expect(sview.atomCount).toBe(185)
        expect(ap.atomname).toBe('N')
      })
    })

    it('.CA', function () {
      var sele = '.CA'
      var selection = new Selection(sele)
      var streamer = new StringStreamer(_1crnPdb)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var sview = new StructureView(structure, selection)
        var ap = getNthSelectedAtom(sview, 30)
        expect(sview.atomCount).toBe(46)
        expect(ap.atomname).toBe('CA')
      })
    })

    it('ARG or .N', function () {
      var sele = 'ARG or .N'
      var selection = new Selection(sele)
      var streamer = new StringStreamer(_1crnPdb)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var sview = new StructureView(structure, selection)
        expect(sview.atomCount).toBe(22 + 46 - 2)
      })
    })

    it('not backbone', function () {
      var sele = 'not backbone'
      var selection = new Selection(sele)
      var streamer = new StringStreamer(_1crnPdb)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var sview = new StructureView(structure, selection)
        var ap = getNthSelectedAtom(sview, 0)
        expect(sview.atomCount).toBe(142)
        expect(ap.atomname).toBe('CB')
      })
    })

    it('sidechain', function () {
      var sele = 'sidechain'
      var selection = new Selection(sele)
      var streamer = new StringStreamer(_1crnPdb)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var sview = new StructureView(structure, selection)
        var ap = getNthSelectedAtom(sview, 0)
        expect(sview.atomCount).toBe(142)
        expect(ap.atomname).toBe('CB')
      })
    })

    it('not backbone or .CA', function () {
      var sele = 'not backbone or .CA'
      var selection = new Selection(sele)
      var streamer = new StringStreamer(_1crnPdb)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var sview = new StructureView(structure, selection)
        var ap1 = getNthSelectedAtom(sview, 0)
        var ap2 = getNthSelectedAtom(sview, 1)
        expect(sview.atomCount).toBe(188)
        expect(ap1.atomname).toBe('CA')
        expect(ap2.atomname).toBe('CB')
      })
    })

    it('TYR vs not not TYR', function () {
      var selection1 = new Selection('TYR')
      var selection2 = new Selection('not not TYR')
      var streamer = new StringStreamer(_1crnPdb)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var sview1 = new StructureView(structure, selection1)
        var sview2 = new StructureView(structure, selection2)
        expect(sview1.atomCount).toBe(sview2.atomCount)
      })
    })

    it('not ( 12 and .CA ) vs not ( 12.CA )', function () {
      var selection1 = new Selection('not ( 12 and .CA )')
      var selection2 = new Selection('not ( 12.CA )')
      var streamer = new StringStreamer(_1crnPdb)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var sview1 = new StructureView(structure, selection1)
        var sview2 = new StructureView(structure, selection2)
        expect(sview1.atomCount).toBe(sview2.atomCount)
      })
    })

    it('/1 PDB', function () {
      var sele = '/1'
      var selection = new Selection(sele)
      var file = join(__dirname, '../data/1LVZ.pdb')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var sview = new StructureView(structure, selection)
        var ap1 = getNthSelectedAtom(sview, 0)
        var ap2 = getNthSelectedAtom(sview, sview.atomCount - 1)
        expect(ap1.modelIndex).toBe(1)
        expect(ap2.modelIndex).toBe(1)
      })
    })

    it('/1 CIF', function () {
      var sele = '/1'
      var selection = new Selection(sele)
      var file = join(__dirname, '../data/1LVZ.cif')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var cifParser = new CifParser(streamer)
      return cifParser.parse().then(function (structure) {
        var sview = new StructureView(structure, selection)
        var ap1 = getNthSelectedAtom(sview, 0)
        var ap2 = getNthSelectedAtom(sview, sview.atomCount - 1)
        expect(ap1.modelIndex).toBe(1)
        expect(ap2.modelIndex).toBe(1)
      })
    })

    it('atomindex', function () {
      var sele = '@1,8,12'
      var selection = new Selection(sele)
      var streamer = new StringStreamer(_1crnPdb)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var sview = new StructureView(structure, selection)
        var ap1 = getNthSelectedAtom(sview, 0)
        var ap2 = getNthSelectedAtom(sview, 1)
        var ap3 = getNthSelectedAtom(sview, 2)
        expect(sview.atomCount).toBe(3)
        expect(ap1.index).toBe(1)
        expect(ap2.index).toBe(8)
        expect(ap3.index).toBe(12)
      })
    })

    it('lowercase resname', function () {
      var sele = 'phe'
      var selection = new Selection(sele)
      var file = join(__dirname, '../data/lowerCaseResname.pdb')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var sview = new StructureView(structure, selection)
        expect(sview.atomCount).toBe(13)
      })
    })
  })
})
