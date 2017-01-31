/**
 * @file Volume Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3 } from "../../lib/three.es6.js";

import { ColormakerRegistry } from "../globals.js";
import Colormaker from "./colormaker.js";


class VolumeColormaker extends Colormaker{

    constructor( params ){

        super( params );

        var valueScale = this.getScale();
        var volume = this.volume;
        var inverseMatrix = volume.inverseMatrix;
        var data = volume.__data;
        var nx = volume.nx;
        var ny = volume.ny;
        var vec = new Vector3();

        this.positionColor = function( v ){

            vec.copy( v );
            vec.applyMatrix4( inverseMatrix );
            vec.round();

            var index = ( ( ( ( vec.z * ny ) + vec.y ) * nx ) + vec.x );

            return valueScale( data[ index ] );

        };

    }

}


ColormakerRegistry.add( "volume", VolumeColormaker );


export default VolumeColormaker;
