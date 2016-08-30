/**
 * @file Worker Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { uniqueArray } from "../utils.js";


function getWorkerDeps( vars ){
    var deps = vars;
    vars.forEach( function( sym ){
        if( sym.__deps ){
            Array.prototype.push.apply( deps, getWorkerDeps( sym.__deps ) );
        }
    } );
    return deps;
}


function makeWorkerString( vars ){
    var deps = uniqueArray( getWorkerDeps( vars ) );
    return deps.map( function( sym ){
        return sym.toString();
    } ).join( "\n\n\n" );
}


function onmessage( e ){

    var name = e.data.__name;
    var postId = e.data.__postId;

    if( name === undefined ){

        console.error( "message __name undefined" );

    }else if( self.func === undefined ){

        console.error( "worker func undefined", name );

    }else{

        var callback = function( aMessage, transferList ){

            aMessage = aMessage || {};
            if( postId !== undefined ) aMessage.__postId = postId;

            try{
                self.postMessage( aMessage, transferList );
            }catch( error ){
                console.error( "self.postMessage:", error );
                self.postMessage( aMessage );
            }

        };

        self.func( e, callback );

    }

}


function makeWorkerBlob( func, deps ){
    var str = "'use strict';\n\n" + makeWorkerString( deps );
    str += "\n\n\nself.func = " + func.toString() + ";";
    str += "\n\n\nself.onmessage = " + onmessage.toString() + ";";
    // console.log( str );
    return new Blob( [ str ], { type: "application/javascript" } );
}


export {
    makeWorkerBlob
};
