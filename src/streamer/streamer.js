/**
 * @file Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { DecompressorRegistry } from "../globals.js";
import { uint8ToString, defaults } from "../utils.js";


function Streamer( src, params ){

    var p = params || {};

    this.compressed = defaults( p.compressed, false );
    this.binary = defaults( p.binary, false );
    this.json = defaults( p.json, false );
    this.xml = defaults( p.xml, false );

    this.src = src;
    this.chunkSize = 1024 * 1024 * 10;
    this.newline = "\n";

    this.__pointer = 0;
    this.__partialLine = "";

    if( this.__srcName ){
        this[ this.__srcName ] = src;
    }

}

Streamer.prototype = {

    constructor: Streamer,

    type: "",

    __srcName: undefined,

    isBinary: function(){

        return this.binary || this.compressed;

    },

    onload: function(){},

    onprogress: function(){},

    onerror: function(){},

    read: function( callback ){

        this._read( function( data ){

            var decompressFn = DecompressorRegistry.get( this.compressed );

            if( this.compressed && decompressFn ){

                this.data = decompressFn( data );

            }else{

                if( ( this.binary || this.compressed ) && data instanceof ArrayBuffer ){
                    data = new Uint8Array( data );
                }
                this.data = data;

            }

            if( typeof this.onload === "function" ){
                this.onload( this.data );
            }
            callback();

        }.bind( this ) );

    },

    _read: function( callback ){

        // overwrite this method when this.src does not contain the data

        callback( this.src );

    },

    _chunk: function( start, end ){

        end = Math.min( this.data.length, end );

        if( start === 0 && this.data.length === end ){

            return this.data;

        }else{

            if( this.isBinary() ){
                return this.data.subarray( start, end );
            }else{
                return this.data.substring( start, end );
            }

        }

    },

    chunk: function( start ){

        var end = start + this.chunkSize;

        return this._chunk( start, end );

    },

    peekLines: function( m ){

        var data = this.data;
        var n = data.length;

        // FIXME does not work for multi-char newline
        var newline = this.isBinary() ? this.newline.charCodeAt( 0 ) : this.newline;

        var i;
        var count = 0;

        for( i = 0; i < n; ++i ){

            if( data[ i ] === newline ) ++count;
            if( count === m ) break;

        }

        var chunk = this._chunk( 0, i + 1 );
        var d = this.chunkToLines( chunk, "", i > n );

        return d.lines;

    },

    lineCount: function(){

        console.warn("lineCount - deprecated");

        var data = this.data;
        var n = data.length;

        // FIXME does not work for multi-char newline
        var newline = this.isBinary() ? this.newline.charCodeAt( 0 ) : this.newline;

        var count = 0;
        for( var i = 0; i < n; ++i ){
            if( data[ i ] === newline ) ++count;
        }
        if( data[ n - 1 ] !== newline ) ++count;

        return count;

    },

    chunkCount: function(){

        return Math.floor( this.data.length / this.chunkSize ) + 1;

    },

    asText: function(){

        return this.isBinary() ? uint8ToString( this.data ) : this.data;

    },

    chunkToLines: function( chunk, partialLine, isLast ){

        var newline = this.newline;

        if( !this.isBinary() && chunk.length === this.data.length ){
            return {
                lines: chunk.split( newline ),
                partialLine: ""
            };
        }

        var str = this.isBinary() ? uint8ToString( chunk ) : chunk;
        var lines = [];
        var idx = str.lastIndexOf( newline );

        if( idx === -1 ){

            partialLine += str;

        }else{

            var str2 = partialLine + str.substr( 0, idx );
            lines = lines.concat( str2.split( newline ) );

            if( idx === str.length - newline.length ){
                partialLine = "";
            }else{
                partialLine = str.substr( idx + newline.length );
            }

        }

        if( isLast && partialLine !== "" ){
            lines.push( partialLine );
        }

        return {
            lines: lines,
            partialLine: partialLine
        };

    },

    nextChunk: function(){

        var start = this.__pointer;

        if( start > this.data.length ){
            return undefined;
        }

        this.__pointer += this.chunkSize;
        return this.chunk( start );

    },

    nextChunkOfLines: function(){

        var chunk = this.nextChunk();

        if( chunk === undefined ){
            return undefined;
        }

        var isLast = this.__pointer > this.data.length;
        var d = this.chunkToLines( chunk, this.__partialLine, isLast );

        this.__partialLine = d.partialLine;

        return d.lines;

    },

    eachChunk: function( callback ){

        var chunkSize = this.chunkSize;
        var n = this.data.length;
        var chunkCount = this.chunkCount();

        for( var i = 0; i < n; i += chunkSize ){

            var chunk = this.chunk( i );
            var chunkNo = Math.round( i / chunkSize );

            callback( chunk, chunkNo, chunkCount );

        }

    },

    eachChunkOfLines: function( callback ){

        this.eachChunk( function( chunk, chunkNo, chunkCount ){

            var isLast = chunkNo === chunkCount + 1;
            var d = this.chunkToLines( chunk, this.__partialLine, isLast );

            this.__partialLine = d.partialLine;

            callback( d.lines, chunkNo, chunkCount );

        }.bind( this ) );

    },

    dispose: function(){

        delete this.src;

        if( this.__srcName ){
            delete this[ this.__srcName ];
        }

    }

};


export default Streamer;
