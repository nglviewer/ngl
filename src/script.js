/**
 * @file Script
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Signal from "../lib/signals.es6.js";

import { Log } from "./globals.js";


function Script( functionBody, name, path ){

    this.signals = {

        elementAdded: new Signal(),
        elementRemoved: new Signal(),
        nameChanged: new Signal(),

    };

    this.name = name;
    this.path = path;
    this.dir = path.substring( 0, path.lastIndexOf( '/' ) + 1 );

    try {

        // supress warning about string evaluation as code
        // jshint evil:true
        this.fn = new Function(

            'stage', 'panel',
            '__name__', '__path__', '__dir__',

            functionBody

        );

    }catch( e ){

        Log.error( "Script compilation failed", e );
        this.fn = null;

    }

}

Script.prototype = {

    constructor: Script,

    type: "Script",

    call: function( stage, onFinish ){

        var panel = {

            add: function( /*element*/ ){

                this.signals.elementAdded.dispatch( arguments );

            }.bind( this ),

            remove: function( /*element*/ ){

                this.signals.elementRemoved.dispatch( arguments );

            }.bind( this ),

            setName: function( value ){

                this.signals.nameChanged.dispatch( value );

            }.bind( this )

        };

        if( this.fn ){

            var args = [
                stage, panel,
                this.name, this.path, this.dir
            ];

            try{

                this.fn.apply( null, args );
                finish();

            }catch( e ){

                Log.error( "Script.fn", e );
                error();

            }

        }else{

            Log.log( "Script.call no function available" );
            finish();

        }

        function finish(){
            if( typeof onFinish === "function" ) onFinish();
        }

        function error(){
            Log.error( "Script: Error executing script" );
            finish();
        }

    }

};


export default Script;
