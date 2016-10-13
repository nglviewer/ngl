/**
 * @file Backbone Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { RepresentationRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import BallAndStickRepresentation from "./ballandstick-representation.js";


function BackboneRepresentation( structure, viewer, params ){

    BallAndStickRepresentation.call( this, structure, viewer, params );

}

BackboneRepresentation.prototype = Object.assign( Object.create(

    BallAndStickRepresentation.prototype ), {

    constructor: BackboneRepresentation,

    type: "backbone",

    defaultSize: 0.25,

    parameters: Object.assign( {

    }, BallAndStickRepresentation.prototype.parameters, {

        multipleBond: null,
        bondSpacing: null,

    } ),

    init: function( params ){

        var p = params || {};
        p.aspectRatio = defaults( p.aspectRatio, 1.0 );

        BallAndStickRepresentation.prototype.init.call( this, p );

    },

    getAtomData: function( sview, what, params ){

        return sview.getBackboneAtomData( this.getAtomParams( what, params ) );

    },

    getBondData: function( sview, what, params ){

        var p = this.getBondParams( what, params );
        p.colorParams.backbone = true;

        return sview.getBackboneBondData( p );

    }

} );


RepresentationRegistry.add( "backbone", BackboneRepresentation );


export default BackboneRepresentation;
