/**
 * @file Spacefill Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { RepresentationRegistry } from "../globals.js";
import StructureRepresentation from "./structure-representation.js";
import SphereBuffer from "../buffer/sphere-buffer.js";


function SpacefillRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

}

SpacefillRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: SpacefillRepresentation,

    type: "spacefill",

    parameters: Object.assign( {

        sphereDetail: true,
        disableImpostor: true

    }, StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};

        StructureRepresentation.prototype.init.call( this, p );

    },

    createData: function( sview ){

        var atomData = sview.getAtomData( this.getAtomParams() );

        var sphereBuffer = new SphereBuffer(
            atomData.position,
            atomData.color,
            atomData.radius,
            atomData.pickingColor,
            this.getBufferParams( {
                sphereDetail: this.sphereDetail,
                dullInterior: true,
                disableImpostor: this.disableImpostor
            } )
        );

        return {
            bufferList: [ sphereBuffer ]
        };

    },

    updateData: function( what, data ){

        var atomData = data.sview.getAtomData( this.getAtomParams( what ) );
        var sphereData = {};

        if( !what || what.position ){
            sphereData.position = atomData.position;
        }

        if( !what || what.color ){
            sphereData.color = atomData.color;
        }

        if( !what || what.radius ){
            sphereData.radius = atomData.radius;
        }

        data.bufferList[ 0 ].setAttributes( sphereData );

    }

} );


RepresentationRegistry.add( "spacefill", SpacefillRepresentation );


export default SpacefillRepresentation;
