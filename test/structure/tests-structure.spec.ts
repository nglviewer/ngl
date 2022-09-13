
import StringStreamer from '../../src/streamer/string-streamer'
import PdbParser from '../../src/parser/pdb-parser'


import { join } from 'path'
// import * as fs from 'fs'

import { promises as fsp } from 'fs'
import AtomProxy from '../../src/proxy/atom-proxy'

async function loadExample() {
  const file = join(__dirname, '/../data/BaceCgProteinAtomistic.pdb')
  const str = await fsp.readFile(file, 'utf-8')
  const streamer = new StringStreamer(str)
  const pdbParser = new PdbParser(streamer)
  const structure = await pdbParser.parse()
  return structure
}

describe('structure/structure', () => {
  describe('iteration', () => {
    test('structure identifies multiple polymers without chain info', async () => {
      expect.assertions(1)
      const structure = await loadExample()
      let i = 0
      structure.eachPolymer( () => { i++ } )
      expect(i).toBe(3)
    })
  })

  describe('updatePosition', () => {
    test('bounding box updates and signals', async () => {
      expect.assertions(6)
      let signalCount = 0
      const structure = await loadExample()

      structure.signals.refreshed.add(() => {
        signalCount++
      })

      const oldBoundingBox = structure.getBoundingBox()

      const newCoords = new Float32Array(structure.atomCount * 3)
      structure.eachAtom((ap: AtomProxy) => {
        ap.positionToArray(newCoords, ap.index * 3)
      })
      newCoords.forEach((x, i) => {
        newCoords[i] = x + 1
      })

      structure.updatePosition(newCoords, false) // false arg should prevent recalc of bounding box
      
      expect(signalCount).toEqual(0)
      expect(oldBoundingBox.min.equals(structure.boundingBox.min)).toBeTruthy()
      expect(oldBoundingBox.max.equals(structure.boundingBox.max)).toBeTruthy()

      structure.updatePosition(newCoords, true) // signal should fire and boundingBox should udpate

      expect(signalCount).toEqual(1)
      expect(oldBoundingBox.min.equals(structure.boundingBox.min)).toBeFalsy()
      expect(oldBoundingBox.max.equals(structure.boundingBox.max)).toBeFalsy()
    })
  })
})


