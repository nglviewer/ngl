/**
 * @file Helixbundle
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";

import { ColorMakerRegistry } from "../globals.js";
import RadiusFactory from "../utils/radius-factory.js";
import Helixorient from "./helixorient.js";
import { calculateMeanVector3, projectPointOnVector } from "../math/vector-utils.js";


function Helixbundle( polymer ){

    this.polymer = polymer;

    this.helixorient = new Helixorient( polymer );
    this.position = this.helixorient.getPosition();

}

Helixbundle.prototype = {

    constructor: Helixbundle,

    getAxis: function( localAngle, centerDist, ssBorder, colorParams, radius, scale ){

        localAngle = localAngle || 30;
        centerDist = centerDist || 2.5;
        ssBorder = ssBorder === undefined ? false : ssBorder;

        var polymer = this.polymer;
        var structure = polymer.structure;
        var n = polymer.residueCount;
        var residueIndexStart = polymer.residueIndexStart;

        var pos = this.position;

        var cp = colorParams || {};
        cp.structure = structure;

        var colorMaker = ColorMakerRegistry.getScheme( cp );
        var pickingColorMaker = ColorMakerRegistry.getPickingScheme( cp );

        var radiusFactory = new RadiusFactory( radius, scale );

        var j = 0;
        var k = 0;

        var axis = [];
        var center = [];
        var beg = [];
        var end = [];
        var col = [];
        var pcol = [];
        var size = [];
        var residueOffset = [];
        var residueCount = [];

        var tmpAxis = [];
        var tmpCenter = [];

        var _axis, _center;
        var _beg = new Vector3();
        var _end = new Vector3();

        var rp1 = structure.getResidueProxy();
        var rp2 = structure.getResidueProxy();
        var ap = structure.getAtomProxy();

        var c1 = new Vector3();
        var c2 = new Vector3();

        var split = false;

        for( var i = 0; i < n; ++i ){

            rp1.index = residueIndexStart + i;
            c1.fromArray( pos.center, i * 3 );

            if( i === n - 1 ){
                split = true;
            }else{

                rp2.index = residueIndexStart + i + 1;
                c2.fromArray( pos.center, i * 3 + 3 );

                if( ssBorder && rp1.sstruc !== rp2.sstruc ){
                    split = true;
                }else if( c1.distanceTo( c2 ) > centerDist ){
                    split = true;
                }else if( pos.bending[ i ] > localAngle ){
                    split = true;
                }

            }

            if( split ){

                if( i - j < 4 ){
                    j = i;
                    split = false;
                    continue;
                }

                ap.index = rp1.traceAtomIndex;

                // ignore first and last axis
                tmpAxis = pos.axis.subarray( j * 3 + 3, i * 3 );
                tmpCenter = pos.center.subarray( j * 3, i * 3 + 3 );

                _axis = calculateMeanVector3( tmpAxis ).normalize();
                _center = calculateMeanVector3( tmpCenter );

                _beg.fromArray( tmpCenter );
                projectPointOnVector( _beg, _axis, _center );

                _end.fromArray( tmpCenter, tmpCenter.length - 3 );
                projectPointOnVector( _end, _axis, _center );

                _axis.subVectors( _end, _beg );

                _axis.toArray( axis, k );
                _center.toArray( center, k );
                _beg.toArray( beg, k );
                _end.toArray( end, k );

                colorMaker.atomColorToArray( ap, col, k );
                pickingColorMaker.atomColorToArray( ap, pcol, k );

                size.push( radiusFactory.atomRadius( ap ) );

                residueOffset.push( residueIndexStart + j );
                residueCount.push( residueIndexStart + i + 1 - j );

                k += 3;
                j = i;
                split = false;

            }

        }

        return {
            "axis": new Float32Array( axis ),
            "center": new Float32Array( center ),
            "begin": new Float32Array( beg ),
            "end": new Float32Array( end ),
            "color": new Float32Array( col ),
            "pickingColor": new Float32Array( pcol ),
            "size": new Float32Array( size ),
            "residueOffset": residueOffset,
            "residueCount": residueCount
        };

    }

};


export default Helixbundle;
