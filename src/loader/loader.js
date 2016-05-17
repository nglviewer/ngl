/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import FileStreamer from "../streamer/file-streamer.js";
import NetworkStreamer from "../streamer/network-streamer.js";


Loader = function( src, params ){

    var p = Object.assign( {}, params );

    var binaryExtList = [ "mmtf", "dcd", "mrc", "ccp4", "map", "dxbin" ];
    var binary = binaryExtList.indexOf( p.ext ) !== -1;

    this.compressed = p.compressed || false;
    this.binary = p.binary !== undefined ? p.binary : binary;
    this.name = p.name || "";
    this.ext = p.ext || "";
    this.dir = p.dir || "";
    this.path = p.path || "";
    this.protocol = p.protocol || "";

    this.params = params;

    //

    var streamerParams = {
        compressed: this.compressed,
        binary: this.binary,
        json: this.ext === "json"
    };

    if( ( self.File && src instanceof File ) ||
        ( self.Blob && src instanceof self.Blob )
    ){
        this.streamer = new FileStreamer( src, streamerParams );
    }else{
        this.streamer = new NetworkStreamer( src, streamerParams );
    }

    if( typeof p.onProgress === "function" ){
        this.streamer.onprogress = p.onprogress;
    }

};

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
