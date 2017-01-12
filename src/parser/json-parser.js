/**
 * @file Json Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ParserRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import Parser from "./parser.js";


function JsonParser( streamer, params ){

    var p = params || {};

    Parser.call( this, streamer, p );

    this.string = defaults( p.string, false );

    this.json = {
        name: this.name,
        path: this.path,
        data: {}
    };

}

JsonParser.prototype = Object.assign( Object.create(

    Parser.prototype ), {

    constructor: JsonParser,
    type: "json",

    __objName: "json",

    _parse: function(){

        if( this.streamer.isBinary() || this.string ){
            this.json.data = JSON.parse( this.streamer.asText() );
        }else{
            this.json.data = this.streamer.data;
        }

    }

} );

ParserRegistry.add( "json", JsonParser );


export default JsonParser;
