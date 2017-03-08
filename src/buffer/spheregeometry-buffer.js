/**
 * @file Sphere Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { IcosahedronGeometry, Vector3 } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import GeometryBuffer from "./geometry-buffer.js";


// position, color, radius, pickingColor
function SphereGeometryBuffer( data, params ){

    var p = params || {};

    var detail = defaults( p.sphereDetail, 1 );

    this.geo = new IcosahedronGeometry( 1, detail );
    this._radius = data.radius;

    GeometryBuffer.call( this, data, p );

}

SphereGeometryBuffer.prototype = Object.assign( Object.create(

    GeometryBuffer.prototype ), {

    constructor: SphereGeometryBuffer,

    applyPositionTransform: function(){

        var r;
        var scale = new Vector3();

        return function applyPositionTransform( matrix, i ){

            r = this._radius[ i ];
            scale.set( r, r, r );
            matrix.scale( scale );

        };

    }(),

    setAttributes: function( data ){

        if( data.radius ){
            this._radius = data.radius;
        }

        GeometryBuffer.prototype.setAttributes.call( this, data );

    }

} );


export default SphereGeometryBuffer;
