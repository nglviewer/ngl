/**
 * @file Parser Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { ParserRegistry } from "../globals.js";
import Loader from "./loader.js";


function ParserLoader( src, params ){

    Loader.call( this, src, params );

    this.useWorker = this.params.useWorker === undefined ? false : this.params.useWorker;

}

ParserLoader.prototype = Object.assign( Object.create(

    Loader.prototype ), {

    constructor: ParserLoader,

    _load: function( resolve, reject ){

        var ParserClass = ParserRegistry.get( this.ext );
        var parser = new ParserClass( this.streamer, this.params );

        if( this.useWorker ){
            parser.parseWorker( resolve );
        }else{
            parser.parse( resolve );
        }

    }

} );


export default ParserLoader;
