/**
 * @file Polymer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log } from "../globals.js";
import Bitset from "../utils/bitset.js";


/**
 * Polymer
 * @class
 * @param {Structure} structure - the structure
 * @param {Integer} residueIndexStart - the index of the first residue
 * @param {Integer} residueIndexEnd - the index of the last residue
 */
function Polymer( structure, residueIndexStart, residueIndexEnd ){

    this.structure = structure;
    this.chainStore = structure.chainStore;
    this.residueStore = structure.residueStore;
    this.atomStore = structure.atomStore;

    this.residueIndexStart = residueIndexStart;
    this.residueIndexEnd = residueIndexEnd;
    this.residueCount = residueIndexEnd - residueIndexStart + 1;

    var rpStart = this.structure.getResidueProxy( this.residueIndexStart );
    var rpEnd = this.structure.getResidueProxy( this.residueIndexEnd );
    this.isPrevConnected = rpStart.getPreviousConnectedResidue() !== undefined;
    var rpNext = rpEnd.getNextConnectedResidue();
    this.isNextConnected = rpNext !== undefined;
    this.isNextNextConnected = this.isNextConnected && rpNext.getNextConnectedResidue() !== undefined;
    this.isCyclic = rpEnd.connectedTo( rpStart );

    this.__residueProxy = this.structure.getResidueProxy();

    // console.log( this.qualifiedName(), this );

}

Polymer.prototype = {

    constructor: Polymer,
    type: "Polymer",

    structure: undefined,
    residueStore: undefined,
    atomStore: undefined,

    residueIndexStart: undefined,
    residueIndexEnd: undefined,
    residueCount: undefined,

    //

    get chainIndex () {
        return this.residueStore.chainIndex[ this.residueIndexStart ];
    },
    get modelIndex () {
        return this.chainStore.modelIndex[ this.chainIndex ];
    },

    get chainname () {
        return this.chainStore.getChainname( this.chainIndex );
    },

    //

    isProtein: function(){
        this.__residueProxy.index = this.residueIndexStart;
        return this.__residueProxy.isProtein();
    },

    isCg: function(){
        this.__residueProxy.index = this.residueIndexStart;
        return this.__residueProxy.isCg();
    },

    isNucleic: function(){
        this.__residueProxy.index = this.residueIndexStart;
        return this.__residueProxy.isNucleic();
    },

    getMoleculeType: function(){
        this.__residueProxy.index = this.residueIndexStart;
        return this.__residueProxy.moleculeType;
    },

    getBackboneType: function( position ){
        this.__residueProxy.index = this.residueIndexStart;
        return this.__residueProxy.getBackboneType( position );
    },

    getAtomIndexByType: function( index, type ){

        // TODO pre-calculate, add to residueStore???

        if( this.isCyclic ){
            if( index === -1 ){
                index = this.residueCount - 1;
            }else if( index === this.residueCount ){
                index = 0;
            }
        }else{
            if( index === -1 && !this.isPrevConnected ) index += 1;
            if( index === this.residueCount && !this.isNextNextConnected ) index -= 1;
            // if( index === this.residueCount - 1 && !this.isNextConnected ) index -= 1;
        }

        var rp = this.__residueProxy;
        rp.index = this.residueIndexStart + index;
        var aIndex;

        switch( type ){
            case "trace":
                aIndex = rp.traceAtomIndex;
                break;
            case "direction1":
                aIndex = rp.direction1AtomIndex;
                break;
            case "direction2":
                aIndex = rp.direction2AtomIndex;
                break;
            default:
                var ap = rp.getAtomByName( type );
                aIndex = ap ? ap.index : undefined;
        }

        // if( !ap ){
        //     console.log( this, type, rp.residueType )
        //     // console.log( rp.qualifiedName(), rp.index, index, this.residueCount - 1 )
        //     // rp.index = this.residueIndexStart;
        //     // console.log( rp.qualifiedName(), this.residueIndexStart )
        //     // rp.index = this.residueIndexEnd;
        //     // console.log( rp.qualifiedName(), this.residueIndexEnd )
        // }

        return aIndex;

    },

    eachAtom: function( callback, selection ){

        this.eachResidue( function( rp ){
            rp.eachAtom( callback, selection );
        }, selection );

    },

    eachAtomN: function( n, callback, type ){

        var i;
        var m = this.residueCount;

        var array = new Array( n );
        for( i = 0; i < n; ++i ){
            array[ i ] = this.structure.getAtomProxy( this.getAtomIndexByType( i, type ) );
        }
        callback.apply( this, array );

        for( var j = n; j < m; ++j ){
            for( i = 1; i < n; ++i ){
                array[ i - 1 ].index = array[ i ].index;
            }
            array[ n - 1 ].index = this.getAtomIndexByType( j, type );
            callback.apply( this, array );
        }

    },

    eachAtomN2: function( n, callback, type ){

        // console.log(this.residueOffset,this.residueCount)

        var offset = this.atomOffset;
        var count = this.atomCount;
        var end = offset + count;
        if( count < n ) return;

        var array = new Array( n );
        for( var i = 0; i < n; ++i ){
            array[ i ] = this.structure.getAtomProxy();
        }
        // console.log( array, offset, end, count )

        var as = this.structure.atomSetCache[ "__" + type ];
        if( as === undefined ){
            Log.warn( "no precomputed atomSet for: " + type );
            as = this.structure.getAtomSet( false );
            this.eachResidue( function( rp ){
                var ap = rp.getAtomByName( type );
                as.add_unsafe( ap.index );
            } );
        }
        var j = 0;

        as.forEach( function( index ){
            if( index >= offset && index < end ){
                for( var i = 1; i < n; ++i ){
                    array[ i - 1 ].index = array[ i ].index;
                }
                array[ n - 1 ].index = index;
                j += 1;
                if( j >= n ){
                    callback.apply( this, array );
                }
            }
        } );

    },

    eachDirectionAtomsN: function( n, callback ){

        var n2 = n * 2;
        var offset = this.atomOffset;
        var count = this.atomCount;
        var end = offset + count;
        if( count < n ) return;

        var array = new Array( n2 );
        for( var i = 0; i < n2; ++i ){
            array[ i ] = this.structure.getAtomProxy();
        }

        var as1 = this.structure.atomSetCache.__direction1;
        var as2 = this.structure.atomSetCache.__direction2;
        if( as1 === undefined || as2 === undefined ){
            Log.error( "no precomputed atomSet for direction1 or direction2" );
            return;
        }
        var j = 0;

        Bitset.forEach( function( index1, index2 ){
            if( index1 >= offset && index1 < end && index2 >= offset && index2 < end ){
                for( var i = 1; i < n; ++i ){
                    array[ i - 1 ].index = array[ i ].index;
                    array[ i - 1 + n ].index = array[ i + n ].index;
                }
                array[ n - 1 ].index = index1;
                array[ n - 1 + n ].index = index2;
                j += 1;
                if( j >= n ){
                    callback.apply( this, array );
                }
            }
        }, as1, as2 );

    },

    eachResidue: function( callback ){

        var rp = this.structure.getResidueProxy();
        var n = this.residueCount;
        var rStartIndex = this.residueIndexStart;

        for( var i = 0; i < n; ++i ){
            rp.index = rStartIndex + i;
            callback( rp );
        }

    },

    qualifiedName: function(){
        var rpStart = this.structure.getResidueProxy( this.residueIndexStart );
        var rpEnd = this.structure.getResidueProxy( this.residueIndexEnd );
        return rpStart.qualifiedName() + " - " + rpEnd.qualifiedName();
    }

};


export default Polymer;
