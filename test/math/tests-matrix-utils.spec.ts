
import { Matrix, svd } from '../../src/math/matrix-utils'



describe('math/matrix-utils', function () {
  describe('Matrix', function () {
    it('initialization', function () {
      var m = new Matrix(5, 10)
      expect(5).toBe(m.cols)
      expect(10).toBe(m.rows)
      expect(5 * 10).toBe(m.size)
    })
  })

  describe('svd', function () {
    it('decomposition', function () {
      // http://web.mit.edu/be.400/www/SVD/Singular_Value_Decomposition.htm

      var mRows = 4
      var nCols = 2

      var A = new Matrix(nCols, mRows)
      A.data.set([
        2, 4,
        1, 3,
        0, 0,
        0, 0
      ])

      // console.log( "A", A.data );

      var W = new Matrix(1, nCols)
      var U = new Matrix(mRows, mRows)
      var V = new Matrix(nCols, nCols)

      svd(A, W, U, V)

      // FIXME see below
      // var Ux = [ 0.82, -0.58,  0, 0,
      //            0.58,  0.82,  0, 0,
      //            0,     0,     1, 0,
      //            0,     0,     0, 1 ];

      var Vx = [ 0.40, -0.91,
        0.91, 0.40 ]

      var Sx = [ 5.47, 0,
        0, 0.37,
        0, 0,
        0, 0 ]

      // console.log( "U", U.data, Ux );

      // assert.equal( U.data, Ux, "Passed!" );

      // FIXME example data for U not the same, not sure way (AR)
      // expect( U.data[0]).toBeCloseTo(Ux[0], 2 );
      // expect( U.data[1]).toBeCloseTo(Ux[1], 2 );
      // expect( U.data[2]).toBeCloseTo(Ux[2], 2 );
      // expect( U.data[3]).toBeCloseTo(Ux[3], 2 );

      expect(W.data[0]).toBeCloseTo(Sx[0], 1.5)
      expect(W.data[1]).toBeCloseTo(Sx[3], 1.5)

      expect(V.data[0]).toBeCloseTo(Vx[0], 1.5)
      expect(V.data[1]).toBeCloseTo(Vx[1], 1.5)
      expect(V.data[2]).toBeCloseTo(Vx[2], 1.5)
      expect(V.data[3]).toBeCloseTo(Vx[3], 1.5)
    })
  })
})
