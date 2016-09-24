/**
 * @file Network Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Streamer from "./streamer.js";


function NetworkStreamer( url, params ){

    Streamer.call( this, url, params );

}

NetworkStreamer.prototype = Object.assign( Object.create(

    Streamer.prototype ), {

    constructor: NetworkStreamer,

    type: "network",

    __srcName: "url",

    _read: function( callback ){

        var url = this.src;

        if( typeof importScripts === 'function' ){

            // FIXME
            // adjust relative path when inside a web worker
            if( url.substr( 0, 3 ) === "../" ) url = "../" + url;

        }

        var xhr = new XMLHttpRequest();
        xhr.open( "GET", url, true );

        //

        xhr.addEventListener( 'load', function () {

            if( xhr.status === 200 || xhr.status === 304 ||
                // when requesting from local file system
                // the status in Google Chrome/Chromium is 0
                xhr.status === 0
            ){

                callback( xhr.response );

            } else {

                if( typeof this.onerror === "function" ){

                    this.onerror( xhr.status );

                }

                throw "NetworkStreamer._read: status code " + xhr.status;

            }

        }.bind( this ), false );

        //

        // if( typeof this.onprogress === "function" ){

        //     xhr.addEventListener( 'progress', function ( event ) {

        //         this.onprogress( event );

        //     }.bind( this ), false );

        // }

        //

        if( typeof this.onerror === "function" ){

            xhr.addEventListener( 'error', function ( event ) {

                this.onerror( event );

            }.bind( this ), false );

        }

        //

        if( this.isBinary() ){
            xhr.responseType = "arraybuffer";
        }else if( this.json ){
            xhr.responseType = "json";
        }else if( this.xml ){
            xhr.responseType = "document";
        }
        // xhr.crossOrigin = true;

        xhr.send( null );

        // try {
        //     xhr.send( null );
        // }catch( e ){
        //     if( typeof this.onerror === "function" ){
        //         this.onerror( e.message );
        //     }
        // }

    }

} );


export default NetworkStreamer;
