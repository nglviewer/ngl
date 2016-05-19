/**
 * @file Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Debug, Log, WorkerRegistry } from "../globals.js";
import { fromJSON } from "../utils.js";
import Worker from "../worker/worker.js";


WorkerRegistry.add( "parse", function( e, callback ){

    if( Debug ) Log.time( "WORKER parse" );

    var parser = fromJSON( e.data );

    parser.parse( function(){

        if( Debug ) Log.timeEnd( "WORKER parse" );

        // no need to return the streamer data
        parser.streamer.dispose();

        callback( parser.toJSON(), parser.getTransferable() );

    } );

} );


function Parser( streamer, params ){

    var p = params || {};

    this.streamer = streamer;

    this.name = p.name;
    this.path = p.path;

}

Parser.prototype = {

    constructor: Parser,
    type: "",

    __objName: "",

    parse: function( callback ){

        var self = this;

        this.streamer.read( function(){
            self._beforeParse();
            self._parse( function(){
                self._afterParse();
                callback( self[ self.__objName ] );
            } );
        } );

        return this[ this.__objName ];

    },

    parseWorker: function( callback ){

        if( typeof Worker !== "undefined" && typeof importScripts !== 'function' ){

            var worker = new Worker( "parse" ).post(

                this.toJSON(),

                this.getTransferable(),

                function( e ){

                    worker.terminate();

                    this.fromJSON( e.data );
                    this._afterWorker( callback );

                }.bind( this ),

                function( e ){

                    Log.warn(
                        "Parser.parseWorker error - trying without worker", e
                    );
                    worker.terminate();

                    this.parse( callback );

                }.bind( this )

            );

        }else{

            this.parse( callback );

        }

        return this[ this.__objName ];

    },

    _parse: function( callback ){

        Log.warn( "Parser._parse not implemented" );
        callback();

    },

    _beforeParse: function(){},

    _afterParse: function(){

        if( Debug ) Log.log( this[ this.__objName ] );

    },

    _afterWorker: function( callback ){

        if( Debug ) Log.log( this[ this.__objName ] );
        callback( this[ this.__objName ] );

    },

    toJSON: function(){

        var type = this.type.substr( 0, 1 ).toUpperCase() +
                    this.type.substr( 1 );

        var output = {

            metadata: {
                version: 0.1,
                type: type + 'Parser',
                generator: type + 'ParserExporter'
            },

            streamer: this.streamer.toJSON(),
            name: this.name,
            path: this.path,

        };

        if( typeof this[ this.__objName ].toJSON === "function" ){

            output[ this.__objName ] = this[ this.__objName ].toJSON();

        }else{

            output[ this.__objName ] = this[ this.__objName ];

        }

        return output;

    },

    fromJSON: function( input ){

        this.streamer = fromJSON( input.streamer );
        this.name = input.name;
        this.path = input.path;

        if( typeof this[ this.__objName ].toJSON === "function" ){

            this[ this.__objName ].fromJSON( input[ this.__objName ] );

        }else{

            this[ this.__objName ] = input[ this.__objName ];

        }

        return this;

    },

    getTransferable: function(){

        var transferable = [];

        transferable = transferable.concat(
            this.streamer.getTransferable()
        );

        if( typeof this[ this.__objName ].toJSON === "function" ){

            transferable = transferable.concat(
                this[ this.__objName ].getTransferable()
            );

        }

        return transferable;

    }

};


export default Parser;
