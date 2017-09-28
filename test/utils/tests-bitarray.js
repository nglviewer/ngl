
import BitArray from '../../src/utils/bitarray.js'

import { assert } from 'chai'

describe('utils/bitarray', function () {
  describe('BitArray', function () {
    it('set basic', function () {
      var ba = new BitArray(40)

      assert.strictEqual(ba.get(10), false, 'after init')

      ba.set(10)
      assert.strictEqual(ba.get(10), true, 'after set')

      ba.clear(10)
      assert.strictEqual(ba.get(10), false, 'after clear')
    })

    it('is set', function () {
      var ba = new BitArray(40)

      assert.isFalse(ba.isSet(10, 33), 'after init')

      ba.set(10)
      ba.set(33)
      assert.isTrue(ba.isSet(10, 33), 'after set')
    })

    it('words', function () {
      var words = new Uint32Array(2)
      var ba = new BitArray(40)

      assert.deepEqual(ba._words, words, 'after init')

      ba.set(0)
      words[ 0 ] = 1
      assert.deepEqual(ba._words, words, 'after set')

      ba.clear(0)
      words[ 0 ] = 0
      assert.deepEqual(ba._words, words, 'after clear')

      ba.set(32)
      words[ 1 ] = 1
      assert.deepEqual(ba._words, words, 'after set')

      ba.clear(32)
      words[ 1 ] = 0
      assert.deepEqual(ba._words, words, 'after clear')
    })

    it('set edge', function () {
      var ba = new BitArray(40)

      assert.strictEqual(ba.get(39), false, 'after init')

      ba.set(39)
      assert.strictEqual(ba.get(39), true, 'after set')

      ba.clear(39)
      assert.strictEqual(ba.get(39), false, 'after clear')
    })

    it('size', function () {
      var ba = new BitArray(40)

      assert.strictEqual(ba.getSize(), 0, 'after init')

      ba.set(10)
      assert.strictEqual(ba.getSize(), 1, 'after set')

      ba.clear(10)
      assert.strictEqual(ba.getSize(), 0, 'after clear')
    })

    it('array', function () {
      var ba = new BitArray(40)

      assert.deepEqual(ba.toArray(), [], 'after init')

      ba.set(10)
      assert.deepEqual(ba.toArray(), [ 10 ], 'after set')

      ba.clear(10)
      assert.deepEqual(ba.toArray(), [], 'after clear')
    })

    it('array edge', function () {
      var ba = new BitArray(40)

      assert.deepEqual(ba.toArray(), [], 'after init')

      ba.set(39)
      assert.deepEqual(ba.toArray(), [ 39 ], 'after set')

      ba.clear(39)
      assert.deepEqual(ba.toArray(), [], 'after clear')
    })

    it('for each', function () {
      var result = []
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
      assert.deepEqual(result, expected, 'results')
    })

    it('string', function () {
      var ba = new BitArray(40)

      assert.deepEqual(ba.toString(), '{}', 'after init')

      ba.set(9)
      assert.deepEqual(ba.toString(), '{9}', 'after set')

      ba.set(2)
      ba.set(33)
      assert.deepEqual(ba.toString(), '{2,9,33}', 'after more sets')
    })

    it('sele string', function () {
      var ba = new BitArray(40)

      assert.deepEqual(ba.toSeleString(), 'NONE', 'after init')

      ba.set(10)
      assert.deepEqual(ba.toSeleString(), '@10', 'after set')

      ba.set(2)
      ba.set(36)
      assert.deepEqual(ba.toSeleString(), '@2,10,36', 'after more sets')
    })

    it('set all', function () {
      var ba = new BitArray(40)

      assert.deepEqual(ba._words, new Uint32Array([ 0, 0 ]), 'after init')
      assert.deepEqual(ba.toArray(), [], 'after init')
      assert.strictEqual(ba.getSize(), 0, 'after init')

      ba.setAll()
      assert.deepEqual(ba._words, new Uint32Array([ 0xFFFFFFFF, 0xFF ]), 'after set')
      assert.deepEqual(ba.toArray(), [...Array(40).keys()], 'after set')
      assert.strictEqual(ba.getSize(), 40, 'after set')

      ba.clearAll()
      assert.deepEqual(ba._words, new Uint32Array([ 0, 0 ]), 'after clear')
      assert.deepEqual(ba.toArray(), [], 'after clear')
      assert.strictEqual(ba.getSize(), 0, 'after clear')
    })

    it('set all 140', function () {
      var ba = new BitArray(140)

      assert.deepEqual(ba._words, new Uint32Array([ 0, 0, 0, 0, 0 ]), 'after init')
      assert.deepEqual(ba.toArray(), [], 'after init')
      assert.strictEqual(ba.getSize(), 0, 'after init')

      ba.setAll()
      assert.deepEqual(ba._words, new Uint32Array([ 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFF ]), 'after set')
      assert.deepEqual(ba.toArray(), [...Array(140).keys()], 'after set')
      assert.strictEqual(ba.getSize(), 140, 'after set')

      ba.clearAll()
      assert.deepEqual(ba._words, new Uint32Array([ 0, 0, 0, 0, 0 ]), 'after clear')
      assert.deepEqual(ba.toArray(), [], 'after clear')
      assert.strictEqual(ba.getSize(), 0, 'after clear')
    })

    it('clone', function () {
      var ba = new BitArray(40)
      var bac = ba.clone()
      assert.isTrue(bac instanceof BitArray, 'after init')
      assert.deepEqual(ba._words, new Uint32Array(2), 'after init')
      assert.deepEqual(ba._words, bac._words, 'after init')
      assert.strictEqual(ba.length, 40, 'after init')
      assert.strictEqual(bac.length, 40, 'after init')

      ba.setAll()
      bac = ba.clone()
      assert.isTrue(bac instanceof BitArray, 'after set')
      assert.deepEqual(ba._words, new Uint32Array([ 0xFFFFFFFF, 0xFF ]), 'after set')
      assert.deepEqual(ba._words, bac._words, 'after set')
      assert.strictEqual(ba.length, 40, 'after set')
      assert.strictEqual(bac.length, 40, 'after set')
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
      assert.isTrue(ba instanceof BitArray, 'after union')
      assert.deepEqual(ba._words, bc._words, 'after union')
      assert.strictEqual(ba.length, 40, 'after union')
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
      assert.isTrue(ba instanceof BitArray, 'after difference')
      assert.deepEqual(bc._words, bd._words, 'after difference')
      assert.strictEqual(ba.getSize(), 38, 'after difference')
    })

    it('intersects getIntersectionSize', function () {
      var ba = new BitArray(40)
      var bb = new BitArray(40)

      ba.setAll()
      bb.set(38)
      assert.isTrue(ba.intersects(bb), 'intersection')
      assert.strictEqual(ba.getIntersectionSize(bb), 1, 'intersection size')

      ba.clear(38)
      assert.isFalse(ba.intersects(bb), 'no intersection')
      assert.strictEqual(ba.getIntersectionSize(bb), 0, 'intersection size is zero when there are is intersection')
      assert.strictEqual(ba.getSize(), 39, 'no value change with intersects')
    })

    it('isEqualTo', function () {
      var ba = new BitArray(40)
      var bb = new BitArray(40)
      assert.isTrue(ba.isEqualTo(bb), 'equals')

      ba.set(38)
      assert.isFalse(ba.isEqualTo(bb), "doesn't equal")

      bb.set(38)
      assert.isTrue(ba.isEqualTo(bb), 'equals')
    })

    it('isAllClear', function () {
      var ba = new BitArray(40)
      assert.isTrue(ba.isAllClear(), 'is empty')

      ba.set(38)
      assert.isFalse(ba.isAllClear(), 'is not empty')
    })

    it('isAllSet', function () {
      var ba = new BitArray(40)
      assert.isFalse(ba.isAllSet(), 'is not all set (empty bitarray)')

      ba.set(38)
      assert.isFalse(ba.isAllSet(), 'is not all set (sparse bitarray)')

      ba.setAll()
      assert.isTrue(ba.isAllSet(), 'is all set')
    })

    it('isRangeSet', function () {
      var ba = new BitArray(92)
      assert.isFalse(ba.isRangeSet(0, 92), 'before set')
      assert.strictEqual(ba.getSize(), 0, 'after set')

      ba.setBits(1, 2, 3)
      assert.isTrue(ba.isRangeSet(1, 3), 'after set')
      assert.isFalse(ba.isRangeSet(0, 3), 'after set')
      assert.strictEqual(ba.getSize(), 3, 'after set')

      ba.setAll()
      assert.isTrue(ba.get(91), 'after set')
      assert.isTrue(ba.isRangeSet(0, 91), 'after set')
      assert.strictEqual(ba.getSize(), 92, 'after set')
    })

    it('setRange', function () {
      var ba = new BitArray(92)
      assert.isFalse(ba.isRangeSet(0, 92), 'before set')
      assert.strictEqual(ba.getSize(), 0, 'after set')

      ba.setRange(1, 10)
      assert.isFalse(ba.get(0), 'after set - index 0 should be false')
      assert.isTrue(ba.get(1), 'after set - index 1 should be true')
      assert.isTrue(ba.get(10), 'after set - index 10 should be true')
      assert.isFalse(ba.get(11), 'after set - index 11 should be false')
      assert.isTrue(ba.isRangeSet(1, 10), 'after set')
      assert.isFalse(ba.isRangeSet(0, 10), 'after set')
      assert.isFalse(ba.isRangeSet(1, 11), 'after set')
      assert.isFalse(ba.isRangeSet(0, 11), 'after set')
      assert.strictEqual(ba.getSize(), 10, 'after set')
    })
  })
})
