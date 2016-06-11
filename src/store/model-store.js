/**
 * @file Model Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Store from "./store.js";


function ModelStore( sizeOrObject ){

    Store.call( this, sizeOrObject );

}

ModelStore.prototype = Object.assign( Object.create(

    Store.prototype ), {

    constructor: ModelStore,

    type: "ModelStore",

    __fields: [

        [ "chainOffset", 1, "uint32" ],
        [ "chainCount", 1, "uint32" ]

    ]

} );


export default ModelStore;
