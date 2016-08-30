/**
 * @file Kdtree
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";

import { Debug, Log } from "../globals.js";
import _Kdtree from "../utils/kdtree.js";


function Kdtree( entity, useSquaredDist ){

    if( Debug ) Log.time( "Kdtree build" );

    var metric;

    if( useSquaredDist ){

        metric = function( a, b ){
            var dx = a[0] - b[0];
            var dy = a[1] - b[1];
            var dz = a[2] - b[2];
            return dx*dx + dy*dy + dz*dz;
        };

    }else{

        metric = function( a, b ){
            var dx = a[0] - b[0];
            var dy = a[1] - b[1];
            var dz = a[2] - b[2];
            return Math.sqrt( dx*dx + dy*dy + dz*dz );
        };

    }

    var points = new Float32Array( entity.atomCount * 3 );
    var atomIndices = new Uint32Array( entity.atomCount );
    var i = 0;

    entity.eachAtom( function( ap ){
        points[ i + 0 ] = ap.x;
        points[ i + 1 ] = ap.y;
        points[ i + 2 ] = ap.z;
        atomIndices[ i / 3 ] = ap.index;
        i += 3;
    } );

    this.atomIndices = atomIndices;
    this.points = points;
    this.kdtree = new _Kdtree( points, metric );

    if( Debug ) Log.timeEnd( "Kdtree build" );

    // console.log("this.kdtree.verify()", this.kdtree.verify())

}

Kdtree.prototype = {

    nearest: function(){

        var pointArray = new Float32Array( 3 );

        return function nearest( point, maxNodes, maxDistance ){

            // Log.time( "Kdtree nearest" );

            if( point instanceof Vector3 ){
                point.toArray( pointArray );
            }else if( point.type === "AtomProxy" ){
                point.positionToArray( pointArray );
            }

            var nodeList = this.kdtree.nearest(
                pointArray, maxNodes, maxDistance
            );

            var indices = this.kdtree.indices;
            var nodes = this.kdtree.nodes;
            var atomIndices = this.atomIndices;
            var resultList = [];

            for( var i = 0, n = nodeList.length; i < n; ++i ){

                var d = nodeList[ i ];
                var nodeIndex = d[ 0 ];
                var dist = d[ 1 ];

                resultList.push( {
                    index: atomIndices[ indices[ nodes[ nodeIndex ] ] ],
                    distance: dist
                } );

            }

            // Log.timeEnd( "Kdtree nearest" );

            return resultList;

        };

    }()

};


export default Kdtree;
