
import StringStreamer from '../../src/streamer/string-streamer'
import PdbParser from '../../src/parser/pdb-parser'
import {
  PolymerEntity, NonPolymerEntity, WaterEntity
} from '../../src/structure/structure-constants'


import { join } from 'path'
import * as fs from 'fs'

function checkEntity (e0: any, e1: any) {
  expect(e0.description).toEqual(e1.description)
  expect(e0.chainIndexList).toEqual(e1.chainIndexList)
  expect(e0.entityType).toEqual(e1.entityType)
  expect(e0.index).toEqual(e1.index)
}

describe('parser/pdb-parser', function () {
  describe('parsing', function () {
    it('basic', function () {
      var file = join(__dirname, '/../data/1crn.pdb')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        expect(structure.atomCount).toBe(327)
        expect(structure.bondCount).toBe(337)
        expect(structure.residueStore.count).toBe(46)
        expect(structure.chainStore.count).toBe(1)
        expect(structure.modelStore.count).toBe(1)

        expect(structure.atomSet.length).toBe(327)
        expect(structure.bondSet.length).toBe(337)
        expect(structure.backboneBondStore.count).toBe(45)
        expect(structure.rungBondStore.count).toBe(0)

        expect(
          structure.boundingBox.max.toArray()).toEqual(
          [ 24.284000396728516, 20.937000274658203, 19.579999923706055 ]
        )
        expect(
          structure.boundingBox.min.toArray()).toEqual(
          [ -3.0969998836517334, -0.515999972820282, -7.421999931335449 ]
        )
        expect(
          structure.center.toArray()).toEqual(
          [ 10.593500256538391, 10.21050015091896, 6.078999996185303 ]
        )

        expect(structure.boxes).toEqual([
          new Float32Array([
            40.959999084472656, 0, 0,
            0, 18.649999618530273, 0,
            0, 0, 22.520000457763672
          ])
        ])
        expect(structure.frames).toEqual([])
        expect(structure.header).toEqual({})
        // TODO
        // expect( structure.header, {
        //     "depositionDate": "1981-04-30",
        //     "releaseDate": "2012-07-11",
        //     "experimentalMethods": [
        //         "X-RAY DIFFRACTION"
        //     ],
        //     "resolution": 1.5
        // } );
        expect(structure.id).toBe('1CRN')
        expect(structure.title).toBe('WATER STRUCTURE OF A HYDROPHOBIC PROTEIN AT ATOMIC RESOLUTION. PENTAGON RINGS OF WATER MOLECULES IN CRYSTALS OF CRAMBIN')

        expect(structure.atomMap.list.length).toBe(27)
        expect(Object.keys(structure.biomolDict).length).toBe(3)
        expect(structure.bondHash.countArray.length).toBe(327)
        expect(structure.bondHash.indexArray.length).toBe(337 * 2)
        expect(structure.bondHash.offsetArray.length).toBe(327)
        expect(structure.residueMap.list.length).toBe(16)
        expect(structure.entityList.length).toBe(1)
        expect(structure.spatialHash !== undefined).toBeTruthy()
      })
    })

    it('entity', function () {
      var file = join(__dirname, '/../data/3pqr.pdb')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        expect(structure.atomCount).toBe(2904)
        expect(structure.bondCount).toBe(2978)
        expect(structure.residueStore.count).toBe(373)
        expect(structure.chainStore.count).toBe(17)
        expect(structure.modelStore.count).toBe(1)
        expect(structure.entityList.length).toBe(12)

        checkEntity(structure.entityList[ 0 ], {
          description: 'RHODOPSIN',
          chainIndexList: [ 0 ],
          entityType: PolymerEntity,
          index: 0
        })
        checkEntity(structure.entityList[ 8 ], {
          description: 'SULFATE ION',
          chainIndexList: [ 11 ],
          entityType: NonPolymerEntity,
          index: 8
        })
        checkEntity(structure.entityList[ 11 ], {
          description: 'water',
          chainIndexList: [ 15, 16 ],
          entityType: WaterEntity,
          index: 11
        })
      })
    })

    it('double bonds', function () {
      var file = join(__dirname, '/../data/doubleBonds.pdb')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var pdbParser = new PdbParser(streamer)
      return pdbParser.parse().then(function (structure) {
        var bs = structure.bondStore
        expect(bs.atomIndex1[ 0 ]).toBe(0)
        expect(bs.atomIndex2[ 0 ]).toBe(1)
        expect(bs.bondOrder[ 0 ]).toBe(1)
        expect(bs.atomIndex1[ 25 ]).toBe(18)
        expect(bs.atomIndex2[ 25 ]).toBe(19)
        expect(bs.bondOrder[ 25 ]).toBe(1)
        expect(bs.atomIndex1[ 26 ]).toBe(19)
        expect(bs.atomIndex2[ 26 ]).toBe(20)
        expect(bs.bondOrder[ 26 ]).toBe(2)
      })
    })
  })
})
