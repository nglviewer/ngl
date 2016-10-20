/**
 * @file Helixorient
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";

import { ColorMakerRegistry } from "../globals.js";
import RadiusFactory from "../utils/radius-factory.js";
import { copyArray } from "../math/array-utils.js";
import { projectPointOnVector } from "../math/vector-utils.js";


function Helixorient( polymer ){

    this.polymer = polymer;

    this.size = polymer.residueCount;

}

Helixorient.prototype = {

    constructor: Helixorient,

    getCenterIterator: function( smooth ){

        var center = this.getPosition().center;
        var n = center.length / 3;

        var i = 0;
        var j = -1;

        var cache = [
            new Vector3(),
            new Vector3(),
            new Vector3(),
            new Vector3()
        ];

        function next(){
            var vector = this.get( j );
            j += 1;
            return vector;
        }

        function get( idx ){
            idx = Math.min( n - 1, Math.max( 0, idx ) );
            var v = cache[ i % 4 ];
            var idx3 = 3 * idx;
            v.fromArray( center, idx3 );
            if( smooth ){
                var l, k, t;
                var w = Math.min( smooth, idx, n - idx - 1 );
                for( k = 1; k <= w; ++k ){
                    l = k * 3;
                    t = ( w + 1 - k ) / ( w + 1 );
                    v.x += t * center[ idx3 - l + 0 ] + t * center[ idx3 + l + 0 ];
                    v.y += t * center[ idx3 - l + 1 ] + t * center[ idx3 + l + 1 ];
                    v.z += t * center[ idx3 - l + 2 ] + t * center[ idx3 + l + 2 ];
                }
                v.x /= w + 1;
                v.y /= w + 1;
                v.z /= w + 1;
            }
            i += 1;
            return v;
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

    getColor: function( params ){

        var polymer = this.polymer;
        var structure = polymer.structure;
        var n = polymer.residueCount;
        var residueIndexStart = polymer.residueIndexStart;

        var col = new Float32Array( n * 3 );
        var pcol = new Float32Array( n * 3 );

        var p = params || {};
        p.structure = structure;

        var colorMaker = ColorMakerRegistry.getScheme( p );
        var pickingColorMaker = ColorMakerRegistry.getPickingScheme( p );

        var rp = structure.getResidueProxy();
        var ap = structure.getAtomProxy();

        for( var i = 0; i < n; ++i ){

            rp.index = residueIndexStart + i;
            ap.index = rp.traceAtomIndex;

            var i3 = i * 3;
            colorMaker.atomColorToArray( ap, col, i3 );
            pickingColorMaker.atomColorToArray( ap, pcol, i3 );

        }

        return {
            "color": col,
            "pickingColor": pcol
        };

    },

    getSize: function( type, scale ){

        var polymer = this.polymer;
        var structure = polymer.structure;
        var n = polymer.residueCount;
        var residueIndexStart = polymer.residueIndexStart;

        var size = new Float32Array( n );
        var radiusFactory = new RadiusFactory( type, scale );

        var rp = structure.getResidueProxy();
        var ap = structure.getAtomProxy();

        for( var i = 0; i < n; ++i ){

            rp.index = residueIndexStart + i;
            ap.index = rp.traceAtomIndex;
            size[ i ] = radiusFactory.atomRadius( ap );

        }

        return {
            "size": size
        };

    },

    getPosition: function(){

        var polymer = this.polymer;
        var structure = polymer.structure;
        var n = polymer.residueCount;
        var n3 = n - 3;

        var center = new Float32Array( 3 * n );
        var axis = new Float32Array( 3 * n );
        var diff = new Float32Array( n );
        var radius = new Float32Array( n );
        var rise = new Float32Array( n );
        var twist = new Float32Array( n );
        var resdir = new Float32Array( 3 * n );

        var tmp, j, i;
        var diff13Length, diff24Length;

        var r12 = new Vector3();
        var r23 = new Vector3();
        var r34 = new Vector3();

        var diff13 = new Vector3();
        var diff24 = new Vector3();

        var v1 = new Vector3();
        var v2 = new Vector3();
        var vt = new Vector3();

        var _axis = new Vector3();
        var _prevAxis = new Vector3();

        var _resdir = new Vector3();
        var _center = new Vector3( 0, 0, 0 );

        var type = "trace";
        var a1 = structure.getAtomProxy();
        var a2 = structure.getAtomProxy( polymer.getAtomIndexByType( 0, type ) );
        var a3 = structure.getAtomProxy( polymer.getAtomIndexByType( 1, type ) );
        var a4 = structure.getAtomProxy( polymer.getAtomIndexByType( 2, type ) );

        for( i = 0; i < n3; ++i ){

            a1.index = a2.index;
            a2.index = a3.index;
            a3.index = a4.index;
            a4.index = polymer.getAtomIndexByType( i + 3, type );

            j = 3 * i;

            // ported from GROMACS src/tools/gmx_helixorient.c

            r12.subVectors( a2, a1 );
            r23.subVectors( a3, a2 );
            r34.subVectors( a4, a3 );

            diff13.subVectors( r12, r23 );
            diff24.subVectors( r23, r34 );

            _axis.crossVectors( diff13, diff24 ).normalize();
            _axis.toArray( axis, j );

            if( i > 0 ){
                diff[ i ] = _axis.angleTo( _prevAxis );
            }

            tmp = Math.cos( diff13.angleTo( diff24 ) );
            twist[ i ] = 180.0 / Math.PI * Math.acos( tmp );

            diff13Length = diff13.length();
            diff24Length = diff24.length();

            radius[ i ] = (
                Math.sqrt( diff24Length * diff13Length ) /
                // clamp, to avoid instabilities for when
                // angle between diff13 and diff24 is near 0
                Math.max( 2.0, 2.0 * ( 1.0 - tmp ) )
            );

            rise[ i ] = Math.abs( r23.dot( _axis ) );

            //

            v1.copy( diff13 ).multiplyScalar( radius[ i ] / diff13Length );
            v2.copy( diff24 ).multiplyScalar( radius[ i ] / diff24Length );

            v1.subVectors( a2, v1 );
            v2.subVectors( a3, v2 );

            v1.toArray( center, j + 3 );
            v2.toArray( center, j + 6 );

            //

            _resdir.subVectors( a1, _center );
            _resdir.toArray( resdir, j );

            _prevAxis.copy( _axis );
            _center.copy( v1 );

        }

        //

        // calc axis as dir of second and third center pos
        // project first traceAtom onto axis to get first center pos
        v1.fromArray( center, 3 );
        v2.fromArray( center, 6 );
        _axis.subVectors( v1, v2 ).normalize();
        // _center.copy( res[ 0 ].getTraceAtom() );
        a1.index = polymer.getAtomIndexByType( 0, type );
        _center.copy( a1 );
        vt.copy( a1 );
        projectPointOnVector( vt, _axis, v1 );
        vt.toArray( center, 0 );

        // calc first resdir
        _resdir.subVectors( _center, v1 );
        _resdir.toArray( resdir, 0 );

        // calc axis as dir of n-1 and n-2 center pos
        // project last traceAtom onto axis to get last center pos
        v1.fromArray( center, 3 * n - 6 );
        v2.fromArray( center, 3 * n - 9 );
        _axis.subVectors( v1, v2 ).normalize();
        // _center.copy( res[ n - 1 ].getTraceAtom() );
        a1.index = polymer.getAtomIndexByType( n - 1, type );
        _center.copy( a1 );
        vt.copy( a1 );
        projectPointOnVector( vt, _axis, v1 );
        vt.toArray( center, 3 * n - 3 );

        // calc last three resdir
        for( i = n - 3; i < n; ++i ){

            v1.fromArray( center, 3 * i );
            // _center.copy( res[ i ].getTraceAtom() );
            a1.index = polymer.getAtomIndexByType( i, type );
            _center.copy( a1 );

            _resdir.subVectors( _center, v1 );
            _resdir.toArray( resdir, 3 * i );

        }

        // average measures to define them on the residues

        var resRadius = new Float32Array( n );
        var resTwist = new Float32Array( n );
        var resRise = new Float32Array( n );
        var resBending = new Float32Array( n );

        resRadius[ 1 ] = radius[ 0 ];
        resTwist[ 1 ] = twist[ 0 ];
        resRise[ 1 ] = radius[ 0 ];

        for( i = 2; i < n - 2; ++i ){

            resRadius[ i ] = 0.5 * ( radius[ i - 2 ] + radius[ i - 1 ] );
            resTwist[ i ] = 0.5 * ( twist[ i - 2 ] + twist[ i - 1 ] );
            resRise[ i ] = 0.5 * ( rise[ i - 2 ] + rise[ i - 1 ] );

            v1.fromArray( axis, 3 * ( i - 2 ) );
            v2.fromArray( axis, 3 * ( i - 1 ) );
            resBending[ i ] = 180.0 / Math.PI * Math.acos( Math.cos( v1.angleTo( v2 ) ) );

        }

        resRadius[ n - 2 ] = radius[ n - 4 ];
        resTwist[ n - 2 ] = twist[ n - 4 ];
        resRise[ n - 2 ] = rise[ n - 4 ];

        // average helix axes to define them on the residues

        var resAxis = new Float32Array( 3 * n );

        copyArray( axis, resAxis, 0, 0, 3 );
        copyArray( axis, resAxis, 0, 3, 3 );

        for( i = 2; i < n - 2; ++i ){

            v1.fromArray( axis, 3 * ( i - 2 ) );
            v2.fromArray( axis, 3 * ( i - 1 ) );

            _axis.addVectors( v2, v1 ).multiplyScalar( 0.5 ).normalize();
            _axis.toArray( resAxis, 3 * i );

        }

        copyArray( axis, resAxis, 3 * n - 12, 3 * n - 6, 3 );
        copyArray( axis, resAxis, 3 * n - 12, 3 * n - 3, 3 );

        return {
            "center": center,
            "axis": resAxis,
            "bending": resBending,
            "radius": resRadius,
            "rise": resRise,
            "twist": resTwist,
            "resdir": resdir,
        };

    }

};


export default Helixorient;
