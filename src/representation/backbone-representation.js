/**
 * @file Backbone Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { RepresentationRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import BallAndStickRepresentation from "./ballandstick-representation.js";


class BackboneRepresentation extends BallAndStickRepresentation{

    constructor( structure, viewer, params ){

        super( structure, viewer, params );

        this.type = "backbone";

        this.parameters = Object.assign( {

        }, this.parameters, {

            multipleBond: null,
            bondSpacing: null,

        } );

        this.init( params );

    }

    init( params ){

        var p = params || {};
        p.aspectRatio = defaults( p.aspectRatio, 1.0 );
        p.radius = defaults( p.radius, 0.25 );

        super.init( p );

    }

    getAtomData( sview, what, params ){

        return sview.getBackboneAtomData( this.getAtomParams( what, params ) );

    }

    getBondData( sview, what, params ){

        return sview.getBackboneBondData( this.getBondParams( what, params ) );

    }

}


RepresentationRegistry.add( "backbone", BackboneRepresentation );


export default BackboneRepresentation;
