/**
 * @file Value Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ColormakerRegistry } from "../globals.js";
import Colormaker from "./colormaker.js";


class ValueColormaker extends Colormaker{

    constructor( params ){

        super( params );

        var valueScale = this.getScale();

        this.volumeColor = function( i ){

            return valueScale( this.volume.data[ i ] );

        };

    }

}


ColormakerRegistry.add( "value", ValueColormaker );


export default ValueColormaker;
