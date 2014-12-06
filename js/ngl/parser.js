/**
 * @file Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


if( typeof importScripts === 'function' ){

    var NGL = {};

    importScripts(
        '../three/three.js',
        '../lib/ui/signals.min.js',
        'core.js',
        'structure.js'
    );

    onmessage = function( event ){

        // TODO dispatch to function

        NGL.GroParser.parseAtoms( event.data, function( atomArray ){

            var aa = atomArray.toObject();
            aa.bonds = null;
            aa.residue = null;

            postMessage( aa, atomArray.getBufferList() );

        } );

    };

}


NGL.StructureParser = function( name, path, params ){

    params = params || {};

    this.name = name;
    this.path = path;

    this.firstModelOnly = params.firstModelOnly || false;
    this.asTrajectory = params.asTrajectory || false;

    this.structure = new NGL.Structure( this.name, this.path );

};

NGL.StructureParser.prototype = {

    parse: function( str, callback ){

        this._parse( str, function( structure ){

            structure.postProcess();

            if( typeof callback === "function" ) callback( structure );

        } );

        return this.structure;

    },

    _parse: function( str, callback ){

        console.warn( "NGL.StructureParser._parse not implemented" );

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

    var i, j;
    var line, recordName;
    var altloc, serial, elem, chainname, resno, resname, atomname, element;

    var m = s.addModel();
    var c = m.addChain();
    var r = c.addResidue();

    var chainDict = {};
    var serialDict = {};

    var id = s.id;
    var title = s.title;
    var sheet = s.sheet;
    var helix = s.helix;

    s.hasConnect = false;

    var a, currentChainname, currentResno, currentBiomol;

    var n = lines.length;

    var useArray = false;

    if( useArray ){

        var atomCount = 0;
        for( i = 0; i < n; ++i ){
            recordName = lines[ i ].substr( 0, 6 )
            if( recordName === 'ATOM  ' || recordName === 'HETATM' ) ++atomCount;
        }

        this.atomArray = new NGL.AtomArray( atomCount );
        var atomArray = this.atomArray;

    }

    var _i = 0;
    var _step = 10000;
    var _n = Math.min( _step, n );

    function _chunked(){

        for( i = _i; i < _n; i++ ){

            line = lines[i];
            recordName = line.substr( 0, 6 );

            if( recordName === 'ATOM  ' || recordName === 'HETATM' ){

                // http://www.wwpdb.org/documentation/format33/sect9.html#ATOM

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

                altloc = line[ 16 ];
                if( altloc !== ' ' && altloc !== 'A' ) continue; // FIXME: ad hoc

                serial = parseInt( line.substr( 6, 5 ) );
                atomname = line.substr( 12, 4 ).trim();
                element = line.substr( 76, 2 ).trim();
                chainname = line[ 21 ];
                resno = parseInt( line.substr( 22, 5 ) );
                resname = line.substr( 17, 4 ).trim();

                if( !a ){

                    c.chainname = chainname;
                    chainDict[ chainname ] = c;

                    r.resno = resno;
                    r.resname = resname;

                    currentChainname = chainname;
                    currentResno = resno;

                }

                if( currentChainname!==chainname ){

                    if( !chainDict[ chainname ] ){

                        c = m.addChain();
                        c.chainname = chainname;

                        chainDict[ chainname ] = c;

                    }else{

                        c = chainDict[ chainname ];

                    }

                }

                if( currentResno!==resno ){

                    r = c.addResidue();
                    r.resno = resno;
                    r.resname = resname;

                }

                if( !element ) element = guessElem( atomname );

                if( useArray ){

                    a = r.addProxyAtom( atomArray );
                    var index = a.index;

                    atomArray.setResname( index, resname );
                    atomArray.x[ index ] = parseFloat( line.substr( 30, 8 ) );
                    atomArray.y[ index ] = parseFloat( line.substr( 38, 8 ) );
                    atomArray.z[ index ] = parseFloat( line.substr( 46, 8 ) );
                    atomArray.setElement( index, element );
                    atomArray.hetero[ index ] = ( line[ 0 ] === 'H' ) ? 1 : 0;
                    atomArray.chainname[ index ] = chainname.charCodeAt( 0 );
                    atomArray.resno[ index ] = resno;
                    atomArray.serial[ index ] = serial;
                    atomArray.setAtomname( index, atomname );
                    atomArray.ss[ index ] = 'c'.charCodeAt( 0 );
                    atomArray.bfactor[ index ] = parseFloat( line.substr( 60, 8 ) );
                    atomArray.altloc[ index ] = altloc.charCodeAt( 0 );
                    atomArray.vdw[ index ] = vdwRadii[ element ];
                    atomArray.covalent[ index ] = covRadii[ element ];

                }else{

                    a = r.addAtom();
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
                    a.altloc = altloc;
                    a.vdw = vdwRadii[ element ];
                    a.covalent = covRadii[ element ];

                }

                serialDict[ serial ] = a;

                currentChainname = chainname;
                currentResno = resno;

                atoms.push( a );

            }else if( recordName === 'CONECT' ){

                var from = serialDict[ parseInt( line.substr( 6, 5 ) ) ];
                var pos = [ 11, 16, 21, 26 ];

                for (var j = 0; j < 4; j++) {

                    var to = serialDict[ parseInt( line.substr( pos[ j ], 5 ) ) ];
                    if( to === undefined ) continue;

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

                    m = s.addModel();
                    c = m.addChain();
                    r = c.addResidue();
                    a = undefined;

                    chainDict = {};
                    serialDict = {};

                }

            }else if( recordName === 'ENDMDL' ){

                if( firstModelOnly ){

                    _n = n;
                    break;

                }

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

        if( _n === n ){

            console.timeEnd( __timeName );

            if( asTrajectory ){
                s.frames = frames;
                s.boxes = boxes;
            }
            _postProcess();
            callback( s );

            // console.log( biomolDict );
            // console.log( frames );
            // console.log( boxes );


        }else{

            _i += _step;
            _n = Math.min( _n + _step, n );

            setTimeout( _chunked );

        }

    }

    function _postProcess(){

        // assign secondary structures

        console.time( "NGL.PdbParser parse ss" );

        for( j = 0; j < sheet.length; j++ ){

            var selection = new NGL.Selection(
                sheet[j][1] + "-" + sheet[j][3] + ":" + sheet[j][0]
            );

            s.eachResidue( function( r ){

                r.ss = "s";

            }, selection );

        }

        for( j = 0; j < helix.length; j++ ){

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
            if( c.chainname && c.chainname !== " " ) _doAutoChainName = false;
        } );
        s._doAutoChainName = _doAutoChainName;

    }

    setTimeout( _chunked );

};


NGL.GroParser = function( name, path, params ){

    NGL.StructureParser.call( this, name, path, params );

    this.structure._doAutoSS = true;
    this.structure._doAutoChainName = true;

};

NGL.GroParser.prototype = Object.create( NGL.StructureParser.prototype );

NGL.GroParser.prototype._build = function(){

    console.time( "NGL.GroParser._build" );

    var s = this.structure;
    var n = s.atoms.length;

    var i, a;

    var m = s.addModel();
    var c = m.addChain();

    var r = c.addResidue();
    r.resno = s.atoms[ 0 ].resno;
    r.resname = s.atoms[ 0 ].resname;

    var currentResno = s.atoms[ 0 ].resno;

    for( i = 0; i < n; ++i ){

        a = s.atoms[ i ];

        if( currentResno !== a.resno ){

            r = c.addResidue();
            r.resno = a.resno;
            r.resname = a.resname;

        }

        r.addAtom( a );

        currentResno = a.resno;

    }

    console.timeEnd( "NGL.GroParser._build" );

}

NGL.GroParser.prototype._parse = function( str, callback ){

    console.time( "NGL.GroParser._parse" );

    var s = this.structure;
    var firstModelOnly = this.firstModelOnly;
    var asTrajectory = this.asTrajectory;

    var scope = this;

    var lines = str.split( "\n" );

    s.title = lines[ 0 ].trim();
    s.size = parseInt( lines[ 1 ] );
    var b = lines[ lines.length-1 ].trim().split( /\s+/ );
    s.box = [
        parseFloat( b[0] ) * 10,
        parseFloat( b[1] ) * 10,
        parseFloat( b[2] ) * 10
    ];

    // var parser = NGL.GroParser.parseAtoms;
    var parser = NGL.GroParser.parseAtomsChunked;
    // var parser = NGL.GroParser.parseAtomsWorker;

    parser( str, firstModelOnly, asTrajectory, function( atomArray, frames, boxes ){

        s.atomCount = atomArray.length;

        if( asTrajectory ){

            s.frames = frames;
            s.boxes = boxes;

        }

        if( !Array.isArray( atomArray ) ){

            s.atomArray = atomArray;

            var i;
            var n = s.atomCount;

            for( i = 0; i < n; ++i ){

                s.atoms.push( new NGL.ProxyAtom( atomArray, i ) );

            }

        }else{

            s.atoms = atomArray;

        }

        console.timeEnd( "NGL.GroParser._parse" );

        scope._build();

        callback( s );

    } );

};

NGL.GroParser.parseAtoms = function( str, firstModelOnly, asTrajectory, callback ){

    console.time( "NGL.GroParser._parseAtoms" );

    var lines = str.trim().split( "\n" );

    var guessElem = NGL.guessElement;
    var covRadii = NGL.CovalentRadii;
    var vdwRadii = NGL.VdwRadii;

    var i;
    var line, atomname, element, resname;

    var atomArray = new NGL.AtomArray( parseInt( lines[ 1 ] ) );

    var a = new NGL.ProxyAtom( atomArray, 0 );

    var n = lines.length - 1;

    for( i = 2; i < n; ++i ){

        line = lines[i];

        atomname = line.substr( 10, 5 ).trim();
        resname = line.substr( 5, 5 ).trim();

        element = guessElem( atomname );

        a.resname = resname;
        a.x = parseFloat( line.substr( 20, 8 ) ) * 10;
        a.y = parseFloat( line.substr( 28, 8 ) ) * 10;
        a.z = parseFloat( line.substr( 36, 8 ) ) * 10;
        a.element = element;
        a.resno = parseInt( line.substr( 0, 5 ) );
        a.serial = parseInt( line.substr( 15, 5 ) );
        a.atomname = atomname;
        a.ss = 'c';

        a.vdw = vdwRadii[ element ];
        a.covalent = covRadii[ element ];

        a.index += 1;

    }

    console.timeEnd( "NGL.GroParser._parseAtoms" );

    callback( atomArray );

};

NGL.GroParser.parseAtomsChunked = function( str, firstModelOnly, asTrajectory, callback ){

    console.time( "NGL.GroParser._parseAtomsChunked" );

    var lines = str.trim().split( "\n" );

    var frames = [];
    var boxes = [];
    var doFrames = false;
    var currentFrame, currentCoord;

    var guessElem = NGL.guessElement;
    var covRadii = NGL.CovalentRadii;
    var vdwRadii = NGL.VdwRadii;

    var i;
    var line, atomname, element, resname;

    var atomCount = parseInt( lines[ 1 ] );
    var modelLineCount = atomCount + 3;

    var index = 0;
    var useArray = false;

    if( useArray ){

        var atomArray = new NGL.AtomArray( atomCount );
        var a = new NGL.ProxyAtom( atomArray, 0 );

    }else{

        var a;
        var atoms = [];

    }

    var n = lines.length;

    var _i = 0;
    var _step = 10000;
    var _n = Math.min( _step, n );

    function _chunked(){

        for( i = _i; i < _n; ++i ){

            line = lines[ i ];

            if( i % modelLineCount === 0 ){

                // console.log( "title", line )

                if( asTrajectory ){

                    currentFrame = new Float32Array( atomCount * 3 );
                    frames.push( currentFrame );
                    currentCoord = 0;

                }

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

                    _n = n;
                    break;

                }

            }else{

                var x = parseFloat( line.substr( 20, 8 ) ) * 10;
                var y = parseFloat( line.substr( 28, 8 ) ) * 10;
                var z = parseFloat( line.substr( 36, 8 ) ) * 10;

                if( asTrajectory ){

                    var j = currentCoord * 3;

                    currentFrame[ j + 0 ] = x;
                    currentFrame[ j + 1 ] = y;
                    currentFrame[ j + 2 ] = z;

                    currentCoord += 1;

                    if( i > modelLineCount ) continue;

                }

                atomname = line.substr( 10, 5 ).trim();
                resname = line.substr( 5, 5 ).trim();

                element = guessElem( atomname );

                if( useArray ){

                    atomArray.setResname( index, resname );
                    atomArray.x[ index ] = x;
                    atomArray.y[ index ] = y;
                    atomArray.z[ index ] = z;
                    atomArray.setElement( index, element );
                    atomArray.resno[ index ] = parseInt( line.substr( 0, 5 ) );
                    atomArray.serial[ index ] = parseInt( line.substr( 15, 5 ) );
                    atomArray.setAtomname( index, atomname );
                    atomArray.ss[ index ] = 'c'.charCodeAt( 0 );
                    atomArray.vdw[ index ] = vdwRadii[ element ];
                    atomArray.covalent[ index ] = covRadii[ element ];

                }else{

                    a = new NGL.Atom();
                    a.bonds = [];

                    a.resname = resname;
                    a.x = x;
                    a.y = y;
                    a.z = z;
                    a.element = element;
                    a.resno = parseInt( line.substr( 0, 5 ) );
                    a.serial = parseInt( line.substr( 15, 5 ) );
                    a.atomname = atomname;
                    a.ss = 'c';
                    a.vdw = vdwRadii[ element ];
                    a.covalent = covRadii[ element ];

                    atoms.push( a );

                }

                a.index = index;
                index += 1;

            }

        }

        if( _n === n ){

            console.timeEnd( "NGL.GroParser._parseAtomsChunked" );

            // console.log( atoms, frames, boxes );

            if( useArray ){
                callback( atomArray );
            }else{
                callback( atoms, frames, boxes );
            }

        }else{

            _i += _step;
            _n = Math.min( _n + _step, n );

            setTimeout( _chunked );

        }

    }

    setTimeout( _chunked );

};

NGL.GroParser.parseAtomsWorker = function( str, firstModelOnly, asTrajectory, callback ){

    console.time( "NGL.GroParser._parseAtomsWorker" );

    var worker = new Worker( '../js/ngl/parser.js' );

    worker.onmessage = function( event ){

        worker.terminate();

        var atomArray = new NGL.AtomArray( event.data );

        console.timeEnd( "NGL.GroParser._parseAtomsWorker" );

        callback( atomArray );

    };

    worker.onerror = function( event ){

        console.error( event );

    };

    worker.postMessage( str );

}


NGL.CifParser = function( name, path, params ){

    params = params || {};

    this.cAlphaOnly = params.cAlphaOnly || false;

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

    var i, j;
    var line, recordName;
    var altloc, serial, elem, chainname, resno, resname, atomname, element;

    var m = s.addModel();
    var c = m.addChain();
    var r = c.addResidue();

    var chainDict = {};
    var serialDict = {};

    var id = s.id;
    var title = s.title;
    var sheet = s.sheet;
    var helix = s.helix;

    s.hasConnect = false;

    var a, currentChainname, currentResno, currentBiomol;

    //

    var cif = {};

    var pendingString = false;
    var currentString = null;
    var pendingLoop = false;
    var loopPointers = null;
    var currentCategory = null;
    var currentName = null;
    var first = null;
    var indexList = null;
    var pointerNames = null;

    var label_atom_id, label_alt_id, Cartn_x, Cartn_y, Cartn_z, id,
        type_symbol, label_asym_id, label_seq_id, label_comp_id,
        group_PDB, B_iso_or_equiv;

    //

    var n = lines.length;

    var _i = 0;
    var _step = 10000;
    var _n = Math.min( _step, n );

    function _chunked(){

        for( i = _i; i < _n; i++ ){

            line = lines[i].trim();

            if( !line || line[0]==="#" ){

                // console.log( "NEW BLOCK" );

                pendingString = false;
                pendingLoop = false;
                loopPointers = null;
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

                    // console.log( "STRING END" );

                    cif[ currentCategory ][ currentName ] = currentString;

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

                    var ls = line.split(/\s+(?=(?:[^']*'[^']*')*[^']*$)/);
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

                if( pendingLoop ){

                    // console.log( "LOOP VALUE", line );

                    if( currentCategory==="atom_site" ){

                        var nn = pointerNames.length;

                        var ls = line.split(/\s+/);
                        var k;

                        if( first ){

                            var names = [
                                "group_PDB", "id", "label_atom_id", "label_seq_id",
                                "label_comp_id", "type_symbol", "label_asym_id",
                                "Cartn_x", "Cartn_y", "Cartn_z", "B_iso_or_equiv",
                                "label_alt_id"
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
                            label_seq_id = pointerNames.indexOf( "label_seq_id" );
                            label_comp_id = pointerNames.indexOf( "label_comp_id" );
                            group_PDB = pointerNames.indexOf( "group_PDB" );
                            B_iso_or_equiv = pointerNames.indexOf( "B_iso_or_equiv" );

                            first = false;

                            r.resno = ls[ label_seq_id ];
                            r.resname = ls[ label_comp_id ];

                        }

                        //

                        var atomname = ls[ label_atom_id ];
                        if( cAlphaOnly && atomname !== 'CA' ) continue;

                        var altloc = ls[ label_alt_id ];
                        if( altloc !== '.' && altloc !== 'A' ) continue; // FIXME: ad hoc

                        var x = parseFloat( ls[ Cartn_x ] );
                        var y = parseFloat( ls[ Cartn_y ] );
                        var z = parseFloat( ls[ Cartn_z ] );

                        var serial = parseInt( ls[ id ] );
                        var element = ls[ type_symbol ];
                        var chainname = ls[ label_asym_id ];
                        var resno = ls[ label_seq_id ];
                        var resname = ls[ label_comp_id ];

                        if( !a ){

                            c.chainname = chainname;
                            chainDict[ chainname ] = c;

                            r.resno = resno;
                            r.resname = resname;

                            currentChainname = chainname;
                            currentResno = resno;

                        }

                        if( currentChainname!==chainname ){

                            if( !chainDict[ chainname ] ){

                                c = m.addChain();
                                c.chainname = chainname;

                                chainDict[ chainname ] = c;

                            }else{

                                c = chainDict[ chainname ];

                            }

                        }

                        if( currentResno !== resno ){

                            r = c.addResidue();
                            r.resno = resno;
                            r.resname = resname;

                        }

                        a = r.addAtom();
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
                        a.altloc = altloc;
                        a.vdw = vdwRadii[ element ];
                        a.covalent = covRadii[ element ];

                        currentResno = resno;

                        atoms.push( a );

                    }else{

                        var ls = line.split(/\s+(?=(?:[^']*'[^']*')*[^']*$)/);
                        var nn = ls.length;
                        for( var j = 0; j < nn; ++j ){
                            loopPointers[ j ].push( ls[ j ] );
                        }

                    }

                }else if( pendingString ){

                    // console.log( "STRING VALUE", line );

                    currentString += " " + line;

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

        if( _n === n ){

            console.timeEnd( __timeName );

            // console.log( cif );

            if( asTrajectory ){
                s.frames = frames;
                s.boxes = boxes;
            }

            _postProcess();
            callback( s );

        }else{

            console.log( _i, n );

            _i += _step;
            _n = Math.min( _n + _step, n );

            setTimeout( _chunked );

        }

    }

    function _postProcess(){

        console.time( "NGL.CifParser _postProcess" );

        var sc = cif.struct_conf;
        var o = sc.id.length;

        if( sc ){

            for( var j = 0; j < o; ++j ){

                var selection = new NGL.Selection(
                    sc.beg_label_seq_id[ j ] + "-" +
                    sc.end_label_seq_id[ j ] + ":" +
                    sc.beg_label_asym_id[ j ]
                );

                var helixType = parseInt( sc.pdbx_PDB_helix_class[ j ] );
                helixType = helixTypes[ helixType ] || helixTypes[""];

                s.eachResidue( function( r ){

                    r.ss = helixType;

                }, selection );

            }

        }

        //

        var ssr = cif.struct_sheet_range;
        var o = ssr.id.length;

        if( ssr ){

            for( var j = 0; j < o; ++j ){

                var selection = new NGL.Selection(
                    ssr.beg_label_seq_id[ j ] + "-" +
                    ssr.end_label_seq_id[ j ] + ":" +
                    ssr.beg_label_asym_id[ j ]
                );

                s.eachResidue( function( r ){

                    r.ss = "s";

                }, selection );

            }

        }

        //

        if( !sc && !ssr ){

            s._doAutoSS = true;

        }

        // check for chain names

        var _doAutoChainName = true;
        s.eachChain( function( c ){
            if( c.chainname ) _doAutoChainName = false;
        } );
        s._doAutoChainName = _doAutoChainName;

        console.timeEnd( "NGL.CifParser _postProcess" );

        // console.log( s )

    }

    setTimeout( _chunked );

};

