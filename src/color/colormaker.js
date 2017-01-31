/**
 * @file Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Color } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";

import chroma from "../../lib/chroma.es6.js";


class Colormaker{

    constructor( params ){

        var p = params || {};

        this.scale = defaults( p.scale, "uniform" );
        this.mode = defaults( p.mode, "hcl" );
        this.domain = defaults( p.domain, [ 0, 1 ] );
        this.value = new Color( defaults( p.value, 0xFFFFFF ) ).getHex();

        this.structure = p.structure;
        this.volume = p.volume;
        this.surface = p.surface;
        this.gidPool = p.gidPool;

        if( this.structure ){
            this.atomProxy = this.structure.getAtomProxy();
        }

    }

    getScale( params ){

        var p = params || {};

        var scale = defaults( p.scale, this.scale );
        if( scale === "rainbow" || scale === "roygb" ){
            scale = [ "red", "orange", "yellow", "green", "blue" ];
        }else if( scale === "rwb" ){
            scale = [ "red", "white", "blue" ];
        }

        return chroma
            .scale( scale )
            .mode( defaults( p.mode, this.mode ) )
            .domain( defaults( p.domain, this.domain ) )
            .out( "num" );

    }

    colorToArray( color, array, offset ){

        if( array === undefined ) array = [];
        if( offset === undefined ) offset = 0;

        array[ offset + 0 ] = ( color >> 16 & 255 ) / 255;
        array[ offset + 1 ] = ( color >> 8 & 255 ) / 255;
        array[ offset + 2 ] = ( color & 255 ) / 255;

        return array;

    }

    atomColor(){

        return 0xFFFFFF;

    }

    atomColorToArray( a, array, offset ){

        return this.colorToArray(
            this.atomColor( a ), array, offset
        );

    }

    bondColor( b, fromTo ){

        this.atomProxy.index = fromTo ? b.atomIndex1 : b.atomIndex2;
        return this.atomColor( this.atomProxy );

    }

    bondColorToArray( b, fromTo, array, offset ){

        return this.colorToArray(
            this.bondColor( b, fromTo ), array, offset
        );

    }

    volumeColor(){

        return 0xFFFFFF;

    }

    volumeColorToArray( i, array, offset ){

        return this.colorToArray(
            this.volumeColor( i ), array, offset
        );

    }

    positionColor(){

        return 0xFFFFFF;

    }

    positionColorToArray( v, array, offset ){

        return this.colorToArray(
            this.positionColor( v ), array, offset
        );

    }

}


export default Colormaker;
