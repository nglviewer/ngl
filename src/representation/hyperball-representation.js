/**
 * @file Hyperball Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { RepresentationRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import { calculateCenterArray } from "../math/array-utils.js";
import LicoriceRepresentation from "./licorice-representation.js";
import SphereBuffer from "../buffer/sphere-buffer.js";
import HyperballStickBuffer from "../buffer/hyperballstick-buffer.js";


function HyperballRepresentation( structure, viewer, params ){

    LicoriceRepresentation.call( this, structure, viewer, params );

    this.defaultScale.vdw = 0.2;

}

HyperballRepresentation.prototype = Object.assign( Object.create(

    LicoriceRepresentation.prototype ), {

    constructor: HyperballRepresentation,

    type: "hyperball",

    defaultSize: 1.0,

    parameters: Object.assign( {

        shrink: {
            type: "number", precision: 3, max: 1.0, min: 0.001, buffer: true
        }

    }, LicoriceRepresentation.prototype.parameters, {

        multipleBond: null,
        bondSpacing: null,

    } ),

    init: function( params ){

        var p = params || {};
        p.scale = defaults( p.scale, 0.2 );
        p.radius = defaults( p.radius, "vdw" );

        this.shrink = defaults( p.shrink, 0.12 );

        LicoriceRepresentation.prototype.init.call( this, p );

    },

    getBondParams: function( what, params ){

        if( !what || what.radius ){
            params = Object.assign( { radius2: true }, params );
        }

        return LicoriceRepresentation.prototype.getBondParams.call( this, what, params );

    },

    createData: function( sview ){

        var atomData = sview.getAtomData( this.getAtomParams() );
        var bondData = sview.getBondData( this.getBondParams() );

        var sphereBuffer = new SphereBuffer(
            atomData.position,
            atomData.color,
            atomData.radius,
            atomData.pickingColor,
            this.getBufferParams( {
                sphereDetail: this.sphereDetail,
                disableImpostor: this.disableImpostor,
                dullInterior: true
            } )
        );

        this.__center = new Float32Array( sview.bondCount * 3 );

        var stickBuffer = new HyperballStickBuffer(
            bondData.position1,
            bondData.position2,
            bondData.color1,
            bondData.color2,
            bondData.radius1,
            bondData.radius2,
            bondData.pickingColor1,
            bondData.pickingColor2,
            this.getBufferParams( {
                shrink: this.shrink,
                radialSegments: this.radialSegments,
                dullInterior: true
            } ),
            this.disableImpostor
        );

        return {
            bufferList: [ sphereBuffer, stickBuffer ]
        };

    },

    updateData: function( what, data ){

        var atomData = data.sview.getAtomData( this.getAtomParams() );
        var bondData = data.sview.getBondData( this.getBondParams() );
        var sphereData = {};
        var stickData = {};

        if( !what || what.position ){
            sphereData.position = atomData.position;
            var from = bondData.position1;
            var to = bondData.position2;
            stickData.position = calculateCenterArray( from, to, this.__center );
            stickData.position1 = from;
            stickData.position2 = to;
        }

        if( !what || what.color ){
            sphereData.color = atomData.color;
            stickData.color = bondData.color1;
            stickData.color2 = bondData.color2;
        }

        if( !what || what.radius ){
            sphereData.radius = atomData.radius;
            stickData.radius = bondData.radius1;
            stickData.radius2 = bondData.radius2;
        }

        data.bufferList[ 0 ].setAttributes( sphereData );
        data.bufferList[ 1 ].setAttributes( stickData );

    }

} );


RepresentationRegistry.add( "hyperball", HyperballRepresentation );


export default HyperballRepresentation;
