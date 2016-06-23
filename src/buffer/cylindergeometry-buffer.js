/**
 * @file Cylinder Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Vector3, CylinderGeometry } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import { calculateCenterArray } from "../math/array-utils.js";
import GeometryBuffer from "./geometry-buffer.js";


function CylinderGeometryBuffer( from, to, color, color2, radius, pickingColor, pickingColor2, params ){

    var p = params || {};

    var radiusSegments = defaults( p.radiusSegments, 10 );

    this.updateNormals = true;

    var matrix = new Matrix4().makeRotationX( Math.PI/ 2  );

    // FIXME params.cap
    this.geo = new CylinderGeometry( 1, 1, 1, radiusSegments, 1, true );
    this.geo.applyMatrix( matrix );

    var n = from.length;
    var m = radius.length;

    this._position = new Float32Array( n * 2 );
    this._color = new Float32Array( n * 2 );
    this._pickingColor = new Float32Array( n * 2 );
    this._from = new Float32Array( n * 2 );
    this._to = new Float32Array( n * 2 );
    this._radius = new Float32Array( m * 2 );

    this.__center = new Float32Array( n );

    GeometryBuffer.call(
        this, this._position, this._color, this._pickingColor, p
    );

    this.setPositionTransform( this._from, this._to, this._radius );

    this.setAttributes( {
        "position1": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius,
        "pickingColor": pickingColor,
        "pickingColor2": pickingColor2
    } );

}

CylinderGeometryBuffer.prototype = Object.assign( Object.create(

    GeometryBuffer.prototype ), {

    constructor: CylinderGeometryBuffer,

    setPositionTransform: function( from, to, radius ){

        var r;
        var scale = new Vector3();
        var eye = new Vector3();
        var target = new Vector3();
        var up = new Vector3( 0, 1, 0 );

        this.applyPositionTransform = function( matrix, i, i3 ){

            eye.fromArray( from, i3 );
            target.fromArray( to, i3 );
            matrix.lookAt( eye, target, up );

            r = radius[ i ];
            scale.set( r, r, eye.distanceTo( target ) );
            matrix.scale( scale );

        };

    },

    setAttributes: function( data ){

        var n = this._position.length / 2;
        var m = this._radius.length / 2;
        var geoData = {};

        if( data.position1 && data.position2 ){

            calculateCenterArray(
                data.position1, data.position2, this.__center
            );
            calculateCenterArray(
                data.position1, this.__center, this._position
            );
            calculateCenterArray(
                this.__center, data.position2, this._position, n
            );

            this._from.set( data.position1 );
            this._from.set( this.__center, n );

            this._to.set( this.__center );
            this._to.set( data.position2, n );

            geoData.position = this._position;

        }

        if( data.color && data.color2 ){

            this._color.set( data.color );
            this._color.set( data.color2, n );

            geoData.color = this._color;

        }

        if( data.pickingColor && data.pickingColor2 ){

            this._pickingColor.set( data.pickingColor );
            this._pickingColor.set( data.pickingColor2, n );

            geoData.pickingColor = this._pickingColor;

        }

        if( data.radius ){

            this._radius.set( data.radius );
            this._radius.set( data.radius, m );

        }

        if( ( data.position1 && data.position2 ) || data.radius ){

            this.setPositionTransform( this._from, this._to, this._radius );

        }

        GeometryBuffer.prototype.setAttributes.call( this, geoData );

    }

} );


export default CylinderGeometryBuffer;
