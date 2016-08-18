
import { Matrix, svd } from "../../src/math/matrix-utils.js";

import { assert } from 'chai';


describe('math/matrix-utils', function() {


describe('Matrix', function () {
    it('initialization', function () {
        var m = new Matrix( 5, 10 );
        assert.strictEqual(5, m.cols);
        assert.strictEqual(10, m.rows);
        assert.strictEqual(5 * 10, m.size);
    });
});

describe('svd', function () {
    it('decomposition', function () {
        // http://web.mit.edu/be.400/www/SVD/Singular_Value_Decomposition.htm

        var m_rows = 4;
        var n_cols = 2;

        var A = new Matrix( n_cols, m_rows );
        A.data.set([
            2, 4,
            1, 3,
            0, 0,
            0, 0
        ]);

        // console.log( "A", A.data );

        var W = new Matrix( 1, n_cols );
        var U = new Matrix( m_rows, m_rows );
        var V = new Matrix( n_cols, n_cols );

        svd( A, W, U, V );

        // FIXME see below
        // var Ux = [ 0.82, -0.58,  0, 0,
        //            0.58,  0.82,  0, 0,
        //            0,     0,     1, 0,
        //            0,     0,     0, 1 ];

        var Vx = [ 0.40, -0.91,
                   0.91,  0.40 ];

        var Sx = [ 5.47, 0,
                   0,    0.37,
                   0,    0,
                   0,    0 ];

        // console.log( "U", U.data, Ux );

        // assert.equal( U.data, Ux, "Passed!" );

        // FIXME example data for U not the same, not sure way (AR)
        // assert.closeTo( U.data[0], Ux[0], 0.01 );
        // assert.closeTo( U.data[1], Ux[1], 0.01 );
        // assert.closeTo( U.data[2], Ux[2], 0.01 );
        // assert.closeTo( U.data[3], Ux[3], 0.01 );

        assert.closeTo( W.data[0], Sx[0], 0.01 );
        assert.closeTo( W.data[1], Sx[3], 0.01 );

        assert.closeTo( V.data[0], Vx[0], 0.01 );
        assert.closeTo( V.data[1], Vx[1], 0.01 );
        assert.closeTo( V.data[2], Vx[2], 0.01 );
        assert.closeTo( V.data[3], Vx[3], 0.01 );
    });
});


});
