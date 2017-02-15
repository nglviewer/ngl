/**
 * @file Random Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ColormakerRegistry } from "../globals.js";
import Colormaker from "./colormaker.js";


/**
 * Class for making random colors
 * @extends Colormaker
 */
class RandomColormaker extends Colormaker{

    /**
     * get color for an atom
     * @return {Integer} random hex color
     */
    atomColor(){
        return Math.random() * 0xFFFFFF;
    }

    /**
     * get color for volume cell
     * @return {Integer} random hex color
     */
    volumeColor(){
        return Math.random() * 0xFFFFFF;
    }

    /**
     * get color for coordinates in space
     * @return {Integer} random hex color
     */
    positionColor(){
        return Math.random() * 0xFFFFFF;
    }

}


ColormakerRegistry.add( "random", RandomColormaker );


export default RandomColormaker;
