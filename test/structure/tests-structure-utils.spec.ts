import { guessElement } from '../../src/structure/structure-utils'


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
