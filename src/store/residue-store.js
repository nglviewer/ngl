/**
 * @file Residue Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Store from "./store.js";


function ResidueStore( sizeOrObject ){

    Store.call( this, sizeOrObject );

}

ResidueStore.prototype = Object.assign( Object.create(

    Store.prototype ), {

    constructor: ResidueStore,

    type: "ResidueStore",

    __fields: [

        [ "chainIndex", 1, "uint32" ],
        [ "atomOffset", 1, "uint32" ],
        [ "atomCount", 1, "uint16" ],
        [ "residueTypeId", 1, "uint16" ],

        [ "resno", 1, "int32" ],
        [ "sstruc", 1, "uint8" ],
        [ "inscode", 1, "uint8" ]

    ],

    setSstruc: function( i, str ){
        this.sstruc[ i ] = str.charCodeAt( 0 );
    },

    getSstruc: function( i ){
        var code = this.sstruc[ i ];
        return code ? String.fromCharCode( code ) : "";
    },

    setInscode: function( i, str ){
        this.inscode[ i ] = str.charCodeAt( 0 );
    },

    getInscode: function( i ){
        var code = this.inscode[ i ];
        return code ? String.fromCharCode( code ) : "";
    }

} );


export default ResidueStore;
