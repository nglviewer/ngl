/**
 * @file Gzip Decompressor
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { DecompressorRegistry } from "../globals.js";
import { ungzip } from "../../lib/pako_inflate.es6.js";


function gzipDecompress( data ){

    var decompressedData;

    if( data instanceof ArrayBuffer ){
        data = new Uint8Array( data );
    }

    try{
        decompressedData = ungzip( data );
    }catch( e ){
        decompressedData = data;  // assume it is already uncompressed
    }

    return decompressedData;

}


DecompressorRegistry.add( "gz", gzipDecompress );
