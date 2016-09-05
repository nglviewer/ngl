
import Kdtree from "../../src/utils/kdtree.js";

import { assert } from 'chai';


describe('utils/kdtree', function() {


describe('Kdtree', function () {
    it('basic', function () {

        var points = [
            3, 0, 5,
            9, 2, 1,
            7, 6, 0,
            1, 1, 1,
            3, 5, 7
        ];

        var metric = function( a, b ){
            var dx = a[0] - b[0];
            var dy = a[1] - b[1];
            var dz = a[2] - b[2];
            return Math.sqrt( dx*dx + dy*dy + dz*dz );
        };

        var kdtree = new Kdtree( points, metric )
        assert.strictEqual(
            kdtree.verify(),
            points.length / 3,
            "kdtree verified"
        )

        var check = function( search, expected ){
            var result = kdtree.nearest( search, 3, 1 )[ 0 ];
            var nodeIndex = result[ 0 ];
            var pointIndex = kdtree.indices[ kdtree.nodes[ nodeIndex ] ] * 3;
            assert.deepEqual(
                [ points[ pointIndex ], points[ pointIndex + 1 ], points[ pointIndex + 2 ] ],
                expected,
                "kdtree nearest search passed"
            );
        }
        check( [ 1, 1, 2 ], [ 1, 1, 1 ] );
        check( [ 3, 0, 5 ], [ 3, 0, 5 ] );
        check( [ 9, 2, 1 ], [ 9, 2, 1 ] );
        check( [ 7, 6, 0 ], [ 7, 6, 0 ] );
        check( [ 3, 5, 7 ], [ 3, 5, 7 ] );

    });
});


});
