/**
 * @file Text Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { ParserRegistry } from "../globals.js";
import Parser from "./parser.js";


function TextParser( streamer, params ){

    var p = params || {};

    Parser.call( this, streamer, p );

    this.text = {

        name: this.name,
        path: this.path,
        data: ""

    };

}

TextParser.prototype = Object.assign( Object.create(

    Parser.prototype ), {

    constructor: TextParser,
    type: "text",

    __objName: "text",

    _parse: function( callback ){

        this.text.data = this.streamer.asText();

        callback();

    }

} );

ParserRegistry.add( "txt", TextParser );
ParserRegistry.add( "text", TextParser );


export default TextParser;
