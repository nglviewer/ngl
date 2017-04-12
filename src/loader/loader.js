/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import FileStreamer from "../streamer/file-streamer.js";
import NetworkStreamer from "../streamer/network-streamer.js";


/**
 * Loader parameter object.
 * @typedef {Object} LoaderParameters - loader parameters
 * @property {String} ext - file extension, determines file type
 * @property {Boolean} compressed - flag data as compressed
 * @property {Boolean} binary - flag data as binary
 * @property {String} name - set data name
 */


const binaryFileExtensions = [
    "mmtf", "dcd", "mrc", "ccp4", "map", "dsn6", "brix", "dxbin"
];

const jsonFileTypes = [
    "json"
];

const xmlFileTypes = [
    "xml", "validation"
];


/**
 * Loader base class
 */
class Loader{

    /**
     * Construct a loader object
     * @param  {String|File|Blob} src - data source, string is interpreted as an URL
     * @param  {LoaderParameters} params - parameters object
     */
    constructor( src, params ){

        var p = Object.assign( {}, params );

        var binary = binaryFileExtensions.includes( p.ext );

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
            json: jsonFileTypes.includes( this.ext ),
            xml: xmlFileTypes.includes( this.ext )
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

    /**
     * Load data
     * @abstract
     * @return {Promise} resolves to the loaded data {@link Object}
     */
    load(){

        return new Promise.reject( "not implemented" );

    }

}


export default Loader;
