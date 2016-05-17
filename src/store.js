/**
 * @file Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


//////////
// Store

NGL.Store = function( sizeOrObject ){

    if( sizeOrObject === undefined ){

        this.init( 0 );

    }else if( Number.isInteger( sizeOrObject ) ){

        this.init( sizeOrObject );

    }else{

        this.fromJSON( sizeOrObject );

    }

};

NGL.Store.prototype = {

    constructor: NGL.Store,

    type: "Store",

    init: function( size ){

        this.length = size;
        this.count = 0;

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            var itemSize = this.__fields[ i ][ 1 ];
            var arrayType = this.__fields[ i ][ 2 ];
            var arraySize = this.length * itemSize;

            switch( arrayType ){

                case "int8":
                    this[ name ] = new Int8Array( arraySize );
                    break;

                case "int16":
                    this[ name ] = new Int16Array( arraySize );
                    break;

                case "int32":
                    this[ name ] = new Int32Array( arraySize );
                    break;

                case "uint8":
                    this[ name ] = new Uint8Array( arraySize );
                    break;

                case "uint16":
                    this[ name ] = new Uint16Array( arraySize );
                    break;

                case "uint32":
                    this[ name ] = new Uint32Array( arraySize );
                    break;

                case "float32":
                    this[ name ] = new Float32Array( arraySize );
                    break;

                default:
                    NGL.warn( "arrayType unknown: " + arrayType );

            }

        }

    },

    resize: function( size ){

        // NGL.time( "NGL.Store.resize" );

        this.length = Math.round( size || 0 );
        this.count = Math.min( this.count, this.length );

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            var itemSize = this.__fields[ i ][ 1 ];
            var arraySize = this.length * itemSize;
            var tmpArray = new this[ name ].constructor( arraySize );

            if( this[ name ].length > arraySize ){
                tmpArray.set( this[ name ].subarray( 0, arraySize ) );
            }else{
                tmpArray.set( this[ name ] );
            }
            this[ name ] = tmpArray;

        }

        // NGL.timeEnd( "NGL.Store.resize" );

    },

    growIfFull: function(){

        if( this.count >= this.length ){
            var size = Math.round( this.length * 1.5 );
            this.resize( Math.max( 256, size ) );
        }

    },

    copyFrom: function( other, thisOffset, otherOffset, length ){

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            var itemSize = this.__fields[ i ][ 1 ];
            var thisField = this[ name ];
            var otherField = other[ name ];

            for( var j = 0; j < length; ++j ){
                var thisIndex = itemSize * ( thisOffset + j );
                var otherIndex = itemSize * ( otherOffset + j );
                for( var k = 0; k < itemSize; ++k ){
                    thisField[ thisIndex + k ] = otherField[ otherIndex + k ];
                }
            }

        }

    },

    copyWithin: function( offsetTarget, offsetSource, length ){

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            var itemSize = this.__fields[ i ][ 1 ];
            var thisField = this[ name ];

            for( var j = 0; j < length; ++j ){
                var targetIndex = itemSize * ( offsetTarget + j );
                var sourceIndex = itemSize * ( offsetSource + j );
                for( var k = 0; k < itemSize; ++k ){
                    thisField[ targetIndex + k ] = thisField[ sourceIndex + k ];
                }
            }

        }

    },

    sort: function( compareFunction ){

        NGL.time( "NGL.Store.sort" );

        var thisStore = this;
        var tmpStore = new this.constructor( 1 );

        function swap( index1, index2 ){
            if( index1 === index2 ) return;
            tmpStore.copyFrom( thisStore, 0, index1, 1 );
            thisStore.copyWithin( index1, index2, 1 );
            thisStore.copyFrom( tmpStore, index2, 0, 1 );
        }

        function quicksort( left, right ){
            if( left < right ){
                var pivot = Math.floor( ( left + right ) / 2 );
                var left_new = left;
                var right_new = right;
                do{
                    while( compareFunction( left_new, pivot ) < 0 ){
                        left_new += 1;
                    }
                    while( compareFunction( right_new, pivot ) > 0 ){
                        right_new -= 1;
                    }
                    if( left_new <= right_new ){
                        if( left_new === pivot ){
                            pivot = right_new;
                        }else if( right_new === pivot ){
                            pivot = left_new;
                        }
                        swap( left_new, right_new );
                        left_new += 1;
                        right_new -= 1;
                    }
                }while( left_new <= right_new );
                quicksort( left, right_new );
                quicksort( left_new, right );
            }
        }

        quicksort( 0, this.count - 1 );

        NGL.timeEnd( "NGL.Store.sort" );

    },

    toJSON: function(){

        var output = {

            metadata: {
                version: 0.1,
                type: this.type,
                generator: this.type + "Exporter"
            },

            length: this.length,
            count: this.count,

        };

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            output[ name ] = this[ name ];

        }

        return output;

    },

    fromJSON: function( input ){

        this.length = input.length;
        this.count = input.count;

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            this[ name ] = input[ name ];

        }

        return this;

    },

    getTransferable: function(){

        var transferable = [];

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            transferable.push( this[ name ].buffer );

        }

        return transferable;

    },

    clear: function(){

        this.count = 0;

    },

    dispose: function(){

        delete this.length;
        delete this.count;

        for( var i = 0, il = this.__fields.length; i < il; ++i ){

            var name = this.__fields[ i ][ 0 ];
            delete this[ name ];

        }

    }

};


//////////////
// BondStore

NGL.BondStore = function( sizeOrObject ){

    NGL.Store.call( this, sizeOrObject );

};

NGL.BondStore.prototype = Object.assign( Object.create(

    NGL.Store.prototype ), {

    constructor: NGL.BondStore,

    type: "BondStore",

    __fields: [

        [ "atomIndex1", 1, "int32" ],
        [ "atomIndex2", 1, "int32" ],
        [ "bondOrder", 1, "int8" ],

    ],

    addBond: function( atom1, atom2, bondOrder ){

        this.growIfFull();

        var i = this.count;
        this.atomIndex1[ i ] = atom1.index;
        this.atomIndex2[ i ] = atom2.index;
        this.bondOrder[ i ] = bondOrder;

        this.count += 1;

    },

    addBondIfConnected: function( atom1, atom2, bondOrder ){

        if( atom1.connectedTo( atom2 ) ){
            this.addBond( atom1, atom2, bondOrder );
            return true;
        }

        return false;

    }

} );


//////////////
// AtomStore

NGL.AtomStore = function( sizeOrObject ){

    NGL.Store.call( this, sizeOrObject );

};

NGL.AtomStore.prototype = Object.assign( Object.create(

    NGL.Store.prototype ), {

    constructor: NGL.AtomStore,

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


/////////////////
// ResidueStore

NGL.ResidueStore = function( sizeOrObject ){

    NGL.Store.call( this, sizeOrObject );

};

NGL.ResidueStore.prototype = Object.assign( Object.create(

    NGL.Store.prototype ), {

    constructor: NGL.ResidueStore,

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


///////////////
// ChainStore

NGL.ChainStore = function( sizeOrObject ){

    NGL.Store.call( this, sizeOrObject );

};

NGL.ChainStore.prototype = Object.assign( Object.create(

    NGL.Store.prototype ), {

    constructor: NGL.ChainStore,

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


///////////////
// ModelStore

NGL.ModelStore = function( sizeOrObject ){

    NGL.Store.call( this, sizeOrObject );

};

NGL.ModelStore.prototype = Object.assign( Object.create(

    NGL.Store.prototype ), {

    constructor: NGL.ModelStore,

    type: "ModelStore",

    __fields: [

        [ "chainOffset", 1, "uint32" ],
        [ "chainCount", 1, "uint32" ]

    ]

} );
