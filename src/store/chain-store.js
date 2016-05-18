/**
 * @file Chain Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import Store from "./store.js";


function ChainStore( sizeOrObject ){

    Store.call( this, sizeOrObject );

}

ChainStore.prototype = Object.assign( Object.create(

    Store.prototype ), {

    constructor: ChainStore,

    type: "ChainStore",

    __fields: [

        [ "modelIndex", 1, "uint16" ],
        [ "residueOffset", 1, "uint32" ],
        [ "residueCount", 1, "uint32" ],

        [ "chainname", 4, "uint8" ]

    ],

    setChainname: function( i, str ){

        var j = 4 * i;
        this.chainname[ j ] = str.charCodeAt( 0 );
        this.chainname[ j + 1 ] = str.charCodeAt( 1 );
        this.chainname[ j + 2 ] = str.charCodeAt( 2 );
        this.chainname[ j + 3 ] = str.charCodeAt( 3 );

    },

    getChainname: function( i ){

        var chainname = "";
        for( var k = 0; k < 4; ++k ){
            var code = this.chainname[ 4 * i + k ];
            if( code ){
                chainname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return chainname;

    }

} );


export default ChainStore;
