/**
 * @file Cone Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Vector3, ConeBufferGeometry } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import { calculateCenterArray } from "../math/array-utils.js";
import GeometryBuffer from "./geometry-buffer.js";


function ConeGeometryBuffer( from, to, color, radius, pickingColor, params ){

    var p = params || {};

    var radialSegments = defaults( p.radialSegments, 60 );
    var openEnded = defaults( p.openEnded, false );

    this.updateNormals = true;

    var matrix = new Matrix4().makeRotationX( -Math.PI / 2  );

    this.geo = new ConeBufferGeometry(
        1,  // radius
        1,  // height
        radialSegments,  // radialSegments
        1,  // heightSegments
        openEnded  // openEnded
    );
    this.geo.applyMatrix( matrix );

    var n = from.length;
    var m = radius.length;

    this._position = new Float32Array( n );
    this._from = new Float32Array( n );
    this._to = new Float32Array( n );
    this._radius = new Float32Array( m );

    // FIXME this contains a call to .setAttributes,
    GeometryBuffer.call(
        this, this._position, color, pickingColor, p
    );

    this.setAttributes( {
        "position1": from,
        "position2": to,
        "color": color,
        "radius": radius,
        "pickingColor": pickingColor
    } );

}

ConeGeometryBuffer.prototype = Object.assign( Object.create(

    GeometryBuffer.prototype ), {

    constructor: ConeGeometryBuffer,

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

        var geoData = {};

        if( data.position1 && data.position2 ){
            calculateCenterArray(
                data.position1, data.position2, this._position
            );
            this._from.set( data.position1 );
            this._to.set( data.position2 );
            geoData.position = this._position;
        }

        if( data.color ){
            geoData.color = data.color;
        }

        if( data.pickingColor ){
            geoData.pickingColor = data.pickingColor;
        }

        if( data.radius ){
            this._radius.set( data.radius );
        }

        GeometryBuffer.prototype.setAttributes.call( this, geoData );

    }

} );


export default ConeGeometryBuffer;
