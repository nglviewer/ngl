/**
 * @file Selection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Signal from "../lib/signals.es6.js";

import { binarySearchIndexOf, rangeInSortedArray } from "./utils.js";


const kwd = {
    PROTEIN: 1,
    NUCLEIC: 2,
    RNA: 3,
    DNA: 4,
    POLYMER: 5,
    WATER: 6,
    HELIX: 7,
    SHEET: 8,
    TURN: 9,
    BACKBONE: 10,
    SIDECHAIN: 11,
    ALL: 12,
    HETERO: 13,
    ION: 14,
    SACCHARIDE: 15, SUGAR: 15,
    BONDED: 16,
    RING: 17
};

const SelectAllKeyword = [ "*", "", "ALL" ];

const AtomOnlyKeywords = [
    kwd.BACKBONE, kwd.SIDECHAIN, kwd.BONDED, kwd.RING
];

const ChainKeywords = [
    kwd.HETERO, kwd.PROTEIN, kwd.NUCLEIC, kwd.RNA, kwd.DNA,
    kwd.POLYMER, kwd.WATER, kwd.ION, kwd.SACCHARIDE
];

const SmallResname = [ "ALA", "GLY" ];
const NucleophilicResname = [ "CYS", "SER", "THR" ];
const HydrophobicResname = [ "ILE", "LEU", "MET", "PRO", "VAL" ];
const AromaticResname = [ "PHE", "TRP", "TYR" ];
const AmideResname = [ "ASN", "GLN" ];
const AcidicResname = [ "ASP", "GLU" ];
const BasicResname = [ "ARG", "HIS", "LYS" ];
const ChargedResname = [ "ARG", "ASP", "GLU", "HIS", "LYS" ];
const PolarResname = [ "ASN", "ARG", "ASP", "GLN", "GLU", "HIS", "LYS", "SER", "THR", "TYR" ];
const NonpolarResname = [ "ALA", "CYS", "ILE", "GLY", "LEU", "MET", "PHE", "PRO", "TRP", "VAL" ];


/**
 * Selection
 */
class Selection{

    /**
     * Create Selection
     * @param {String} string - selection string, see {@tutorial selection-language}
     */
    constructor( string ){

        this.signals = {
            stringChanged: new Signal(),
        };

        this.setString( string );

    }

    get type(){ return "selection"; }

    setString( string, silent ){

        if( string === undefined ) string = this.string || "";
        if( string === this.string ) return;

        //

        try{
            this.parse( string );
        }catch( e ){
            // Log.error( e.stack );
            this.selection = { "error": e.message };
        }

        this.string = string;

        this.test = this.makeAtomTest();
        this.residueTest = this.makeResidueTest();
        this.chainTest = this.makeChainTest();
        this.modelTest = this.makeModelTest();

        this.atomOnlyTest = this.makeAtomTest( true );
        this.residueOnlyTest = this.makeResidueTest( true );
        this.chainOnlyTest = this.makeChainTest( true );
        this.modelOnlyTest = this.makeModelTest( true );

        if( !silent ){
            this.signals.stringChanged.dispatch( this.string );
        }

    }

    parse( string ){

        this.selection = {
            operator: undefined,
            rules: []
        };

        if( !string ) return;

        let selection = this.selection;
        let newSelection, oldSelection;
        const selectionStack = [];

        string = string.replace( /\(/g, ' ( ' ).replace( /\)/g, ' ) ' ).trim();
        if( string.charAt( 0 ) === "(" && string.substr( -1 ) === ")" ){
            string = string.slice( 1, -1 ).trim();
        }
        const chunks = string.split( /\s+/ );

        // Log.log( string, chunks )

        const createNewContext = operator => {

            newSelection = {
                operator: operator,
                rules: []
            };
            if( selection === undefined ){
                selection = newSelection;
                this.selection = newSelection;
            }else{
                selection.rules.push( newSelection );
                selectionStack.push( selection );
                selection = newSelection;
            }

        };

        const getPrevContext = function( operator ){

            oldSelection = selection;
            selection = selectionStack.pop();
            if( selection === undefined ){
                createNewContext( operator );
                pushRule( oldSelection );
            }

        };

        const pushRule = function( rule ){

            selection.rules.push( rule );

        };

        let not;

        for( let i = 0; i < chunks.length; ++i ){

            const c = chunks[ i ];
            const cu = c.toUpperCase();

            // handle parens

            if( c === "(" ){

                // Log.log( "(" );

                not = false;
                createNewContext();
                continue;

            }else if( c === ")" ){

                // Log.log( ")" );

                getPrevContext();
                if( selection.negate ){
                    getPrevContext();
                }
                continue;

            }

            // leave 'not' context

            if( not > 0 ){

                if( cu === "NOT" ){

                    not = 1;

                }else if( not === 1 ){

                    not = 2;

                }else if( not === 2 ){

                    not = false;
                    getPrevContext();

                }else{

                    throw new Error( "something went wrong with 'not'" );

                }

            }

            // handle logic operators

            if( cu === "AND" ){

                // Log.log( "AND" );

                if( selection.operator === "OR" ){
                    const lastRule = selection.rules.pop();
                    createNewContext( "AND" );
                    pushRule( lastRule );
                }else{
                    selection.operator = "AND";
                }
                continue;

            }else if( cu === "OR" ){

                // Log.log( "OR" );

                if( selection.operator === "AND" ){
                    getPrevContext( "OR" );
                }else{
                    selection.operator = "OR";
                }
                continue;

            }else if( c.toUpperCase() === "NOT" ){

                // Log.log( "NOT", j );

                not = 1;
                createNewContext();
                selection.negate = true;
                continue;

            }else{

                // Log.log( "chunk", c, j, selection );

            }

            // handle keyword attributes

            const keyword = kwd[ cu ];
            if( keyword !== undefined ){
                pushRule( { keyword } );
                continue;
            }

            if( cu === "HYDROGEN" ){
                pushRule( { element: "H" } );
                continue;
            }

            if( cu === "SMALL" ){
                pushRule( { resname: SmallResname } );
                continue;
            }

            if( cu === "NUCLEOPHILIC" ){
                pushRule( { resname: NucleophilicResname } );
                continue;
            }

            if( cu === "HYDROPHOBIC" ){
                pushRule( { resname: HydrophobicResname } );
                continue;
            }

            if( cu === "AROMATIC" ){
                pushRule( { resname: AromaticResname } );
                continue;
            }

            if( cu === "AMIDE" ){
                pushRule( { resname: AmideResname } );
                continue;
            }

            if( cu === "ACIDIC" ){
                pushRule( { resname: AcidicResname } );
                continue;
            }

            if( cu === "BASIC" ){
                pushRule( { resname: BasicResname } );
                continue;
            }

            if( cu === "CHARGED" ){
                pushRule( { resname: ChargedResname } );
                continue;
            }

            if( cu === "POLAR" ){
                pushRule( { resname: PolarResname } );
                continue;
            }

            if( cu === "NONPOLAR" ){
                pushRule( { resname: NonpolarResname } );
                continue;
            }

            if( cu === "SIDECHAINATTACHED" ){
                pushRule( {
                    operator: "OR",
                    rules: [
                        { keyword: kwd.SIDECHAIN },
                        {
                            operator: "AND",
                            negate: false,
                            rules: [
                                { keyword: kwd.PROTEIN },
                                {
                                    operator: "OR",
                                    negate: false,
                                    rules: [
                                        { atomname: "CA" },
                                        { atomname: "BB" }
                                    ]
                                }
                            ]
                        },
                        {
                            operator: "AND",
                            negate: false,
                            rules: [
                                { resname: "PRO" },
                                { atomname: "N" }
                            ]
                        },
                        {
                            operator: "AND",
                            negate: false,
                            rules: [
                                { keyword: kwd.NUCLEIC },
                                {
                                    operator: "OR",
                                    negate: true,
                                    rules: [
                                        { atomname: "P" },
                                        { atomname: "OP1" },
                                        { atomname: "OP2" },
                                        { atomname: "O3'" },
                                        { atomname: "O3*" },
                                        { atomname: "O5'" },
                                        { atomname: "O5*" },
                                        { atomname: "C5'" },
                                        { atomname: "C5*" }
                                    ]
                                }
                            ]
                        }
                    ]
                } );
                continue;
            }

            if( SelectAllKeyword.indexOf( cu ) !== -1 ){
                pushRule( { keyword: kwd.ALL } );
                continue;
            }

            // handle atom expressions

            if( c.charAt( 0 ) === "@" ){
                const indexList = c.substr( 1 ).split( "," );
                for( let k = 0, kl = indexList.length; k < kl; ++k ){
                    indexList[ k ] = parseInt( indexList[ k ] );
                }
                indexList.sort( function( a, b ){ return a - b; } );
                pushRule( { atomindex: indexList } );
                continue;
            }

            if( c.charAt( 0 ) === "#" ){
                console.error( "# for element selection deprecated, use _" );
                pushRule( { element: cu.substr( 1 ) } );
                continue;
            }
            if( c.charAt( 0 ) === "_" ){
                pushRule( { element: cu.substr( 1 ) } );
                continue;
            }

            if( c[0] === "[" && c[c.length-1] === "]" ){
                const resnameList = cu.substr( 1, c.length-2 ).split( "," );
                const resname = resnameList.length > 1 ? resnameList : resnameList[ 0 ];
                pushRule( { resname: resname } );
                continue;
            }else if(
                ( c.length >= 1 && c.length <= 4 ) &&
                c[0] !== "^" && c[0] !== ":" && c[0] !== "." && c[0] !== "%" && c[0] !== "/" &&
                isNaN( parseInt( c ) )
            ){
                pushRule( { resname: cu } );
                continue;
            }

            // there must be only one constraint per rule
            // otherwise a test quickly becomes not applicable
            // e.g. chainTest for chainname when resno is present too

            const sele = {
                operator: "AND",
                rules: []
            };

            const model = c.split( "/" );
            if( model.length > 1 && model[1] ){
                if( isNaN( parseInt( model[1] ) ) ){
                    throw new Error( "model must be an integer" );
                }
                sele.rules.push( {
                    model: parseInt( model[1] )
                } );
            }

            const altloc = model[0].split( "%" );
            if( altloc.length > 1 ){
                sele.rules.push( {
                    altloc: altloc[1]
                } );
            }

            const atomname = altloc[0].split( "." );
            if( atomname.length > 1 && atomname[1] ){
                if( atomname[1].length > 4 ){
                    throw new Error( "atomname must be one to four characters" );
                }
                sele.rules.push( {
                    atomname: atomname[1].substring( 0, 4 ).toUpperCase()
                } );
            }

            const chain = atomname[0].split( ":" );
            if( chain.length > 1 && chain[1] ){
                sele.rules.push( {
                    chainname: chain[1]
                } );
            }

            const inscode = chain[0].split( "^" );
            if( inscode.length > 1 ){
                sele.rules.push( {
                    inscode: inscode[1]
                } );
            }

            if( inscode[0] ){
                let negate, negate2;
                if( inscode[0][0] === "-" ){
                    inscode[0] = inscode[0].substr( 1 );
                    negate = true;
                }
                if( inscode[0].includes( "--" ) ){
                    inscode[0] = inscode[0].replace( "--", "-" );
                    negate2 = true;
                }
                let resi = inscode[0].split( "-" );
                if( resi.length === 1 ){
                    resi = parseInt( resi[0] );
                    if( isNaN( resi ) ){
                        throw new Error( "resi must be an integer" );
                    }
                    if( negate ) resi *= -1;
                    sele.rules.push( {
                        resno: resi
                    } );
                }else if( resi.length === 2 ){
                    if( negate ) resi[0] *= -1;
                    if( negate2 ) resi[1] *= -1;
                    sele.rules.push( {
                        resno: [ parseInt( resi[0] ), parseInt( resi[1] ) ]
                    } );
                }else{
                    throw new Error( "resi range must contain one '-'" );
                }
            }

            // round up

            if( sele.rules.length === 1 ){
                pushRule( sele.rules[ 0 ] );
            }else if( sele.rules.length > 1 ){
                pushRule( sele );
            }else{
                throw new Error( "empty selection chunk" );
            }

        }

        // cleanup

        if(
            this.selection.operator === undefined &&
            this.selection.rules.length === 1 &&
            this.selection.rules[ 0 ].hasOwnProperty( "operator" )
        ){
            this.selection = this.selection.rules[ 0 ];
        }

    }

    _makeTest( fn, selection ){

        if( selection === undefined ) selection = this.selection;
        if( selection === null ) return false;
        if( selection.error ) return false;

        const n = selection.rules.length;
        if( n === 0 ) return false;

        const t = selection.negate ? false : true;
        const f = selection.negate ? true : false;

        const subTests = [];
        for( let i = 0; i < n; ++i ){
            const s = selection.rules[ i ];
            if( s.hasOwnProperty( "operator" ) ){
                subTests[ i ] = this._makeTest( fn, s );
            }
        }

        // ( x and y ) can short circuit on false
        // ( x or y ) can short circuit on true
        // not ( x and y )

        return function test( entity ){

            const and = selection.operator === "AND";
            let na = false;
            let ret;

            for( let i = 0; i < n; ++i ){

                const s = selection.rules[ i ];

                if( s.hasOwnProperty( "operator" ) ){

                    if( subTests[ i ] ){
                        ret = subTests[ i ]( entity );
                    }else{
                        ret = -1;
                    }

                    if( ret === -1 ){
                        // return -1;
                        na = true;
                        continue;
                    }else if( ret === true ){
                        if( and ){ continue; }else{ return t; }
                    }else{
                        if( and ){ return f; }else{ continue; }
                    }

                }else{

                    if( s.keyword===kwd.ALL ){
                        if( and ){ continue; }else{ return t; }
                    }

                    ret = fn( entity, s );

                    // console.log( entity.qualifiedName(), ret, s, selection.negate, "t", t, "f", f )

                    if( ret === -1 ){
                        // return -1;
                        na = true;
                        continue;
                    }else if( ret === true ){
                        if( and ){ continue; }else{ return t; }
                    }else{
                        if( and ){ return f; }else{ continue; }
                    }

                }

            }

            if( na ){
                return -1;
            }else{
                if( and ){ return t; }else{ return f; }
            }

        };

    }

    _filter( fn, selection ){

        if( selection === undefined ) selection = this.selection;
        if( selection.error ) return selection;

        const n = selection.rules.length;
        if( n === 0 ) return selection;

        const filtered = {
            operator: selection.operator,
            rules: []
        };
        if( selection.hasOwnProperty( "negate" ) ){
            filtered.negate = selection.negate;
        }

        for( let i = 0; i < n; ++i ){

            const s = selection.rules[ i ];
            if( s.hasOwnProperty( "operator" ) ){
                const fs = this._filter( fn, s );
                if( fs !== null ) filtered.rules.push( fs );
            }else if( !fn( s ) ){
                filtered.rules.push( s );
            }

        }

        if( filtered.rules.length > 0 ){

            // TODO maybe the filtered rules could be returned
            // in some case, but the way how tests are applied
            // e.g. when traversing a structure would also need
            // to change
            return selection;
            // return filtered;

        }else{

            return null;

        }

    }

    makeAtomTest( atomOnly ){

        let selection;

        if( atomOnly ){

            // console.log( this.selection )

            selection = this._filter( function( s ){
                if( s.keyword!==undefined && !AtomOnlyKeywords.includes( s.keyword ) ) return true;
                if( s.model!==undefined ) return true;
                if( s.chainname!==undefined ) return true;
                if( s.resname!==undefined ) return true;
                if( s.resno!==undefined ) return true;
                if( s.sstruc!==undefined ) return true;
                return false;
            } );

        }else{

            selection = this.selection;

        }

        const fn = function( a, s ){

            // returning -1 means the rule is not applicable
            if( s.atomname===undefined && s.element===undefined &&
                    s.altloc===undefined && s.atomindex===undefined &&
                    s.keyword===undefined && s.inscode===undefined &&
                    s.resname===undefined && s.sstruc===undefined &&
                    s.resno===undefined && s.chainname===undefined &&
                    s.model===undefined
            ) return -1;

            if( s.keyword!==undefined ){
                if( s.keyword===kwd.BACKBONE && !a.isBackbone() ) return false;
                if( s.keyword===kwd.SIDECHAIN && !a.isSidechain() ) return false;
                if( s.keyword===kwd.BONDED && !a.isBonded() ) return false;
                if( s.keyword===kwd.RING && !a.isRing() ) return false;

                if( s.keyword===kwd.HETERO && !a.isHetero() ) return false;
                if( s.keyword===kwd.PROTEIN && !a.isProtein() ) return false;
                if( s.keyword===kwd.NUCLEIC && !a.isNucleic() ) return false;
                if( s.keyword===kwd.RNA && !a.isRna() ) return false;
                if( s.keyword===kwd.DNA && !a.isDna() ) return false;
                if( s.keyword===kwd.POLYMER && !a.isPolymer() ) return false;
                if( s.keyword===kwd.WATER && !a.isWater() ) return false;
                if( s.keyword===kwd.HELIX && !a.isHelix() ) return false;
                if( s.keyword===kwd.SHEET && !a.isSheet() ) return false;
                if( s.keyword===kwd.TURN && !a.isTurn() ) return false;
                if( s.keyword===kwd.ION && !a.isIon() ) return false;
                if( s.keyword===kwd.SACCHARIDE && !a.isSaccharide() ) return false;
            }

            if( s.atomname!==undefined && s.atomname!==a.atomname ) return false;
            if( s.element!==undefined && s.element!==a.element ) return false;
            if( s.altloc!==undefined && s.altloc!==a.altloc ) return false;

            if( s.atomindex!==undefined &&
                    binarySearchIndexOf( s.atomindex, a.index ) < 0
            ) return false;

            if( s.resname!==undefined ){
                if( Array.isArray( s.resname ) ){
                    if( !s.resname.includes( a.resname ) ) return false;
                }else{
                    if( s.resname!==a.resname ) return false;
                }
            }
            if( s.sstruc!==undefined && s.sstruc!==a.sstruc ) return false;
            if( s.resno!==undefined ){
                if( Array.isArray( s.resno ) && s.resno.length===2 ){
                    if( s.resno[0]>a.resno || s.resno[1]<a.resno ) return false;
                }else{
                    if( s.resno!==a.resno ) return false;
                }
            }
            if( s.inscode!==undefined && s.inscode!==a.inscode ) return false;

            if( s.chainname!==undefined && s.chainname!==a.chainname ) return false;
            if( s.model!==undefined && s.model!==a.modelIndex ) return false;

            return true;

        };

        return this._makeTest( fn, selection );

    }

    makeResidueTest( residueOnly ){

        let selection;

        if( residueOnly ){

            // console.log( this.selection )

            selection = this._filter( function( s ){
                if( s.keyword!==undefined && AtomOnlyKeywords.includes( s.keyword ) ) return true;
                if( s.model!==undefined ) return true;
                if( s.chainname!==undefined ) return true;
                if( s.atomname!==undefined ) return true;
                if( s.element!==undefined ) return true;
                if( s.altloc!==undefined ) return true;
                return false;
            } );

        }else{

            selection = this.selection;

        }

        const fn = function( r, s ){

            // returning -1 means the rule is not applicable
            if( s.resname===undefined && s.resno===undefined && s.inscode===undefined &&
                    s.sstruc===undefined && s.model===undefined && s.chainname===undefined &&
                    s.atomindex===undefined &&
                    ( s.keyword===undefined || AtomOnlyKeywords.includes( s.keyword ) )
            ) return -1;

            if( s.keyword!==undefined ){
                if( s.keyword===kwd.HETERO && !r.isHetero() ) return false;
                if( s.keyword===kwd.PROTEIN && !r.isProtein() ) return false;
                if( s.keyword===kwd.NUCLEIC && !r.isNucleic() ) return false;
                if( s.keyword===kwd.RNA && !r.isRna() ) return false;
                if( s.keyword===kwd.DNA && !r.isDna() ) return false;
                if( s.keyword===kwd.POLYMER && !r.isPolymer() ) return false;
                if( s.keyword===kwd.WATER && !r.isWater() ) return false;
                if( s.keyword===kwd.HELIX && !r.isHelix() ) return false;
                if( s.keyword===kwd.SHEET && !r.isSheet() ) return false;
                if( s.keyword===kwd.TURN && !r.isTurn() ) return false;
                if( s.keyword===kwd.ION && !r.isIon() ) return false;
                if( s.keyword===kwd.SACCHARIDE && !r.isSaccharide() ) return false;
            }

            if( s.atomindex!==undefined &&
                    rangeInSortedArray( s.atomindex, r.atomOffset, r.atomEnd ) === 0
            ) return false;

            if( s.resname!==undefined ){
                if( Array.isArray( s.resname ) ){
                    if( !s.resname.includes( r.resname ) ) return false;
                }else{
                    if( s.resname!==r.resname ) return false;
                }
            }
            if( s.sstruc!==undefined && s.sstruc!==r.sstruc ) return false;
            if( s.resno!==undefined ){
                if( Array.isArray( s.resno ) && s.resno.length===2 ){
                    if( s.resno[0]>r.resno || s.resno[1]<r.resno ) return false;
                }else{
                    if( s.resno!==r.resno ) return false;
                }
            }
            if( s.inscode!==undefined && s.inscode!==r.inscode ) return false;

            if( s.chainname!==undefined && s.chainname!==r.chainname ) return false;
            if( s.model!==undefined && s.model!==r.modelIndex ) return false;

            return true;

        };

        return this._makeTest( fn, selection );

    }

    makeChainTest( chainOnly ){

        let selection;

        if( chainOnly ){

            // console.log( this.selection )

            selection = this._filter( function( s ){
                if( s.keyword!==undefined && !ChainKeywords.includes( s.keyword ) ) return true;
                // if( s.model!==undefined ) return true;
                if( s.resname!==undefined ) return true;
                if( s.resno!==undefined ) return true;
                if( s.atomname!==undefined ) return true;
                if( s.element!==undefined ) return true;
                if( s.altloc!==undefined ) return true;
                if( s.sstruc!==undefined ) return true;
                if( s.inscode!==undefined ) return true;
                return false;
            } );

        }else{

            selection = this.selection;

        }

        const fn = function( c, s ){

            // returning -1 means the rule is not applicable
            if( s.chainname===undefined && s.model===undefined && s.atomindex===undefined &&
                    ( s.keyword===undefined || !ChainKeywords.includes( s.keyword ) )
            ) return -1;

            if( s.keyword!==undefined ){
                if( s.keyword===kwd.HETERO && !c.isHetero() ) return false;
                if( s.keyword===kwd.PROTEIN && !c.isProtein() ) return false;
                if( s.keyword===kwd.NUCLEIC && !c.isNucleic() ) return false;
                if( s.keyword===kwd.RNA && !c.isRna() ) return false;
                if( s.keyword===kwd.DNA && !c.isDna() ) return false;
                if( s.keyword===kwd.POLYMER && !c.isPolymer() ) return false;
                if( s.keyword===kwd.WATER && !c.isWater() ) return false;
                if( s.keyword===kwd.ION && !c.isIon() ) return false;
                if( s.keyword===kwd.SACCHARIDE && !c.isSaccharide() ) return false;
            }

            if( s.atomindex!==undefined &&
                    rangeInSortedArray( s.atomindex, c.atomOffset, c.atomEnd ) === 0
            ) return false;

            if( s.chainname!==undefined && s.chainname!==c.chainname ) return false;

            if( s.model!==undefined && s.model!==c.modelIndex ) return false;

            return true;

        };

        return this._makeTest( fn, selection );

    }

    makeModelTest( modelOnly ){

        let selection;

        if( modelOnly ){

            // console.log( this.selection )

            selection = this._filter( function( s ){
                if( s.keyword!==undefined ) return true;
                if( s.chainname!==undefined ) return true;
                if( s.resname!==undefined ) return true;
                if( s.resno!==undefined ) return true;
                if( s.atomname!==undefined ) return true;
                if( s.element!==undefined ) return true;
                if( s.altloc!==undefined ) return true;
                if( s.sstruc!==undefined ) return true;
                if( s.inscode!==undefined ) return true;
                return false;
            } );

        }else{

            selection = this.selection;

        }

        const fn = function( m, s ){

            // returning -1 means the rule is not applicable
            if( s.model===undefined && s.atomindex===undefined ) return -1;

            if( s.atomindex!==undefined &&
                    rangeInSortedArray( s.atomindex, m.atomOffset, m.atomEnd ) === 0
            ) return false;

            if( s.model!==undefined && s.model!==m.index ) return false;

            return true;

        };

        return this._makeTest( fn, selection );

    }

}


export default Selection;

export {
    kwd
};
