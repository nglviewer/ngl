/**
 * @file Dxbin Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Debug, Log, ParserRegistry } from "../globals.js";
import { uint8ToLines } from "../utils.js";
import DxParser from "./dx-parser.js";


function DxbinParser( streamer, params ){

    DxParser.call( this, streamer, params );

}

DxbinParser.prototype = Object.assign( Object.create(

    DxParser.prototype ), {

    constructor: DxbinParser,
    type: "dxbin",

    _parse: function(){

        // https://github.com/Electrostatics/apbs-pdb2pqr/issues/216

        if( Debug ) Log.time( "DxbinParser._parse " + this.name );

        var bin = this.streamer.data;
        if( bin instanceof Uint8Array ){
            bin = bin.buffer;
        }

        var headerLines = uint8ToLines( new Uint8Array( bin, 0, 1000 ) );
        var headerInfo = this.parseHeaderLines( headerLines );
        var header = this.volume.header;
        var headerByteCount = headerInfo.headerByteCount;

        var size = header.nx * header.ny * header.nz;
        var dv = new DataView( bin );
        var data = new Float32Array( size );

        for( var i = 0; i < size; ++i ){
            data[ i ] = dv.getFloat64( i * 8 + headerByteCount, true );
        }

        this.volume.setData( data, header.nz, header.ny, header.nx );

        if( Debug ) Log.timeEnd( "DxbinParser._parse " + this.name );

    }

} );

ParserRegistry.add( "dxbin", DxbinParser );


export default DxbinParser;
