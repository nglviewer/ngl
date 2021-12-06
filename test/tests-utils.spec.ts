
import { uint8ToLines, binarySearchIndexOf } from '../src/utils'



function str2bin (str: string) {
  var uint = new Uint8Array(str.length)
  for (var i = 0, j = str.length; i < j; ++i) {
    uint[ i ] = str.charCodeAt(i)
  }
  return uint
}

describe('utils', function () {
  describe('uint8ToLines', function () {
    it('multiple chunks', function () {
      var str = 'moin\nfoo\nbar\ntest123\n'
      var bin = str2bin(str)
      var lines = uint8ToLines(bin, 4)
      expect(4).toBe(lines.length)
      expect([ 'moin', 'foo', 'bar', 'test123' ]).toEqual(lines)
    })

    it('newline at end', function () {
      var str = 'moin\nfoo\nbar\ntest123\n'
      var bin = str2bin(str)
      var lines = uint8ToLines(bin)
      expect(4).toBe(lines.length)
      expect([ 'moin', 'foo', 'bar', 'test123' ]).toEqual(lines)
    })

    it('no newline at end', function () {
      var str = 'moin\nfoo\nbar\ntest123'
      var bin = str2bin(str)
      var lines = uint8ToLines(bin)
      expect(4).toBe(lines.length)
      expect([ 'moin', 'foo', 'bar', 'test123' ]).toEqual(lines)
    })
  })

  describe('binarySearchIndexOf', function () {
    it('basic', function () {
      var array = [ 1, 2, 3, 4, 5, 6 ]
      var element = 4

      var result = binarySearchIndexOf(array, element)

      expect(result).toBe(3)
    })
  })
})
