/**
 * @file Base Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { RepresentationRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import BallAndStickRepresentation from "./ballandstick-representation.js";


class BaseRepresentation extends BallAndStickRepresentation{

    constructor( structure, viewer, params ){

        super( structure, viewer, params );

        this.type = "base";

        this.parameters = Object.assign( {

        }, this.parameters, {

            multipleBond: null,
            bondSpacing: null,

        } );

    }

    init( params ){

        var p = params || {};
        p.aspectRatio = defaults( p.aspectRatio, 1.0 );
        p.radius = defaults( p.radius, 0.3 );

        super.init( p );

    }

    getAtomData( sview, what, params ){

        return sview.getRungAtomData( this.getAtomParams( what, params ) );

    }

    getBondData( sview, what, params ){

        var p = this.getBondParams( what, params );
        p.colorParams.rung = true;

        return sview.getRungBondData( p );

    }

}


RepresentationRegistry.add( "base", BaseRepresentation );


export default BaseRepresentation;
