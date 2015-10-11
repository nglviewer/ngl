/**
 * @file Selection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


//////////////
// Selection

NGL.Selection = function( string, extraString ){

    var SIGNALS = signals;

    this.signals = {

        stringChanged: new SIGNALS.Signal(),

    };

    this.setString( string, extraString );

};


NGL.Selection.prototype = {

    constructor: NGL.Selection,

    setString: function( string, extraString, silent ){

        if( string === undefined ){
            string = this.string || "";
        }

        if( extraString === undefined ){
            extraString = this.extraString || "";
        }

        if( string === this.string && extraString === this.extraString ){
            return;
        }

        //

        var combinedString;

        if( !string && !extraString ){

            combinedString = "";

        }else if( !string ){

            combinedString = extraString;

        }else if( !extraString ){

            combinedString = string;

        }else{

            combinedString = (
                "( " + string + " ) and " +
                "( " + extraString + " )"
            );

        }

        if( combinedString === this.combinedString ){
            return;
        }

        //

        try{

            this.parse( combinedString );

        }catch( e ){

            // NGL.error( e.stack );
            this.selection = { "error": e.message };

        }

        this.string = string;
        this.extraString = extraString;
        this.combinedString = combinedString;

        this.test = this.makeAtomTest();
        this.residueTest = this.makeResidueTest();
        this.chainTest = this.makeChainTest();
        this.modelTest = this.makeModelTest();

        this.atomOnlyTest = this.makeAtomTest( true );
        this.residueOnlyTest = this.makeResidueTest( true );
        this.chainOnlyTest = this.makeChainTest( true )
        this.modelOnlyTest = this.makeModelTest( true );

        if( !silent ){
            this.signals.stringChanged.dispatch( this.string );
        }

    },

    parse: function( string ){

        this.selection = {
            operator: undefined,
            rules: []
        };

        if( !string ) return;

        var scope = this;

        var selection = this.selection;
        var selectionStack = [];
        var newSelection, oldSelection;
        var andContext = null;

        string = string.replace( /\(/g, ' ( ' ).replace( /\)/g, ' ) ' ).trim();
        if( string.charAt( 0 ) === "(" && string.substr( -1 ) === ")" ){
            string = string.slice( 1, -1 ).trim();
        }
        var chunks = string.split( /\s+/ );

        // NGL.log( string, chunks )

        var all = [ "*", "", "ALL" ];

        var c, sele, i, error, not;
        var atomname, chain, resno, resname, model, resi;
        var j = 0;

        var createNewContext = function( operator ){

            newSelection = {
                operator: operator,
                rules: []
            };
            if( selection === undefined ){
                selection = newSelection;
                scope.selection = newSelection;
            }else{
                selection.rules.push( newSelection );
                selectionStack.push( selection );
                selection = newSelection;
            }
            j = 0;

        }

        var getPrevContext = function( operator ){

            oldSelection = selection;
            selection = selectionStack.pop();
            if( selection === undefined ){
                createNewContext( operator );
                pushRule( oldSelection );
            }else{
                j = selection.rules.length;
            }

        }

        var pushRule = function( rule ){

            selection.rules.push( rule );
            j += 1;

        }

        for( i = 0; i < chunks.length; ++i ){

            c = chunks[ i ];

            // handle parens

            if( c === "(" ){

                // NGL.log( "(" );

                not = false;
                createNewContext();
                continue;

            }else if( c === ")" ){

                // NGL.log( ")" );

                getPrevContext();
                if( selection.negate ){
                    getPrevContext();
                }
                continue;

            }

            // leave 'not' context

            if( not > 0 ){

                if( c.toUpperCase() === "NOT" ){

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

            if( c.toUpperCase() === "AND" ){

                // NGL.log( "AND" );

                if( selection.operator === "OR" ){
                    var lastRule = selection.rules.pop();
                    createNewContext( "AND" );
                    pushRule( lastRule );
                }else{
                    selection.operator = "AND";
                }
                continue;

            }else if( c.toUpperCase() === "OR" ){

                // NGL.log( "OR" );

                if( selection.operator === "AND" ){
                    getPrevContext( "OR" );
                }else{
                    selection.operator = "OR";
                }
                continue;

            }else if( c.toUpperCase() === "NOT" ){

                // NGL.log( "NOT", j );

                not = 1;
                createNewContext();
                selection.negate = true;
                continue;

            }else{

                // NGL.log( "chunk", c, j, selection );

            }

            // handle keyword attributes

            sele = {};

            if( c.toUpperCase() === "HETERO" ){
                sele.keyword = "HETERO";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "WATER" ){
                sele.keyword = "WATER";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "PROTEIN" ){
                sele.keyword = "PROTEIN";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "NUCLEIC" ){
                sele.keyword = "NUCLEIC";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "RNA" ){
                sele.keyword = "RNA";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "DNA" ){
                sele.keyword = "DNA";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "POLYMER" ){
                sele.keyword = "POLYMER";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "HYDROGEN" ){
                sele.element = "H";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "SMALL" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "GLY" },
                        { resname: "ALA" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "NUCLEOPHILIC" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "SER" },
                        { resname: "THR" },
                        { resname: "CYS" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "HYDROPHOBIC" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "VAL" },
                        { resname: "LEU" },
                        { resname: "ILE" },
                        { resname: "MET" },
                        { resname: "PRO" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "AROMATIC" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "PHE" },
                        { resname: "TYR" },
                        { resname: "TRP" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "AMIDE" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "ASN" },
                        { resname: "GLN" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "ACIDIC" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "ASP" },
                        { resname: "GLU" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "BASIC" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "HIS" },
                        { resname: "LYS" },
                        { resname: "ARG" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "CHARGED" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "ASP" },
                        { resname: "GLU" },
                        { resname: "HIS" },
                        { resname: "LYS" },
                        { resname: "ARG" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "POLAR" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "ASP" },
                        { resname: "GLU" },
                        { resname: "HIS" },
                        { resname: "LYS" },
                        { resname: "ARG" },
                        { resname: "ASN" },
                        { resname: "GLN" },
                        { resname: "SER" },
                        { resname: "THR" },
                        { resname: "TYR" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "NONPOLAR" ){
                sele = {
                    operator: "OR",
                    rules: [
                        { resname: "ALA" },
                        { resname: "CYS" },
                        { resname: "GLY" },
                        { resname: "ILE" },
                        { resname: "LEU" },
                        { resname: "MET" },
                        { resname: "PHE" },
                        { resname: "PRO" },
                        { resname: "VAL" },
                        { resname: "TRP" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "HELIX" ){
                sele.keyword = "HELIX";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "SHEET" ){
                sele.keyword = "SHEET";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "TURN" ){
                sele = {
                    operator: "OR",
                    negate: true,
                    rules: [
                        { keyword: "HELIX" },
                        { keyword: "SHEET" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "BACKBONE" ){
                sele.keyword = "BACKBONE";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "SIDECHAIN" ){
                sele.keyword = "SIDECHAIN";
                pushRule( sele );
                continue;
            }

            if( c.toUpperCase() === "SIDECHAINATTACHED" ){
                sele = {
                    operator: "OR",
                    rules: [
                        {
                            operator: "AND",
                            negate: false,
                            rules: [
                                { resname: "PRO" },
                                { atomname: "N" },
                            ]
                        },
                        { keyword: "SIDECHAIN" },
                        { atomname: "CA" },
                        { atomname: "BB" }
                    ]
                };
                pushRule( sele );
                continue;
            }

            if( all.indexOf( c.toUpperCase() )!==-1 ){
                sele.keyword = "ALL";
                pushRule( sele );
                continue;
            }

            // handle atom expressions

            // TODO make replacement
            // if( c.charAt( 0 ) === "@" ){
            //     sele.globalindex = parseInt( c.substr( 1 ) );
            //     pushRule( sele );
            //     continue;
            // }

            if( c.charAt( 0 ) === "#" ){
                sele.element = c.substr( 1 ).toUpperCase();
                pushRule( sele );
                continue;
            }

            if( c.charAt( 0 ) === "~" ){
                sele.altloc = c.substr( 1 );
                pushRule( sele );
                continue;
            }

            if( ( c.length >= 1 && c.length <= 4 ) &&
                    c[0] !== ":" && c[0] !== "." && c[0] !== "/" &&
                    isNaN( parseInt( c ) ) ){

                sele.resname = c.toUpperCase();
                pushRule( sele );
                continue;
            }

            // there must be only one constraint per rule
            // otherwise a test quickly becomes not applicable
            // e.g. chainTest for chainname when resno is present too

            sele = {
                operator: "AND",
                rules: []
            };

            model = c.split("/");
            if( model.length > 1 && model[1] ){
                if( isNaN( parseInt( model[1] ) ) ){
                    throw new Error( "model must be an integer" );
                }
                sele.rules.push( {
                    model: parseInt( model[1] )
                } );
            }

            atomname = model[0].split(".");
            if( atomname.length > 1 && atomname[1] ){
                if( atomname[1].length > 4 ){
                    throw new Error( "atomname must be one to four characters" );
                }
                sele.rules.push( {
                    atomname: atomname[1].substring( 0, 4 ).toUpperCase()
                } );
            }

            chain = atomname[0].split(":");
            if( chain.length > 1 && chain[1] ){
                sele.rules.push( {
                    chainname: chain[1]
                } );
            }

            if( chain[0] ){
                resi = chain[0].split("-");
                if( resi.length === 1 ){
                    resi = parseInt( resi[0] );
                    if( isNaN( resi ) ){
                        throw new Error( "resi must be an integer" );
                    }
                    sele.rules.push( {
                        resno: resi
                    } );
                }else if( resi.length === 2 ){
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

        if( this.selection.operator === undefined &&
                this.selection.rules.length === 1 &&
                this.selection.rules[ 0 ].hasOwnProperty( "operator" ) ){

            this.selection = this.selection.rules[ 0 ];

        }

    },

    _makeTest: function( fn, selection ){

        if( selection === undefined ) selection = this.selection;
        if( selection === null ) return false;
        if( selection.error ) return false;

        var n = selection.rules.length;
        if( n === 0 ) return false;

        var t = selection.negate ? false : true;
        var f = selection.negate ? true : false;

        var s, and, ret, na;

        var subTests = [];

        for( var i = 0; i < n; ++i ){

            s = selection.rules[ i ];

            if( s.hasOwnProperty( "operator" ) ){

                subTests[ i ] = this._makeTest( fn, s );

            }

        }

        return function( entity ){

            and = selection.operator === "AND";
            na = false;

            for( var i = 0; i < n; ++i ){

                s = selection.rules[ i ];

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

                    }else if( ret === true){

                        if( and ){ continue; }else{ return t; }

                    }else{

                        if( and ){ return f; }else{ continue; }

                    }

                }else{

                    if( s.keyword!==undefined && s.keyword==="ALL" ){

                        if( and ){ continue; }else{ return t; }

                    }

                    ret = fn( entity, s );

                    if( ret === -1 ){

                        // return -1;
                        na = true;
                        continue;

                    }else if( ret === true){

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

        }

    },

    _filter: function( fn, selection ){

        if( selection === undefined ) selection = this.selection;
        if( selection.error ) return selection;

        var n = selection.rules.length;
        if( n === 0 ) return selection;

        var filtered = {
            operator: selection.operator,
            rules: []
        };
        if( selection.hasOwnProperty( "negate" ) ){
            filtered.negate = selection.negate;
        }

        for( var i = 0; i < n; ++i ){

            var s = selection.rules[ i ];

            if( s.hasOwnProperty( "operator" ) ){

                var fs = this._filter( fn, s );
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

        }else{

            return null;

        }

    },

    makeAtomTest: function( atomOnly ){

        var backboneProtein = [
            "CA", "C", "N", "O",
            "O1", "O2", "OC1", "OC2",
            "H", "H1", "H2", "H3", "HA"
        ];
        var backboneNucleic = [
            "P", "O3'", "O5'", "C5'", "C4'", "C3'", "OP1", "OP2",
            "O3*", "O5*", "C5*", "C4*", "C3*"
        ];
        var backboneCg = [
            "CA", "BB"
        ];

        var helixTypes = [
            "h", "g", "i"
        ];

        var selection;

        if( atomOnly ){

            // console.log( this.selection )

            selection = this._filter( function( s ){

                if( s.model!==undefined ) return true;
                if( s.chainname!==undefined ) return true;
                if( s.resname!==undefined ) return true;
                if( s.resno!==undefined ) return true;

                return false;

            } );

        }else{

            selection = this.selection;

        }

        var fn = function( a, s ){

            // returning -1 means the rule is not applicable

            if( s.keyword!==undefined ){

                if( s.keyword==="HETERO" && a.hetero===1 ) return true;
                if( s.keyword==="PROTEIN" && (
                        a.residue.isProtein() || a.residue.isCg()
                    )
                ) return true;
                if( s.keyword==="NUCLEIC" && a.residue.isNucleic() ) return true;
                if( s.keyword==="RNA" && a.residue.isRna() ) return true;
                if( s.keyword==="DNA" && a.residue.isDna() ) return true;
                if( s.keyword==="POLYMER" && (
                        a.residue.isProtein() ||
                        a.residue.isNucleic() ||
                        a.residue.isCg()
                    )
                ) return true;
                if( s.keyword==="WATER" && a.residue.isWater() ) return true;
                if( s.keyword==="HELIX" && helixTypes.indexOf( a.ss )!==-1 ) return true;
                if( s.keyword==="SHEET" && a.ss==="s" ) return true;
                if( s.keyword==="BACKBONE" && (
                        ( a.residue.isProtein() &&
                            backboneProtein.indexOf( a.atomname )!==-1 ) ||
                        ( a.residue.isNucleic() &&
                            backboneNucleic.indexOf( a.atomname )!==-1 ) ||
                        ( a.residue.isCg() &&
                            backboneCg.indexOf( a.atomname )!==-1 )
                    )
                ) return true;
                if( s.keyword==="SIDECHAIN" && (
                        ( a.residue.isProtein() &&
                            backboneProtein.indexOf( a.atomname )===-1 ) ||
                        ( a.residue.isNucleic() &&
                            backboneNucleic.indexOf( a.atomname )===-1 ) ||
                        ( a.residue.isCg() &&
                            backboneCg.indexOf( a.atomname )===-1 )
                    )
                ) return true;

                return false;

            }

            // TODO make replacement
            // if( s.globalindex!==undefined && s.globalindex!==a.globalindex ) return false;
            if( s.resname!==undefined && s.resname!==a.resname ) return false;
            if( s.chainname!==undefined && s.chainname!==a.chainname ) return false;
            if( s.atomname!==undefined && s.atomname!==a.atomname ) return false;
            if( s.model!==undefined && s.model!==a.residue.chain.model.index ) return false;

            if( s.resno!==undefined ){
                if( Array.isArray( s.resno ) && s.resno.length===2 ){
                    if( s.resno[0]>a.resno || s.resno[1]<a.resno ) return false;
                }else{
                    if( s.resno!==a.resno ) return false;
                }
            }

            if( s.element!==undefined && s.element!==a.element ) return false;

            if( s.altloc!==undefined && s.altloc!==a.altloc ) return false;

            return true;

        }

        return this._makeTest( fn, selection );

    },

    makeResidueTest: function( residueOnly ){

        var selection;

        if( residueOnly ){

            // console.log( this.selection )

            selection = this._filter( function( s ){

                if( s.model!==undefined ) return true;
                // TODO make replacement
                // if( s.globalindex!==undefined ) return true;
                if( s.chainname!==undefined ) return true;
                if( s.atomname!==undefined ) return true;
                if( s.element!==undefined ) return true;
                if( s.altloc!==undefined ) return true;

                return false;

            } );

        }else{

            selection = this.selection;

        }

        var fn = function( r, s ){

            // returning -1 means the rule is not applicable

            if( s.keyword!==undefined ){

                if( s.keyword==="HETERO" && r.isHetero() ) return true;
                if( s.keyword==="PROTEIN" && (
                        r.isProtein() || r.isCg() )
                ) return true;
                if( s.keyword==="NUCLEIC" && r.isNucleic() ) return true;
                if( s.keyword==="RNA" && r.isRna() ) return true;
                if( s.keyword==="DNA" && r.isDna() ) return true;
                if( s.keyword==="POLYMER" && (
                        r.isProtein() || r.isNucleic() || r.isCg() )
                ) return true;
                if( s.keyword==="WATER" && r.isWater() ) return true;

            }

            if( s.chainname===undefined && s.model===undefined &&
                    s.resname===undefined && s.resno===undefined
            ) return -1;
            if( s.chainname!==undefined && r.chain.chainname===undefined ) return -1;

            // support autoChainNames which work only on atoms
            if( s.chainname!==undefined && r.chain.chainname==="" ) return -1;

            if( s.resname!==undefined && s.resname!==r.resname ) return false;
            if( s.chainname!==undefined && s.chainname!==r.chain.chainname ) return false;
            if( s.model!==undefined && s.model!==r.chain.model.index ) return false;

            if( s.resno!==undefined ){
                if( Array.isArray( s.resno ) && s.resno.length===2 ){
                    if( s.resno[0]>r.resno || s.resno[1]<r.resno ) return false;
                }else{
                    if( s.resno!==r.resno ) return false;
                }
            }

            return true;

        }

        return this._makeTest( fn, selection );

    },

    makeChainTest: function( chainOnly ){

        var selection;

        if( chainOnly ){

            // console.log( this.selection )

            selection = this._filter( function( s ){

                if( s.model!==undefined ) return true;
                if( s.resname!==undefined ) return true;
                if( s.resno!==undefined ) return true;
                // TODO make replacement
                // if( s.globalindex!==undefined ) return true;
                if( s.atomname!==undefined ) return true;
                if( s.element!==undefined ) return true;
                if( s.altloc!==undefined ) return true;

                return false;

            } );

        }else{

            selection = this.selection;

        }

        var fn = function( c, s ){

            // returning -1 means the rule is not applicable

            if( s.chainname!==undefined && c.chainname===undefined ) return -1;
            if( s.chainname===undefined && s.model===undefined ) return -1;

            // support autoChainNames which work only on atoms
            if( s.chainname!==undefined && c.chainname==="" ) return -1;

            if( s.chainname!==undefined && s.chainname!==c.chainname ) return false;
            if( s.model!==undefined && s.model!==c.model.index ) return false;

            return true;

        }

        return this._makeTest( fn, selection );

    },

    makeModelTest: function( modelOnly ){

        var selection;

        if( modelOnly ){

            // console.log( this.selection )

            selection = this._filter( function( s ){

                if( s.chainname!==undefined ) return true;
                if( s.resname!==undefined ) return true;
                if( s.resno!==undefined ) return true;
                // TODO make replacement
                // if( s.globalindex!==undefined ) return true;
                if( s.atomname!==undefined ) return true;
                if( s.element!==undefined ) return true;
                if( s.altloc!==undefined ) return true;

                return false;

            } );

        }else{

            selection = this.selection;

        }

        var fn = function( m, s ){

            // returning -1 means the rule is not applicable

            if( s.model===undefined ) return -1;
            if( s.model!==m.index ) return false;

            return true;

        }

        return this._makeTest( fn, selection );

    }

};
