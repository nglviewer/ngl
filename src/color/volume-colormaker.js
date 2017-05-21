/**
 * @file Volume Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";

import { ColormakerRegistry } from "../globals.js";
import Colormaker from "./colormaker.js";


/**
 * Color by volume position
 */
class VolumeColormaker extends Colormaker{

    constructor( params ){

        super( params );

        var volume = this.volume;

        if( volume && volume.inverseMatrix ){

            var valueScale = this.getScale();
            var inverseMatrix = volume.inverseMatrix;
            var data = volume.data;
            var nx = volume.nx;
            var ny = volume.ny;
            var vec = new Vector3();

            this.positionColor = function( coords ){

                vec.copy( coords );
                vec.applyMatrix4( inverseMatrix );
                vec.round();

                var index = ( ( ( ( vec.z * ny ) + vec.y ) * nx ) + vec.x );

                return valueScale( data[ index ] );

            };

        }else{

            var colorValue = this.value;
            this.positionColor = function(){ return colorValue; };

        }

    }

    /**
     * return the color for coordinates in space
     * @param  {Vector3} coords - xyz coordinates
     * @return {Integer} hex coords color
     */
    positionColor( /*coords*/ ){}

}


ColormakerRegistry.add( "volume", VolumeColormaker );


export default VolumeColormaker;
