/**
 * @file Script Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Loader from "./loader.js";
import Script from "../script.js";


function ScriptLoader( src, params ){

    Loader.call( this, src, params );

}

ScriptLoader.prototype = Object.assign( Object.create(

    Loader.prototype ), {

    constructor: ScriptLoader,

    load: function(){

        return this.streamer.read().then( () => {

            return new Script(
                this.streamer.asText(), this.name, this.path
            );

        } );

    }

} );


export default ScriptLoader;
