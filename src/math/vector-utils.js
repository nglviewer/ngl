/**
 * @file Vector Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { EPS } from "../constants.js";


/**
 * Converted to JavaScript from
 * {@link http://paulbourke.net/geometry/pointlineplane/lineline.c}
 *
 * @param  {THREE.Vector3} p1
 * @param  {THREE.Vector3} p2
 * @param  {THREE.Vector3} p3
 * @param  {THREE.Vector3} p4
 * @return {Array.<THREE.Vector3, THREE.Vector3>}
 */
function lineLineIntersect( p1, p2, p3, p4 ){

    var p13 = new THREE.Vector3(),
        p43 = new THREE.Vector3(),
        p21 = new THREE.Vector3();
    var d1343, d4321, d1321, d4343, d2121;
    var denom, numer;

    p13.x = p1.x - p3.x;
    p13.y = p1.y - p3.y;
    p13.z = p1.z - p3.z;
    p43.x = p4.x - p3.x;
    p43.y = p4.y - p3.y;
    p43.z = p4.z - p3.z;
    if( Math.abs(p43.x) < EPS && Math.abs(p43.y) < EPS && Math.abs(p43.z) < EPS )
        return null;

    p21.x = p2.x - p1.x;
    p21.y = p2.y - p1.y;
    p21.z = p2.z - p1.z;
    if( Math.abs(p21.x) < EPS && Math.abs(p21.y) < EPS && Math.abs(p21.z) < EPS )
        return null;

    d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
    d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
    d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
    d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
    d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;

    denom = d2121 * d4343 - d4321 * d4321;
    if( Math.abs(denom) < EPS )
        return null;
    numer = d1343 * d4321 - d1321 * d4343;

    var mua = numer / denom;
    var mub = ( d1343 + d4321 * mua ) / d4343;

    var pa = new THREE.Vector3(
        p1.x + mua * p21.x,
        p1.y + mua * p21.y,
        p1.z + mua * p21.z
    );
    var pb = new THREE.Vector3(
        p3.x + mub * p43.x,
        p3.y + mub * p43.y,
        p3.z + mub * p43.z
    );

    return [ pa, pb ];

}


function calculateMeanVector3( array ){

    var n = array.length;
    var m = array.length / 3;

    var x = 0;
    var y = 0;
    var z = 0;

    var i;

    for( i = 0; i < n; i += 3 ){

        x += array[ i + 0 ];
        y += array[ i + 1 ];
        z += array[ i + 2 ];

    }

    return new THREE.Vector3( x / m, y / m, z / m );

}


function isPointOnSegment( p, l1, l2 ){

    var len = l1.distanceTo( l2 );

    return p.distanceTo( l1 ) <= len && p.distanceTo( l2 ) <= len;

}


var pointVectorIntersection = function(){

    var v = new THREE.Vector3();
    var v1 = new THREE.Vector3();

    return function( point, origin, vector ){

        v.copy( vector );
        v1.subVectors( point, origin );
        var distOriginI = Math.cos( v.angleTo( v1 ) ) * v1.length();
        var vectorI = v.normalize().multiplyScalar( distOriginI );
        var pointI = new THREE.Vector3().addVectors( vectorI, origin );

        return pointI;

    }

}();


export {
	lineLineIntersect,
	calculateMeanVector3,
	isPointOnSegment,
	pointVectorIntersection
};
