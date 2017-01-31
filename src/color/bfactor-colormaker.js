/**
 * @file Bfactor Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ColormakerRegistry } from "../globals.js";
import Colormaker from "./colormaker.js";


class BfactorColormaker extends Colormaker{

    constructor( params ){

        super( params );

        if( !params.scale ){
            this.scale = "OrRd";
        }

        if( !params.domain ){

            var selection;
            var min = Infinity;
            var max = -Infinity;

            if( params.sele ){
                selection = new Selection( params.sele );
            }

            this.structure.eachAtom( function( a ){
                var bfactor = a.bfactor;
                min = Math.min( min, bfactor );
                max = Math.max( max, bfactor );
            }, selection );

            this.domain = [ min, max ];

        }

        var bfactorScale = this.getScale();

        this.atomColor = function( a ){
            return bfactorScale( a.bfactor );
        };

    }

}


ColormakerRegistry.add( "bfactor", BfactorColormaker );


export default BfactorColormaker;
