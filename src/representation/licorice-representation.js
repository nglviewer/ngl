/**
 * @file Licorice Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import BallAndStickRepresentation from "./ballandstick-representation.js";


function LicoriceRepresentation( structure, viewer, params ){

    BallAndStickRepresentation.call( this, structure, viewer, params );

}

LicoriceRepresentation.prototype = Object.assign( Object.create(

    BallAndStickRepresentation.prototype ), {

    constructor: LicoriceRepresentation,

    type: "licorice",

    parameters: Object.assign(
        {}, BallAndStickRepresentation.prototype.parameters, { aspectRatio: null }
    ),

    init: function( params ){

        var p = params || {};
        p.aspectRatio = 1.0;

        BallAndStickRepresentation.prototype.init.call( this, p );

    }

} );


export default LicoriceRepresentation;
