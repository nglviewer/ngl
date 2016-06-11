/**
 * @file Rope Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { RepresentationRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import CartoonRepresentation from "./cartoon-representation.js";
import Helixorient from "../geometry/helixorient.js";
import Spline from "../geometry/spline.js";


function RopeRepresentation( structure, viewer, params ){

    CartoonRepresentation.call( this, structure, viewer, params );

}

RopeRepresentation.prototype = Object.assign( Object.create(

    CartoonRepresentation.prototype ), {

    constructor: RopeRepresentation,

    type: "rope",

    parameters: Object.assign( {

        smooth: {
            type: "integer", max: 15, min: 0, rebuild: true
        }

    }, CartoonRepresentation.prototype.parameters, {
        aspectRatio: null,
        smoothSheet: null
    } ),

    init: function( params ){

        var p = params || {};
        p.aspectRatio = 1.0;
        p.tension = defaults( p.tension, 0.5 );
        p.scale = defaults( p.scale, 5.0 );
        p.smoothSheet = false;

        this.smooth = defaults( p.smooth, 2 );

        CartoonRepresentation.prototype.init.call( this, p );

    },

    getSpline: function( polymer ){

        var helixorient = new Helixorient( polymer );

        return new Spline( polymer, this.getSplineParams( {
            directional: false,
            positionIterator: helixorient.getCenterIterator( this.smooth )
        } ) );

    }

} );


RepresentationRegistry.add( "rope", RopeRepresentation );


export default RopeRepresentation;
