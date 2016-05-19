/**
 * @file Base Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import BallAndStickRepresentation from "./ballandstick-representation.js";


function BaseRepresentation( structure, viewer, params ){

    BallAndStickRepresentation.call( this, structure, viewer, params );

}

BaseRepresentation.prototype = Object.assign( Object.create(

    BallAndStickRepresentation.prototype ), {

    constructor: BaseRepresentation,

    type: "base",

    defaultSize: 0.3,

    parameters: Object.assign( {

    }, BallAndStickRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.aspectRatio = p.aspectRatio || 1.0;

        BallAndStickRepresentation.prototype.init.call( this, p );

    },

    getAtomData: function( sview, what, params ){

        return sview.getRungAtomData( this.getAtomParams( what, params ) );

    },

    getBondData: function( sview, what, params ){

        var p = this.getBondParams( what, params );
        p.colorParams.rung = true;

        return sview.getRungBondData( p );

    }

} );


export default BaseRepresentation;
