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

        if( this.structure ){
            this.offset = this.structure.atomStore.count;
            if( params.backbone ){
                this.offset += this.structure.bondStore.count;
            }else if( params.rung ){
                this.offset += this.structure.bondStore.count;
                this.offset += this.structure.backboneBondStore.count;
            }
        }

        if( !this.gidPool ){
            console.warn( "no gidPool" );
            this.gidPool = {
                getGid: function(){ return 0; }
            };
        }

    }

    atomColor( a ){
        return this.gidPool.getGid( this.structure, a.index );
    }

    bondColor( b ){
        return this.gidPool.getGid( this.structure, this.offset + b.index );
    }

    volumeColor( i ){
        return this.gidPool.getGid( this.volume, i );
    }

}


ColormakerRegistry.add( "picking", PickingColormaker );


export default PickingColormaker;
