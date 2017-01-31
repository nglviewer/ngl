/**
 * @file Atomindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ColormakerRegistry } from "../globals.js";
import Colormaker from "./colormaker.js";


class AtomindexColormaker extends Colormaker{

    constructor( params ){

        super( params );

        if( !params.scale ){
            this.scale = "roygb";
        }
        if( !params.domain ){

            var scalePerModel = {};

            this.structure.eachModel( function( mp ){
                this.domain = [ mp.atomOffset, mp.atomEnd ];
                scalePerModel[ mp.index ] = this.getScale();
            }.bind( this ) );

            this.atomColor = function( a ){
                return scalePerModel[ a.modelIndex ]( a.index );
            };

        }else{

            var atomindexScale = this.getScale();

            this.atomColor = function( a ){
                return atomindexScale( a.index );
            };

        }

    }

}


ColormakerRegistry.add( "atomindex", AtomindexColormaker );


export default AtomindexColormaker;
