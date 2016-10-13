/**
 * @file Spline
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";

import { ColorMakerRegistry } from "../globals.js";
import RadiusFactory from "../utils/radius-factory.js";
import { copyArray } from "../math/array-utils.js";


function Interpolator( m, tension ){

    var dt = 1.0 / m;
    var delta = 0.0001;

    var vec1 = new Vector3();
    var vec2 = new Vector3();

    function interpolate( p0, p1, p2, p3, t ) {
        var v0 = ( p2 - p0 ) * tension;
        var v1 = ( p3 - p1 ) * tension;
        var t2 = t * t;
        var t3 = t * t2;
        return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 +
               ( -3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 +
               v0 * t + p1;
    }

    function interpolateToArr( v0, v1, v2, v3, t, arr, offset ){
        arr[ offset + 0 ] = interpolate( v0.x, v1.x, v2.x, v3.x, t );
        arr[ offset + 1 ] = interpolate( v0.y, v1.y, v2.y, v3.y, t );
        arr[ offset + 2 ] = interpolate( v0.z, v1.z, v2.z, v3.z, t );
    }

    function interpolateToVec( v0, v1, v2, v3, t, vec ){
        vec.x = interpolate( v0.x, v1.x, v2.x, v3.x, t );
        vec.y = interpolate( v0.y, v1.y, v2.y, v3.y, t );
        vec.z = interpolate( v0.z, v1.z, v2.z, v3.z, t );
    }

    function interpolatePosition( v0, v1, v2, v3, pos, offset ){
        for( var j = 0; j < m; ++j ){
            var l = offset + j * 3;
            var d = dt * j;
            interpolateToArr( v0, v1, v2, v3, d, pos, l );
        }
    }

    function interpolateTangent( v0, v1, v2, v3, tan, offset ){
        for( var j = 0; j < m; ++j ){
            var d = dt * j;
            var d1 = d - delta;
            var d2 = d + delta;
            var l = offset + j * 3;
            // capping as a precation
            if ( d1 < 0 ) d1 = 0;
            if ( d2 > 1 ) d2 = 1;
            //
            interpolateToVec( v0, v1, v2, v3, d1, vec1 );
            interpolateToVec( v0, v1, v2, v3, d2, vec2 );
            //
            vec2.sub( vec1 ).normalize();
            vec2.toArray( tan, l );
        }
    }

    function vectorSubdivide( interpolationFn, iterator, array, offset, isCyclic ){
        var v0;
        var v1 = iterator.next();
        var v2 = iterator.next();
        var v3 = iterator.next();
        //
        var n = iterator.size;
        var n1 = n - 1;
        var k = offset || 0;
        for( var i = 0; i < n1; ++i ){
            v0 = v1;
            v1 = v2;
            v2 = v3;
            v3 = iterator.next();
            interpolationFn( v0, v1, v2, v3, array, k );
            k += 3 * m;
        }
        if( isCyclic ){
            v0 = iterator.get( n - 2 );
            v1 = iterator.get( n - 1 );
            v2 = iterator.get( 0 );
            v3 = iterator.get( 1 );
            interpolationFn( v0, v1, v2, v3, array, k );
            k += 3 * m;
        }
    }

    //

    this.getPosition = function( iterator, array, offset, isCyclic ){
        iterator.reset();
        vectorSubdivide(
            interpolatePosition, iterator, array, offset, isCyclic
        );
        var n1 = iterator.size - 1;
        var k = n1 * m * 3;
        if( isCyclic ) k += m * 3;
        var v = iterator.get( isCyclic ? 0 : n1 );
        array[ k     ] = v.x;
        array[ k + 1 ] = v.y;
        array[ k + 2 ] = v.z;
    };

    this.getTangent = function( iterator, array, offset, isCyclic ){
        iterator.reset();
        vectorSubdivide(
            interpolateTangent, iterator, array, offset, isCyclic
        );
        var n1 = iterator.size - 1;
        var k = n1 * m * 3;
        if( isCyclic ) k += m * 3;
        copyArray( array, array, k - 3, k, 3 );
    };

    //

    var vDir = new Vector3();
    var vTan = new Vector3();
    var vNorm = new Vector3();
    var vBin = new Vector3();

    var m2 = Math.ceil( m / 2 );

    function interpolateNormalDir( u0, u1, u2, u3, v0, v1, v2, v3, tan, norm, bin, offset, shift ){
        for( var j = 0; j < m; ++j ){
            var l = offset + j * 3;
            if( shift ) l += m2 * 3;
            var d = dt * j;
            interpolateToVec( u0, u1, u2, u3, d, vec1 );
            interpolateToVec( v0, v1, v2, v3, d, vec2 );
            vDir.subVectors( vec2, vec1 ).normalize();
            vTan.fromArray( tan, l );
            vBin.crossVectors( vDir, vTan ).normalize();
            vBin.toArray( bin, l );
            vNorm.crossVectors( vTan, vBin ).normalize();
            vNorm.toArray( norm, l );
        }
    }

    function interpolateNormal( vDir, tan, norm, bin, offset ){
        for( var j = 0; j < m; ++j ){
            var l = offset + j * 3;
            vDir.copy( vNorm );
            vTan.fromArray( tan, l );
            vBin.crossVectors( vDir, vTan ).normalize();
            vBin.toArray( bin, l );
            vNorm.crossVectors( vTan, vBin ).normalize();
            vNorm.toArray( norm, l );
        }
    }

    this.getNormal = function( size, tan, norm, bin, offset, isCyclic ){
        vNorm.set( 0, 0, 1 );
        var n = size;
        var n1 = n - 1;
        var k = offset || 0;
        for( var i = 0; i < n1; ++i ){
            interpolateNormal( vDir, tan, norm, bin, k );
            k += 3 * m;
        }
        if( isCyclic ){
            interpolateNormal( vDir, tan, norm, bin, k );
            k += 3 * m;
        }
        vBin.toArray( bin, k );
        vNorm.toArray( norm, k );
    };

    this.getNormalDir = function( iterDir1, iterDir2, tan, norm, bin, offset, isCyclic, shift ){
        iterDir1.reset();
        iterDir2.reset();
        //
        var vSub1 = new Vector3();
        var vSub2 = new Vector3();
        var vSub3 = new Vector3();
        var vSub4 = new Vector3();
        //
        var d1v1 = new Vector3();
        var d1v2 = new Vector3().copy( iterDir1.next() );
        var d1v3 = new Vector3().copy( iterDir1.next() );
        var d1v4 = new Vector3().copy( iterDir1.next() );
        var d2v1 = new Vector3();
        var d2v2 = new Vector3().copy( iterDir2.next() );
        var d2v3 = new Vector3().copy( iterDir2.next() );
        var d2v4 = new Vector3().copy( iterDir2.next() );
        //
        vNorm.set( 0, 0, 1 );
        var n = iterDir1.size;
        var n1 = n - 1;
        var k = offset || 0;
        for( var i = 0; i < n1; ++i ){
            d1v1.copy( d1v2 );
            d1v2.copy( d1v3 );
            d1v3.copy( d1v4 );
            d1v4.copy( iterDir1.next() );
            d2v1.copy( d2v2 );
            d2v2.copy( d2v3 );
            d2v3.copy( d2v4 );
            d2v4.copy( iterDir2.next() );
            //
            if( i === 0 ){
                vSub1.subVectors( d2v1, d1v1 );
                vSub2.subVectors( d2v2, d1v2 );
                if( vSub1.dot( vSub2 ) < 0 ){
                    vSub2.multiplyScalar( -1 );
                    d2v2.addVectors( d1v2, vSub2 );
                }
                vSub3.subVectors( d2v3, d1v3 );
                if( vSub2.dot( vSub3 ) < 0 ){
                    vSub3.multiplyScalar( -1 );
                    d2v3.addVectors( d1v3, vSub3 );
                }
            }else{
                vSub3.copy( vSub4 );
            }
            vSub4.subVectors( d2v4, d1v4 );
            if( vSub3.dot( vSub4 ) < 0 ){
                vSub4.multiplyScalar( -1 );
                d2v4.addVectors( d1v4, vSub4 );
            }
            interpolateNormalDir(
                d1v1, d1v2, d1v3, d1v4,
                d2v1, d2v2, d2v3, d2v4,
                tan, norm, bin, k, shift
            );
            k += 3 * m;
        }
        if( isCyclic ){
            d1v1.copy( iterDir1.get( n - 2 ) );
            d1v2.copy( iterDir1.get( n - 1 ) );
            d1v3.copy( iterDir1.get( 0 ) );
            d1v4.copy( iterDir1.get( 1 ) );
            d2v1.copy( iterDir2.get( n - 2 ) );
            d2v2.copy( iterDir2.get( n - 1 ) );
            d2v3.copy( iterDir2.get( 0 ) );
            d2v4.copy( iterDir2.get( 1 ) );
            //
            vSub3.copy( vSub4 );
            vSub4.subVectors( d2v4, d1v4 );
            if( vSub3.dot( vSub4 ) < 0 ){
                vSub4.multiplyScalar( -1 );
                d2v4.addVectors( d1v4, vSub4 );
            }
            interpolateNormalDir(
                d1v1, d1v2, d1v3, d1v4,
                d2v1, d2v2, d2v3, d2v4,
                tan, norm, bin, k, shift
            );
            k += 3 * m;
        }
        if( shift ){
            // FIXME shift requires data from one more preceeding residue
            vBin.fromArray( bin, m2 * 3 );
            vNorm.fromArray( norm, m2 * 3 );
            for( var j = 0; j < m2; ++j ){
                vBin.toArray( bin, j * 3 );
                vNorm.toArray( norm, j * 3 );
            }
        }else{
            vBin.toArray( bin, k );
            vNorm.toArray( norm, k );
        }
    };

    //

    function interpolateColor( item1, item2, colFn, pcolFn, col, pcol, offset ){
        var j, l;
        for( j = 0; j < m2; ++j ){
            l = offset + j * 3;
            colFn( item1, col, l );  // itemColorToArray
            pcolFn( item1, pcol, l );  // itemPickingColorToArray
        }
        for( j = m2; j < m; ++j ){
            l = offset + j * 3;
            colFn( item2, col, l );  // itemColorToArray
            pcolFn( item2, pcol, l );  // itemPickingColorToArray
        }
    }

    this.getColor = function( iterator, colFn, pcolFn, col, pcol, offset, isCyclic ){
        iterator.reset();
        var i0 = iterator.next();  // first element not needed, replaced in the loop
        var i1 = iterator.next();
        //
        var n = iterator.size;
        var n1 = n - 1;
        var k = offset || 0;
        for( var i = 0; i < n1; ++i ){
            i0 = i1;
            i1 = iterator.next();
            interpolateColor( i0, i1, colFn, pcolFn, col, pcol, k );
            k += 3 * m;
        }
        if( isCyclic ){
            i0 = iterator.get( n - 1 );
            i1 = iterator.get( 0 );
            interpolateColor( i0, i1, colFn, pcolFn, col, pcol, k );
            k += 3 * m;
        }
        //
        col[ k     ] = col[ k - 3 ];
        col[ k + 1 ] = col[ k - 2 ];
        col[ k + 2 ] = col[ k - 1 ];
        pcol[ k     ] = pcol[ k - 3 ];
        pcol[ k + 1 ] = pcol[ k - 2 ];
        pcol[ k + 2 ] = pcol[ k - 1 ];
    };

    //

    function interpolateSize( item1, item2, sizeFn, size, offset ){
        var s1 = sizeFn( item1 );
        var s2 = sizeFn( item2 );
        for( var j = 0; j < m; ++j ){
            // linear interpolation
            var t = j / m;
            size[ offset + j ] = ( 1 - t ) * s1 + t * s2;
        }
    }

    this.getSize = function( iterator, sizeFn, size, offset, isCyclic ){
        iterator.reset();
        var i0 = iterator.next();  // first element not needed, replaced in the loop
        var i1 = iterator.next();
        //
        var n = iterator.size;
        var n1 = n - 1;
        var k = offset || 0;
        for( var i = 0; i < n1; ++i ){
            i0 = i1;
            i1 = iterator.next();
            interpolateSize( i0, i1, sizeFn, size, k );
            k += m;
        }
        if( isCyclic ){
            i0 = iterator.get( n - 1 );
            i1 = iterator.get( 0 );
            interpolateSize( i0, i1, sizeFn, size, k );
            k += m;
        }
        //
        size[ k ] = size[ k - 1 ];
    };

}


function Spline( polymer, params ){

    this.polymer = polymer;
    this.size = polymer.residueCount;

    var p = params || {};
    this.directional = p.directional || false;
    this.positionIterator = p.positionIterator || false;
    this.subdiv = p.subdiv || 1;
    this.smoothSheet = p.smoothSheet || false;

    if( isNaN( p.tension ) ){
        this.tension = this.polymer.isNucleic() ? 0.5 : 0.9;
    }else{
        this.tension = p.tension || 0.5;
    }

    this.interpolator = new Interpolator( this.subdiv, this.tension );

}

Spline.prototype = {

    constructor: Spline,

    getAtomIterator: function( type, smooth ){

        var polymer = this.polymer;
        var structure = polymer.structure;
        var n = polymer.residueCount;

        var i = 0;
        var j = -1;

        var cache = [
            structure.getAtomProxy(),
            structure.getAtomProxy(),
            structure.getAtomProxy(),
            structure.getAtomProxy()
        ];

        var cache2 = [
            new Vector3(),
            new Vector3(),
            new Vector3(),
            new Vector3()
        ];

        function next(){
            var atomProxy = this.get( j );
            j += 1;
            return atomProxy;
        }

        var apPrev = structure.getAtomProxy();
        var apNext = structure.getAtomProxy();

        function get( idx ){
            var atomProxy = cache[ i % 4 ];
            atomProxy.index = polymer.getAtomIndexByType( idx, type );
            if( smooth && idx > 0 && idx < n && atomProxy.sstruc === "e" ){
                var vec = cache2[ i % 4 ];
                apPrev.index = polymer.getAtomIndexByType( idx + 1, type );
                apNext.index = polymer.getAtomIndexByType( idx - 1, type );
                vec.addVectors( apPrev, apNext )
                    .add( atomProxy ).add( atomProxy )
                    .multiplyScalar( 0.25 );
                i += 1;
                return vec;
            }
            i += 1;
            return atomProxy;
        }

        function reset(){
            i = 0;
            j = -1;
        }

        return {
            size: n,
            next: next,
            get: get,
            reset: reset
        };

    },

    getSubdividedColor: function( params ){

        var m = this.subdiv;
        var polymer = this.polymer;
        var n = polymer.residueCount;
        var n1 = n - 1;
        var nCol = n1 * m * 3 + 3;
        if( polymer.isCyclic ) nCol += m * 3;

        var col = new Float32Array( nCol );
        var pcol = new Float32Array( nCol );
        var iterator = this.getAtomIterator( "trace" );

        var p = params || {};
        p.structure = polymer.structure;

        var colorMaker = ColorMakerRegistry.getScheme( p );
        var pickingColorMaker = ColorMakerRegistry.getPickingScheme( p );

        function colFn( item, array, offset ){
            colorMaker.atomColorToArray( item, array, offset );
        }

        function pcolFn( item, array, offset ){
            pickingColorMaker.atomColorToArray( item, array, offset );
        }

        this.interpolator.getColor(
            iterator, colFn, pcolFn, col, pcol, 0, polymer.isCyclic
        );

        return {
            "color": col,
            "pickingColor": pcol
        };

    },

    getSubdividedPosition: function(){

        var pos = this.getPosition();

        return {
            "position": pos
        };

    },

    getSubdividedOrientation: function(){

        var tan = this.getTangent();
        var normals = this.getNormals( tan );

        return {
            "tangent": tan,
            "normal": normals.normal,
            "binormal": normals.binormal
        };

    },

    getSubdividedSize: function( type, scale ){

        var m = this.subdiv;
        var polymer = this.polymer;
        var n = polymer.residueCount;
        var n1 = n - 1;
        var nSize = n1 * m + 1;
        if( polymer.isCyclic ) nSize += m;

        var size = new Float32Array( nSize );
        var iterator = this.getAtomIterator( "trace" );

        var radiusFactory = new RadiusFactory( type, scale );

        function sizeFn( item ){
            return radiusFactory.atomRadius( item );
        }

        this.interpolator.getSize(
            iterator, sizeFn, size, 0, polymer.isCyclic
        );

        return {
            "size": size
        };

    },

    getPosition: function(){

        var m = this.subdiv;
        var polymer = this.polymer;
        var n = polymer.residueCount;
        var n1 = n - 1;
        var nPos = n1 * m * 3 + 3;
        if( polymer.isCyclic ) nPos += m * 3;

        var pos = new Float32Array( nPos );
        var iterator = this.positionIterator || this.getAtomIterator( "trace", this.smoothSheet );

        this.interpolator.getPosition(
            iterator, pos, 0, polymer.isCyclic
        );

        return pos;

    },

    getTangent: function(){

        var m = this.subdiv;
        var polymer = this.polymer;
        var n = this.size;
        var n1 = n - 1;
        var nTan = n1 * m * 3 + 3;
        if( polymer.isCyclic ) nTan += m * 3;

        var tan = new Float32Array( nTan );
        var iterator = this.positionIterator || this.getAtomIterator( "trace", this.smoothSheet );

        this.interpolator.getTangent(
            iterator, tan, 0, polymer.isCyclic
        );

        return tan;

    },

    getNormals: function( tan ){

        var m = this.subdiv;
        var polymer = this.polymer;
        var isProtein = polymer.isProtein();
        var n = this.size;
        var n1 = n - 1;
        var nNorm = n1 * m * 3 + 3;
        if( polymer.isCyclic ) nNorm += m * 3;

        var norm = new Float32Array( nNorm );
        var bin = new Float32Array( nNorm );

        if( this.directional && !this.polymer.isCg() ){
            var iterDir1 = this.getAtomIterator( "direction1" );
            var iterDir2 = this.getAtomIterator( "direction2" );
            this.interpolator.getNormalDir(
                iterDir1, iterDir2, tan, norm, bin, 0, polymer.isCyclic, isProtein
            );
        }else{
            this.interpolator.getNormal(
                n, tan, norm, bin, 0, polymer.isCyclic, isProtein
            );
        }

        return {
            "normal": norm,
            "binormal": bin
        };

    }

};


export default Spline;
