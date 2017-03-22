/**
 * @file Validation Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { RepresentationRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import StructureRepresentation from "./structure-representation.js";
import CylinderBuffer from "../buffer/cylinder-buffer.js";


/**
 * Validation representation object
 * @class
 * @extends StructureRepresentation
 * @param {Structure} structure - the structure to be represented
 * @param {Viewer} viewer - a viewer object
 * @param {RepresentationParameters} params - representation parameters
 */
function ValidationRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

}

ValidationRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: ValidationRepresentation,

    type: "validation",

    parameters: Object.assign( {

        radiusType: null,
        radius: null,
        scale: null

    }, StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.colorValue = defaults( p.colorValue, "#f0027f" );

        StructureRepresentation.prototype.init.call( this, p );

    },

    createData: function( sview ){

        if( !sview.validation ) return;

        var clashData = sview.validation.getClashData( {
            structure: sview,
            color: this.colorValue
        } );

        var cylinderBuffer = new CylinderBuffer(
            clashData, this.getBufferParams( { openEnded: false } )
        );

        return {
            bufferList: [ cylinderBuffer ]
        };

    },

    updateData: function( /*what, data*/ ){

        this.build();

    }

} );


RepresentationRegistry.add( "validation", ValidationRepresentation );


export default ValidationRepresentation;
