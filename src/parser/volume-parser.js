/**
 * @file Volume Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4 } from "../../lib/three.es6.js";

import Parser from "./parser.js";
import Volume from "../surface/volume.js";


function VolumeParser( streamer, params ){

    Parser.call( this, streamer, params );

    this.volume = new Volume( this.name, this.path );

}

VolumeParser.prototype = Object.assign( Object.create(

    Parser.prototype ), {

    constructor: VolumeParser,
    type: "volume",

    __objName: "volume",

    _afterParse: function(){

        this.volume.setMatrix( this.getMatrix() );

    },

    getMatrix: function(){

        return new Matrix4();

    }

} );


export default VolumeParser;
