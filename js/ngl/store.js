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

        NGL.time( "NGL.Store.resize" );

        this.length = size;
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

        NGL.timeEnd( "NGL.Store.resize" );

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

NGL.BondStore.prototype = NGL.createObject(

    NGL.Store.prototype, {

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

NGL.AtomStore.prototype = NGL.createObject(

    NGL.Store.prototype, {

    constructor: NGL.AtomStore,

    type: "AtomStore",

    __fields: [

        [ "residueIndex", 1, "uint32" ],

        [ "atomno", 1, "int32" ],
        [ "resname", 5, "uint8" ],
        [ "x", 1, "float32" ],
        [ "y", 1, "float32" ],
        [ "z", 1, "float32" ],
        [ "element", 3, "uint8" ],
        [ "chainname", 4, "uint8" ],
        [ "resno", 1, "int32" ],
        [ "serial", 1, "int32" ],
        [ "sstruc", 1, "uint8" ],
        [ "vdw", 1, "float32" ],
        [ "covalent", 1, "float32" ],
        [ "hetero", 1, "int8" ],
        [ "bfactor", 1, "float32" ],
        [ "altloc", 1, "uint8" ],
        [ "atomname", 4, "uint8" ],
        [ "modelindex", 1, "uint32" ]

    ],

    setResname: function( i, str ){

        var j = 5 * i;
        this.resname[ j ] = str.charCodeAt( 0 );
        this.resname[ j + 1 ] = str.charCodeAt( 1 );
        this.resname[ j + 2 ] = str.charCodeAt( 2 );
        this.resname[ j + 3 ] = str.charCodeAt( 3 );
        this.resname[ j + 4 ] = str.charCodeAt( 4 );

    },

    getResname: function( i ){

        var code;
        var resname = "";
        var j = 5 * i;
        for( var k = 0; k < 5; ++k ){
            code = this.resname[ j + k ];
            if( code ){
                resname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return resname;

    },

    setElement: function( i, str ){

        var j = 3 * i;
        this.element[ j ] = str.charCodeAt( 0 );
        this.element[ j + 1 ] = str.charCodeAt( 1 );
        this.element[ j + 2 ] = str.charCodeAt( 2 );

    },

    getElement: function( i ){

        var code;
        var element = "";
        var j = 3 * i;
        for( var k = 0; k < 3; ++k ){
            code = this.element[ j + k ];
            if( code ){
                element += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return element;

    },

    setChainname: function( i, str ){

        var j = 4 * i;
        this.chainname[ j ] = str.charCodeAt( 0 );
        this.chainname[ j + 1 ] = str.charCodeAt( 1 );
        this.chainname[ j + 2 ] = str.charCodeAt( 2 );
        this.chainname[ j + 3 ] = str.charCodeAt( 3 );

    },

    getChainname: function( i ){

        var code;
        var chainname = "";
        var j = 4 * i;
        for( var k = 0; k < 4; ++k ){
            code = this.chainname[ j + k ];
            if( code ){
                chainname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return chainname;

    },

    setSstruc: function( i, str ){

        this.sstruc[ i ] = str.charCodeAt( 0 );

    },

    getSstruc: function( i ){

        var code = this.sstruc[ i ];
        return code ? String.fromCharCode( code ) : "";

    },

    setAltloc: function( i, str ){

        this.altloc[ i ] = str.charCodeAt( 0 );

    },

    getAltloc: function( i ){

        var code = this.altloc[ i ];
        return code ? String.fromCharCode( code ) : "";

    },

    setAtomname: function( i, str ){

        var j = 4 * i;
        this.atomname[ j ] = str.charCodeAt( 0 );
        this.atomname[ j + 1 ] = str.charCodeAt( 1 );
        this.atomname[ j + 2 ] = str.charCodeAt( 2 );
        this.atomname[ j + 3 ] = str.charCodeAt( 3 );

    },

    getAtomname: function( i ){

        var code;
        var atomname = "";
        var j = 4 * i;
        for( var k = 0; k < 4; ++k ){
            code = this.atomname[ j + k ];
            if( code ){
                atomname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return atomname;

    }

} );


/////////////////
// ResidueStore

NGL.ResidueStore = function( sizeOrObject ){

    NGL.Store.call( this, sizeOrObject );

};

NGL.ResidueStore.prototype = NGL.createObject(

    NGL.Store.prototype, {

    constructor: NGL.ResidueStore,

    type: "ResidueStore",

    __fields: [

        [ "chainIndex", 1, "uint32" ],
        [ "atomOffset", 1, "uint32" ],
        [ "atomCount", 1, "uint16" ],

        [ "resno", 1, "int32" ],
        [ "resname", 5, "uint8" ],
        [ "sstruc", 1, "uint8" ]

    ],

    setResname: function( i, str ){

        var j = 5 * i;
        this.resname[ j ] = str.charCodeAt( 0 );
        this.resname[ j + 1 ] = str.charCodeAt( 1 );
        this.resname[ j + 2 ] = str.charCodeAt( 2 );
        this.resname[ j + 3 ] = str.charCodeAt( 3 );
        this.resname[ j + 4 ] = str.charCodeAt( 4 );

    },

    getResname: function( i ){

        var code;
        var resname = "";
        var j = 5 * i;
        for( var k = 0; k < 5; ++k ){
            code = this.resname[ j + k ];
            if( code ){
                resname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return resname;

    },

    setSstruc: function( i, str ){

        this.sstruc[ i ] = str.charCodeAt( 0 );

    },

    getSstruc: function( i ){

        var code = this.sstruc[ i ];
        return code ? String.fromCharCode( code ) : "";

    }

} );


///////////////
// ChainStore

NGL.ChainStore = function( sizeOrObject ){

    NGL.Store.call( this, sizeOrObject );

};

NGL.ChainStore.prototype = NGL.createObject(

    NGL.Store.prototype, {

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

        var code;
        var chainname = "";
        var j = 4 * i;
        for( var k = 0; k < 4; ++k ){
            code = this.chainname[ j + k ];
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

NGL.ModelStore.prototype = NGL.createObject(

    NGL.Store.prototype, {

    constructor: NGL.ModelStore,

    type: "ModelStore",

    __fields: [

        [ "chainOffset", 1, "uint32" ],
        [ "chainCount", 1, "uint32" ]

    ]

} );
