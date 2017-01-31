/**
 * @file Uniform Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ColormakerRegistry } from "../globals.js";
import Colormaker from "./colormaker.js";


class UniformColormaker extends Colormaker{

    constructor( params ){

        super( params );

        var color = this.value;

        this.atomColor = function(){

            return color;

        };

        this.bondColor = function(){

            return color;

        };

        this.valueColor = function(){

            return color;

        };

    }

}


ColormakerRegistry.add( "uniform", UniformColormaker );


export default UniformColormaker;
