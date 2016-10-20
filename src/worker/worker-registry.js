/**
 * @file Worker Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { makeWorkerBlob } from "./worker-utils.js";


function WorkerRegistry(){

    this.activeWorkerCount = 0;

    var funcDict = {};
    var depsDict = {};
    var blobDict = {};

    this.add = function( name, func, deps ){
        funcDict[ name ] = func;
        depsDict[ name ] = deps;
    };

    this.get = function( name ){
        if( !blobDict[ name ] ){
            blobDict[ name ] = makeWorkerBlob(
                funcDict[ name ], depsDict[ name ]
            );
        }
        return blobDict[ name ];
    };

}


export default WorkerRegistry;
