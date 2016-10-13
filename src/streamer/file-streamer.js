/**
 * @file File Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Streamer from "./streamer.js";


function FileStreamer( file, params ){

    Streamer.call( this, file, params );

}

FileStreamer.prototype = Object.assign( Object.create(

    Streamer.prototype ), {

    constructor: FileStreamer,

    type: "file",

    __srcName: "file",

    _read: function( callback ){

        var reader;

        if( typeof importScripts === 'function' ){

            // Use FileReaderSync within Worker

            reader = new FileReaderSync();
            var data;
            if( this.binary || this.compressed ){
                data = reader.readAsArrayBuffer( this.file );
            }else{
                data = reader.readAsText( this.file );
            }

            //

            callback( data );

        }else{

            reader = new FileReader();

            //

            reader.onload = function( event ){

                callback( event.target.result );

            }.bind( this );

            //

            if( typeof this.onprogress === "function" ){

                reader.onprogress = function ( event ) {

                    this.onprogress( event );

                }.bind( this );

            }

            //

            if( typeof this.onerror === "function" ){

                reader.onerror = function ( event ) {

                    this.onerror( event );

                }.bind( this );

            }

            //

            if( this.binary || this.compressed ){
                reader.readAsArrayBuffer( this.file );
            }else{
                reader.readAsText( this.file );
            }

        }

    }

} );


export default FileStreamer;
