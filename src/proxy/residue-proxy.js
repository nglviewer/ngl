/**
 * @file Residue Proxy
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import {
    ProteinType, RnaType, DnaType, WaterType, IonType, SaccharideType,
    CgProteinBackboneType, CgRnaBackboneType, CgDnaBackboneType,
    AA1
} from "../structure/structure-constants.js";


/**
 * Residue proxy
 * @class
 * @param {Structure} structure - the structure
 * @param {Integer} index - the index
 */
function ResidueProxy( structure, index ){

    this.structure = structure;
    this.chainStore = structure.chainStore;
    this.residueStore = structure.residueStore;
    this.atomStore = structure.atomStore;
    this.residueMap = structure.residueMap;
    this.atomMap = structure.atomMap;
    this.index = index;

}

ResidueProxy.prototype = {

    constructor: ResidueProxy,
    type: "ResidueProxy",

    structure: undefined,
    chainStore: undefined,
    residueStore: undefined,
    atomStore: undefined,
    index: undefined,

    get entity () {
        return this.structure.entityList[ this.entityIndex ];
    },
    get entityIndex () {
        return this.chainStore.entityIndex[ this.chainIndex ];
    },
    get chain () {
        return this.structure.getChainProxy( this.chainIndex );
    },

    get chainIndex () {
        return this.residueStore.chainIndex[ this.index ];
    },
    set chainIndex ( value ) {
        this.residueStore.chainIndex[ this.index ] = value;
    },

    get atomOffset () {
        return this.residueStore.atomOffset[ this.index ];
    },
    set atomOffset ( value ) {
        this.residueStore.atomOffset[ this.index ] = value;
    },

    get atomCount () {
        return this.residueStore.atomCount[ this.index ];
    },
    set atomCount ( value ) {
        this.residueStore.atomCount[ this.index ] = value;
    },

    get atomEnd () {
        return this.atomOffset + this.atomCount - 1;
    },

    //

    get modelIndex () {
        return this.chainStore.modelIndex[ this.chainIndex ];
    },
    get chainname () {
        return this.chainStore.getChainname( this.chainIndex );
    },
    get chainid () {
        return this.chainStore.getChainid( this.chainIndex );
    },

    //

    get resno () {
        return this.residueStore.resno[ this.index ];
    },
    set resno ( value ) {
        this.residueStore.resno[ this.index ] = value;
    },

    get sstruc () {
        return this.residueStore.getSstruc( this.index );
    },
    set sstruc ( value ) {
        this.residueStore.setSstruc( this.index, value );
    },

    get inscode () {
        return this.residueStore.getInscode( this.index );
    },
    set inscode ( value ) {
        this.residueStore.getInscode( this.index, value );
    },

    //

    get residueType () {
        return this.residueMap.get( this.residueStore.residueTypeId[ this.index ] );
    },

    get resname () {
        return this.residueType.resname;
    },
    get hetero () {
        return this.residueType.hetero;
    },
    get moleculeType () {
        return this.residueType.moleculeType;
    },
    get backboneType () {
        return this.residueType.backboneType;
    },
    get backboneStartType () {
        return this.residueType.backboneStartType;
    },
    get backboneEndType () {
        return this.residueType.backboneEndType;
    },
    get traceAtomIndex () {
        return this.residueType.traceAtomIndex + this.atomOffset;
    },
    get direction1AtomIndex () {
        return this.residueType.direction1AtomIndex + this.atomOffset;
    },
    get direction2AtomIndex () {
        return this.residueType.direction2AtomIndex + this.atomOffset;
    },
    get backboneStartAtomIndex () {
        return this.residueType.backboneStartAtomIndex + this.atomOffset;
    },
    get backboneEndAtomIndex () {
        return this.residueType.backboneEndAtomIndex + this.atomOffset;
    },
    get rungEndAtomIndex () {
        return this.residueType.rungEndAtomIndex + this.atomOffset;
    },

    //

    eachAtom: function( callback, selection ){

        var i;
        var count = this.atomCount;
        var offset = this.atomOffset;
        var ap = this.structure._ap;
        var end = offset + count;

        if( selection && selection.atomOnlyTest ){
            var atomOnlyTest = selection.atomOnlyTest;
            for( i = offset; i < end; ++i ){
                ap.index = i;
                if( atomOnlyTest( ap ) ) callback( ap );
            }
        }else{
            for( i = offset; i < end; ++i ){
                ap.index = i;
                callback( ap );
            }
        }

    },

    //

    isProtein: function(){
        return this.residueType.moleculeType === ProteinType;
    },

    isNucleic: function(){
        var moleculeType = this.residueType.moleculeType;
        return (
            moleculeType === RnaType ||
            moleculeType === DnaType
        );
    },

    isRna: function(){
        return this.residueType.moleculeType === RnaType;
    },

    isDna: function(){
        return this.residueType.moleculeType === DnaType;
    },

    isCg: function(){
        var backboneType = this.residueType.backboneType;
        return (
            backboneType === CgProteinBackboneType ||
            backboneType === CgRnaBackboneType ||
            backboneType === CgDnaBackboneType
        );
    },

    isPolymer: function(){
        if( this.structure.entityList.length > 0 ){
            return this.entity.isPolymer();
        }else{
            var moleculeType = this.residueType.moleculeType;
            return (
                moleculeType === ProteinType ||
                moleculeType === RnaType ||
                moleculeType === DnaType
            );
        }
    },

    isHetero: function(){
        return this.residueType.hetero === 1;
    },

    isWater: function(){
        return this.residueType.moleculeType === WaterType;
    },

    isIon: function(){
        return this.residueType.moleculeType === IonType;
    },

    isSaccharide: function(){
        return this.residueType.moleculeType === SaccharideType;
    },

    getAtomType: function( index ){
        return this.atomMap.get( this.atomStore.atomTypeId[ index ] );
    },

    getResname1: function(){
        // FIXME nucleic support
        return AA1[ this.resname.toUpperCase() ] || 'X';
    },

    getBackboneType: function( position ){
        switch( position ){
            case -1:
                return this.residueType.backboneStartType;
            case 1:
                return this.residueType.backboneEndType;
            default:
                return this.residueType.backboneType;
        }
    },

    getAtomIndexByName: function( atomname ){
        var index = this.residueType.getAtomIndexByName( atomname );
        if( index !== undefined ){
            index += this.atomOffset;
        }
        return index;
    },

    getAtomByName: function( atomname ){
        return this.residueType.getAtomByName( atomname );
    },

    hasAtomWithName: function( atomname ){
        return this.residueType.hasAtomWithName( atomname );
    },

    getAtomnameList: function(){

        console.warn( "getAtomnameList - might be expensive" );

        var n = this.atomCount;
        var offset = this.atomOffset;
        var list = new Array( n );
        for( var i = 0; i < n; ++i ){
            list[ i ] = this.getAtomType( offset + i ).atomname;
        }
        return list;
    },

    connectedTo: function( rNext ){
        var bbAtomEnd = this.structure.getAtomProxy( this.backboneEndAtomIndex );
        var bbAtomStart = this.structure.getAtomProxy( rNext.backboneStartAtomIndex );
        if( bbAtomEnd && bbAtomStart ){
            return bbAtomEnd.connectedTo( bbAtomStart );
        }else{
            return false;
        }
    },

    getNextConnectedResidue: function(){
        var rOffset = this.chainStore.residueOffset[ this.chainIndex ];
        var rCount = this.chainStore.residueCount[ this.chainIndex ];
        var nextIndex = this.index + 1;
        if( nextIndex < rOffset + rCount ){
            var rpNext = this.structure.getResidueProxy( nextIndex );
            if( this.connectedTo( rpNext ) ){
                return rpNext;
            }
        }else if( nextIndex === rOffset + rCount ){  // cyclic
            var rpFirst = this.structure.getResidueProxy( rOffset );
            if( this.connectedTo( rpFirst ) ){
                return rpFirst;
            }
        }
        return undefined;
    },

    getPreviousConnectedResidue: function( rp ){
        var rOffset = this.chainStore.residueOffset[ this.chainIndex ];
        var prevIndex = this.index - 1;
        if( prevIndex >= rOffset ){
            if( rp === undefined ) rp = this.structure.getResidueProxy();
            rp.index = prevIndex;
            if( rp.connectedTo( this ) ){
                return rp;
            }
        }else if( prevIndex === rOffset - 1 ){  // cyclic
            if( rp === undefined ) rp = this.structure.getResidueProxy();
            var rCount = this.chainStore.residueCount[ this.chainIndex ];
            rp.index = rOffset + rCount - 1;
            if( rp.connectedTo( this ) ){
                return rp;
            }
        }
        return undefined;
    },

    getBonds: function(){
        return this.residueType.getBonds( this );
    },

    getRings: function() {
        return this.residueType.getRings();
    },

    qualifiedName: function( noResname ){
        var name = "";
        if( this.resname && !noResname ) name += "[" + this.resname + "]";
        if( this.resno !== undefined ) name += this.resno;
        if( this.inscode ) name += "^" + this.inscode;
        if( this.chain ) name += ":" + this.chainname;
        name += "/" + this.modelIndex;
        return name;
    },

    clone: function(){
        return new this.constructor( this.structure, this.index );
    },

    toObject: function(){
        return {
            index: this.index,
            chainIndex: this.chainIndex,
            atomOffset: this.atomOffset,
            atomCount: this.atomCount,

            resno: this.resno,
            resname: this.resname,
            sstruc: this.sstruc
        };
    }

};


export default ResidueProxy;
