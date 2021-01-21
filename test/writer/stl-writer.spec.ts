import StlWriter from '../../src/writer/stl-writer'

describe('writer/stl-writer', function () {
  describe('writing', function () {
    it('getData', function () {
      const surf = {
        normal: [0, 0, 1, 0, 0, 1, 0, 0, 1],
        index: [0, 1, 2],
        position: [0, 0, 0, 0, 1, 0, 0, 0, 1]
      }
      const stl = new StlWriter(surf as any)
      const dataView = stl.getData()
      expect(dataView.byteLength).toEqual(80 + 4 + 12 + 36 + 2)  // byte length
      expect(dataView.getUint32(80, true)).toEqual(1) // triangles count
      expect(dataView.getFloat32(80 + 4 + 12, true)).toEqual(0) // 1st vertex x
      expect(dataView.getUint16(80 + 4 + 48, true)).toEqual(0) // attribute byte count
    })
  })
})
