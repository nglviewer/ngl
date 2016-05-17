/**
 * @file Surface Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import Parser from "./parser.js";
import Surface from "../surface/surface.js";


function SurfaceParser( streamer, params ){

    var p = params || {};

    Parser.call( this, streamer, p );

    this.loader = undefined;
    this.surface = new Surface( this.name, this.path );

}

SurfaceParser.prototype = Object.assign( Object.create(

    Parser.prototype ), {

    constructor: SurfaceParser,
    type: "surface",

    __objName: "surface",

    _parse: function( callback ){

        var geometry = this.loader.parse( this.streamer.asText() );

        this.surface.fromGeometry( geometry );

        callback();

    }

} );


export default SurfaceParser;
