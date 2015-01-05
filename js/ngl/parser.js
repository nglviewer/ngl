/**
 * @file Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.processArray = function( array, fn, callback, chunkSize ){

    chunkSize = chunkSize !== undefined ? chunkSize : 10000;

    var n = array.length;

    var _i = 0;
    var _step = chunkSize;
    var _n = Math.min( _step, n );

    async.until(

        function(){

            return _i >= n;

        },

        function( wcallback ){

            setTimeout( function(){

                // console.log( _i, _n, n );

                var stop = fn( _i, _n, array );

                if( stop ){

                    _i = n;

                }else{

                    _i += _step;
                    _n = Math.min( _n + _step, n );

                }

                wcallback();

            }, 10 );

        },

        callback

    );

};


NGL.buildStructure = function( structure, callback ){

    console.time( "NGL.buildStructure" );

    var m, c, r, a;
    var i, chainDict;

    var currentModelindex = null;
    var currentChainname;
    var currentResno;

    function _chunked( _i, _n, atoms ){

        for( i = _i; i < _n; ++i ){

            a = atoms[ i ];

            var modelindex = a.modelindex;
            var chainname = a.chainname;
            var resno = a.resno;
            var resname = a.resname;

            if( currentModelindex!==modelindex ){

                m = structure.addModel();

                chainDict = {};

                c = m.addChain();
                c.chainname = chainname;
                chainDict[ chainname ] = c;

                r = c.addResidue();
                r.resno = resno;
                r.resname = resname;

            }else if( currentChainname!==chainname ){

                if( !chainDict[ chainname ] ){

                    c = m.addChain();
                    c.chainname = chainname;
                    chainDict[ chainname ] = c;

                }else{

                    c = chainDict[ chainname ];

                }

                r = c.addResidue();
                r.resno = resno;
                r.resname = resname;

            }else if( currentResno!==resno ){

                r = c.addResidue();
                r.resno = resno;
                r.resname = resname;

            }

            r.addAtom( a );

            // seems to slow down Chrome
            // delete a.modelindex;

            currentModelindex = modelindex;
            currentChainname = chainname;
            currentResno = resno;

        }

    }

    NGL.processArray(

        structure.atoms,

        _chunked,

        function(){

            console.timeEnd( "NGL.buildStructure" );
            console.log( structure );

            callback();

        }

    );

    return structure;

};


NGL.createAtomArray = function( structure, callback ){

    console.time( "NGL.createAtomArray" );

    var s = structure;
    var atoms = s.atoms;
    var n = atoms.length;

    s.atomArray = new NGL.AtomArray( n );
    var atomArray = s.atomArray;

    function _chunked( _i, _n ){

        for( var i = _i; i < _n; ++i ){

            var ai = atoms[ i ];

            var a = new NGL.ProxyAtom( atomArray );
            a.index = i;

            atomArray.setResname( i, ai.resname );
            atomArray.x[ i ] = ai.x;
            atomArray.y[ i ] = ai.y;
            atomArray.z[ i ] = ai.z;
            atomArray.setElement( i, ai.element );
            atomArray.hetero[ i ] = ai.hetero;
            atomArray.setChainname( i, ai.chainname );
            atomArray.resno[ i ] = ai.resno;
            atomArray.serial[ i ] = ai.serial;
            atomArray.setAtomname( i, ai.atomname );
            atomArray.ss[ i ] = ai.ss.charCodeAt( 0 );
            atomArray.bfactor[ i ] = ai.bfactor;
            atomArray.altloc[ i ] = ai.altloc.charCodeAt( 0 );
            atomArray.vdw[ i ] = ai.vdw;
            atomArray.covalent[ i ] = ai.covalent;
            // FIXME atomArray.modelindex[ i ] = ai.modelindex;
            a.modelindex = ai.modelindex;

            atoms[ i ] = a;

        }

    }

    NGL.processArray(

        atoms,

        _chunked,

        function(){

            console.timeEnd( "NGL.createAtomArray" );

            callback();

        },

        50000

    );

    return structure;

}


////////////////////
// StructureParser

NGL.StructureParser = function( name, path, params ){

    params = params || {};

    this.name = name;
    this.path = path;

    this.firstModelOnly = params.firstModelOnly || false;
    this.asTrajectory = params.asTrajectory || false;
    this.cAlphaOnly = params.cAlphaOnly || false;

    this.structure = new NGL.Structure( this.name, this.path );

};

NGL.StructureParser.prototype = {

    parse: function( str, callback ){

        var self = this;

        async.series( [

            function( wcallback ){

                self._parse( str, wcallback );

            },

            function( wcallback ){

                if( self.structure.atoms.length > 100000 ){

                    NGL.createAtomArray( self.structure, wcallback );

                }else{

                    wcallback();

                }

            },

            function( wcallback ){

                NGL.buildStructure( self.structure, wcallback );

            },

            function( wcallback ){

                self._postProcess( self.structure, wcallback );

            },

            function( wcallback ){

                self.structure.postProcess( wcallback );

            }

        ], function(){

            callback( self.structure );

        } );

        return this.structure;

    },

    _parse: function( str, callback ){

        console.warn( "NGL.StructureParser._parse not implemented" );
        callback();

    },

    _postProcess: function( structure, callback ){

        console.warn( "NGL.StructureParser._postProcess not implemented" );
        callback();

    }

}


NGL.PdbParser = function( name, path, params ){

    NGL.StructureParser.call( this, name, path, params );

};

NGL.PdbParser.prototype = Object.create( NGL.StructureParser.prototype );

NGL.PdbParser.prototype._parse = function( str, callback ){

    var __timeName = "NGL.PdbParser._parse " + this.name;

    console.time( __timeName );

    var s = this.structure;
    var firstModelOnly = this.firstModelOnly;
    var asTrajectory = this.asTrajectory;
    var cAlphaOnly = this.cAlphaOnly;

    var frames = [];
    var boxes = [];
    var doFrames = false;
    var currentFrame, currentCoord;

    s.title = '';
    s.id = '';
    s.sheet = [];
    s.helix = [];

    s.biomolDict = {};
    var biomolDict = s.biomolDict;

    var atoms = s.atoms;
    var bondSet = s.bondSet;

    var lines = str.split( "\n" );

    var guessElem = NGL.guessElement;
    var covRadii = NGL.CovalentRadii;
    var vdwRadii = NGL.VdwRadii;
    var helixTypes = NGL.HelixTypes;

    var line, recordName;
    var serial, elem, chainname, resno, resname, atomname, element;

    var serialDict = {};

    var id = s.id;
    var title = s.title;
    var sheet = s.sheet;
    var helix = s.helix;

    s.hasConnect = false;

    var a, currentBiomol;

    var idx = 0;
    var modelIdx = 0;

    function _chunked( _i, _n ){

        for( var i = _i; i < _n; ++i ){

            line = lines[ i ];
            recordName = line.substr( 0, 6 );

            if( recordName === 'ATOM  ' || recordName === 'HETATM' ){

                // http://www.wwpdb.org/documentation/format33/sect9.html#ATOM

                if( firstModelOnly && modelIdx > 0 ) continue;

                atomname = line.substr( 12, 4 ).trim();
                if( cAlphaOnly && atomname !== 'CA' ) continue;

                var x = parseFloat( line.substr( 30, 8 ) );
                var y = parseFloat( line.substr( 38, 8 ) );
                var z = parseFloat( line.substr( 46, 8 ) );

                if( asTrajectory ){

                    var j = currentCoord * 3;

                    currentFrame[ j + 0 ] = x;
                    currentFrame[ j + 1 ] = y;
                    currentFrame[ j + 2 ] = z;

                    currentCoord += 1;

                    if( doFrames ) continue;

                }

                serial = parseInt( line.substr( 6, 5 ) );
                element = line.substr( 76, 2 ).trim();
                chainname = line[ 21 ].trim();
                resno = parseInt( line.substr( 22, 5 ) );
                resname = line.substr( 17, 4 ).trim();

                if( !element ) element = guessElem( atomname );

                a = new NGL.Atom();
                a.index = idx;
                a.bonds = [];

                a.resname = resname;
                a.x = x;
                a.y = y;
                a.z = z;
                a.element = element;
                a.hetero = ( line[ 0 ] === 'H' ) ? true : false;
                a.chainname = chainname;
                a.resno = resno;
                a.serial = serial;
                a.atomname = atomname;
                a.ss = 'c';
                a.bfactor = parseFloat( line.substr( 60, 8 ) );
                a.altloc = line[ 16 ].trim();
                a.vdw = vdwRadii[ element ];
                a.covalent = covRadii[ element ];
                a.modelindex = modelIdx;

                serialDict[ serial ] = a;

                idx += 1;
                atoms.push( a );

            }else if( recordName === 'CONECT' ){

                var from = serialDict[ parseInt( line.substr( 6, 5 ) ) ];
                var pos = [ 11, 16, 21, 26 ];

                if( from === undefined ){
                    // console.log( "missing CONNECT serial" );
                    continue;
                }

                for (var j = 0; j < 4; j++) {

                    var to = parseInt( line.substr( pos[ j ], 5 ) );
                    if( Number.isNaN( to ) ) continue;
                    to = serialDict[ to ];
                    if( to === undefined ){
                        // console.log( "missing CONNECT serial" );
                        continue;
                    }

                    bondSet.addBond( from, to );

                }

                s.hasConnect = true;

            }else if( recordName === 'HELIX ' ){

                var startChain = line[ 19 ];
                var startResi = parseInt( line.substr( 21, 4 ) );
                var endChain = line[ 31 ];
                var endResi = parseInt( line.substr( 33, 4 ) );
                var helixType = parseInt( line.substr( 39, 1 ) );
                helixType = helixTypes[ helixType ] || helixTypes[""];
                helix.push([ startChain, startResi, endChain, endResi, helixType ]);

            }else if( recordName === 'SHEET ' ){

                var startChain = line[ 21 ];
                var startResi = parseInt( line.substr( 22, 4 ) );
                var endChain = line[ 32 ];
                var endResi = parseInt( line.substr( 33, 4 ) );
                sheet.push([ startChain, startResi, endChain, endResi ]);

            }else if( recordName === 'REMARK' && line.substr( 7, 3 ) === '350' ){

                if( line.substr( 11, 12 ) === "BIOMOLECULE:" ){

                    var name = line.substr( 23 ).trim();

                    biomolDict[ name ] = {
                        matrixDict: {},
                        chainList: []
                    };
                    currentBiomol = biomolDict[ name ];

                }else if( line.substr( 13, 5 ) === "BIOMT" ){

                    var row = parseInt( line[ 18 ] ) - 1;
                    var mat = line.substr( 20, 3 ).trim();

                    if( row === 0 ){
                        currentBiomol.matrixDict[ mat ] = new THREE.Matrix4();
                    }

                    var elms = currentBiomol.matrixDict[ mat ].elements;

                    elms[ 4 * 0 + row ] = parseFloat( line.substr( 24, 9 ) );
                    elms[ 4 * 1 + row ] = parseFloat( line.substr( 34, 9 ) );
                    elms[ 4 * 2 + row ] = parseFloat( line.substr( 44, 9 ) );
                    elms[ 4 * 3 + row ] = parseFloat( line.substr( 54, 14 ) );

                }else if(
                    line.substr( 11, 30 ) === 'APPLY THE FOLLOWING TO CHAINS:' ||
                    line.substr( 11, 30 ) === '                   AND CHAINS:'
                ){

                    line.substr( 41, 30 ).split( "," ).forEach( function( v ){

                        currentBiomol.chainList.push( v.trim() )

                    } );

                }

            }else if( recordName === 'HEADER' ){

                id = line.substr( 62, 4 );

            }else if( recordName === 'TITLE ' ){

                title += line.substr( 10, 70 ) + "\n";

            }else if( recordName === 'MODEL ' ){

                if( asTrajectory ){

                    if( doFrames ){
                        currentFrame = new Float32Array( atoms.length * 3 );
                        frames.push( currentFrame );
                    }else{
                        currentFrame = [];
                    }
                    currentCoord = 0;

                }else if( a ){

                    modelIdx += 1;
                    if( !firstModelOnly ) serialDict = {};

                }

            }else if( recordName === 'ENDMDL' ){

                if( asTrajectory && !doFrames ){

                    frames.push( new Float32Array( currentFrame ) );
                    doFrames = true;

                }

            }else if( recordName === 'CRYST1' ){

                // CRYST1   55.989   55.989   55.989  90.00  90.00  90.00 P 1           1
                //  7 - 15       Real(9.3)      a (Angstroms)
                // 16 - 24       Real(9.3)      b (Angstroms)
                // 25 - 33       Real(9.3)      c (Angstroms)

                var box = new Float32Array( 9 );
                box[ 0 ] = parseFloat( line.substr( 6, 9 ) );
                box[ 4 ] = parseFloat( line.substr( 15, 9 ) );
                box[ 8 ] = parseFloat( line.substr( 24, 9 ) );
                boxes.push( box );

            }

        }

    }

    NGL.processArray(

        lines,

        _chunked,

        function(){

            console.timeEnd( __timeName );

            if( asTrajectory ){
                s.frames = frames;
                s.boxes = boxes;
            }

            callback();

        }

    );

};

NGL.PdbParser.prototype._postProcess = function( structure, callback ){

    var s = structure
    var helix = s.helix;
    var sheet = s.sheet;

    // assign secondary structures

    console.time( "NGL.PdbParser parse ss" );

    for( var j = 0; j < sheet.length; j++ ){

        var selection = new NGL.Selection(
            sheet[j][1] + "-" + sheet[j][3] + ":" + sheet[j][0]
        );

        s.eachResidue( function( r ){

            r.ss = "s";

        }, selection );

    }

    for( var j = 0; j < helix.length; j++ ){

        var selection = new NGL.Selection(
            helix[j][1] + "-" + helix[j][3] + ":" + helix[j][0]
        );

        var helixType = helix[j][4];

        s.eachResidue( function( r ){

            r.ss = helixType;

        }, selection );

    }

    console.timeEnd( "NGL.PdbParser parse ss" );

    if( sheet.length === 0 && helix.length === 0 ){

        s._doAutoSS = true;

    }

    // check for chain names

    var _doAutoChainName = true;
    s.eachChain( function( c ){
        if( c.chainname ) _doAutoChainName = false;
    } );
    s._doAutoChainName = _doAutoChainName;

    callback();

};


NGL.GroParser = function( name, path, params ){

    NGL.StructureParser.call( this, name, path, params );

    this.structure._doAutoSS = true;
    this.structure._doAutoChainName = true;

};

NGL.GroParser.prototype = Object.create( NGL.StructureParser.prototype );

NGL.GroParser.prototype._parse = function( str, callback ){

    var __timeName = "NGL.GroParser._parse " + this.name;

    console.time( __timeName );

    var s = this.structure;
    var firstModelOnly = this.firstModelOnly;
    var asTrajectory = this.asTrajectory;
    var cAlphaOnly = this.cAlphaOnly;

    var frames = [];
    var boxes = [];
    var doFrames = false;
    var currentFrame, currentCoord;

    var atoms = s.atoms;

    var lines = str.split( "\n" );

    var guessElem = NGL.guessElement;
    var covRadii = NGL.CovalentRadii;
    var vdwRadii = NGL.VdwRadii;

    s.title = lines[ 0 ].trim();
    s.size = parseInt( lines[ 1 ] );
    var b = lines[ lines.length-1 ].trim().split( /\s+/ );
    s.box = [
        parseFloat( b[0] ) * 10,
        parseFloat( b[1] ) * 10,
        parseFloat( b[2] ) * 10
    ];

    // var xpos = 20;
    // var ypos = 28;
    // var zpos = 36;

    var ndec = lines[ 2 ].length - lines[ 2 ].lastIndexOf(".") - 1;
    var lpos = 5 + ndec;
    var xpos = 20;
    var ypos = 20 + lpos;
    var zpos = 20 + 2 * ( lpos );

    //

    var atomname, resname, element;

    var atomCount = parseInt( lines[ 1 ] );
    var modelLineCount = atomCount + 3;

    var idx = 0;
    var modelIdx = 0;

    function _chunked( _i, _n ){

        for( var i = _i; i < _n; ++i ){

            var line = lines[ i ];

            if( i % modelLineCount === 0 ){

                // console.log( "title", line )

                if( asTrajectory ){

                    currentFrame = new Float32Array( atomCount * 3 );
                    frames.push( currentFrame );
                    currentCoord = 0;

                }

                modelIdx += 1;

            }else if( i % modelLineCount === 1 ){

                // console.log( "atomCount", line )

            }else if( i % modelLineCount === modelLineCount - 1 ){

                var str = line.trim().split( /\s+/ );
                var box = new Float32Array( 9 );
                box[ 0 ] = parseFloat( box[ 0 ] ) * 10;
                box[ 4 ] = parseFloat( box[ 1 ] ) * 10;
                box[ 8 ] = parseFloat( box[ 2 ] ) * 10;
                boxes.push( box );

                if( firstModelOnly ){

                    return true;

                }

            }else{

                atomname = line.substr( 10, 5 ).trim();
                if( cAlphaOnly && atomname !== 'CA' ) continue;

                var x = parseFloat( line.substr( xpos, lpos ) ) * 10;
                var y = parseFloat( line.substr( ypos, lpos ) ) * 10;
                var z = parseFloat( line.substr( zpos, lpos ) ) * 10;

                if( asTrajectory ){

                    var j = currentCoord * 3;

                    currentFrame[ j + 0 ] = x;
                    currentFrame[ j + 1 ] = y;
                    currentFrame[ j + 2 ] = z;

                    currentCoord += 1;

                    if( i > modelLineCount ) continue;

                }

                resname = line.substr( 5, 5 ).trim();

                element = guessElem( atomname );

                var a = new NGL.Atom();
                a.index = idx;
                a.bonds = [];

                a.resname = resname;
                a.x = x;
                a.y = y;
                a.z = z;
                a.element = element;
                a.chainname = '';
                a.resno = parseInt( line.substr( 0, 5 ) );
                a.serial = parseInt( line.substr( 15, 5 ) );
                a.atomname = atomname;
                a.ss = 'c';
                a.altloc = '';
                a.vdw = vdwRadii[ element ];
                a.covalent = covRadii[ element ];
                a.modelindex = modelIdx;

                idx += 1;
                atoms.push( a );

            }

        }

    }

    NGL.processArray(

        lines,

        _chunked,

        function(){

            console.timeEnd( __timeName );

            if( asTrajectory ){
                s.frames = frames;
                s.boxes = boxes;
            }

            callback();

        }

    );

};

NGL.GroParser.prototype._postProcess = function( structure, callback ){

    callback();

};


NGL.CifParser = function( name, path, params ){

    NGL.StructureParser.call( this, name, path, params );

};

NGL.CifParser.prototype = Object.create( NGL.StructureParser.prototype );

NGL.CifParser.prototype._parse = function( str, callback ){

    var __timeName = "NGL.CifParser._parse " + this.name;

    console.time( __timeName );

    var s = this.structure;
    var firstModelOnly = this.firstModelOnly;
    var asTrajectory = this.asTrajectory;
    var cAlphaOnly = this.cAlphaOnly;

    var frames = [];
    var boxes = [];
    var doFrames = false;
    var currentFrame, currentCoord;

    s.title = '';
    s.id = '';
    s.sheet = [];
    s.helix = [];

    s.biomolDict = {};
    var biomolDict = s.biomolDict;

    var atoms = s.atoms;
    var bondSet = s.bondSet;

    var lines = str.split( "\n" );

    var guessElem = NGL.guessElement;
    var covRadii = NGL.CovalentRadii;
    var vdwRadii = NGL.VdwRadii;
    var helixTypes = NGL.HelixTypes;

    var line, recordName;
    var altloc, serial, elem, chainname, resno, resname, atomname, element;

    var serialDict = {};

    var title = s.title;
    var sheet = s.sheet;
    var helix = s.helix;

    s.hasConnect = false;

    var a, currentBiomol;

    //

    var reWhitespace = /\s+/;
    var reQuotedWhitespace = /'(.*?)'|"(.*?)"|(\S+)/g;
    var reDoubleQuote = /"/g;

    var cif = {};
    s.cif = cif;

    var pendingString = false;
    var currentString = null;
    var pendingLoop = false;
    var loopPointers = null;
    var currentLoopIndex = null;
    var currentCategory = null;
    var currentName = null;
    var first = null;
    var indexList = null;
    var pointerNames = null;

    var label_atom_id, label_alt_id, Cartn_x, Cartn_y, Cartn_z, id,
        type_symbol, label_asym_id,
        // label_seq_id,
        label_comp_id,
        group_PDB, B_iso_or_equiv, auth_seq_id, pdbx_PDB_model_num;

    //

    var useArray = lines.length > 300000 ? true : false;

    var idx = 0;
    var modelIdx = 0;
    var modelNum;

    function _chunked( _i, _n ){

        for( var i = _i; i < _n; ++i ){

            line = lines[i].trim();

            if( ( !line && !pendingString ) || line[0]==="#" ){

                // console.log( "NEW BLOCK" );

                pendingString = false;
                pendingLoop = false;
                loopPointers = null;
                currentLoopIndex = null;
                currentCategory = null;
                currentName = null;
                first = null;
                indexList = null;
                pointerNames = null;

            }else if( line.substring( 0, 5 )==="data_" ){

                var data = line.substring( 5 );

                // console.log( "DATA", data );

            }else if( line[0]===";" ){

                if( pendingString ){

                    // console.log( "STRING END", currentString );

                    if( pendingLoop ){
                        loopPointers[ currentLoopIndex ].push( currentString );
                        currentLoopIndex += 1;
                    }else{
                        cif[ currentCategory ][ currentName ] = currentString;
                    }

                    pendingString = false;
                    currentString = null;

                }else{

                    // console.log( "STRING START" );

                    pendingString = true;
                    currentString = line.substring( 1 );

                }

            }else if( line==="loop_" ){

                // console.log( "LOOP START" );

                pendingLoop = true;
                loopPointers = [];
                pointerNames = [];
                currentLoopIndex = 0;

            }else if( line[0]==="_" ){

                if( pendingLoop ){

                    // console.log( "LOOP KEY", line );

                    var ks = line.split(".");
                    var category = ks[ 0 ].substring( 1 );
                    var name = ks[ 1 ];

                    if( !cif[ category ] ) cif[ category ] = {};
                    if( cif[ category ][ name ] ){
                        console.warn( category, name, "already exists" );
                    }else{
                        cif[ category ][ name ] = [];
                        loopPointers.push( cif[ category ][ name ] );
                        pointerNames.push( name );
                    }

                    currentCategory = category;
                    currentName = name;
                    first = true;

                }else{

                    var ls = line.match( reQuotedWhitespace );
                    var key = ls[ 0 ];
                    var value = ls[ 1 ];
                    var ks = key.split(".");
                    var category = ks[ 0 ].substring( 1 );
                    var name = ks[ 1 ];

                    if( !cif[ category ] ) cif[ category ] = {};
                    if( cif[ category ][ name ] ){
                        console.warn( category, name, "already exists" );
                    }else{
                        cif[ category ][ name ] = value;
                    }

                    currentCategory = category;
                    currentName = name;

                }

            }else{

                if( pendingString ){

                    // console.log( "STRING VALUE", line );

                    currentString += " " + line;

                }else if( pendingLoop ){

                    // console.log( "LOOP VALUE", line );

                    if( currentCategory==="atom_site" ){

                        var nn = pointerNames.length;

                        var ls = line.split( reWhitespace );
                        var k;

                        if( first ){

                            var names = [
                                "group_PDB", "id", "label_atom_id",
                                // "label_seq_id",
                                "label_comp_id", "type_symbol", "label_asym_id",
                                "Cartn_x", "Cartn_y", "Cartn_z", "B_iso_or_equiv",
                                "label_alt_id", "auth_seq_id", "pdbx_PDB_model_num"
                            ];

                            indexList = [];

                            for( var j = 0; j < nn; ++j ){

                                if( names.indexOf( pointerNames[ j ] ) !== -1 ){
                                    indexList.push( j );
                                }

                            }

                            label_atom_id = pointerNames.indexOf( "label_atom_id" );
                            label_alt_id = pointerNames.indexOf( "label_alt_id" );
                            Cartn_x = pointerNames.indexOf( "Cartn_x" );
                            Cartn_y = pointerNames.indexOf( "Cartn_y" );
                            Cartn_z = pointerNames.indexOf( "Cartn_z" );
                            id = pointerNames.indexOf( "id" );
                            type_symbol = pointerNames.indexOf( "type_symbol" );
                            label_asym_id = pointerNames.indexOf( "label_asym_id" );
                            // label_seq_id = pointerNames.indexOf( "label_seq_id" );
                            label_comp_id = pointerNames.indexOf( "label_comp_id" );
                            group_PDB = pointerNames.indexOf( "group_PDB" );
                            B_iso_or_equiv = pointerNames.indexOf( "B_iso_or_equiv" );
                            auth_seq_id = pointerNames.indexOf( "auth_seq_id" );
                            pdbx_PDB_model_num = pointerNames.indexOf( "pdbx_PDB_model_num" );

                            first = false;

                            modelNum = parseInt( ls[ pdbx_PDB_model_num ] );
                            currentFrame = [];
                            currentCoord = 0;

                        }

                        //

                        var _modelNum = parseInt( ls[ pdbx_PDB_model_num ] );

                        if( modelNum !== _modelNum ){

                            if( modelIdx === 0 ){
                                frames.push( new Float32Array( currentFrame ) );
                            }

                            currentFrame = new Float32Array( atoms.length * 3 );
                            frames.push( currentFrame );
                            currentCoord = 0;

                            modelIdx += 1;

                        }

                        modelNum = _modelNum;

                        if( firstModelOnly && modelIdx > 0 ) continue;

                        //

                        var atomname = ls[ label_atom_id ].replace( reDoubleQuote, '' );
                        if( cAlphaOnly && atomname !== 'CA' ) continue;

                        var x = parseFloat( ls[ Cartn_x ] );
                        var y = parseFloat( ls[ Cartn_y ] );
                        var z = parseFloat( ls[ Cartn_z ] );

                        if( asTrajectory ){

                            var j = currentCoord * 3;

                            currentFrame[ j + 0 ] = x;
                            currentFrame[ j + 1 ] = y;
                            currentFrame[ j + 2 ] = z;

                            currentCoord += 1;

                            if( modelIdx > 0 ) continue;

                        }

                        //

                        var serial = parseInt( ls[ id ] );
                        var element = ls[ type_symbol ];
                        var chainname = ls[ label_asym_id ];
                        // var resno = parseInt( ls[ label_seq_id ] );
                        var resno = parseInt( ls[ auth_seq_id ] );
                        var resname = ls[ label_comp_id ];
                        var altloc = ls[ label_alt_id ];

                        a = new NGL.Atom();
                        a.index = idx;
                        a.bonds = [];

                        a.resname = resname;
                        a.x = x;
                        a.y = y;
                        a.z = z;
                        a.element = element;
                        a.hetero = ( ls[ group_PDB ][ 0 ] === 'H' ) ? true : false;
                        a.chainname = chainname;
                        a.resno = resno;
                        a.serial = serial;
                        a.atomname = atomname;
                        a.ss = 'c';
                        a.bfactor = parseFloat( ls[ B_iso_or_equiv ] );
                        a.altloc = ( altloc === '.' ) ? '' : altloc;
                        a.vdw = vdwRadii[ element ];
                        a.covalent = covRadii[ element ];
                        a.modelindex = modelIdx;

                        idx += 1;
                        atoms.push( a );

                    }else{

                        var ls = line.match( reQuotedWhitespace );
                        var nn = ls.length;

                        if( currentLoopIndex === loopPointers.length ){
                            currentLoopIndex = 0;
                        }/*else if( currentLoopIndex > loopPointers.length ){
                            console.warn( "cif parsing error, wrong number of loop data entries", nn, loopPointers.length );
                        }*/

                        for( var j = 0; j < nn; ++j ){
                            loopPointers[ currentLoopIndex + j ].push( ls[ j ] );
                        }

                        currentLoopIndex += nn;

                    }

                }else if( line[0]==="'" && line.substring( line.length-1 )==="'" ){

                    // console.log( "NEWLINE STRING", line );

                    cif[ currentCategory ][ currentName ] = line.substring(
                        1, line.length - 2
                    );

                }else{

                    console.log( "???", line );

                }

            }


        }

    }

    NGL.processArray(

        lines,

        _chunked,

        function(){

            console.timeEnd( __timeName );

            if( asTrajectory ){
                s.frames = frames;
                s.boxes = boxes;
            }

            callback();

        }

    );

}

NGL.CifParser.prototype._postProcess = function( structure, callback ){

    console.time( "NGL.CifParser._postProcess" );

    var s = structure;
    var cif = s.cif;

    async.series( [

        // assign helix
        function( wcallback ){

            var helixTypes = NGL.HelixTypes;

            var sc = cif.struct_conf;

            if( !sc ){

                wcallback();
                return;

            }

            NGL.processArray(

                sc.beg_label_seq_id,

                function( _i, _n ){

                    for( var i = _i; i < _n; ++i ){

                        var selection = new NGL.Selection(
                            sc.beg_label_seq_id[ i ] + "-" +
                            sc.end_label_seq_id[ i ] + ":" +
                            sc.beg_label_asym_id[ i ]
                        );

                        var helixType = parseInt( sc.pdbx_PDB_helix_class[ i ] );

                        if( !Number.isNaN( helixType ) ){

                            helixType = helixTypes[ helixType ] || helixTypes[""];

                            s.eachResidue( function( r ){

                                r.ss = helixType;

                            }, selection );

                        }

                    }

                },

                wcallback,

                1000

            );

        },

        // assign strand
        function( wcallback ){

            var ssr = cif.struct_sheet_range;

            if( !ssr ){

                wcallback();
                return;

            }

            NGL.processArray(

                ssr.beg_label_seq_id,

                function( _i, _n ){

                    for( var i = _i; i < _n; ++i ){

                        var selection = new NGL.Selection(
                            ssr.beg_label_seq_id[ i ] + "-" +
                            ssr.end_label_seq_id[ i ] + ":" +
                            ssr.beg_label_asym_id[ i ]
                        );

                        s.eachResidue( function( r ){

                            r.ss = "s";

                        }, selection );

                    }

                },

                wcallback,

                1000

            );

        },

        // add connections
        function( wcallback ){

            var sc = cif.struct_conn;

            if( !sc ){

                wcallback();
                return;

            }

            NGL.processArray(

                sc.id,

                function( _i, _n ){

                    for( var i = _i; i < _n; ++i ){

                        var selection1 = new NGL.Selection(
                            sc.ptnr1_auth_seq_id[ i ] + ":" +
                            sc.ptnr1_label_asym_id[ i ] + "." +
                            sc.ptnr1_label_atom_id[ i ]
                        );
                        var atoms1 = s.getAtoms( selection1 );

                        var selection2 = new NGL.Selection(
                            sc.ptnr2_auth_seq_id[ i ] + ":" +
                            sc.ptnr2_label_asym_id[ i ] + "." +
                            sc.ptnr2_label_atom_id[ i ]
                        );
                        var atoms2 = s.getAtoms( selection2 );

                        var a1, a2;
                        var m = atoms1.length;

                        for( var j = 0; j < m; ++j ){

                            a1 = atoms1[ j ];
                            a2 = atoms2[ j ];

                            if( a1 && a2 ){

                                s.bondSet.addBond( a1, a2 );

                            }else{

                                console.log( "atoms for connection not found" );

                            }

                        }

                    }

                },

                wcallback,

                1000

            );

        }

    ], function(){

        if( !cif.struct_conf && !cif.struct_sheet_range ){

            s._doAutoSS = true;

        }

        // biomol processing

        var operDict = {};

        s.biomolDict = {};
        var biomolDict = s.biomolDict;

        if( cif.pdbx_struct_oper_list ){

            var op = cif.pdbx_struct_oper_list;

            // ensure data is in lists
            if( !Array.isArray( op.id ) ){
                Object.keys( op ).forEach( function( key ){
                    op[ key ] = [ op[ key ] ];
                } );
            }

            op.id.forEach( function( id, i ){

                var m = new THREE.Matrix4();
                var elms = m.elements;

                elms[  0 ] = parseFloat( op[ "matrix[1][1]" ][ i ] );
                elms[  1 ] = parseFloat( op[ "matrix[1][2]" ][ i ] );
                elms[  2 ] = parseFloat( op[ "matrix[1][3]" ][ i ] );

                elms[  4 ] = parseFloat( op[ "matrix[2][1]" ][ i ] );
                elms[  5 ] = parseFloat( op[ "matrix[2][2]" ][ i ] );
                elms[  6 ] = parseFloat( op[ "matrix[2][3]" ][ i ] );

                elms[  8 ] = parseFloat( op[ "matrix[3][1]" ][ i ] );
                elms[  9 ] = parseFloat( op[ "matrix[3][2]" ][ i ] );
                elms[ 10 ] = parseFloat( op[ "matrix[3][3]" ][ i ] );

                elms[ 12 ] = parseFloat( op[ "vector[1]" ][ i ] );
                elms[ 13 ] = parseFloat( op[ "vector[2]" ][ i ] );
                elms[ 14 ] = parseFloat( op[ "vector[3]" ][ i ] );

                operDict[ id ] = m;

            } );

        }

        if( cif.pdbx_struct_assembly_gen ){

            var gen = cif.pdbx_struct_assembly_gen;

            // ensure data is in lists
            if( !Array.isArray( gen.assembly_id ) ){
                Object.keys( gen ).forEach( function( key ){
                    gen[ key ] = [ gen[ key ] ];
                } );
            }

            gen.assembly_id.forEach( function( id, i ){

                var md = {};
                var oe = gen.oper_expression[ i ];

                if( oe.indexOf( ")(" ) !== -1 ){

                    console.warn( "parsing of this oper_expression not implemented:", oe );
                    return;

                }else{

                    var l = oe.replace( /[\(\)']/g, "" ).split( "," );

                    l.forEach( function( e ){

                        if( e.indexOf( "-" ) !== -1 ){

                            var es = e.split( "-" );

                            var j = parseInt( es[ 0 ] );
                            var m = parseInt( es[ 1 ] );

                            for( ; j <= m; ++j ){

                                md[ j ] = operDict[ j ];

                            }

                        }else{

                            md[ e ] = operDict[ e ];

                        }

                    } );

                }

                biomolDict[ id ] = {
                    matrixDict: md,
                    chainList: gen.asym_id_list[ i ].split( "," )
                };

            } );

        }

        // check for chain names

        var _doAutoChainName = true;
        s.eachChain( function( c ){
            if( c.chainname ) _doAutoChainName = false;
        } );
        s._doAutoChainName = _doAutoChainName;

        console.timeEnd( "NGL.CifParser._postProcess" );

        callback();

    } );

};

