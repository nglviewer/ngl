/**
 * @file Tube Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { RepresentationRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import CartoonRepresentation from "./cartoon-representation.js";


function TubeRepresentation( structure, viewer, params ){

    CartoonRepresentation.call( this, structure, viewer, params );

}

TubeRepresentation.prototype = Object.assign( Object.create(

    CartoonRepresentation.prototype ), {

    constructor: TubeRepresentation,

    type: "tube",

    parameters: Object.assign(
        {}, CartoonRepresentation.prototype.parameters, { aspectRatio: null }
    ),

    init: function( params ){

        var p = params || {};
        p.aspectRatio = 1.0;
        p.scale = defaults( p.scale, 2.0 );

        CartoonRepresentation.prototype.init.call( this, p );

        if( p.quality === "low" ){
            this.radialSegments = 5;
        }

    },

    getSplineParams: function( /*params*/ ){

        return CartoonRepresentation.prototype.getSplineParams.call( this, {
            directional: false
        } );

    }

} );


RepresentationRegistry.add( "tube", TubeRepresentation );


export default TubeRepresentation;
