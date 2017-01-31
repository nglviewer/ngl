/**
 * @file Picking Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ColormakerRegistry } from "../globals.js";
import Colormaker from "./colormaker.js";


class PickingColormaker extends Colormaker{

    constructor( params ){

        super( params );

        var offset;
        if( this.structure ){
            offset = this.structure.atomStore.count;
            if( params.backbone ){
                offset += this.structure.bondStore.count;
            }else if( params.rung ){
                offset += this.structure.bondStore.count;
                offset += this.structure.backboneBondStore.count;
            }
        }

        if( !this.gidPool ){
            console.warn( "no gidPool" );
            this.gidPool = {
                getGid: function(){ return 0; }
            };
        }

        this.atomColor = function( a ){

            return this.gidPool.getGid( this.structure, a.index );

        };

        this.bondColor = function( b ){

            return this.gidPool.getGid( this.structure, offset + b.index );

        };

        this.volumeColor = function( i ){

            return this.gidPool.getGid( this.volume, i );

        };

    }

}


ColormakerRegistry.add( "picking", PickingColormaker );


export default PickingColormaker;
