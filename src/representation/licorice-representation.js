/**
 * @file Licorice Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { RepresentationRegistry } from "../globals.js";
import BallAndStickRepresentation from "./ballandstick-representation.js";


/**
 * Licorice representation object ({@link BallAndStickRepresentation} with `aspectRatio` fixed at 1.0)
 * @class
 * @extends BallAndStickRepresentation
 * @param {Structure} structure - the structure to be represented
 * @param {Viewer} viewer - a viewer object
 * @param {BallAndStickRepresentationParameters} params - ball and stick representation parameters
 */
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


RepresentationRegistry.add( "licorice", LicoriceRepresentation );


export default LicoriceRepresentation;
