/**
 * @file Chain Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { UnknownBackboneType } from "../structure/structure-constants.js";
import Polymer from "./polymer.js";


/**
 * Chain proxy
 * @class
 * @param {Structure} structure - the structure
 * @param {Integer} index - the index
 */
function ChainProxy( structure, index ){

    this.structure = structure;
    this.chainStore = structure.chainStore;
    this.residueStore = structure.residueStore;
    this.index = index;

    this.__residueProxy = this.structure.getResidueProxy();

}

ChainProxy.prototype = {

    constructor: ChainProxy,
    type: "ChainProxy",

    structure: undefined,
    chainStore: undefined,
    index: undefined,

    get entity () {
        return this.structure.entityList[ this.entityIndex ];
    },
    get model () {
        return this.structure.getModelProxy( this.modelIndex );
    },

    get entityIndex () {
        return this.chainStore.entityIndex[ this.index ];
    },
    set entityIndex ( value ) {
        this.chainStore.entityIndex[ this.index ] = value;
    },

    get modelIndex () {
        return this.chainStore.modelIndex[ this.index ];
    },
    set modelIndex ( value ) {
        this.chainStore.modelIndex[ this.index ] = value;
    },

    get residueOffset () {
        return this.chainStore.residueOffset[ this.index ];
    },
    set residueOffset ( value ) {
        this.chainStore.residueOffset[ this.index ] = value;
    },

    get residueCount () {
        return this.chainStore.residueCount[ this.index ];
    },
    set residueCount ( value ) {
        this.chainStore.residueCount[ this.index ] = value;
    },

    get residueEnd () {
        return this.residueOffset + this.residueCount - 1;
    },

    get atomOffset () {
        return this.residueStore.atomOffset[ this.residueOffset ];
    },
    get atomEnd () {
        return (
            this.residueStore.atomOffset[ this.residueEnd ] +
            this.residueStore.atomCount[ this.residueEnd ] - 1
        );
    },
    get atomCount () {
        if( this.residueCount === 0 ){
            return 0;
        }else{
            return this.atomEnd - this.atomOffset + 1;
        }
    },

    //

    get chainname () {
        return this.chainStore.getChainname( this.index );
    },
    set chainname ( value ) {
        this.chainStore.setChainname( this.index, value );
    },

    get chainid () {
        return this.chainStore.getChainid( this.index );
    },
    set chainid ( value ) {
        this.chainStore.setChainid( this.index, value );
    },

    //

    get __firstResidueProxy () {
        this.__residueProxy.index = this.residueOffset;
        return this.__residueProxy;
    },

    //

    isProtein: function(){
        return this.__firstResidueProxy.isProtein();
    },

    isNucleic: function(){
        return this.__firstResidueProxy.isNucleic();
    },

    isRna: function(){
        return this.__firstResidueProxy.isRna();
    },

    isDna: function(){
        return this.__firstResidueProxy.isDna();
    },

    isPolymer: function(){
        return this.__firstResidueProxy.isPolymer();
    },

    isHetero: function(){
        return this.__firstResidueProxy.isHetero();
    },

    isWater: function(){
        return this.__firstResidueProxy.isWater();
    },

    isIon: function(){
        return this.__firstResidueProxy.isIon();
    },

    isSaccharide: function(){
        return this.__firstResidueProxy.isSaccharide();
    },

    //

    eachAtom: function( callback, selection ){

        this.eachResidue( function( rp ){
            rp.eachAtom( callback, selection );
        }, selection );

    },

    eachResidue: function( callback, selection ){

        var i;
        var count = this.residueCount;
        var offset = this.residueOffset;
        var rp = this.structure._rp;
        var end = offset + count;

        if( selection && selection.test ){
            var residueOnlyTest = selection.residueOnlyTest;
            if( residueOnlyTest ){
                for( i = offset; i < end; ++i ){
                    rp.index = i;
                    if( residueOnlyTest( rp ) ){
                        callback( rp, selection );
                    }
                }
            }else{
                for( i = offset; i < end; ++i ){
                    rp.index = i;
                    callback( rp, selection );
                }
            }
        }else{
            for( i = offset; i < end; ++i ){
                rp.index = i;
                callback( rp );
            }
        }

    },

    eachResidueN: function( n, callback ){

        var i;
        var count = this.residueCount;
        var offset = this.residueOffset;
        var end = offset + count;
        if( count < n ) return;
        var array = new Array( n );

        for( i = 0; i < n; ++i ){
            array[ i ] = this.structure.getResidueProxy( offset + i );
        }
        callback.apply( this, array );

        for( var j = offset + n; j < end; ++j ){
            for( i = 0; i < n; ++i ){
                array[ i ].index += 1;
            }
            callback.apply( this, array );
        }

    },

    eachPolymer: function( callback, selection ){

        var rStartIndex, rNextIndex;
        var test = selection ? selection.residueOnlyTest : undefined;
        var structure = this.model.structure;

        var count = this.residueCount;
        var offset = this.residueOffset;
        var end = offset + count;

        var rp1 = this.structure.getResidueProxy();
        var rp2 = this.structure.getResidueProxy( offset );

        var ap1 = this.structure.getAtomProxy();
        var ap2 = this.structure.getAtomProxy();

        var first = true;

        for( var i = offset + 1; i < end; ++i ){

            rp1.index = rp2.index;
            rp2.index = i;

            if( first ){
                rStartIndex = rp1.index;
                first = false;
            }
            rNextIndex = rp2.index;

            var bbType1 = first ? rp1.backboneEndType : rp1.backboneType;
            var bbType2 = rp2.backboneType;

            if( bbType1 !== UnknownBackboneType && bbType1 === bbType2 ){

                ap1.index = rp1.backboneEndAtomIndex;
                ap2.index = rp2.backboneStartAtomIndex;

            }else{

                if( bbType1 !== UnknownBackboneType ){
                    if( rp1.index - rStartIndex > 1 ){
                        // console.log("FOO1",rStartIndex, rp1.index)
                        callback( new Polymer( structure, rStartIndex, rp1.index ) );
                    }
                }

                rStartIndex = rNextIndex;

                continue;

            }

            if( !ap1 || !ap2 || !ap1.connectedTo( ap2 ) ||
                ( test && ( !test( rp1 ) || !test( rp2 ) ) ) ){
                if( rp1.index - rStartIndex > 1 ){
                    // console.log("FOO2",rStartIndex, rp1.index)
                    callback( new Polymer( structure, rStartIndex, rp1.index ) );
                }
                rStartIndex = rNextIndex;

            }

        }

        if( rNextIndex - rStartIndex > 1 ){
            if( this.structure.getResidueProxy( rStartIndex ).backboneStartType ){
                // console.log("FOO3",rStartIndex, rNextIndex)
                callback( new Polymer( structure, rStartIndex, rNextIndex ) );
            }
        }

    },

    //

    qualifiedName: function(){
        var name = ":" + this.chainname + "/" + this.modelIndex;
        return name;
    },

    clone: function(){

        return new this.constructor( this.structure, this.index );

    },

    toObject: function(){

        return {
            index: this.index,
            residueOffset: this.residueOffset,
            residueCount: this.residueCount,

            chainname: this.chainname
        };

    }

};


export default ChainProxy;
