/**
 * @file Residueindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ColormakerRegistry } from "../globals.js";
import Colormaker from "./colormaker.js";


class ResidueindexColormaker extends Colormaker{

    constructor( params ){

        super( params );

        if( !params.scale ){
            this.scale = "roygb";
        }
        if( !params.domain ){

            // this.domain = [ 0, this.structure.residueStore.count ];

            var scalePerChain = {};

            this.structure.eachChain( function( cp ){
                this.domain = [ cp.residueOffset, cp.residueEnd ];
                scalePerChain[ cp.index ] = this.getScale();
            }.bind( this ) );

            this.atomColor = function( a ){
                return scalePerChain[ a.chainIndex ]( a.residueIndex );
            };

        }else{

            var residueindexScale = this.getScale();

            this.atomColor = function( a ){
                return residueindexScale( a.residueIndex );
            };

        }

    }

}


ColormakerRegistry.add( "residueindex", ResidueindexColormaker );


export default ResidueindexColormaker;
