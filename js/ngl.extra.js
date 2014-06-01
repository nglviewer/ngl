/**
 * @file Extra
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


// from Jmol http://jmol.sourceforge.net/jscolors/ (or 0xFFFFFF)
NGL.ElementColors = {
    "H": 0xFFFFFF, "HE": 0xD9FFFF, "LI": 0xCC80FF, "BE": 0xC2FF00, "B": 0xFFB5B5,
    "C": 0x909090, "N": 0x3050F8, "O": 0xFF0D0D, "F": 0x90E050, "NE": 0xB3E3F5, 
    "NA": 0xAB5CF2, "MG": 0x8AFF00, "AL": 0xBFA6A6, "SI": 0xF0C8A0, "P": 0xFF8000, 
    "S": 0xFFFF30, "CL": 0x1FF01F, "AR": 0x80D1E3, "K": 0x8F40D4, "CA": 0x3DFF00, 
    "SC": 0xE6E6E6, "TI": 0xBFC2C7, "V": 0xA6A6AB, "CR": 0x8A99C7, "MN": 0x9C7AC7, 
    "FE": 0xE06633, "CO": 0xF090A0, "NI": 0x50D050, "CU": 0xC88033, "ZN": 0x7D80B0, 
    "GA": 0xC28F8F, "GE": 0x668F8F, "AS": 0xBD80E3, "SE": 0xFFA100, "BR": 0xA62929, 
    "KR": 0x5CB8D1, "RB": 0x702EB0, "SR": 0x00FF00, "Y": 0x94FFFF, "ZR": 0x94E0E0, 
    "NB": 0x73C2C9, "MO": 0x54B5B5, "TC": 0x3B9E9E, "RU": 0x248F8F, "RH": 0x0A7D8C, 
    "PD": 0x006985, "AG": 0xC0C0C0, "CD": 0xFFD98F, "IN": 0xA67573, "SN": 0x668080, 
    "SB": 0x9E63B5, "TE": 0xD47A00, "I": 0x940094, "XE": 0x940094, "CS": 0x57178F, 
    "BA": 0x00C900, "LA": 0x70D4FF, "CE": 0xFFFFC7, "PR": 0xD9FFC7, "ND": 0xC7FFC7,
    "PM": 0xA3FFC7, "SM": 0x8FFFC7, "EU": 0x61FFC7, "GD": 0x45FFC7, "TB": 0x30FFC7, 
    "DY": 0x1FFFC7, "HO": 0x00FF9C, "ER": 0x00E675, "TM": 0x00D452, "YB": 0x00BF38, 
    "LU": 0x00AB24, "HF": 0x4DC2FF, "TA": 0x4DA6FF, "W": 0x2194D6, "RE": 0x267DAB, 
    "OS": 0x266696, "IR": 0x175487, "PT": 0xD0D0E0, "AU": 0xFFD123, "HG": 0xB8B8D0, 
    "TL": 0xA6544D, "PB": 0x575961, "BI": 0x9E4FB5, "PO": 0xAB5C00, "AT": 0x754F45, 
    "RN": 0x428296, "FR": 0x420066, "RA": 0x007D00, "AC": 0x70ABFA, "TH": 0x00BAFF, 
    "PA": 0x00A1FF, "U": 0x008FFF, "NP": 0x0080FF, "PU": 0x006BFF, "AM": 0x545CF2, 
    "CM": 0x785CE3, "BK": 0x8A4FE3, "CF": 0xA136D4, "ES": 0xB31FD4, "FM": 0xB31FBA, 
    "MD": 0xB30DA6, "NO": 0xBD0D87, "LR": 0xC70066, "RF": 0xCC0059, "DB": 0xD1004F, 
    "SG": 0xD90045, "BH": 0xE00038, "HS": 0xE6002E, "MT": 0xEB0026, "DS": 0xFFFFFF, 
    "RG": 0xFFFFFF, "CN": 0xFFFFFF, "UUT": 0xFFFFFF, "FL": 0xFFFFFF, "UUP": 0xFFFFFF, 
    "LV": 0xFFFFFF, "UUH": 0xFFFFFF
};

// http://dx.doi.org/10.1021/jp8111556 (or 2.0)
NGL.VdwRadii = {
    "H": 1.1, "HE": 1.4, "LI": 1.81, "BE": 1.53, "B": 1.92, "C": 1.7, 
    "N": 1.55, "O": 1.52, "F": 1.47, "NE": 1.54, "NA": 2.27, "MG": 1.73, "AL": 1.84, 
    "SI": 2.1, "P": 1.8, "S": 1.8, "CL": 1.75, "AR": 1.88, "K": 2.75, "CA": 2.31, 
    "SC": 2.3, "TI": 2.15, "V": 2.05, "CR": 2.05, "MN": 2.05, "FE": 2.05, "CO": 2.0, 
    "NI": 2.0, "CU": 2.0, "ZN": 2.1, "GA": 1.87, "GE": 2.11, "AS": 1.85, "SE": 1.9, 
    "BR": 1.83, "KR": 2.02, "RB": 3.03, "SR": 2.49, "Y": 2.4, "ZR": 2.3, "NB": 2.15, 
    "MO": 2.1, "TC": 2.05, "RU": 2.05, "RH": 2.0, "PD": 2.05, "AG": 2.1, "CD": 2.2, 
    "IN": 2.2, "SN": 1.93, "SB": 2.17, "TE": 2.06, "I": 1.98, "XE": 2.16, "CS": 3.43, 
    "BA": 2.68, "LA": 2.5, "CE": 2.48, "PR": 2.47, "ND": 2.45, "PM": 2.43, "SM": 2.42, 
    "EU": 2.4, "GD": 2.38, "TB": 2.37, "DY": 2.35, "HO": 2.33, "ER": 2.32, "TM": 2.3, 
    "YB": 2.28, "LU": 2.27, "HF": 2.25, "TA": 2.2, "W": 2.1, "RE": 2.05, "OS": 2.0, 
    "IR": 2.0, "PT": 2.05, "AU": 2.1, "HG": 2.05, "TL": 1.96, "PB": 2.02, "BI": 2.07, 
    "PO": 1.97, "AT": 2.02, "RN": 2.2, "FR": 3.48, "RA": 2.83, "AC": 2.0, "TH": 2.4, 
    "PA": 2.0, "U": 2.3, "NP": 2.0, "PU": 2.0, "AM": 2.0, "CM": 2.0, "BK": 2.0, 
    "CF": 2.0, "ES": 2.0, "FM": 2.0, "MD": 2.0, "NO": 2.0, "LR": 2.0, "RF": 2.0, 
    "DB": 2.0, "SG": 2.0, "BH": 2.0, "HS": 2.0, "MT": 2.0, "DS": 2.0, "RG": 2.0, 
    "CN": 2.0, "UUT": 2.0, "FL": 2.0, "UUP": 2.0, "LV": 2.0, "UUH": 2.0
};

// http://dx.doi.org/10.1039/b801115j (or 1.6)
NGL.CovalentRadii = {
    "H": 0.31, "HE": 0.28, "LI": 1.28, "BE": 0.96, "B": 0.84, "C": 0.76, 
    "N": 0.71, "O": 0.66, "F": 0.57, "NE": 0.58, "NA": 1.66, "MG": 1.41, "AL": 1.21, 
    "SI": 1.11, "P": 1.07, "S": 1.05, "CL": 1.02, "AR": 1.06, "K": 2.03, "CA": 1.76, 
    "SC": 1.7, "TI": 1.6, "V": 1.53, "CR": 1.39, "MN": 1.39, "FE": 1.32, "CO": 1.26, 
    "NI": 1.24, "CU": 1.32, "ZN": 1.22, "GA": 1.22, "GE": 1.2, "AS": 1.19, "SE": 1.2, 
    "BR": 1.2, "KR": 1.16, "RB": 2.2, "SR": 1.95, "Y": 1.9, "ZR": 1.75, "NB": 1.64, 
    "MO": 1.54, "TC": 1.47, "RU": 1.46, "RH": 1.42, "PD": 1.39, "AG": 1.45, "CD": 1.44, 
    "IN": 1.42, "SN": 1.39, "SB": 1.39, "TE": 1.38, "I": 1.39, "XE": 1.4, "CS": 2.44, 
    "BA": 2.15, "LA": 2.07, "CE": 2.04, "PR": 2.03, "ND": 2.01, "PM": 1.99, "SM": 1.98, 
    "EU": 1.98, "GD": 1.96, "TB": 1.94, "DY": 1.92, "HO": 1.92, "ER": 1.89, "TM": 1.9, 
    "YB": 1.87, "LU": 1.87, "HF": 1.75, "TA": 1.7, "W": 1.62, "RE": 1.51, "OS": 1.44, 
    "IR": 1.41, "PT": 1.36, "AU": 1.36, "HG": 1.32, "TL": 1.45, "PB": 1.46, "BI": 1.48, 
    "PO": 1.4, "AT": 1.5, "RN": 1.5, "FR": 2.6, "RA": 2.21, "AC": 2.15, "TH": 2.06, 
    "PA": 2.0, "U": 1.96, "NP": 1.9, "PU": 1.87, "AM": 1.8, "CM": 1.69, "BK": 1.6, 
    "CF": 1.6, "ES": 1.6, "FM": 1.6, "MD": 1.6, "NO": 1.6, "LR": 1.6, "RF": 1.6, 
    "DB": 1.6, "SG": 1.6, "BH": 1.6, "HS": 1.6, "MT": 1.6, "DS": 1.6, "RG": 1.6, 
    "CN": 1.6, "UUT": 1.6, "FL": 1.6, "UUP": 1.6, "LV": 1.6, "UUH": 1.6
};

NGL.guessElement = function(){

    var elm1 = [ "H", "C", "O", "N", "S" ];
    var elm2 = [ "NA", "CL" ];

    return function( atomName ){

        var at = atomName.trim().toUpperCase();
        var n = at.length;

        if( n===0 ) return "";
        
        if( n===1 ) return at;

        if( n===2 ){

            if( elm2.indexOf( at )!==-1 ) return at;

            if( elm1.indexOf( at[0] )!==-1 ) return at[0];

        }

        if( n===3 ){

            if( elm1.indexOf( at[0] )!==-1 ) return at[0];

        }

        if( n===4 ){

            if( at[0]==="H" ) return "H";

        }
        
        return "";

    };

}();

NGL.getNextAvailablePropertyName = function( name, o ){

    var i = 1;
    var baseName = name;

    while( true ){

        if( o.hasOwnProperty( name ) ){

            name = baseName + " (" + (i++) + ")";

        }else{

            return name;

        }

    }

};


//////////////
// Structure

NGL.Structure = function( name, viewer ){

    this.name = name;
    this.viewer = viewer;

    this.reprList = [];

    this.testCounter = 0;

};

NGL.Structure.prototype = {

    constructor: NGL.Structure,

    parse: function( str ){

        // must create:
        //  this.atomSet
        //  this.bondSet

    },

    add: function( type, sele ){

        console.time( "NGL.Structure.add " + type );

        var reprType = NGL.representationTypes[ type ];

        if( !reprType ){

            console.error( "NGL.Structure.add: representation type unknown" );
            return;

        }

        this.reprList.push( new reprType( this, sele ) );

        console.timeEnd( "NGL.Structure.add " + type );

    },

    remove: function( repr ){

        var idx = this.reprList.indexOf( repr );

        if( idx !== -1 ){

            this.reprList.splice( idx, 1 );

        }

    },

    toggle: function(){
        
        this.reprList.forEach( function( repr ){ repr.toggle(); });

    },

    center: function(){

        var t = new THREE.Vector3();

        return function(){
        
            t.copy( this.atomSet.center ).multiplyScalar( -1 );

            this.viewer.rotationGroup.position.copy( t );
            this.viewer.render();

        };

    }(),

    dispose: function(){

        viewer = this.viewer;
        
        // copy via .slice as side effects may change reprList
        this.reprList.slice().forEach( function( repr ){

            repr.dispose();

        });

        this.viewer.gui2.removeFolder( this.__guiName );

    },

    update: function( position ){
    
        this.atomSet.setPosition( position );
        this.bondSet.makeFromTo();

        this.reprList.forEach( function( repr ){
            console.log( repr.name, repr );
            repr.update(); 
        } );

    },

    test: function( i ){

        var scope = this;

        var url = "../xtc/frame/" + i +
            "?path=" + encodeURIComponent( this.xtc );

        if( this.frameCache[ i ] ){

            this.update( this.frameCache[ i ] );

            this.viewer.render();

            return;

        }

        var loader = new THREE.XHRLoader();
        loader.setResponseType( "arraybuffer" );

        loader.load( url, function( arrayBuffer ){

            if( !arrayBuffer ) return;

            scope.frameCache[ i ] = new Float32Array( arrayBuffer );

            scope.update( scope.frameCache[ i ] );

            scope.viewer.render();

        });

    },

    initGui: function(){

        var scope = this;

        this.__guiName = NGL.getNextAvailablePropertyName(
            this.name, this.viewer.gui2.__folders
        );

        this.gui = this.viewer.gui2.addFolder( this.__guiName );

        this.gui.add( this, 'toggle' );
        this.gui.add( this, 'center' );
        this.gui.add( this, 'dispose' );

        this.frameCache = {};
        // this.xtc = "/home/arose/dev/repos/ngl/data/md.xtc";
        this.xtc = "/Users/alexrose/dev/repos/ngl/data/md.xtc";
        // this.xtc = "/media/arose/data3/projects/rho/Gt_I-state/md/analysis/md_mc_fit.xtc";
        var params = {
            "add repr": "",
            "xtc": this.xtc,
            "frame": 0
        };

        var loader = new THREE.XHRLoader();
        var url = "../xtc/numframes?path=" + encodeURIComponent( this.xtc );
        loader.load( url, function( n ){

            n = parseInt( n );
            console.log( "numframes", n );

            scope.gui.add( params, "frame" ).min(0).max(n-1).step(1).onChange(

                function( frame ){ 

                    console.log( frame );
                    scope.test( frame );

                }

            );

        });

        var repr = [ "" ].concat( Object.keys( NGL.representationTypes ) );

        this.gui.add( params, "add repr", repr ).onChange(

            function( value ){ 

                scope.add( value );
                params[ "add repr" ] = "";

            }

        );

        this.gui.add( params, 'xtc' ).listen().onFinishChange( function( xtc ){

            this.xtc = xtc;

        }.bind( this ) );

    },

};



/**
 * An object fro representing a PDB file.
 * @class
 */
NGL.PdbStructure = function( name, viewer ){

    NGL.Structure.call( this, name, viewer );

};

NGL.PdbStructure.prototype = Object.create( NGL.Structure.prototype );

/**
 * Parses a pdb string. Based on GLmol.parsePDB2.
 * @param  {String} str
 */
NGL.PdbStructure.prototype.parse = function( str ){

    console.time( "NGL.PdbStructure.parse" );

    var atoms = [];
    var bonds = [];

    this.title = '';
    this.id = '';
    this.sheet = [];
    this.helix = [];
    
    var idx = 0;
    var lines = str.split("\n");

    var guessElem = NGL.guessElement;
    var covRadii = NGL.CovalentRadii;
    var vdwRadii = NGL.VdwRadii;

    var i, j;
    var line, recordName, altloc, serial, elem;

    for( i = 0; i < lines.length; i++ ){

        line = lines[i];
        recordName = line.substr( 0, 6 );

        if( recordName == 'ATOM  ' || recordName == 'HETATM' ){

            altLoc = line[ 16 ];
            if( altLoc != ' ' && altLoc != 'A' ) continue; // FIXME: ad hoc

            serial = parseInt( line.substr( 6, 5 ) );
            atom = line.substr( 12, 4 ).trim();
            elem = line.substr( 76, 2 ).trim();

            if( !elem ) elem = guessElem( atom );

            atoms.push({
                'resn': line.substr( 17, 3 ).trim(),
                'x': parseFloat( line.substr( 30, 8 ) ),
                'y': parseFloat( line.substr( 38, 8 ) ),
                'z': parseFloat( line.substr( 46, 8 ) ),
                'elem': elem,
                'hetflag': ( line[ 0 ]=='H' ) ? true : false,
                'chain': line[  21 ],
                'resi': parseInt( line.substr( 22, 5 ) ),
                'serial': serial,
                'atom': atom,
                'bonds': [],
                'ss': 'c',
                'b': parseFloat( line.substr( 60, 8 ) ),
                // altLoc': altLoc,

                'color': 0xFFFFFF,
                'vdw': vdwRadii[ elem ],
                'covalent': covRadii[ elem ],
                'index': idx++
            });

        }else if( recordName == 'CONECT' ){

            var from = parseInt( line.substr( 6, 5 ) );
            var pos = [ 11, 16, 21, 26 ];
            var to;

            for (var j = 0; j < 4; j++) {

                var to = parseInt( line.substr( pos[ j ], 5 ) );
                if( isNaN( to ) ) continue;

                // TODO: broken
                //bonds.push([ from-2, to-2 ]);

            }

        }else if( recordName == 'HELIX ' ){

            var startChain = line[ 19 ];
            var startResi = parseInt( line.substr( 21, 4 ) );
            var endChain = line[ 31 ];
            var endResi = parseInt( line.substr( 33, 4 ) );
            this.helix.push([ startChain, startResi, endChain, endResi ]);

        }else if( recordName == 'SHEET ' ){

            var startChain = line[ 21 ];
            var startResi = parseInt( line.substr( 22, 4 ) );
            var endChain = line[ 32 ];
            var endResi = parseInt( line.substr( 33, 4 ) );
            this.sheet.push([ startChain, startResi, endChain, endResi ]);

        }else if( recordName == 'HEADER' ){
        
            this.id = line.substr( 62, 4 );
        
        }else if( recordName == 'TITLE ' ){
        
            this.title += line.substr( 10, 70 ) + "\n"; 
        
        }

    }

    var atom, atom2
    var nAtoms = atoms.length;

    // Assign secondary structures
    for( i = 0; i < nAtoms; i++ ){
        
        atom = atoms[ i ];
        if( atom == undefined ) continue;

        for( j = 0; j < this.sheet.length; j++ ){

            if (atom.chain != this.sheet[j][0]) continue;
            if (atom.resi < this.sheet[j][1]) continue;
            if (atom.resi > this.sheet[j][3]) continue;
            atom.ss = 's';
            if (atom.resi == this.sheet[j][1]) atom.ssbegin = true;
            if (atom.resi == this.sheet[j][3]) atom.ssend = true;

        }

        for( j = 0; j < this.helix.length; j++ ){

            if (atom.chain != this.helix[j][0]) continue;
            if (atom.resi < this.helix[j][1]) continue;
            if (atom.resi > this.helix[j][3]) continue;
            atom.ss = 'h';
            if (atom.resi == this.helix[j][1]) atom.ssbegin = true;
            else if (atom.resi == this.helix[j][3]) atom.ssend = true;

        }

    }

    console.timeEnd( "NGL.PdbStructure.parse" );

    this.atomSet = new NGL.AtomSet( atoms );
    this.bondSet = new NGL.BondSet( this.atomSet, bonds );
    
};



/**
 * An object fro representing a GRO file.
 * @class
 */
NGL.GroStructure = function( name, viewer ){

    NGL.Structure.call( this, name, viewer );

};

NGL.GroStructure.prototype = Object.create( NGL.Structure.prototype );

NGL.GroStructure.prototype.parse = function( str ){

    console.time( "NGL.GroStructure.parse" );

    var atoms = [];

    var idx = 0;
    var lines = str.trim().split("\n");

    var guessElem = NGL.guessElement;
    var covRadii = NGL.CovalentRadii;
    var vdwRadii = NGL.VdwRadii;

    var i, j;
    var line, recordName, altloc, serial, atomName, elem;

    this.title = lines[ 0 ].trim();
    this.size = parseInt( lines[ 1 ] );
    var b = lines[ lines.length-1 ].trim().split(/\s+/);
    this.box = [ 
        parseFloat(b[0]) * 10, 
        parseFloat(b[1]) * 10, 
        parseFloat(b[2]) * 10
    ];

    for( i = 2; i < lines.length-1; i++ ){

        line = lines[i];

        atom = line.substr( 10, 5 ).trim();
        elem = guessElem( atom );

        atoms.push({

            'resn': line.substr( 5, 5 ).trim(),
            'x': parseFloat( line.substr( 20, 8 ) ) * 10,
            'y': parseFloat( line.substr( 28, 8 ) ) * 10,
            'z': parseFloat( line.substr( 36, 8 ) ) * 10,
            'elem': elem,
            'chain': ' ',
            'resi': parseInt( line.substr( 0, 5 ) ),
            'serial': parseInt( line.substr( 15, 5 ) ),
            'atom': atom,
            'ss': 'c',

            'color': 0xFFFFFF,
            'vdw': vdwRadii[ elem ],
            'covalent': covRadii[ elem ],
            'index': idx++

        });

    }

    console.timeEnd( "NGL.GroStructure.parse" );

    this.atomSet = new NGL.AtomSet( atoms );
    this.bondSet = new NGL.BondSet( this.atomSet );

};


////////////
// Surface

NGL.initSurface = function( object, viewer, name ){

    if( object instanceof THREE.Geometry ){

        geo = object;

        // TODO check if needed
        geo.computeFaceNormals( true );
        geo.computeVertexNormals( true );

    }else{

        geo = object.children[0].geometry;

    }
    
    var position = NGL.Utils.positionFromGeometry( geo );
    var color = NGL.Utils.colorFromGeometry( geo );
    var index = NGL.Utils.indexFromGeometry( geo );
    var normal = NGL.Utils.normalFromGeometry( geo );

    surface = new NGL.MeshBuffer( position, color, index, normal );

    viewer.add( surface );
    viewer.render();

    return surface;

}


///////////
// Loader

NGL.FileLoader = function ( manager ) {

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.FileLoader.prototype = {

    constructor: NGL.FileLoader,

    load: function ( file, onLoad ) {

        var scope = this;

        var cached = scope.cache.get( file );

        if ( cached !== undefined ) {

            onLoad( cached );
            return;

        }

        var reader = new FileReader();

        reader.onload = function( event ){

            scope.cache.add( file, this.response );

            onLoad( event.target.result );
            scope.manager.itemEnd( file );

        }

        reader.readAsText( file );

        scope.manager.itemStart( file );

    }

};


NGL.PdbLoader = function ( manager ) {

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.PdbLoader.prototype = Object.create( THREE.XHRLoader.prototype );

NGL.PdbLoader.prototype.init = function( str, viewer, name ){

    var pdb = new NGL.PdbStructure( name, viewer );

    pdb.parse( str );
    pdb.initGui();

    return pdb

};


NGL.GroLoader = function ( manager ) {

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.GroLoader.prototype = Object.create( THREE.XHRLoader.prototype );

NGL.GroLoader.prototype.init = function( str, viewer, name ){

    var gro = new NGL.GroStructure( name, viewer );

    gro.parse( str );
    gro.initGui();

    return gro

};


NGL.ObjLoader = function ( manager ) {

    // this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.ObjLoader.prototype = Object.create( THREE.OBJLoader.prototype );

NGL.ObjLoader.prototype.init = function( data, viewer, name ){

    if( typeof data === "string" ){

        data = this.parse( data );

    }

    return NGL.initSurface( data, viewer, name );

};


NGL.PlyLoader = function ( manager ) {

    // this.cache = new THREE.Cache();
    // this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.PlyLoader.prototype = Object.create( THREE.PLYLoader.prototype );

NGL.PlyLoader.prototype.init = function( data, viewer, name ){

    if( typeof data === "string" ){

        data = this.parse( data );

    }

    return NGL.initSurface( data, viewer, name );

};


NGL.autoLoad = function(){

    var loaders = {

        "gro": NGL.GroLoader,
        "pdb": NGL.PdbLoader,

        "obj": NGL.ObjLoader,
        "ply": NGL.PlyLoader,

    }

    return function( file, viewer, onLoad ){

        var object;

        var path = ( file instanceof File ) ? file.name : file;
        var name = path.replace( /^.*[\\\/]/, '' );
        var ext = path.split('.').pop().toLowerCase();

        if( name.length===4 ){

            ext = "pdb";
            file = "http://www.rcsb.org/pdb/files/" + name + ".pdb";

        }

        var loader = new loaders[ ext ];

        if( !loader ){
        
            console.error( "NGL.autoLoading: ext '" + ext + "' unknown" );
            return null;

        }

        function init( data ){

            object = loader.init( data, viewer, name );

            if( typeof onLoad === "function" ) onLoad( object );

        }

        if( file instanceof File ){

            name = file.name;
            
            var fileLoader = new NGL.FileLoader();            
            fileLoader.load( file, init )

        }else{

            loader.load( file, init );

        }

        return object;

    }

}();


////////
// Set

NGL.AtomSet = function( atoms ){

    this.atoms = atoms;
    this.size = this.atoms.length;

    this.position = new Float32Array( this.size * 3 );
    this.makePosition();

    this.center = new THREE.Vector3();
    this.computeCenter();

};

NGL.AtomSet.prototype = {

    constructor: NGL.AtomSet,

    setPosition: function( position ){

        if( this.position.length!==position.length ){
            console.error( "NGL.AtomSet.setPosition: length differ" );
        }

        this.position = position;

        var na = this.size;
        var atoms = this.atoms;

        var a, j;

        for( var i = 0; i < na; ++i ){

            a = atoms[ i ];

            j = i * 3;

            a.x = position[ j + 0 ];
            a.y = position[ j + 1 ];
            a.z = position[ j + 2 ];

        }

    },

    makePosition: function(){

        var na = this.size;
        var atoms = this.atoms;
        var position = this.position;

        var a, j;

        for( var i = 0; i < na; ++i ){

            a = atoms[ i ];

            j = i * 3;

            position[ j + 0 ] = a.x;
            position[ j + 1 ] = a.y;
            position[ j + 2 ] = a.z;

        }

    },

    /**
     * [computeCenter description]
     * from THREE.BufferGeometry.computeBoundingSphere
     * @return {[type]} [description]
     */
    computeCenter: function(){

        var box = new THREE.Box3();
        var vector = new THREE.Vector3();

        return function(){

            box.makeEmpty();

            var positions = this.position;
            var center = this.center;

            for( var i = 0, n = positions.length; i < n; i += 3 ){

                vector.set( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );
                box.expandByPoint( vector );

            }

            box.center( center );

        };

    }(),

    getColor: function(){

        var na = this.size;
        var atoms = this.atoms;
        var color = new Float32Array( this.size * 3 );

        var a, c, j;
        var elemColors = NGL.ElementColors;

        for( var i = 0; i < na; ++i ){

            a = atoms[ i ];

            j = i * 3;

            c = elemColors[ a.elem ];
            if( !c ) c = 0xCCCCCC;

            color[ j + 0 ] = ( c >> 16 & 255 ) / 255;
            color[ j + 1 ] = ( c >> 8 & 255 ) / 255;
            color[ j + 2 ] = ( c & 255 ) / 255;

        }

        return color;

    },

    getRadius: function( size, scale ){

        if( !size ) size = null;
        if( !scale ) scale = null;

        var na = this.size;
        var atoms = this.atoms;
        var radius = new Float32Array( this.size );

        var a, r, j;
        var vdwRadii = NGL.VdwRadii;

        for( var i = 0; i < na; ++i ){

            a = atoms[ i ];

            j = i * 3;

            if( size ){
                radius[ i ] = size;
            }else{
                r = vdwRadii[ a.elem ];
                radius[ i ] = ( r ? r : 1.5 ) * scale;
            }

        }

        return radius;

    }

};


NGL.BondSet = function( atomSet, extraBonds ){

    this.atomSet = atomSet;

    this.calculateBonds();
    if( extraBonds ) this.bonds = this.bonds.concat( extraBonds );
    this.size = this.bonds.length;

    this.from = new Float32Array( this.size * 3 );
    this.to = new Float32Array( this.size * 3 );
    this.makeFromTo();

};

NGL.BondSet.prototype = {

    constructor: NGL.BondSet,

    isConnected: function( atom1, atom2 ){

        //if( atom1.hetflag && atom2.hetflag ) return 0;

        var distSquared = ( atom1.x - atom2.x ) * ( atom1.x - atom2.x ) + 
                          ( atom1.y - atom2.y ) * ( atom1.y - atom2.y ) + 
                          ( atom1.z - atom2.z ) * ( atom1.z - atom2.z );

        if( isNaN( distSquared ) ) return 0;
        if( distSquared < 0.5 ) return 0; // duplicate or altloc

        var d = atom1.covalent + atom2.covalent + 0.3;
        return distSquared < ( d * d );

    },

    calculateBonds: function(){

        console.time( "NGL.BondSet.calculateBonds" );

        var bonds = [];

        var na = this.atomSet.size;
        var atoms = this.atomSet.atoms;
        var isConnected = this.isConnected;

        var i, j;

        for( i = 0; i < na; i++ ){
            
            atom = atoms[ i ];

            for (j = i + 1; j < i + 30 && j < na; j++ ){

                atom2 = atoms[ j ];
                
                if( isConnected( atom, atom2 ) ){
                    bonds.push([ i, j ]);
                }

            }

        }

        this.bonds = bonds;

        console.timeEnd( "NGL.BondSet.calculateBonds" );

    },

    makeFromTo: function(){

        var atoms = this.atomSet.atoms;
        var position = this.atomSet.position;
        var bonds = this.bonds;
        var nb = this.size;

        var from = this.from;
        var to = this.to;

        var a1, a2, j;

        for( var i = 0; i < nb; ++i ){

            b = bonds[ i ];

            a1 = b[ 0 ] * 3;
            a2 = b[ 1 ] * 3;

            j = i * 3;

            from[ j + 0 ] = position[ a1 + 0 ];
            from[ j + 1 ] = position[ a1 + 1 ];
            from[ j + 2 ] = position[ a1 + 2 ];

            to[ j + 0 ] = position[ a2 + 0 ];
            to[ j + 1 ] = position[ a2 + 1 ];
            to[ j + 2 ] = position[ a2 + 2 ];

        }

    },

    /**
     * [getColor description]
     * @param  {Int} idx 0 for 'from' colors, 1 for 'to' colors
     * @return {Float32Array}     color array
     */
    getColor: function( idx ){

        var atoms = this.atomSet.atoms;
        var bonds = this.bonds;
        var nb = this.size;

        var color = new Float32Array( this.size * 3 );

        var a, c, j;
        var elemColors = NGL.ElementColors;

        for( var i = 0; i < nb; ++i ){
            
            a = atoms[ bonds[ i ][ idx ] ];

            j = i * 3;

            c = elemColors[ a.elem ];
            if( !c ) c = 0xCCCCCC;

            color[ j + 0 ] = ( c >> 16 & 255 ) / 255;
            color[ j + 1 ] = ( c >> 8 & 255 ) / 255;
            color[ j + 2 ] = ( c & 255 ) / 255;

        }

        return color

    },

    getRadius: function( idx, size, scale ){

        if( !size ) size = null;
        if( !scale ) scale = null;

        var atoms = this.atomSet.atoms;
        var bonds = this.bonds;
        var nb = this.size;

        var radius = new Float32Array( this.size );

        var a, r, j;
        var vdwRadii = NGL.VdwRadii;

        for( var i = 0; i < nb; ++i ){

            j = i * 3;

            if( scale ){

                a = atoms[ bonds[ i ][ idx ] ];
                r = vdwRadii[ a.elem ];
                radius[ i ] = ( r ? r : 1.5 ) * scale;

            }else{

                radius[ i ] = size;

            }

        }

        return radius;

    },

};


NGL.makeBackboneSets = function( atomSet ){

    var na = atomSet.size;
    var atoms = atomSet.atoms;

    var backboneAtoms = [];
    var backboneBonds = [];

    var j = 0;
    var a, aPrev, distSquared;

    for( var i = 0; i < na; ++i ){

        a = atoms[ i ];

        if( a.atom==="CA" ){

            backboneAtoms.push( a );

            if( aPrev ){

                distSquared = ( a.x - aPrev.x ) * ( a.x - aPrev.x ) + 
                              ( a.y - aPrev.y ) * ( a.y - aPrev.y ) + 
                              ( a.z - aPrev.z ) * ( a.z - aPrev.z );

                if( distSquared < 18 ){
                    backboneBonds.push([ j, j+1 ]);
                }
                j += 1;

            }
            
            aPrev = a;

        }

    }

    aPrev = undefined;
    if( j!==0 ) j += 1;

    for( var i = 0; i < na; ++i ){

        a = atoms[ i ];

        if( a.atom==="P" && !a.hetflag ){

            backboneAtoms.push( a );

            if( aPrev ){

                distSquared = ( a.x - aPrev.x ) * ( a.x - aPrev.x ) + 
                              ( a.y - aPrev.y ) * ( a.y - aPrev.y ) + 
                              ( a.z - aPrev.z ) * ( a.z - aPrev.z );

                if( distSquared < 60 ){
                    backboneBonds.push([ j, j+1 ]);
                }
                j += 1;

            }
            
            aPrev = a;

        }

    }

    var backboneAtomSet = new NGL.AtomSet( backboneAtoms );
    var backboneBondSet = new NGL.BondSet( backboneAtomSet, backboneBonds );

    return {
        atomSet: backboneAtomSet,
        bondSet: backboneBondSet
    }

}


//////////////
// Selection

NGL.Selection = function( selection ){

    this.selectionStr = "";

    if( Array.isArray( selection ) ){
        
        this.selection = selection;

    }else{

        this.selectionStr = selection;
        this.parse( selection );

    }

    this.size = this.selection.length;

};


NGL.Selection.prototype = {

    constructor: NGL.Selection, 

    parse: function( str ){

        // valid examples
        //     :A
        //     32
        //     :A.CA
        //     32:A.CA
        //     32-40:A - not implemented yet
        //     32.CA
        //     LYS
        //     
        // all case insensitive
        
        var selection = [];
        var chunks = str.trim().split(/\s+/);

        var all = [ "*", "", "ALL" ];

        var c, sele, atomname, chain, resno, resname;

        for( var i = 0; i < chunks.length; i++ ){

            c = chunks[ i ];

            if( i===0 && ( c.toUpperCase()==="NOT" || c==="!" ) ){
                this.negate = true;
                continue;
            }

            sele = {};

            if( c.toUpperCase()==="HETERO" ){
                selection.push( "HETERO" );
                continue;
            }

            if( all.indexOf( c.toUpperCase() )!==-1 ){
                selection.push( "ALL" );
                continue;
            }

            if( ( c.length>=2 || c.length<=4 ) && 
                    c[0]!==":" && c[0]!=="." && 
                    isNaN( parseInt( c ) ) ){

                sele.resn = c.toUpperCase();
                selection.push( sele );
                continue;
            }

            atomname = c.split(".");
            if( atomname.length>1 && atomname[1] ){
                if( atomname[1].length>4 ){
                    console.error( "atomname must be one to four characters" );
                    continue;
                }
                sele.atom = atomname[1].substring( 0, 4 ).toUpperCase();
            }

            chain = atomname[0].split(":");
            if( chain.length>1 && chain[1] ){
                if( chain[1].length>1 ){
                    console.error( "chain identifier must be one character" );
                    continue;
                }
                sele.chain = chain[1][0].toUpperCase();
            }

            if( chain[0] ){
                resi = chain[0].split("-");
                if( resi.length===1 ){
                    sele.resi = parseInt( resi[0] );
                }else if( resi.length===2 ){
                    sele.resi = [ parseInt( resi[0] ), parseInt( resi[1] ) ];
                }else{
                    console.error( "resi range must contain one '-'" );
                    continue;
                }
            }

            selection.push( sele );
            
        }

        console.log( str, selection );

        this.selection = selection;

    },

    makeTest: function(){

        var n = this.size;
        var selection = this.selection;
        var negate = this.negate;

        var t = true;
        var f = false;

        if( negate ){
            t = !t;
            f = !f;
        }

        var i, s;

        return function( a ){



            for( i=0; i<n; ++i ){

                s = selection[ i ];

                if( typeof s === "string" ){

                    if( s==="ALL" ) return t;
                    if( s==="HETERO" && a.hetflag===true ) return t;

                    return f;

                }

                if( s.resn!==undefined && s.resn!==a.resn ) continue;
                if( s.chain!==undefined && s.chain!==a.chain ) continue;
                if( s.atom!==undefined && s.atom!==a.atom ) continue;

                if( s.resi!==undefined ){
                    if( Array.isArray( s.resi ) && s.resi.length===2 ){
                        if( s.resi[0]>a.resi || s.resi[1]<a.resi ) continue;
                    }else{
                        if( s.resi!==a.resi ) continue;
                    }
                }

                return t;

            }

            return f;

        }

    },

};


///////////////////
// Representation

NGL.Representation = function( structure, sele ){

    this.structure = structure;

    this.viewer = structure.viewer;

    this.atomSet = structure.atomSet;
    this.bondSet = structure.bondSet;

    if( sele ){

        this.selection = new NGL.Selection( sele );
        this.applySelection();

    }

    this.create();
    this.finalize();

};

NGL.Representation.prototype = {

    constructor: NGL.Representation,

    name: "",

    applySelection: function(){

        var na = this.structure.atomSet.size;
        var atoms = this.structure.atomSet.atoms;

        var selectionTest = this.selection.makeTest();
        
        var selectionAtoms = [];

        var a;

        for( var i = 0; i < na; ++i ){

            a = atoms[ i ];

            if( selectionTest( a ) ) selectionAtoms.push( a );

        }

        // TODO filter bonds instead of re-calculationg

        this.atomSet = new NGL.AtomSet( selectionAtoms );
        this.bondSet = new NGL.BondSet( this.atomSet );

    },

    finalize: function(){

        this.attach();
        this.initGui();

    },

    create: function(){

        this.bufferList = [];

    },

    update: function(){

        if( this.selection ){

            this.applySelection();

        }

    },

    attach: function(){
        
        var viewer = this.viewer;

        this.bufferList.forEach( function( buffer ){

            viewer.add( buffer );

        });

    },

    toggle: function(){

        this.bufferList.forEach( function( buffer ){

            buffer.mesh.visible = !buffer.mesh.visible;

        });

        this.viewer.render();

    },

    dispose: function(){

        viewer = this.viewer;

        this.bufferList.forEach( function( buffer ){

            buffer.remove();
            viewer.remove( buffer );

        });

        this.structure.remove( this );

        this.structure.gui.removeFolder( this.__guiName );

    },

    initGui: function(){

        this.__guiName = NGL.getNextAvailablePropertyName(
            this.name, this.structure.gui.__folders
        );

        this.gui = this.structure.gui.addFolder( this.__guiName );

        this.gui.add( this, 'toggle' );
        this.gui.add( this, 'dispose' );

        var params = { "sele": "" };

        if( this.selection ) params.sele = this.selection.selectionStr;

        var oldSele = "";

        this.gui.add( params, 'sele' ).listen().onFinishChange( function( sele ){

            if( sele===oldSele ) return;
            oldSele = sele;

            this.selection = new NGL.Selection( sele );
            this.applySelection();

            viewer = this.viewer;

            this.bufferList.forEach( function( buffer ){

                buffer.remove();
                viewer.remove( buffer );

            });

            this.create();
            this.attach();

        }.bind( this ) );

    }

};


NGL.SpacefillRepresentation = function( structure, sele, scale ){

    this.scale = scale || 1.0;

    NGL.Representation.call( this, structure, sele );

};

NGL.SpacefillRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.SpacefillRepresentation.prototype.name = "spacefill";

NGL.SpacefillRepresentation.prototype.create = function(){

    this.sphereBuffer = new NGL.SphereBuffer(
        this.atomSet.position,
        this.atomSet.getColor(),
        this.atomSet.getRadius( null, this.scale )
    );

    this.bufferList = [ this.sphereBuffer ];

};

NGL.SpacefillRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    this.sphereBuffer.setAttributes({ 
        position: this.atomSet.position 
    });

};


NGL.BallAndStickRepresentation = function( structure, sele, sphereScale, cylinderSize ){

    this.sphereScale = sphereScale || 0.2;
    this.cylinderSize = cylinderSize || 0.12;

    NGL.Representation.call( this, structure, sele );

};

NGL.BallAndStickRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.BallAndStickRepresentation.prototype.name = "ball+stick";

NGL.BallAndStickRepresentation.prototype.create = function(){

    this.sphereBuffer = new NGL.SphereBuffer(
        this.atomSet.position,
        this.atomSet.getColor(),
        this.atomSet.getRadius( null, this.sphereScale )
    );

    this.cylinderBuffer = new NGL.CylinderBuffer(
        this.bondSet.from,
        this.bondSet.to,
        this.bondSet.getColor( 0 ),
        this.bondSet.getColor( 1 ),
        this.bondSet.getRadius( null, this.cylinderSize, null )
    );

    this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

};

NGL.BallAndStickRepresentation.prototype.update = function(){
    
    NGL.Representation.prototype.update.call( this );

    if( this.selection ){

        this.applySelection();

    }

    this.sphereBuffer.setAttributes({ 
        position: this.atomSet.position 
    });

    this.cylinderBuffer.setAttributes({ 
        position: NGL.Utils.calculateCenterArray( 
            this.bondSet.from, this.bondSet.to
        ),
        position1: this.bondSet.from,
        position2: this.bondSet.to
    });

};


NGL.LicoriceRepresentation = function( structure, sele, size ){

    this.size = size || 0.15;

    NGL.Representation.call( this, structure, sele );

};

NGL.LicoriceRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.LicoriceRepresentation.prototype.name = "licorice";

NGL.LicoriceRepresentation.prototype.create = function(){

    this.sphereBuffer = new NGL.SphereBuffer(
        this.atomSet.position,
        this.atomSet.getColor(),
        this.atomSet.getRadius( this.size, null )
    );

    this.cylinderBuffer = new NGL.CylinderBuffer(
        this.bondSet.from,
        this.bondSet.to,
        this.bondSet.getColor( 0 ),
        this.bondSet.getColor( 1 ),
        this.bondSet.getRadius( null, this.size, null )
    );

    this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

};

NGL.LicoriceRepresentation.prototype.update = function(){

    NGL.BallAndStickRepresentation.prototype.update.call( this );

};


NGL.LineRepresentation = function( structure, sele ){

    NGL.Representation.call( this, structure, sele );

};

NGL.LineRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.LineRepresentation.prototype.name = "line";

NGL.LineRepresentation.prototype.create = function(){

    this.lineBuffer = new NGL.LineBuffer(
        this.bondSet.from,
        this.bondSet.to,
        this.bondSet.getColor( 0 ),
        this.bondSet.getColor( 1 )
    );

    this.bufferList = [ this.lineBuffer ];

};

NGL.LineRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    this.lineBuffer.setAttributes({
        from: this.bondSet.from,
        to: this.bondSet.to
    });

};


NGL.HyperballRepresentation = function( structure, sele, scale, shrink ){

    this.scale = scale || 0.2;
    this.shrink = shrink || 0.12;

    NGL.Representation.call( this, structure, sele );

};

NGL.HyperballRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.HyperballRepresentation.prototype.name = "hyperball";

NGL.HyperballRepresentation.prototype.create = function(){

    this.sphereBuffer = new NGL.SphereBuffer(
        this.atomSet.position,
        this.atomSet.getColor(),
        this.atomSet.getRadius( null, this.scale )
    );

    this.cylinderBuffer = new NGL.HyperballStickImpostorBuffer(
        this.bondSet.from,
        this.bondSet.to,
        this.bondSet.getColor( 0 ),
        this.bondSet.getColor( 1 ),
        this.bondSet.getRadius( 0, null, this.scale ),
        this.bondSet.getRadius( 1, null, this.scale ),
        this.shrink
    );

    this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

};

NGL.HyperballRepresentation.prototype.update = function(){

    NGL.BallAndStickRepresentation.prototype.update.call( this );

};


NGL.BackboneRepresentation = function( structure, sele, size ){

    this.size = size || 0.25;

    NGL.Representation.call( this, structure, sele );

};

NGL.BackboneRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.BackboneRepresentation.prototype.name = "backbone";

NGL.BackboneRepresentation.prototype.create = function(){

    this.makeBackboneSets();

    this.sphereBuffer = new NGL.SphereBuffer(
        this.backboneAtomSet.position,
        this.backboneAtomSet.getColor(),
        this.backboneAtomSet.getRadius( this.size, null )
    );

    this.cylinderBuffer = new NGL.CylinderBuffer(
        this.backboneBondSet.from,
        this.backboneBondSet.to,
        this.backboneBondSet.getColor( 0 ),
        this.backboneBondSet.getColor( 1 ),
        this.backboneBondSet.getRadius( null, this.size, null )
    );

    this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

};

NGL.BackboneRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    this.makeBackboneSets();

    this.sphereBuffer.setAttributes({ 
        position: this.backboneAtomSet.position 
    });

    this.cylinderBuffer.setAttributes({ 
        position: NGL.Utils.calculateCenterArray( 
            this.backboneBondSet.from, this.backboneBondSet.to
        ),
        position1: this.backboneBondSet.from,
        position2: this.backboneBondSet.to
    });

};

NGL.BackboneRepresentation.prototype.makeBackboneSets = function(){

    var backbone = NGL.makeBackboneSets( this.atomSet );

    this.backboneAtomSet = backbone.atomSet;
    this.backboneBondSet = backbone.bondSet;

};


NGL.TubeRepresentation = function( structure, sele, size ){

    this.size = size || 0.25;

    NGL.Representation.call( this, structure, sele );

};

NGL.TubeRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.TubeRepresentation.prototype.name = "tube";

NGL.TubeRepresentation.prototype.create = function(){

    this.makeBackboneSets();

    var pd = NGL.getPathData(
        this.backboneAtomSet.position,
        this.backboneAtomSet.getColor(),
        this.backboneAtomSet.getRadius( this.size, null ),
        3
    );

    this.tubeBuffer = new NGL.TubeImpostorBuffer(
        pd.position,
        pd.normal,
        pd.dir,
        pd.color,
        pd.size
    );

    // this.bufferList = [ this.tubeBuffer ];

    this.tubebuffer2 = new NGL.TubeGroup(
        this.backboneAtomSet.position,
        this.backboneAtomSet.getColor(),
        this.backboneAtomSet.getRadius( this.size, null ),
        3  
    );

    this.bufferList = [ this.tubebuffer2 ];

};

NGL.TubeRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    // TODO

};

NGL.TubeRepresentation.prototype.makeBackboneSets = function(){

    var backbone = NGL.makeBackboneSets( this.atomSet );

    this.backboneAtomSet = backbone.atomSet;
    this.backboneBondSet = backbone.bondSet;

};


NGL.RibbonRepresentation = function( structure, sele, size ){

    this.size = size || 0.25;

    NGL.Representation.call( this, structure, sele );

};

NGL.RibbonRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.RibbonRepresentation.prototype.name = "ribbon";

NGL.RibbonRepresentation.prototype.create = function(){

    this.makeBackboneSets();

    var pd = NGL.getPathData(
        this.backboneAtomSet.position,
        this.backboneAtomSet.getColor(),
        this.backboneAtomSet.getRadius( this.size, null ),
        3
    );

    this.ribbonBuffer = new NGL.RibbonBuffer(
        pd.position,
        pd.normal,
        pd.dir,
        pd.color,
        pd.size
    );

    this.bufferList = [ this.ribbonBuffer ];

};

NGL.RibbonRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    // TODO

};

NGL.RibbonRepresentation.prototype.makeBackboneSets = function(){

    var backbone = NGL.makeBackboneSets( this.atomSet );

    this.backboneAtomSet = backbone.atomSet;
    this.backboneBondSet = backbone.bondSet;

};


NGL.TraceRepresentation = function( structure, sele ){

    NGL.Representation.call( this, structure, sele );

};

NGL.TraceRepresentation.prototype = Object.create( NGL.Representation.prototype );

NGL.TraceRepresentation.prototype.name = "trace";

NGL.TraceRepresentation.prototype.create = function(){

    this.makeBackboneSets();

    var sub = 10;

    var spline = new NGL.Spline( this.backboneAtomSet.position );
    var subPos = spline.getSubdividedPosition( sub );
    var subCol = NGL.Utils.replicateArry3Entries(
        NGL.Utils.randomColorArray( this.backboneAtomSet.size ), sub
    )

    this.traceBuffer = new NGL.TraceBuffer(
        subPos,
        subCol
    );

    this.bufferList = [ this.traceBuffer ];

};

NGL.TraceRepresentation.prototype.update = function(){

    NGL.Representation.prototype.update.call( this );

    // TODO

};

NGL.TraceRepresentation.prototype.makeBackboneSets = function(){

    var backbone = NGL.makeBackboneSets( this.atomSet );

    this.backboneAtomSet = backbone.atomSet;
    this.backboneBondSet = backbone.bondSet;

};


// Or better name it BioSpline?
NGL.Spline = function( position ){

    this.position = position;
    this.size = position.length / 3;

};

NGL.Spline.prototype = {

    // from THREE.js
    // ASR added tension
    interpolate: function( p0, p1, p2, p3, t ) {

        var tension = 0.9;

        var v0 = ( p2 - p0 ) * tension;
        var v1 = ( p3 - p1 ) * tension;
        var t2 = t * t;
        var t3 = t * t2;
        return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + 
               ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + 
               v0 * t + p1;

    },

    getSubdividedPosition: function( m ){

        var n = this.size;
        var n1 = n - 1;
        var n2 = n - 2;
        var n3 = n - 3;
        var n13 = n1 * 3;
        var n23 = n2 * 3;
        var n33 = n3 * 3;

        var pos = this.position;
        var interpolate = this.interpolate;

        var dt = 1.0 / m;
        var subPos = new Float32Array( n1 * m * 3 + 3 );

        // ghost point for initial position
        var p0x = pos[ 0 + 0 ] + ( pos[ 3 + 0 ] - pos[ 0 + 0 ] );
        var p0y = pos[ 0 + 1 ] + ( pos[ 3 + 1 ] - pos[ 0 + 1 ] );
        var p0z = pos[ 0 + 2 ] + ( pos[ 3 + 2 ] - pos[ 0 + 2 ] );

        var p1x = pos[ 0 + 0 ];
        var p1y = pos[ 0 + 1 ];
        var p1z = pos[ 0 + 2 ];

        var p2x = pos[ 3 + 0 ];
        var p2y = pos[ 3 + 1 ];
        var p2z = pos[ 3 + 2 ];

        var p3x, p3y, p3z;

        var i, j, k, l;

        for( i = 0; i < n1; ++i ){

            k = i * m * 3;
            v = ( i + 2 ) * 3;

            if( i === n2 ){
                // ghost point for last position
                p3x = pos[ n13 + 0 ] + ( pos[ n13 + 0 ] - pos[ n23 + 0 ] );
                p3y = pos[ n13 + 1 ] + ( pos[ n13 + 1 ] - pos[ n23 + 1 ] );
                p3z = pos[ n13 + 2 ] + ( pos[ n13 + 2 ] - pos[ n23 + 2 ] );
            }else{
                p3x = pos[ v + 0 ];
                p3y = pos[ v + 1 ];
                p3z = pos[ v + 2 ];
            }

            for( j = 0; j < m; ++j ){

                l = k + j * 3;

                subPos[ l + 0 ] = interpolate( p0x, p1x, p2x, p3x, dt * j );
                subPos[ l + 1 ] = interpolate( p0y, p1y, p2y, p3y, dt * j );
                subPos[ l + 2 ] = interpolate( p0z, p1z, p2z, p3z, dt * j );

            }

            p0x = p1x; p0y = p1y; p0z = p1z;
            p1x = p2x; p1y = p2y; p1z = p2z;
            p2x = p3x; p2y = p3y; p2z = p3z;

        }

        // add last position to the array of subdivided positions
        subPos[ n1 * m * 3 + 0 ] = pos[ n13 + 0 ];
        subPos[ n1 * m * 3 + 1 ] = pos[ n13 + 1 ];
        subPos[ n1 * m * 3 + 2 ] = pos[ n13 + 2 ];

        return subPos;

    }

};


NGL.representationTypes = {

    "spacefill":    NGL.SpacefillRepresentation,
    "ball+stick":   NGL.BallAndStickRepresentation,
    "licorice":     NGL.LicoriceRepresentation,
    "hyperball":    NGL.HyperballRepresentation,
    "line":         NGL.LineRepresentation,
    "backbone":     NGL.BackboneRepresentation,
    "tube":         NGL.TubeRepresentation,
    "ribbon":       NGL.RibbonRepresentation,
    "trace":        NGL.TraceRepresentation,

};













