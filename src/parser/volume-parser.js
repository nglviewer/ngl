/**
 * @file Volume Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import THREE from "../../lib/three.js";

import Parser from "./parser.js";
import Volume from "../surface/volume.js";


function VolumeParser( streamer, params ){

    var p = params || {};

    Parser.call( this, streamer, p );

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

        return new THREE.Matrix4();

    }

} );


export default VolumeParser;
