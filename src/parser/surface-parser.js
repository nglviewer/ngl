/**
 * @file Surface Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Parser from "./parser.js";
import Surface from "../surface/surface.js";


function SurfaceParser( streamer, params ){

    Parser.call( this, streamer, params );

    this.loader = undefined;
    this.surface = new Surface( this.name, this.path );

}

SurfaceParser.prototype = Object.assign( Object.create(

    Parser.prototype ), {

    constructor: SurfaceParser,
    type: "surface",

    __objName: "surface",

    _parse: function(){

        var geometry = this.loader.parse( this.streamer.asText() );

        this.surface.fromGeometry( geometry );

    }

} );


export default SurfaceParser;
