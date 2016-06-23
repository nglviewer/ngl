/**
 * @file Sphere Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { IcosahedronGeometry, Vector3 } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import GeometryBuffer from "./geometry-buffer.js";


function SphereGeometryBuffer( position, color, radius, pickingColor, params ){

    var detail = defaults( params.sphereDetail, 1 );

    this.geo = new IcosahedronGeometry( 1, detail );

    this.setPositionTransform( radius );

    GeometryBuffer.call( this, position, color, pickingColor, params );

}

SphereGeometryBuffer.prototype = Object.assign( Object.create(

    GeometryBuffer.prototype ), {

    constructor: SphereGeometryBuffer,

    setPositionTransform: function( radius ){

        var r;
        var scale = new Vector3();

        this.applyPositionTransform = function( matrix, i ){

            r = radius[ i ];
            scale.set( r, r, r );
            matrix.scale( scale );

        };

    },

    setAttributes: function( data ){

        if( data.radius ){
            this.setPositionTransform( data.radius );
        }

        GeometryBuffer.prototype.setAttributes.call( this, data );

    }

} );


export default SphereGeometryBuffer;
