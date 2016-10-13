/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import FileStreamer from "../streamer/file-streamer.js";
import NetworkStreamer from "../streamer/network-streamer.js";


function Loader( src, params ){

    var p = Object.assign( {}, params );

    var binary = [ "mmtf", "dcd", "mrc", "ccp4", "map", "dxbin" ].includes( p.ext );

    this.compressed = defaults( p.compressed, false );
    this.binary = defaults( p.binary, binary );
    this.name = defaults( p.name, "" );
    this.ext = defaults( p.ext, "" );
    this.dir = defaults( p.dir, "" );
    this.path = defaults( p.path, "" );
    this.protocol = defaults( p.protocol, "" );

    this.params = params;

    //

    var streamerParams = {
        compressed: this.compressed,
        binary: this.binary,
        json: this.ext === "json",
        xml: this.ext === "xml"
    };

    if( ( typeof File !== "undefined" && src instanceof File ) ||
        ( typeof Blob !== "undefined" && src instanceof Blob )
    ){
        this.streamer = new FileStreamer( src, streamerParams );
    }else{
        this.streamer = new NetworkStreamer( src, streamerParams );
    }

    if( typeof p.onProgress === "function" ){
        this.streamer.onprogress = p.onprogress;
    }

}

Loader.prototype = {

    constructor: Loader,

    load: function(){

        return new Promise( function( resolve, reject ){

            this.streamer.onerror = reject;

            try{
                this._load( resolve, reject );
            }catch( e ){
                reject( e );
            }

        }.bind( this ) );

    },

    _load: function( resolve, reject ){

        reject( "not implemented" );

    }

};


export default Loader;
