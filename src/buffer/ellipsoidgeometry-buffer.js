/**
 * @file Ellipsoid Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { IcosahedronGeometry, Vector3 } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import GeometryBuffer from "./geometry-buffer.js";


// position, color, radius, majorAxis, minorAxis, pickingColor
function EllipsoidGeometryBuffer( data, params ){

    var p = params || {};

    var detail = defaults( p.sphereDetail, 2 );

    this.updateNormals = true;

    this.geo = new IcosahedronGeometry( 1, detail );
    this._radius = data.radius;
    this._majorAxis = data.majorAxis;
    this._minorAxis = data.minorAxis;

    GeometryBuffer.call( this, data, p );

}

EllipsoidGeometryBuffer.prototype = Object.assign( Object.create(

    GeometryBuffer.prototype ), {

    constructor: EllipsoidGeometryBuffer,

    applyPositionTransform: function(){

        var scale = new Vector3();
        var target = new Vector3();
        var up = new Vector3();
        var eye = new Vector3( 0, 0, 0 );

        return function applyPositionTransform( matrix, i, i3 ){

            target.fromArray( this._majorAxis, i3 );
            up.fromArray( this._minorAxis, i3 );
            matrix.lookAt( eye, target, up );

            scale.set( this._radius[ i ], up.length(), target.length() );
            matrix.scale( scale );

        };

    }(),

    setAttributes: function( data ){

        if( data.majorAxis ){
            this.majorAxis = data.majorAxis;
        }

        if( data.minorAxis ){
            this._minorAxis = data.minorAxis;
        }

        GeometryBuffer.prototype.setAttributes.call( this, data );

    }

} );


export default EllipsoidGeometryBuffer;
