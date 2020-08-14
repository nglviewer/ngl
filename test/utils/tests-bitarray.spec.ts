
import BitArray from '../../src/utils/bitarray'



describe('utils/bitarray', function () {
  describe('BitArray', function () {
    it('set basic', function () {
      var ba = new BitArray(40)

      expect(ba.get(10)).toBe(false)

      ba.set(10)
      expect(ba.get(10)).toBe(true)

      ba.clear(10)
      expect(ba.get(10)).toBe(false)
    })

    it('is set', function () {
      var ba = new BitArray(40)

      expect(ba.isSet(10, 33)).toBeFalsy()

      ba.set(10)
      ba.set(33)
      expect(ba.isSet(10, 33)).toBeTruthy()
    })

    it('words', function () {
      var words = new Uint32Array(2)
      var ba = new BitArray(40)

      expect(ba["_words"]).toEqual(words)

      ba.set(0)
      words[ 0 ] = 1
      expect(ba['_words']).toEqual(words)

      ba.clear(0)
      words[ 0 ] = 0
      expect(ba['_words']).toEqual(words)

      ba.set(32)
      words[ 1 ] = 1
      expect(ba['_words']).toEqual(words)

      ba.clear(32)
      words[ 1 ] = 0
      expect(ba['_words']).toEqual(words)
    })

    it('set edge', function () {
      var ba = new BitArray(40)

      expect(ba.get(39)).toBe(false)

      ba.set(39)
      expect(ba.get(39)).toBe(true)

      ba.clear(39)
      expect(ba.get(39)).toBe(false)
    })

    it('size', function () {
      var ba = new BitArray(40)

      expect(ba.getSize()).toBe(0)

      ba.set(10)
      expect(ba.getSize()).toBe(1)

      ba.clear(10)
      expect(ba.getSize()).toBe(0)
    })

    it('array', function () {
      var ba = new BitArray(40)

      expect(ba.toArray()).toEqual([])

      ba.set(10)
      expect(ba.toArray()).toEqual([ 10 ])

      ba.clear(10)
      expect(ba.toArray()).toEqual([])
    })

    it('array edge', function () {
      var ba = new BitArray(40)

      expect(ba.toArray()).toEqual([])

      ba.set(39)
      expect(ba.toArray()).toEqual([ 39 ])

      ba.clear(39)
      expect(ba.toArray()).toEqual([])
    })

    it('for each', function () {
      var result: number[] = []
      var expected = [
        2, 0,
        9, 1,
        33, 2
      ]

      var ba = new BitArray(40)
      ba.set(9)
      ba.set(2)
      ba.set(33)
      ba.forEach(function (index, i) {
        result.push(index, i)
      })
      expect(result).toEqual(expected)
    })

    it('string', function () {
      var ba = new BitArray(40)

      expect(ba.toString()).toEqual('{}')

      ba.set(9)
      expect(ba.toString()).toEqual('{9}')

      ba.set(2)
      ba.set(33)
      expect(ba.toString()).toEqual('{2,9,33}')
    })

    it('sele string', function () {
      var ba = new BitArray(40)

      expect(ba.toSeleString()).toEqual('NONE')

      ba.set(10)
      expect(ba.toSeleString()).toEqual('@10')

      ba.set(2)
      ba.set(36)
      expect(ba.toSeleString()).toEqual('@2,10,36')
    })

    it('set all', function () {
      var ba = new BitArray(40)

      expect(ba['_words']).toEqual(new Uint32Array([ 0, 0 ]))
      expect(ba.toArray()).toEqual([])
      expect(ba.getSize()).toBe(0)

      ba.setAll()
      expect(ba['_words']).toEqual(new Uint32Array([ 0xFFFFFFFF, 0xFF ]))
      expect(ba.toArray()).toEqual([...Array(40).keys()])
      expect(ba.getSize()).toBe(40)

      ba.clearAll()
      expect(ba['_words']).toEqual(new Uint32Array([ 0, 0 ]))
      expect(ba.toArray()).toEqual([])
      expect(ba.getSize()).toBe(0)
    })

    it('set all 140', function () {
      var ba = new BitArray(140)

      expect(ba['_words']).toEqual(new Uint32Array([ 0, 0, 0, 0, 0 ]))
      expect(ba.toArray()).toEqual([])
      expect(ba.getSize()).toBe(0)

      ba.setAll()
      expect(ba['_words']).toEqual(new Uint32Array([ 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFF ]))
      expect(ba.toArray()).toEqual([...Array(140).keys()])
      expect(ba.getSize()).toBe(140)

      ba.clearAll()
      expect(ba['_words']).toEqual(new Uint32Array([ 0, 0, 0, 0, 0 ]))
      expect(ba.toArray()).toEqual([])
      expect(ba.getSize()).toBe(0)
    })

    it('clone', function () {
      var ba = new BitArray(40)
      var bac = ba.clone()
      expect(bac instanceof BitArray).toBeTruthy()
      expect(ba['_words']).toEqual(new Uint32Array(2))
      expect(ba['_words']).toEqual(bac['_words'])
      expect(ba.length).toBe(40)
      expect(bac.length).toBe(40)

      ba.setAll()
      bac = ba.clone()
      expect(bac instanceof BitArray).toBeTruthy()
      expect(ba['_words']).toEqual(new Uint32Array([ 0xFFFFFFFF, 0xFF ]))
      expect(ba['_words']).toEqual(bac['_words'])
      expect(ba.length).toBe(40)
      expect(bac.length).toBe(40)
    })

    it('union', function () {
      var ba = new BitArray(40)
      var bb = new BitArray(40)
      var bc = new BitArray(40)

      ba.set(2)
      bb.set(38)
      bc.set(2)
      bc.set(38)

      ba.union(bb)
      expect(ba instanceof BitArray).toBeTruthy()
      expect(ba['_words']).toEqual(bc['_words'])
      expect(ba.length).toBe(40)
    })

    it('difference', function () {
      var ba = new BitArray(40)
      var bb = new BitArray(40)
      var bc = new BitArray(40)
      var bd = new BitArray(40)

      ba.setAll()
      bb.set(38)
      bb.set(2)
      bc.set(2)

      ba.difference(bb)
      bc.difference(bb)
      expect(ba instanceof BitArray).toBeTruthy()
      expect(bc['_words']).toEqual(bd['_words'])
      expect(ba.getSize()).toBe(38)
    })

    it('intersects getIntersectionSize', function () {
      var ba = new BitArray(40)
      var bb = new BitArray(40)

      ba.setAll()
      bb.set(38)
      expect(ba.intersects(bb))// , 'intersection').toBeTruthy()
      expect(ba.getIntersectionSize(bb)).toBe(1)// , 'intersection size')

      ba.clear(38)
      expect(ba.intersects(bb)) //, 'no intersection').toBeFalsy()
      expect(ba.getIntersectionSize(bb)).toBe(0) //, 'intersection size is zero when there are is intersection')
      expect(ba.getSize()).toBe(39) //, 'no value change with intersects')
    })

    it('isEqualTo', function () {
      var ba = new BitArray(40)
      var bb = new BitArray(40)
      expect(ba.isEqualTo(bb)).toBeTruthy()

      ba.set(38)
      expect(ba.isEqualTo(bb)).toBeFalsy()

      bb.set(38)
      expect(ba.isEqualTo(bb)).toBeTruthy()
    })

    it('isAllClear', function () {
      var ba = new BitArray(40)
      expect(ba.isAllClear()).toBeTruthy()

      ba.set(38)
      expect(ba.isAllClear()).toBeFalsy()
    })

    it('isAllSet', function () {
      var ba = new BitArray(40)
      expect(ba.isAllSet()).toBeFalsy()

      ba.set(38)
      expect(ba.isAllSet()).toBeFalsy()

      ba.setAll()
      expect(ba.isAllSet()).toBeTruthy()
    })

    it('isRangeSet', function () {
      var ba = new BitArray(92)
      expect(ba.isRangeSet(0, 92)).toBeFalsy()
      expect(ba.getSize()).toBe(0)

      ba.setBits(1, 2, 3)
      expect(ba.isRangeSet(1, 3)).toBeTruthy()
      expect(ba.isRangeSet(0, 3)).toBeFalsy()
      expect(ba.getSize()).toBe(3)

      ba.setAll()
      expect(ba.get(91)).toBeTruthy()
      expect(ba.isRangeSet(0, 91)).toBeTruthy()
      expect(ba.getSize()).toBe(92)
    })

    it('setRange', function () {
      var ba = new BitArray(92)
      expect(ba.isRangeSet(0, 92)).toBeFalsy()
      expect(ba.getSize()).toBe(0)

      ba.setRange(1, 10)
      expect(ba.get(0)).toBeFalsy()
      expect(ba.get(1)).toBeTruthy()
      expect(ba.get(10)).toBeTruthy()
      expect(ba.get(11)).toBeFalsy()
      expect(ba.isRangeSet(1, 10)).toBeTruthy()
      expect(ba.isRangeSet(0, 10)).toBeFalsy()
      expect(ba.isRangeSet(1, 11)).toBeFalsy()
      expect(ba.isRangeSet(0, 11)).toBeFalsy()
      expect(ba.getSize()).toBe(10)
    })
  })
})
