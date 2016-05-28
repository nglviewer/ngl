/**
 * @file Worker Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
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

function makeWorker( onmessage, deps ){
    var str = makeWorkerString( deps );
    str += "\n\n\nself.onmessage = " + onmessage.toString();
    // console.log( str );
    var blob = new Blob( [ str ], { type: "application/javascript" } );
    return new self.Worker( URL.createObjectURL( blob ) );
}


// function onmessage( e ){

//     var name = e.data.__name;
//     var postId = e.data.__postId;
//     // NGL.debug = e.data.__debug;

//     if( name === undefined ){

//         NGL.error( "message __name undefined" );

//     }else if( NGL.WorkerRegistry.funcDict[ name ] === undefined ){

//         NGL.error( "funcDict[ __name ] undefined", name );

//     }else{

//         var callback = function( aMessage, transferList ){

//             aMessage = aMessage || {};
//             if( postId !== undefined ) aMessage.__postId = postId;

//             try{
//                 self.postMessage( aMessage, transferList );
//             }catch( error ){
//                 NGL.error( "self.postMessage:", error );
//                 self.postMessage( aMessage );
//             }

//         };

//         NGL.WorkerRegistry.funcDict[ name ]( e, callback );

//     }

// }


export {
    makeWorkerString,
    makeWorker,
    onmessage
};
