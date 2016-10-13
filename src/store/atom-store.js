/**
 * @file Atom Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Store from "./store.js";


function AtomStore( sizeOrObject ){

    Store.call( this, sizeOrObject );

}

AtomStore.prototype = Object.assign( Object.create(

    Store.prototype ), {

    constructor: AtomStore,

    type: "AtomStore",

    __fields: [

        [ "residueIndex", 1, "uint32" ],
        [ "atomTypeId", 1, "uint16" ],

        [ "x", 1, "float32" ],
        [ "y", 1, "float32" ],
        [ "z", 1, "float32" ],
        [ "serial", 1, "int32" ],
        [ "bfactor", 1, "float32" ],
        [ "altloc", 1, "uint8" ],
        [ "occupancy", 1, "float32" ]

    ],

    setAltloc: function( i, str ){
        this.altloc[ i ] = str.charCodeAt( 0 );
    },

    getAltloc: function( i ){
        var code = this.altloc[ i ];
        return code ? String.fromCharCode( code ) : "";
    }

} );


export default AtomStore;
