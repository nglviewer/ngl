

var NGL = NGL || {};

if( typeof importScripts === 'function' ){
    importScripts(
        '../../js/three/three.js',
        '../../js/lib/ui/signals.min.js',
        '../../js/ngl.structure.js'
    );
}


NGL.AtomArray = function( size ){

    this.atomno = new Int32Array( size );
    this.resname = new Uint8Array( 5 * size );
    this.x = new Float32Array( size );
    this.y = new Float32Array( size );
    this.z = new Float32Array( size );
    this.element = new Uint8Array( 3 * size );
    this.chainname = new Uint8Array( size );
    this.resno = new Int32Array( size );
    this.serial = new Int32Array( size );
    this.ss = new Uint8Array( size );
    this.vdw = new Float32Array( size );
    this.covalent = new Float32Array( size );
    this.hetero = new Uint8Array( size );
    this.bfactor = new Float32Array( size );
    this.bonds = new Array( size );
    this.altloc = new Uint8Array( size );
    this.atomname = new Uint8Array( 4 * size );

    this.residue = new Array( size );

};

NGL.AtomArray.prototype = {

    setResname: function( i, str ){

        var j = 5 * i;
        this.resname[ j ] = str.charCodeAt( 0 );
        this.resname[ j + 1 ] = str.charCodeAt( 1 );
        this.resname[ j + 2 ] = str.charCodeAt( 2 );
        this.resname[ j + 3 ] = str.charCodeAt( 3 );
        this.resname[ j + 4 ] = str.charCodeAt( 4 );

    },

    getResname: function( i ){

        var code;
        var resname = "";
        var j = 5 * i;
        for( var k = 0; k < 5; ++k ){
            code = this.resname[ j + k ];
            if( code ){
                resname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return resname;

    },

    setElement: function( i, str ){

        var j = 3 * i;
        this.element[ j ] = str.charCodeAt( 0 );
        this.element[ j + 1 ] = str.charCodeAt( 1 );
        this.element[ j + 2 ] = str.charCodeAt( 2 );

    },

    getElement: function( i ){

        var code;
        var element = "";
        var j = 3 * i;
        for( var k = 0; k < 3; ++k ){
            code = this.element[ j + k ];
            if( code ){
                element += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return element;

    },

    setChainname: function( i, str ){

        this.chainname[ i ] = str.charCodeAt( 0 );

    },

    getChainname: function( i ){

        var code = this.chainname[ i ];
        return code ? String.fromCharCode( code ) : "";

    },

    setSS: function( i, str ){

        this.ss[ i ] = str.charCodeAt( 0 );

    },

    getSS: function( i ){

        var code = this.ss[ i ];
        return code ? String.fromCharCode( code ) : "";

    },

    setAltloc: function( i, str ){

        this.altloc[ i ] = str.charCodeAt( 0 );

    },

    getAltloc: function( i ){

        var code = this.altloc[ i ];
        return code ? String.fromCharCode( code ) : "";

    },

    setAtomname: function( i, str ){

        var j = 4 * i;
        this.atomname[ j ] = str.charCodeAt( 0 );
        this.atomname[ j + 1 ] = str.charCodeAt( 1 );
        this.atomname[ j + 2 ] = str.charCodeAt( 2 );
        this.atomname[ j + 3 ] = str.charCodeAt( 3 );

    },

    getAtomname: function( i ){

        var code;
        var atomname = "";
        var j = 4 * i;
        for( var k = 0; k < 4; ++k ){
            code = this.atomname[ j + k ];
            if( code ){
                atomname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return atomname;

    },

    connectedTo: function( i, j ){

        if( this.hetero[ i ] && this.hetero[ j ] ) return false;

        var xij = this.x[ i ] - this.x[ j ];
        var yij = this.y[ i ] - this.y[ j ];
        var zij = this.z[ i ] - this.z[ j ];

        var distSquared = xij * xij + yij * yij + zij * zij;

        // console.log( distSquared );
        if( this.residue.isCg() && distSquared < 28.0 ) return true;

        if( isNaN( distSquared ) ) return false;
        if( distSquared < 0.5 ) return false; // duplicate or altloc

        var d = this.covalent[ i ] + this.covalent[ j ] + 0.3;
        return distSquared < ( d * d );

    },

    qualifiedName: function( i ){

        var name = "";

        var resname = this.getResname( i ).trim();
        var chainname = this.getChainname( i ).trim();
        var atomname = this.getAtomname( i ).trim();

        if( resname ) name += "[" + resname + "]";
        if( this.resno[ i ] ) name += this.resno[ i ];
        if( chainname ) name += ":" + chainname;
        if( atomname ) name += "." + atomname;
        if( this.residue && this.residue.chain &&
                this.residue.chain.model ){
            name += "/" + this.residue.chain.model.index;
        } 

        return name;

    }

};

NGL.ProxyAtom = function( atomArray, index ){

    this.atomArray = atomArray;
    this.index = index;

};

NGL.ProxyAtom.prototype = {

    get atomno () {
        return this.atomArray.atomno[ this.index ];
    },
    set atomno ( value ) {
        this.atomArray.atomno[ this.index ] = value;
    },

    get resname () {
        return this.atomArray.getResname( this.index );
    },
    set resname ( value ) {
        this.atomArray.setResname( this.index, value );
    },

    get x () {
        return this.atomArray.x[ this.index ];
    },
    set x ( value ) {
        this.atomArray.x[ this.index ] = value;
    },

    get y () {
        return this.atomArray.y[ this.index ];
    },
    set y ( value ) {
        this.atomArray.y[ this.index ] = value;
    },

    get z () {
        return this.atomArray.z[ this.index ];
    },
    set z ( value ) {
        this.atomArray.z[ this.index ] = value;
    },

    get element () {
        return this.atomArray.getElement( this.index );
    },
    set element ( value ) {
        this.atomArray.setElement( this.index, value );
    },

    get chainname () {
        return this.atomArray.getChainname( this.index );
    },
    set chainname ( value ) {
        this.atomArray.setChainname( this.index, value );
    },

    get resno () {
        return this.atomArray.resno[ this.index ];
    },
    set resno ( value ) {
        this.atomArray.resno[ this.index ] = value;
    },

    get serial () {
        return this.atomArray.serial[ this.index ];
    },
    set serial ( value ) {
        this.atomArray.serial[ this.index ] = value;
    },

    get ss () {
        return this.atomArray.getSS( this.index );
    },
    set ss ( value ) {
        this.atomArray.setSS( this.index, value );
    },

    get vdw () {
        return this.atomArray.vdw[ this.index ];
    },
    set vdw ( value ) {
        this.atomArray.vdw[ this.index ] = value;
    },

    get covalent () {
        return this.atomArray.covalent[ this.index ];
    },
    set covalent ( value ) {
        this.atomArray.covalent[ this.index ] = value;
    },

    get hetero () {
        return this.atomArray.hetero[ this.index ];
    },
    set hetero ( value ) {
        this.atomArray.hetero[ this.index ] = value;
    },

    get bfactor () {
        return this.atomArray.bfactor[ this.index ];
    },
    set bfactor ( value ) {
        this.atomArray.bfactor[ this.index ] = value;
    },

    get bonds () {
        return this.atomArray.bonds[ this.index ];
    },
    set bonds ( value ) {
        this.atomArray.bonds[ this.index ] = value;
    },

    get altloc () {
        return this.atomArray.getAltloc( this.index );
    },
    set altloc ( value ) {
        this.atomArray.setAltloc( this.index, value );
    },

    get atomname () {
        return this.atomArray.getAtomname( this.index );
    },
    set atomname ( value ) {
        this.atomArray.setAtomname( this.index, value );
    },

    get residue () {
        return this.atomArray.residue[ this.index ];
    },
    set residue ( value ) {
        this.atomArray.residue[ this.index ] = value;
    },

    connectedTo: function( atom ){

        if( this.hetero && atom.hetero ) return false;

        var x = this.x - atom.x;
        var y = this.y - atom.y;
        var z = this.z - atom.z;

        var distSquared = x * x + y * y + z * z;

        // console.log( distSquared );
        if( this.residue.isCg() && distSquared < 28.0 ) return true;

        if( isNaN( distSquared ) ) return false;
        if( distSquared < 0.5 ) return false; // duplicate or altloc

        var d = this.covalent + atom.covalent + 0.3;
        return distSquared < ( d * d );

    },

    qualifiedName: function(){

        var name = "";

        if( this.resname ) name += "[" + this.resname + "]";
        if( this.resno ) name += this.resno;
        if( this.chainname ) name += ":" + this.chainname;
        if( this.atomname ) name += "." + this.atomname;
        if( this.residue && this.residue.chain &&
                this.residue.chain.model ){
            name += "/" + this.residue.chain.model.index;
        } 

        return name;

    }

}


onmessage = function( event ){

    var groStructure = new NGL.GroStructure2();
    
    groStructure.__parse( event.data );

    var aa = groStructure.atomArray;

    // postMessage( aa );

    postMessage( aa, [
        aa.atomno.buffer, aa.resname.buffer, aa.x.buffer, aa.y.buffer,
        aa.z.buffer, aa.element.buffer, aa.chainname.buffer,
        aa.resno.buffer, aa.serial.buffer, aa.ss.buffer, aa.vdw.buffer,
        aa.covalent.buffer, aa.hetero.buffer, aa.bfactor.buffer,
        aa.altloc.buffer, aa.atomname.buffer
    ] );
    
    // postMessage( "moin" );
    
};


NGL.GroStructure2 = function( name, path ){

    this._doAutoSS = true;
    this._doAutoChainName = true;

    NGL.Structure.call( this, name, path );

};

NGL.GroStructure2.prototype = Object.create( NGL.Structure.prototype );

NGL.GroStructure2.prototype._parse = function( str, callback ){

    var scope = this;

    var worker = new Worker( '../exp/atomArray.js' );

    worker.onmessage = function( event ){
        callback( event.data );
        worker.terminate();
    };

    worker.postMessage( str );

},

NGL.GroStructure2.prototype.__parse = function( str, callback ){

    console.time( "NGL.GroStructure2.parse" );

    var atoms = this.atoms;

    var lines = str.trim().split( "\n" );

    var guessElem = NGL.guessElement;
    var covRadii = NGL.CovalentRadii;
    var vdwRadii = NGL.VdwRadii;

    var i, j;
    var line, serial, atomname, element, resno, resname;

    this.title = lines[ 0 ].trim();
    this.size = parseInt( lines[ 1 ] );
    var b = lines[ lines.length-1 ].trim().split( /\s+/ );
    this.box = [
        parseFloat( b[0] ) * 10,
        parseFloat( b[1] ) * 10,
        parseFloat( b[2] ) * 10
    ];

    var atomArray = new NGL.AtomArray( this.size );
    var pa = new NGL.ProxyAtom( atomArray );

    var m = this.addModel();
    var c = m.addChain();
    var r = c.addResidue();

    var a, currentResno;

    var n = lines.length - 1;

    for( i = 2; i < n; i++ ){

        line = lines[i];

        atomname = line.substr( 10, 5 ).trim();
        resno = parseInt( line.substr( 0, 5 ) )
        resname = line.substr( 5, 5 ).trim();

        if( !a ){

            r.resno = resno;
            r.resname = resname;
            currentResno = resno;

        }

        if( currentResno!==resno ){

            r = c.addResidue();
            r.resno = resno;
            r.resname = resname;

        }

        element = guessElem( atomname );

        pa.index = r.addAtom2();

        pa.resname = resname;
        pa.x = parseFloat( line.substr( 20, 8 ) ) * 10;
        pa.y = parseFloat( line.substr( 28, 8 ) ) * 10;
        pa.z = parseFloat( line.substr( 36, 8 ) ) * 10;
        pa.element = element;
        pa.resno = resno;
        pa.serial = parseInt( line.substr( 15, 5 ) );
        pa.atomname = atomname;
        pa.ss = 'c';
        pa.bonds = [];

        pa.vdw = vdwRadii[ element ];
        pa.covalent = covRadii[ element ];

        currentResno = resno;

        // atoms.push( pa.index );

    }

    this.atomArray = atomArray;

    console.timeEnd( "NGL.GroStructure2.parse" );
    // callback( this );

};


NGL.GroStructure3 = function( name, path ){

    this._doAutoSS = true;
    this._doAutoChainName = true;

    NGL.Structure.call( this, name, path );

};

NGL.GroStructure3.prototype = Object.create( NGL.Structure.prototype );

NGL.GroStructure3.prototype._parse = function( str, callback ){

    console.time( "NGL.GroStructure3.parse" );

    var scope = this;

    var atoms = this.atoms;

    var lines = str.trim().split( "\n" );

    var guessElem = NGL.guessElement;
    var covRadii = NGL.CovalentRadii;
    var vdwRadii = NGL.VdwRadii;

    var i, j;
    var line, serial, atomname, element, resno, resname;

    this.title = lines[ 0 ].trim();
    this.size = parseInt( lines[ 1 ] );
    var b = lines[ lines.length-1 ].trim().split( /\s+/ );
    this.box = [
        parseFloat( b[0] ) * 10,
        parseFloat( b[1] ) * 10,
        parseFloat( b[2] ) * 10
    ];

    var atomArray = new NGL.AtomArray( this.size );

    var m = this.addModel();
    var c = m.addChain();
    var r = c.addResidue();

    var a, currentResno;

    var n = lines.length - 1;

    var _i = 2;
    var _step = 10000;
    var _n = Math.min( _step + 2, n );

    function _chunked(){

        for( i = _i; i < _n; i++ ){

            line = lines[i];

            atomname = line.substr( 10, 5 ).trim();
            resno = parseInt( line.substr( 0, 5 ) )
            resname = line.substr( 5, 5 ).trim();

            if( !a ){

                r.resno = resno;
                r.resname = resname;
                currentResno = resno;

            }

            if( currentResno!==resno ){

                r = c.addResidue();
                r.resno = resno;
                r.resname = resname;

            }

            element = guessElem( atomname );

            a = r.addProxyAtom( atomArray );

            a.resname = resname;
            a.x = parseFloat( line.substr( 20, 8 ) ) * 10;
            a.y = parseFloat( line.substr( 28, 8 ) ) * 10;
            a.z = parseFloat( line.substr( 36, 8 ) ) * 10;
            a.element = element;
            a.resno = resno;
            a.serial = parseInt( line.substr( 15, 5 ) );
            a.atomname = atomname;
            a.ss = 'c';
            a.bonds = [];

            a.vdw = vdwRadii[ element ];
            a.covalent = covRadii[ element ];

            currentResno = resno;

            atoms.push( a );

        }

        if( _n === n ){

            console.timeEnd( "NGL.GroStructure3.parse" );
            callback( scope );

        }else{

            _i += _step;
            _n = Math.min( _n + _step, n );

            setTimeout( _chunked );

        }

    }

    this.atomArray = atomArray;

    setTimeout( _chunked );

};