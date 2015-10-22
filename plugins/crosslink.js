

var CrosslinkData = function( linkList ){

    var linkHash = {};

    function insertLink( from, to ){
        // if ( from > to ){
        //     var tmp = from;
        //     from = to;
        //     to = tmp;
        // }
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
        insertLink( to, from );
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


var CrosslinkRepresentation = function( stage, structureComp, xlList, params ){

    var p = Object.assign( {}, params );

    if( p.displayedResiduesColor === undefined && p.displayedColor === undefined ){
        p.displayedResiduesColor = "lightgrey";
    }
    if( p.displayedLinksColor === undefined && p.displayedColor === undefined ){
        p.displayedLinksColor = "lightgrey";
    }
    if( p.highlightedResiduesColor === undefined && p.highlightedColor === undefined ){
        p.highlightedResiduesColor = "lightgreen";
    }
    if( p.highlightedLinksColor === undefined && p.highlightedColor === undefined ){
        p.highlightedLinksColor = "lightgreen";
    }
    if( p.sstrucColor === undefined ){
        p.sstrucColor = "wheat";
    }
    if( p.displayedDistanceColor === undefined ){
        p.displayedDistanceColor = "tomato";
    }
    if( p.highlightedDistanceColor === undefined ){
        p.highlightedDistanceColor = "white";
    }
    if( p.displayedDistanceVisible === undefined ){
        p.displayedDistanceVisible = false;
    }
    if( p.highlightedDistanceVisible === undefined ){
        p.highlightedDistanceVisible = true;
    }

    this.setParameters( p, true );

    //

    this.signals = {
        onPicking: new signals.Signal()
    };

    this.stage = stage;
    this.structureComp = structureComp;
    this.xlData = new CrosslinkData( xlList );

    this.colorOptions = {};
    this._initColorSchemes();

    this._initStructureRepr();
    this._initLinkRepr();

    this.stage.signals.onPicking.add( this._handlePicking, this );

};

CrosslinkRepresentation.prototype = {

    constructor: CrosslinkRepresentation,

    _getAtomPairsFromLink: function( linkList ){

        if( !linkList ) return [];

        var atomPairs = [];
        var structure = this.structureComp.structure;
        var resToSele = this._getSelectionFromResidue;

        if( linkList === "all" ){
            atomPairs = this._getAtomPairsFromResidue();
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

    _getAtomPairsFromResidue: function( residue ){

        var linkList = this.xlData.getLinks( residue );

        return this._getAtomPairsFromLink( linkList );

    },

    _getSelectionFromResidue: function( resnoList, asSelection ){

        var sele;

        if( !resnoList ){

            sele = "none";

        }else{

            if( resnoList === "all" ){
                resnoList = this.xlData.getResidues();
            }

            if( !Array.isArray( resnoList ) ) resnoList = [ resnoList ];
            sele = "( " + resnoList.join( " OR " ) + " ) AND .CA";

        }

        return asSelection ? new NGL.Selection( sele ) : sele;

    },

    _initStructureRepr: function(){

        var comp = this.structureComp;
        var resSele = this._getSelectionFromResidue(
            this.xlData.getResidues()
        );

        this.sstrucRepr = comp.addRepresentation( "cartoon", {
            color: this.sstrucColor,
            name: "sstruc"
        } );

        this.resRepr = comp.addRepresentation( "spacefill", {
            sele: resSele,
            color: this.displayedResiduesColor,
            scale: 0.6,
            name: "res"
        } );

        this.resEmphRepr = comp.addRepresentation( "spacefill", {
            sele: "none",
            color: this.highlightedResiduesColor,
            scale: 0.9,
            opacity: 0.7,
            name: "resEmph"
        } );

        this.stage.centerView( true );
        comp.centerView( true );

    },

    _initLinkRepr: function(){

        var comp = this.structureComp;
        var xlPair = this._getAtomPairsFromResidue();

        this.linkRepr = comp.addRepresentation( "distance", {
            atomPair: xlPair,
            color: this.displayedLinksColor,
            labelSize: 2.0,
            labelColor: this.displayedDistanceColor,
            labelVisible: this.displayedDistanceVisible,
            name: "link"
        } );

        this.linkEmphRepr = comp.addRepresentation( "distance", {
            atomPair: [],
            color: this.highlightedLinksColor,
            labelSize: 2.0,
            labelColor: this.highlightedDistanceColor,
            labelVisible: this.highlightedDistanceVisible,
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
                fromResidue: pd.bond.atom1.resno,
                toResidue: pd.bond.atom2.resno
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

        this.resRepr.setSelection(
            this._getSelectionFromResidue( residues )
        );

    },

    setHighlightedResidues: function( residues ){

        this.resEmphRepr.setSelection(
            this._getSelectionFromResidue( residues )
        );

    },

    setDisplayedLinks: function( links ){

        this.linkRepr.setParameters( {
            atomPair: this._getAtomPairsFromLink( links ),
        } );

    },

    setHighlightedLinks: function( links ){

        this.linkEmphRepr.setParameters( {
            atomPair: this._getAtomPairsFromLink( links ),
        } );

    },

    /**
     * params
     *
     * - displayedColor (sets residues and links color)
     * - highlightedColor (sets residues and links color)
     * - displayedResiduesColor
     * - highlightedResiduesColor
     * - displayedLinksColor
     * - highlightedLinksColor
     * - sstrucColor
     * - displayedDistanceColor (can't be a color scheme)
     * - highlightedDistanceColor (can't be a color scheme)
     * - displayedDistanceVisible
     * - highlightedDistanceVisible
     */
    setParameters: function( params, initialize ){

        var p = Object.assign( {}, params );

        var resParams = {};
        var linkParams = {};
        var resEmphParams = {};
        var linkEmphParams = {};
        var sstrucParams = {};

        // set params

        resParams.color = p.displayedColor;
        linkParams.color = p.displayedColor;
        resEmphParams.color = p.highlightedColor;
        linkEmphParams.color = p.highlightedColor;

        if( p.displayedResiduesColor ){
            resParams.color = p.displayedResiduesColor;
        }
        if( p.displayedLinksColor ){
            linkParams.color = p.displayedLinksColor;
        }
        if( p.highlightedResiduesColor ){
            resEmphParams.color = p.highlightedResiduesColor;
        }
        if( p.highlightedLinksColor ){
            linkEmphParams.color = p.highlightedLinksColor;
        }

        sstrucParams.color = p.sstrucColor;

        linkParams.labelColor = p.displayedDistanceColor;
        linkEmphParams.labelColor = p.highlightedDistanceColor;
        linkParams.labelVisible = p.displayedDistanceVisible;
        linkEmphParams.labelVisible = p.highlightedDistanceVisible;

        // set object properties

        if( resParams.color !== undefined ){
            this.displayedResiduesColor = resParams.color;
        }
        if( linkParams.color !== undefined ){
            this.displayedLinksColor = linkParams.color;
        }
        if( resEmphParams.color !== undefined ){
            this.highlightedResiduesColor = resEmphParams.color;
        }
        if( linkEmphParams.color !== undefined ){
            this.highlightedLinksColor = linkEmphParams.color;
        }

        if( sstrucParams.color !== undefined ){
            this.sstrucColor = sstrucParams.color;
        }

        if( linkParams.labelColor !== undefined ){
            this.displayedDistanceColor = linkParams.labelColor;
        }
        if( linkEmphParams.labelColor !== undefined ){
            this.highlightedDistanceColor = linkEmphParams.labelColor;
        }
        if( linkParams.labelVisible !== undefined ){
            this.displayedDistanceVisible = linkParams.labelVisible;
        }
        if( linkEmphParams.labelVisible !== undefined ){
            this.highlightedDistanceVisible = linkEmphParams.labelVisible;
        }

        // pass params to representations

        if( !initialize ){

            this.resRepr.setColor( resParams.color );
            this.linkRepr.setColor( linkParams.color );
            this.resEmphRepr.setColor( resEmphParams.color );
            this.linkEmphRepr.setColor( linkEmphParams.color );
            this.sstrucRepr.setColor( sstrucParams.color );

            this.resRepr.setParameters( resParams );
            this.linkRepr.setParameters( linkParams );
            this.resEmphRepr.setParameters( resEmphParams );
            this.linkEmphRepr.setParameters( linkEmphParams );
            this.sstrucRepr.setParameters( sstrucParams );

        }

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
