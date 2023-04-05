import { guessElement } from '../../src/structure/structure-utils'
import StringStreamer from '../../src/streamer/string-streamer'
import PdbParser from '../../src/parser/pdb-parser'

import { join } from 'path'
import * as fs from 'fs'
import { Structure } from '../../src/ngl'

describe('structure-utils/guessElement', function () {
  describe('basic', function () {
    it('strips numbers in atom names', function () {
        expect(guessElement('CL1')).toBe('CL')
        expect(guessElement('10CB')).toBe('C')
    })

    it('strips spaces and signs in atom names', function () {
        expect(guessElement(' CL+1')).toBe('CL')
    })

    it('prioritizes Carbon over Calcium', function () {
        expect(guessElement('CA')).toBe('C')
    })

    it('prioritizes first letter when element is not Na, Cl nor Fe in atomnames containing 2 letters ', function () {
        expect(guessElement('HF')).toBe('H')
    })

    it('recognizes other standard elements names with 2 letters', function () {
        expect(guessElement('MG')).toBe('MG')
        expect(guessElement('MZ')).toBe('')
        expect(guessElement('NE')).toBe('N') // 'N' has priority
    })
    
  })
})

describe('structure-utils/calculateChainNames', function () {
    it('Calculates new chain names when none is set', function () {
        var file = join(__dirname, '/../data/noChainNameTerRecords.pdb')
        var str = fs.readFileSync(file, 'utf-8')
        var streamer = new StringStreamer(str)
        var pdbParser = new PdbParser(streamer)
        return pdbParser.parse().then(function (structure: Structure) {
            const chainNames: string[] = []
            structure.eachChain(cp => chainNames.push(cp.chainname))

            expect(chainNames).toEqual(['A', 'B', 'C', 'D'])
            expect(structure.modelStore.chainCount[0]).toBe(structure.chainStore.count)
        })
    })
})
