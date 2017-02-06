/**
 * @file Parser Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ParserRegistry } from "../globals.js";
import Loader from "./loader.js";


function ParserLoader( src, params ){

    Loader.call( this, src, params );

}

ParserLoader.prototype = Object.assign( Object.create(

    Loader.prototype ), {

    constructor: ParserLoader,

    load: function(){

        var ParserClass = ParserRegistry.get( this.ext );
        var parser = new ParserClass( this.streamer, this.params );

        return parser.parse();

    }

} );


export default ParserLoader;
