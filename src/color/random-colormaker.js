/**
 * @file Random Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ColormakerRegistry } from "../globals.js";
import Colormaker from "./colormaker.js";


class RandomColormaker extends Colormaker{

    constructor( params ){

        super( params );

        this.atomColor = function(){

            return Math.random() * 0xFFFFFF;

        };

    }

}


ColormakerRegistry.add( "random", RandomColormaker );


export default RandomColormaker;
