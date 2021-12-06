
import { computeVertexNormals } from '../../src/surface/surface-utils'



describe('surface/surface-utils', function () {
  describe('computeVertexNormals', function () {
    it('position, no index, no normal', function () {
      var position = new Float32Array([ 1, 1, 1, 2, 1, 2, 3, 1, 1 ])
      var normal = computeVertexNormals(position)
      var expected = new Float32Array([ 0, 1, 0, 0, 1, 0, 0, 1, 0 ])
      expect(normal).toEqual(expected)
    })

    it('position, index, no normal', function () {
      var position = new Float32Array([ 1, 1, 1, 2, 1, 2, 3, 1, 1 ])
      var index = new Uint32Array([ 0, 1, 2 ])
      var normal = computeVertexNormals(position, index)
      var expected = new Float32Array([ 0, 1, 0, 0, 1, 0, 0, 1, 0 ])
      expect(normal).toEqual(expected)
    })

    it('position, index, normal', function () {
      var position = new Float32Array([ 1, 1, 1, 2, 1, 2, 3, 1, 1 ])
      var index = new Uint32Array([ 0, 1, 2 ])
      var normal = new Float32Array(position.length)
      computeVertexNormals(position, index, normal)
      var expected = new Float32Array([ 0, 1, 0, 0, 1, 0, 0, 1, 0 ])
      expect(normal).toEqual(expected)
    })

    it('position, no index, normal', function () {
      var position = new Float32Array([ 1, 1, 1, 2, 1, 2, 3, 1, 1 ])
      var normal = new Float32Array(position.length)
      computeVertexNormals(position, undefined, normal)
      var expected = new Float32Array([ 0, 1, 0, 0, 1, 0, 0, 1, 0 ])
      expect(normal).toEqual(expected)
    })
  })
})
