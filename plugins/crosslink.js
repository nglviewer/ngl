

var CrosslinkData = function( linkList ){

    var linkHash = {};

    function insertLink( from, to ){
        if ( from > to ){
            var tmp = from;
            from = to;
            to = tmp;
        }
        var list = linkHash[ from ];
        if( list === undefined ){
            linkHash[ from ] = [ to ];
            return true;
        }else if( list.indexOf( to ) === -1 ){
            list.push( to );
            return true;
        }
        return false;
    }

    linkList.forEach( function( rl ){
        var from = rl.fromResidue;
        var to = rl.toResidue;
        insertLink( from, to );
    } );

    //

    this._linkList = linkList;
    this._linkHash = linkHash;
    this._residueList = Object.keys( linkHash );

};

CrosslinkData.prototype = {

    getLinkedResidues: function( residue ){

        return this._linkHash[ residue ];

    },

    getLinks: function( residue ){

        if( !residue ){

            return this._linkList;

        }else{

            var links = [];
            var linkedResidues = this._linkHash[ residue ];

            if( linkedResidues ){
                linkedResidues.forEach( function( to ){
                    links.push( { fromResidue: residue, toResidue: to } );
                } );
            }

            return links;

        }

    },

    getResidues: function( link ){

        if( !link ){

            return this._residueList;

        }else if( Array.isArray( link ) ){

            var residues = [];
            link.forEach( function( l ){
                residues.push( l.fromResidue, l.toResidue );
            } );
            return residues;

        }else{

            return [ link.fromResidue, link.toResidue ];

        }

    },

    hasResidue: function( residue ){

        return this._linkHash[ residue ] === undefined ? false : true;

    },

    hasLink: function( link ){

        var linkHash = this._linkHash;
        var from = link.fromResidue;
        var to = link.toResidue;

        if( from > to ){
            var tmp = from;
            from = to;
            to = tmp;
        }

        var list = linkHash[ from ];
        if( list === undefined ){
            return false;
        }else if( list.indexOf( to ) === -1 ){
            return false;
        }
        return true;

    }

};


var CrosslinkRepresentation = function( stage, structureComp, xlList ){

    this.signals = {
        onPicking: new signals.Signal()
    };

    this.stage = stage;
    this.structureComp = structureComp;
    this.xlData = new CrosslinkData( xlList );

    this.colorOptions = {};
    this._initColorSchemes();

    this._initStructureRepr();
    this._initReslinkRepr();

    this.stage.signals.onPicking.add( this._handlePicking, this );

};

CrosslinkRepresentation.prototype = {

    constructor: CrosslinkRepresentation,

    _getAtomPairs: function( residue ){

        var atomPairs = [];
        var structure = this.structureComp.structure;
        var linkList = this.xlData.getLinks( residue );

        function resToSele( resnoList, asSelection ){

            if( !Array.isArray( resnoList ) ) resnoList = [ resnoList ];
            var sele = "( " + resnoList.join( " OR " ) + " ) AND .CA";
            return asSelection ? new NGL.Selection( sele ) : sele;

        }

        linkList.forEach( function( rl ){

            var from = rl.fromResidue;
            var to = rl.toResidue;

            var a1 = structure.getAtoms( resToSele( from, true ), true );
            var a2 = structure.getAtoms( resToSele( to, true ), true );

            if( a1 && a2 ){
                atomPairs.push( [ resToSele( from ), resToSele( to ) ] );
            }

        } );

        return atomPairs;

    },

    _initStructureRepr: function(){

        var comp = this.structureComp;

        this.sstrucRepr = comp.addRepresentation( "cartoon", {
            color: "residueindex",
            name: "sstruc"
        } );

        this.resRepr = comp.addRepresentation( "spacefill", {
            sele: "none",
            color: this.linkCountScheme,
            scale: 0.6,
            name: "res"
        } );

        this.resEmphRepr = comp.addRepresentation( "spacefill", {
            sele: "none",
            color: "fuchsia",
            scale: 1.2,
            opacity: 0.7,
            name: "resEmph"
        } );

        this.stage.centerView( true );
        comp.centerView( true );

    },

    _initReslinkRepr: function(){

        var comp = this.structureComp;
        var xlPair = this._getAtomPairs();

        // this.stage.getRepresentationsByName( "allRes" )
        //     .setSelection( resToSele( xlResList ) );

        this.linkRepr = comp.addRepresentation( "distance", {
            atomPair: xlPair,
            color: new THREE.Color( "lightgrey" ).getHex(),
            labelSize: 0.001,
            name: "link"
        } );

        this.linkEmphRepr = comp.addRepresentation( "distance", {
            atomPair: xlPair,
            sele: "none",
            color: new THREE.Color( "fuchsia" ).getHex(),
            labelSize: 2.0,
            scale: 2.5,
            opacity: 0.6,
            name: "linkEmph"
        } );

    },

    _initColorSchemes: function(){

        var self = this;

        var linkCountScale = chroma
            .scale( 'YlGn' )
            .mode('lch')
            .domain( [ 0, 8 ] );

        this.linkCountScheme = NGL.ColorMakerRegistry.addScheme( function( params ){

            this.atomColor = function( atom ){

                var count = self.xlRes[ atom.resno ].length;

                var _c = linkCountScale( count )._rgb;
                var c = _c[0] << 16 | _c[1] << 8 | _c[2];

                return c;

            }

        }, "linkCount" );

        this.colorOptions[ "linkCount" ] = this.linkCountScheme;
        this.colorOptions[ "white" ] = new THREE.Color( "white" ).getHex();
        this.colorOptions[ "lightgrey" ] = new THREE.Color( "lightgrey" ).getHex();

    },

    _handlePicking: function( pickingData ){

        var pd = pickingData;
        var xlData = this.xlData;

        var pd2 = {
            residue: undefined,
            link: undefined
        };

        if( pd.atom !== undefined && pd.bond === undefined ){

            var residue = pd.atom.resno;
            pd2.residue = xlData.hasResidue( residue ) ? residue : undefined;

        }else if( pd.bond !== undefined ){

            var link = {
                fromResidue: bond.atom1.resno,
                toResidue: bond.atom2.resno
            };
            pd2.link = xlData.hasLink( link ) ? link : undefined;

        }

        this.signals.onPicking.dispatch( pd2 );

    },

    // API

    setDisplayed: function( residues, links ){

        this.setDisplayedResidues( residues );
        this.setDisplayedLinks( links );

    },

    setHighlighted: function( residues, links ){

        this.setHighlightedResidues( residues );
        this.setHighlightedLinks( links );

    },

    setDisplayedResidues: function( residues ){

    },

    setHighlightedResidues: function( residues ){

    },

    setDisplayedLinks: function( links ){

    },

    setHighlightedLinks: function( links ){

        links.forEach( function( rl ){


        } );

        if( d.atom !== undefined && d.bond === undefined ){

            var linkedRes = xlData.getLinkedResidues( d.atom.resno );

            if( linkedRes ){

                focusedComp.setSelection( resToSele( d.atom.resno ) );
                linkedComp.setSelection( resToSele( linkedRes ) );

                // textElm.setValue( "[" + d.atom.resno + "] " + linkedRes.join( ", " ) );

            }else{

                focusedComp.setSelection( "none" );
                linkedComp.setSelection( "none" );

                textElm.setValue( "none" );

            }

            focusedBondComp.setSelection( "none" );

        }else if( d.bond !== undefined ){

            var bondedRes = xlBond[ getBondName( d.bond ) ];

            if( bondedRes ){

                focusedBondComp.setSelection( resToSele( bondedRes ) );

                // textElm.setValue( bondedRes.join( ", " ) );

            }else{

                focusedBondComp.setSelection( "none" );

                // textElm.setValue( "none" );

            }

            focusedComp.setSelection( "none" );
            linkedComp.setSelection( "none" );

        }else{

            focusedComp.setSelection( "none" );
            linkedComp.setSelection( "none" );
            focusedBondComp.setSelection( "none" );

            // textElm.setValue( "none" );

        }

    },

    setParameters: function( params ){

        // highlightColor
        // linkColor

    },

    dispose: function(){

        this.stage.signals.onPicking.remove( this._handlePicking, this );

        this.stage.removeRepresentation( this.sstrucRepr );
        this.stage.removeRepresentation( this.resRepr );
        this.stage.removeRepresentation( this.resEmphRepr );
        this.stage.removeRepresentation( this.linkRepr );
        this.stage.removeRepresentation( this.linkEmphRepr );

    }

};
