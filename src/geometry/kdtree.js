/**
 * @file Kdtree
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Debug, Log } from "../globals.js";


function Kdtree( entity, useSquaredDist ){

    if( Debug ) Log.time( "Kdtree build" );

    if( useSquaredDist ){

        var metric = function( a, b ){
            var dx = a[0] - b[0];
            var dy = a[1] - b[1];
            var dz = a[2] - b[2];
            return dx*dx + dy*dy + dz*dz;
        };

    }else{

        var metric = function( a, b ){
            var dx = a[0] - b[0];
            var dy = a[1] - b[1];
            var dz = a[2] - b[2];
            return Math.sqrt( dx*dx + dy*dy + dz*dz );
        };

    }

    var points = new Float32Array( entity.atomCount * 4 );
    var i = 0;

    var eachFnName = entity.eachSelectedAtom ? "eachSelectedAtom" : "eachAtom";

    entity[ eachFnName ]( function( ap ){
        points[ i + 0 ] = ap.x;
        points[ i + 1 ] = ap.y;
        points[ i + 2 ] = ap.z;
        points[ i + 3 ] = ap.index;
        i += 4;
    } );

    this.points = points;
    this.kdtree = new THREE.TypedArrayUtils.Kdtree( points, metric, 4, 3 );

    if( Debug ) Log.timeEnd( "Kdtree build" );

}

Kdtree.prototype = {

    nearest: function(){

        var pointArray = new Float32Array( 3 );

        return function( point, maxNodes, maxDistance ){

            // Log.time( "Kdtree nearest" );

            if( point instanceof THREE.Vector3 ){

                point.toArray( pointArray );

            }else if( point.type === "AtomProxy" ){

                point.positionToArray( pointArray );

            }

            var nodeList = this.kdtree.nearest(
                pointArray, maxNodes, maxDistance
            );

            var points = this.points;
            var resultList = [];

            for( var i = 0, n = nodeList.length; i < n; ++i ){

                var d = nodeList[ i ];
                var node = d[ 0 ];
                var dist = d[ 1 ];

                resultList.push( {
                    index: points[ node.pos + 3 ],
                    distance: dist
                } );

            }

            // Log.timeEnd( "Kdtree nearest" );

            return resultList;

        };

    }()

};


export default Kdtree;
