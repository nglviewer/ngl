
import StringStreamer from '../../src/streamer/string-streamer'
import CifParser from '../../src/parser/cif-parser'


import { join } from 'path'
import * as fs from 'fs'

describe('parser/cif-parser', function () {
  describe('parsing', function () {
    it('basic/mmcif', function () {
      var file = join(__dirname, '/../data/1CRN.cif')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var cifParser = new CifParser(streamer, {})
      return cifParser.parse().then(function (structure) {
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
        expect(structure.center.toArray()).toEqual(
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
        expect(structure.header).toEqual({
          'depositionDate': '1981-04-30',
          'releaseDate': '1981-07-28',
          'experimentalMethods': [
            'X-RAY DIFFRACTION'
          ],
          'resolution': 1.5
        })
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

    it('basic/chemComp', function () {
      var file = join(__dirname, '/../data/PRDCC_000001.cif')
      var str = fs.readFileSync(file, 'utf-8')
      var streamer = new StringStreamer(str)
      var cifParser = new CifParser(streamer, {})
      return cifParser.parse().then(function (structure) {
        expect(structure.atomCount).toBe(352)
        expect(structure.bondCount).toBe(364)
      })
    })
  })
})
