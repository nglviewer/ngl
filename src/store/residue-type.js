/**
 * @file Residue Type
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { calculateResidueBonds } from "../structure/structure-utils.js";
import {
    ProteinType, RnaType, DnaType, WaterType, IonType, SaccharideType, UnknownType,
    ProteinBackboneType, RnaBackboneType, DnaBackboneType, UnknownBackboneType,
    CgProteinBackboneType, CgRnaBackboneType, CgDnaBackboneType,
    ChemCompProtein, ChemCompRna, ChemCompDna, ChemCompSaccharide,
    ChemCompOther, ChemCompNonPolymer, ChemCompHetero,
    AA3, PurinBases, RnaBases, DnaBases, IonNames, WaterNames,
    ProteinBackboneAtoms, NucleicBackboneAtoms, ResidueTypeAtoms
} from "../structure/structure-constants.js";


function ResidueType( structure, resname, atomTypeIdList, hetero, chemCompType, bonds ){

    this.structure = structure;

    this.resname = resname;
    this.atomTypeIdList = atomTypeIdList;
    this.hetero = hetero ? 1 : 0;
    this.chemCompType = chemCompType;
    this.bonds = bonds;
    this.atomCount = atomTypeIdList.length;

    this.moleculeType = this.getMoleculeType();
    this.backboneType = this.getBackboneType( 0 );
    this.backboneEndType = this.getBackboneType( -1 );
    this.backboneStartType = this.getBackboneType( 1 );
    this.backboneIndexList = this.getBackboneIndexList();

    //

    var atomnames = ResidueTypeAtoms[ this.backboneType ];
    var atomnamesStart = ResidueTypeAtoms[ this.backboneStartType ];
    var atomnamesEnd = ResidueTypeAtoms[ this.backboneEndType ];

    var traceIndex = this.getAtomIndexByName( atomnames.trace );
    this.traceAtomIndex = traceIndex !== undefined ? traceIndex : -1;

    var dir1Index = this.getAtomIndexByName( atomnames.direction1 );
    this.direction1AtomIndex = dir1Index !== undefined ? dir1Index : -1;

    var dir2Index = this.getAtomIndexByName( atomnames.direction2 );
    this.direction2AtomIndex = dir2Index !== undefined ? dir2Index : -1;

    var bbStartIndex = this.getAtomIndexByName( atomnamesStart.backboneStart );
    this.backboneStartAtomIndex = bbStartIndex !== undefined ? bbStartIndex : -1;

    var bbEndIndex = this.getAtomIndexByName( atomnamesEnd.backboneEnd );
    this.backboneEndAtomIndex = bbEndIndex !== undefined ? bbEndIndex : -1;

    var rungEndIndex;
    if( PurinBases.indexOf( resname ) !== -1 ){
        rungEndIndex = this.getAtomIndexByName( "N1" );
    }else{
        rungEndIndex = this.getAtomIndexByName( "N3" );
    }
    this.rungEndAtomIndex = rungEndIndex !== undefined ? rungEndIndex : -1;

}

ResidueType.prototype = {

    constructor: ResidueType,
    type: "ResidueType",

    resname: undefined,
    atomTypeIdList: undefined,
    atomCount: undefined,

    getBackboneIndexList: function(){
        var backboneIndexList = [];
        var atomnameList;
        switch( this.moleculeType ){
            case ProteinType:
                atomnameList = ProteinBackboneAtoms;
                break;
            case RnaType:
            case DnaType:
                atomnameList = NucleicBackboneAtoms;
                break;
            default:
                return backboneIndexList;
        }
        var atomMap = this.structure.atomMap;
        var atomTypeIdList = this.atomTypeIdList;
        for( var i = 0, il = this.atomCount; i < il; ++i ){
            var atomType = atomMap.get( atomTypeIdList[ i ] );
            if( atomnameList.indexOf( atomType.atomname ) !== -1 ){
                backboneIndexList.push( i );
            }
        }
        return backboneIndexList;
    },

    getMoleculeType: function(){
        if( this.isProtein() ){
            return ProteinType;
        }else if( this.isRna() ){
            return RnaType;
        }else if( this.isDna() ){
            return DnaType;
        }else if( this.isWater() ){
            return WaterType;
        }else if( this.isIon() ){
            return IonType;
        }else if( this.isSaccharide() ){
            return SaccharideType;
        }else{
            return UnknownType;
        }
    },

    getBackboneType: function( position ){
        if( this.hasProteinBackbone( position ) ){
            return ProteinBackboneType;
        }else if( this.hasRnaBackbone( position ) ){
            return RnaBackboneType;
        }else if( this.hasDnaBackbone( position ) ){
            return DnaBackboneType;
        }else if( this.hasCgProteinBackbone( position ) ){
            return CgProteinBackboneType;
        }else if( this.hasCgRnaBackbone( position ) ){
            return CgRnaBackboneType;
        }else if( this.hasCgDnaBackbone( position ) ){
            return CgDnaBackboneType;
        }else{
            return UnknownBackboneType;
        }
    },

    isProtein: function(){
        if( this.chemCompType ){
            return ChemCompProtein.indexOf( this.chemCompType ) !== -1;
        }else{
            return (
                this.hasAtomWithName( "CA", "C", "N" ) ||
                AA3.indexOf( this.resname ) !== -1
            );
        }
    },

    isCg: function(){
        var backboneType = this.backboneType;
        return (
            backboneType === CgProteinBackboneType ||
            backboneType === CgRnaBackboneType ||
            backboneType === CgDnaBackboneType
        );
    },

    isNucleic: function(){
        return this.isRna() || this.isDna();
    },

    isRna: function(){
        if( this.chemCompType ){
            return ChemCompRna.indexOf( this.chemCompType ) !== -1;
        }else{
            return (
                this.hasAtomWithName( [ "P", "O3'", "O3*" ], [ "C4'", "C4*" ], [ "O2'", "O2*" ] ) ||
                RnaBases.indexOf( this.resname ) !== -1
            );
        }
    },

    isDna: function(){
        if( this.chemCompType ){
            return ChemCompDna.indexOf( this.chemCompType ) !== -1;
        }else{
            return (
                ( this.hasAtomWithName( [ "P", "O3'", "O3*" ], [ "C3'", "C3*" ] ) &&
                    !this.hasAtomWithName( [ "O2'", "O2*" ] ) ) ||
                DnaBases.indexOf( this.resname ) !== -1
            );
        }
    },

    isPolymer: function(){
        return this.isProtein() || this.isNucleic();
    },

    isHetero: function(){
        return this.hetero === 1;
    },

    isIon: function(){
        return IonNames.indexOf( this.resname ) !== -1;
    },

    isWater: function(){
        return WaterNames.indexOf( this.resname ) !== -1;
    },

    isSaccharide: function(){
        return ChemCompSaccharide.indexOf( this.chemCompType ) !== -1;
    },

    hasBackboneAtoms: function( position, type ){
        var atomnames = ResidueTypeAtoms[ type ];
        if( position === -1 ){
            return this.hasAtomWithName(
                atomnames.trace,
                atomnames.backboneEnd,
                atomnames.direction1,
                atomnames.direction2
            );
        }else if( position === 0 ){
            return this.hasAtomWithName(
                atomnames.trace,
                atomnames.direction1,
                atomnames.direction2
            );
        }else if( position === 1 ){
            return this.hasAtomWithName(
                atomnames.trace,
                atomnames.backboneStart,
                atomnames.direction1,
                atomnames.direction2
            );
        }else{
            return this.hasAtomWithName(
                atomnames.trace,
                atomnames.backboneStart,
                atomnames.backboneEnd,
                atomnames.direction1,
                atomnames.direction2
            );
        }
    },

    hasProteinBackbone: function( position ){
        return (
            this.isProtein() &&
            this.hasBackboneAtoms( position, ProteinBackboneType )
        );
    },

    hasRnaBackbone: function( position ){
        return (
            this.isRna() &&
            this.hasBackboneAtoms( position, RnaBackboneType )
        );
    },

    hasDnaBackbone: function( position ){
        return (
            this.isDna() &&
            this.hasBackboneAtoms( position, DnaBackboneType )
        );
    },

    hasCgProteinBackbone: function( position ){
        return (
            this.isProtein() &&
            this.hasBackboneAtoms( position, CgProteinBackboneType )
        );
    },

    hasCgRnaBackbone: function( position ){
        return (
            this.isRna() &&
            this.hasBackboneAtoms( position, CgRnaBackboneType )
        );
    },

    hasCgDnaBackbone: function( position ){
        return (
            this.isDna() &&
            this.hasBackboneAtoms( position, CgDnaBackboneType )
        );
    },

    hasBackbone: function( position ){
        return (
            this.hasProteinBackbone( position ) ||
            this.hasRnaBackbone( position ) ||
            this.hasDnaBackbone( position ) ||
            this.hasCgProteinBackbone( position ) ||
            this.hasCgRnaBackbone( position ) ||
            this.hasCgDnaBackbone( position )
        );
    },

    getAtomIndexByName: function( atomname ){
        var i, index;
        var n = this.atomCount;
        var atomMap = this.structure.atomMap;
        var atomTypeIdList = this.atomTypeIdList;
        if( Array.isArray( atomname ) ){
            for( i = 0; i < n; ++i ){
                index = atomTypeIdList[ i ];
                if( atomname.indexOf( atomMap.get( index ).atomname ) !== -1 ){
                    return i;
                }
            }
        }else{
            for( i = 0; i < n; ++i ){
                index = atomTypeIdList[ i ];
                if( atomname === atomMap.get( index ).atomname ){
                    return i;
                }
            }
        }
        return undefined;
    },

    hasAtomWithName: function( atomname ){
        var n = arguments.length;
        for( var i = 0; i < n; ++i ){
            if( arguments[ i ] === undefined ) continue;
            if( this.getAtomIndexByName( arguments[ i ] ) === undefined ){
                return false;
            }
        }
        return true;
    },

    getBonds: function( r ){
        if( this.bonds === undefined ){
            this.bonds = calculateResidueBonds( r );
        }
        return this.bonds;
    },

    toJSON: function(){
        var output = {
            resname: this.resname,
            atomTypeIdList: this.atomTypeIdList,
            hetero: this.hetero
        };
        return output;
    }

};


export default ResidueType;
