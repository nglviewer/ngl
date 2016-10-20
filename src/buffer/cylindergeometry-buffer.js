/**
 * @file Cylinder Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Vector3, CylinderBufferGeometry } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import { calculateCenterArray } from "../math/array-utils.js";
import GeometryBuffer from "./geometry-buffer.js";


function CylinderGeometryBuffer( from, to, color, color2, radius, pickingColor, pickingColor2, params ){

    var p = params || {};

    var radialSegments = defaults( p.radialSegments, 10 );
    var openEnded = defaults( p.openEnded, true );

    this.updateNormals = true;

    var matrix = new Matrix4().makeRotationX( Math.PI / 2  );

    this.geo = new CylinderBufferGeometry(
        1,  // radiusTop,
        1,  // radiusBottom,
        1,  // height,
        radialSegments,  // radialSegments,
        1,  // heightSegments,
        openEnded  // openEnded
    );
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

    applyPositionTransform: function(){

        var r;
        var scale = new Vector3();
        var eye = new Vector3();
        var target = new Vector3();
        var up = new Vector3( 0, 1, 0 );

        return function applyPositionTransform( matrix, i, i3 ){

            eye.fromArray( this._from, i3 );
            target.fromArray( this._to, i3 );
            matrix.lookAt( eye, target, up );

            r = this._radius[ i ];
            scale.set( r, r, eye.distanceTo( target ) );
            matrix.scale( scale );

        };

    }(),

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

        GeometryBuffer.prototype.setAttributes.call( this, geoData );

    }

} );


export default CylinderGeometryBuffer;
