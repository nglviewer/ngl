

function transformLinkList( linkList, chainname, structureId ){

    chainname = chainname === undefined ? "A" : chainname;

    var tLinkList = [];
    var nextLinkId = 0;
    var nextResidueId = 0;

    var residueDict = {};
    function getResidueId( resno ){
        // TODO add structureId to key
        // TODO in NMR structures there are multiple models
        var key = resno + ":" + chainname;
        if( residueDict[ key ] === undefined ){
            residueDict[ key ] = nextResidueId
            nextResidueId += 1;
        }
        return residueDict[ key ];
    }

    linkList.forEach( function( rl ){

        tLinkList.push( {
            linkId: nextLinkId,
            residueA: {
                residueId: getResidueId( rl.fromResidue ),
                resno: rl.fromResidue,
                chainname: chainname,
                structureId: structureId
            },
            residueB: {
                residueId: getResidueId( rl.toResidue ),
                resno: rl.toResidue,
                chainname: chainname,
                structureId: structureId
            }
        } );

        nextLinkId += 1;

    } );

    return tLinkList;

}


var CrosslinkData = function( linkList ){

    linkList = transformLinkList( linkList, "A" );

    var linkIdToResidueIds = {};
    var residueIdToLinkIds = {};

    var linkIdToLink = {};
    var residueIdToResidue = {};

    var residueList = [];

    //

    linkList.forEach( function( rl ){
        linkIdToResidueIds[ rl.linkId ] = [
            rl.residueA.residueId,
            rl.residueB.residueId
        ];
        linkIdToLink[ rl.linkId ] = rl;
    } );

    function insertResidue( residue, link ){
        var list = residueIdToLinkIds[ residue.residueId ];
        if( list === undefined ){
            residueIdToLinkIds[ residue.residueId ] = [ link.linkId ];
        }else if( list.indexOf( link.linkId ) === -1 ){
            list.push( link.linkId );
        }
        residueIdToResidue[ residue.residueId ] = residue;
    }

    linkList.forEach( function( rl ){
        insertResidue( rl.residueA, rl );
        insertResidue( rl.residueB, rl );
    } );

    for( var residueId in residueIdToResidue ){
        residueList.push( residueIdToResidue[ residueId ] );
    }

    //

    this._linkIdToResidueIds = linkIdToResidueIds;
    this._residueIdToLinkIds = residueIdToLinkIds;

    this._linkIdToLink = linkIdToLink;
    this._residueIdToResidue = residueIdToResidue;

    this._linkList = linkList;
    this._residueList = residueList;

};

CrosslinkData.prototype = {

    getLinks: function( residue ){

        if( residue === undefined ){

            return this._linkList;

        }else{

            var links = [];
            var linkIds = this._residueIdToLinkIds[ residue.residueId ];

            if( linkIds ){
                for( var i = 0, il = linkIds.length; i < il; ++i ){
                    links.push( this._linkIdToLink[ linkIds[ i ] ] );
                }
            }

            return links;

        }

    },

    getResidues: function( link ){

        if( link === undefined ){

            return this._residueList;

        }else if( Array.isArray( link ) ){

            var residues = [];
            link.forEach( function( l ){
                residues.push( l.residueA, l.residueB );
            } );
            return residues;

        }else{

            return [ link.residueA, link.residueB ];

        }

    },

    findLinks: function( residueA, residueB ){

        var idA = residueA.residueId;
        var idB = residueB.residueId;
        var linklist = this._linkList;

        var links = []

        for( var i = 0, il = linklist.length; i < il; ++i ){
            var l = linklist[ i ];
            if( l.residueA.residueId === idA && l.residueB.residueId === idB ){
                links.push( l );
            }
        }

        return links.length ? links : false;

    },

    findResidues: function( resno, chainname ){

        var residueList = this._residueList;

        var residues = [];

        for( var i = 0, il = residueList.length; i < il; ++i ){
            var r = residueList[ i ];
            if( r.resno === resno && r.chainname === chainname ){
                residues.push( r );
            }
        }

        return residues.length ? residues : false;

    },

    hasResidue: function( residue ){

        var id = residue.residueId;
        return this._residueIdToResidue[ id ] === undefined ? false : true;

    },

    hasLink: function( link ){

        var id = link.linkId;
        return this._linkIdToLink[ id ] === undefined ? false : true;

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

            var resA = rl.residueA;
            var resB = rl.residueB;

            var a1 = structure.getAtoms( resToSele( resA, true ), true );
            var a2 = structure.getAtoms( resToSele( resB, true ), true );

            if( a1 && a2 ){
                atomPairs.push( [ resToSele( resA ), resToSele( resB ) ] );
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

            var tmp = [];

            resnoList.forEach( function( r ){
                var rsele = r.resno;
                if( r.chainname ) rsele + ":" + r.chainname;
                tmp.push( rsele );
            } );

            sele = "( " + tmp.join( " OR " ) + " ) AND .CA";

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

            var residues = xlData.findResidues(
                pd.atom.resno, pd.atom.chainname
            );
            if( residues ){
                pd2.residue = residues[ 0 ];
            }

        }else if( pd.bond !== undefined ){

            var residuesA = xlData.findResidues(
                pd.bond.atom1.resno, pd.bond.atom1.chainname
            );

            var residuesB = xlData.findResidues(
                pd.bond.atom2.resno, pd.bond.atom2.chainname
            );

            if( residuesA && residuesB ){
                var links = xlData.findLinks(
                    residuesA[ 0 ], residuesB[ 0 ]
                );
                if( links ){
                    pd2.link = links[ 0 ];
                }
            }

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
