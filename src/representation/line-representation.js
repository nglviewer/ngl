/**
 * @file Line Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ExtensionFragDepth, RepresentationRegistry } from "../globals.js";
import Representation from "./representation.js";
import StructureRepresentation from "./structure-representation.js";
import LineBuffer from "../buffer/line-buffer.js";


function LineRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

}

LineRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: LineRepresentation,

    type: "line",

    parameters: Object.assign( {

    }, Representation.prototype.parameters, {

        flatShaded: null,
        side: null,
        wireframe: null,

        roughness: null,
        metalness: null,
        diffuse: null,

    } ),

    init: function( params ){

        var p = params || {};

        StructureRepresentation.prototype.init.call( this, p );

    },

    createData: function( sview ){

        var what = { position: true, color: true };
        var bondData = sview.getBondData( this.getBondParams( what ) );

        var lineBuffer = new LineBuffer(
            bondData.position1,
            bondData.position2,
            bondData.color1,
            bondData.color2,
            this.getBufferParams()
        );

        return {
            bufferList: [ lineBuffer ]
        };

    },

    updateData: function( what, data ){

        var bondData = data.sview.getBondData( this.getBondParams( what ) );
        var lineData = {};

        if( !what || what.position ){
            lineData.from = bondData.position1;
            lineData.to = bondData.position2;
        }

        if( !what || what.color ){
            lineData.color = bondData.color1;
            lineData.color2 = bondData.color2;
        }

        data.bufferList[ 0 ].setAttributes( lineData );

    }

} );


RepresentationRegistry.add( "line", LineRepresentation );


export default LineRepresentation;
