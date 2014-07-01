/**
 * @file Structure
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


// rename residue to group?


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


NGL.ProteinType = 0;
NGL.NucleicType = 1;
NGL.UnknownType = 2;


NGL.AA1 = {
    'HIS': 'H',
    'ARG': 'R',
    'LYS': 'K',
    'ILE': 'I',
    'PHE': 'F',
    'LEU': 'L',
    'TRP': 'W',
    'ALA': 'A',
    'MET': 'M',
    'PRO': 'P',
    'CYS': 'C',
    'ASN': 'N',
    'VAL': 'V',
    'GLY': 'G',
    'SER': 'S',
    'GLN': 'Q',
    'TYR': 'Y',
    'ASP': 'D',
    'GLU': 'E',
    'THR': 'T'
};


NGL.nextGlobalAtomindex = 0;


////////
// Set

NGL.AtomSet = function( structure, selection ){

    this.atoms = [];

    this.structure = structure;
    this.selection = selection;

    if( structure ){

        this.fromStructure( structure, selection );

    }

};

NGL.AtomSet.prototype = {

    constructor: NGL.AtomSet,

    apply: function( object ){

        object.atomPosition = NGL.AtomSet.prototype.atomPosition;
        object.atomColor = NGL.AtomSet.prototype.atomColor;
        object.atomRadius = NGL.AtomSet.prototype.atomRadius;
        object.atomCenter = NGL.AtomSet.prototype.atomCenter;

    },

    addAtom: function( atom ){

        this.atoms.push( atom );

        this.atomCount = this.atoms.length;
        // this.center = this.atomCenter();

    },

    fromStructure: function( structure, selection ){

        this.structure = structure;

        this.setSelection( selection );

    },

    setSelection: function( selection ){

        this.atoms = [];

        this.selection = selection;

        var atoms = this.atoms;

        this.structure.eachAtom( function( a ){

            atoms.push( a );

        }, selection );

        this.atomCount = this.atoms.length;
        this.center = this.atomCenter();

    },

    eachAtom: function( callback, selection ){

        if( selection ){

            var test = selection.test;

            this.atoms.forEach( function( a ){

                if( test( a ) ) callback( a );

            } );

        }else{

            this.atoms.forEach( callback );

        }

    },

    atomPosition: function( selection ){

        // TODO cache
        var i, position;

        if( selection ){
            position = [];
        }else{
            position = new Float32Array( this.atomCount * 3 );
        }

        i = 0;

        this.eachAtom( function( a ){

            position[ i + 0 ] = a.x;
            position[ i + 1 ] = a.y;
            position[ i + 2 ] = a.z;

            i += 3;

        }, selection );

        if( selection ) position = new Float32Array( position );

        return position;

    },

    atomColor: function( selection, picking ){

        // TODO cache
        var i, c, color;
        var elemColors = NGL.ElementColors;

        if( selection ){
            color = [];
        }else{
            color = new Float32Array( this.atomCount * 3 );
        }

        i = 0;

        this.eachAtom( function( a ){

            if( picking ){
                
                c = a.globalindex + 1;

            }else{

                c = elemColors[ a.element ];
                if( !c ) c = 0xCCCCCC;

            }

            color[ i + 0 ] = ( c >> 16 & 255 ) / 255;
            color[ i + 1 ] = ( c >> 8 & 255 ) / 255;
            color[ i + 2 ] = ( c & 255 ) / 255;

            i += 3;

        }, selection );

        if( selection ) color = new Float32Array( color );

        return color;

    },

    atomRadius: function( selection, size, scale ){

        // TODO cache
        var i, r, radius;
        var vdwRadii = NGL.VdwRadii;

        if( !size ) size = null;
        if( !scale ) scale = null;

        if( selection ){
            radius = [];
        }else{
            radius = new Float32Array( this.atomCount );
        }

        i = 0;

        this.eachAtom( function( a ){

            if( size ){
                radius[ i ] = size;
            }else{
                r = vdwRadii[ a.element ];
                radius[ i ] = ( r ? r : 1.5 ) * scale;
            }

            i += 1;

        }, selection );

        if( selection ) radius = new Float32Array( radius );

        return radius;

    },

    atomCenter: function(){

        var box = new THREE.Box3();
        var vector = new THREE.Vector3();

        return function(){

            box.makeEmpty();

            this.eachAtom( function( a ){

                vector.set( a.x, a.y, a.z );
                box.expandByPoint( vector );

            } );

            return box.center();

        };

    }(),

    eachBond: function( callback, selection ){

        selection = selection || this.selection;

        if( selection ){

            var test = selection.test;

            this.atoms.forEach( function( a ){

                if( test( a ) ){

                    a.bonds.forEach( function( b ){

                        // if( b.atom1 === a && test( b.atom2 ) ){

                        //     callback( b );

                        // }else if( b.atom2 === a && test( b.atom2 ) ){

                        //     callback( b );

                        // }

                        if( test( b.atom1 ) && test( b.atom2 ) ){

                            callback( b );

                        }

                    } );

                }

            } );

        }else{

            this.atoms.forEach( function( a ){

                a.bonds.forEach( function( b ){

                    callback( b );

                } );

            } );

        }

    },

    bondPosition: function( selection, fromTo ){

        var i = 0;
        var position = [];

        this.eachBond( function( b ){

            if( fromTo ){

                position[ i + 0 ] = b.atom1.x;
                position[ i + 1 ] = b.atom1.y;
                position[ i + 2 ] = b.atom1.z;

            }else{

                position[ i + 0 ] = b.atom2.x;
                position[ i + 1 ] = b.atom2.y;
                position[ i + 2 ] = b.atom2.z;

            }

            i += 3;

        }, selection );

        return new Float32Array( position );

    },

    bondColor: function( selection, fromTo, picking ){

        var i = 0;
        var color = [];

        var c;
        var elemColors = NGL.ElementColors;

        this.eachBond( function( b ){

            if( fromTo ){

                if( picking ){
                
                    c = b.atom1.globalindex + 1;

                }else{

                    c = elemColors[ b.atom1.element ];
                    if( !c ) c = 0xCCCCCC;

                }

            }else{

                if( picking ){
                
                    c = b.atom2.globalindex + 1;

                }else{

                    c = elemColors[ b.atom2.element ];
                    if( !c ) c = 0xCCCCCC;

                }

            }

            color[ i + 0 ] = ( c >> 16 & 255 ) / 255;
            color[ i + 1 ] = ( c >> 8 & 255 ) / 255;
            color[ i + 2 ] = ( c & 255 ) / 255;

            i += 3;

        }, selection );

        return new Float32Array( color );

    },

    bondRadius: function( selection, fromTo, size, scale ){

        var i = 0;
        var radius = [];

        var r;
        var vdwRadii = NGL.VdwRadii;

        this.eachBond( function( b ){

            if( size ){

                radius[ i ] = size;

            }else{

                if( fromTo ){
                    r = vdwRadii[ b.atom1.element ];
                }else{
                    r = vdwRadii[ b.atom2.element ];
                }

                radius[ i ] = ( r ? r : 1.5 ) * scale;

            }

            i += 1;

        }, selection );

        return new Float32Array( radius );

    },

    setPosition: function( position ){

        console.warn( "AtomSet.setPosition - To be removed" );

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

        console.warn( "AtomSet.makePosition - To be removed" );

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

    }

};


NGL.BondSet = function(){

    this.bonds = [];
    this.bondDict = Object.create( null );

};

NGL.BondSet.prototype = {

    constructor: NGL.BondSet,

    addBond: function( atom1, atom2, onlyHere ){

        var bonds = this.bonds;
        var bondDict = this.bondDict;

        var b = new NGL.Bond( atom1, atom2 );
        var qn = b.qualifiedName();

        if( bondDict[ qn ] ){

            console.log( "bond already known" );

        }else{

            if( !onlyHere ){
                atom1.bonds.push( b );
                atom2.bonds.push( b );
            }
            bonds.push( b );
            bondDict[ qn ] = b;

        }

    },

    addBondIfConnected: function( atom1, atom2, onlyHere ){

        if( atom1.connectedTo( atom2 ) ){

            this.addBond( atom1, atom2, onlyHere );

        }

    },

    eachBond: function( callback, selection ){

        if( selection ){

            var test = selection.test;

            this.bonds.forEach( function( b ){

                if( test( b.atom1 ) && test( b.atom2 ) ){

                    callback( b );

                }

            } );

        }else{

            this.bonds.forEach( function( b ){

                callback( b );

            } );

        }

    },

    bondPosition: NGL.AtomSet.prototype.bondPosition,

    bondColor: NGL.AtomSet.prototype.bondColor,

    bondRadius: NGL.AtomSet.prototype.bondRadius,

};


/////////
// Bond

NGL.Bond = function( atomA, atomB, bondOrder ){

    if( atomA.index < atomB.index ){
        this.atom1 = atomA;
        this.atom2 = atomB;
    }else{
        this.atom1 = atomB;
        this.atom2 = atomA;
    }
    
    this.bondOrder = 1;

};

NGL.Bond.prototype = {

    atom1: undefined,
    atom2: undefined,
    bondOrder: undefined,

    qualifiedName: function(){

        return this.atom1.index + "=" + this.atom2.index;

    }

};


///////////////
// Trajectory

NGL.Trajectory = function( xtcPath, structure ){

    var SIGNALS = signals;

    this.signals = {

        gotNumframes: new SIGNALS.Signal(),
        frameChanged: new SIGNALS.Signal(),

    };

    this.xtcPath = xtcPath;
    this.structure = structure;
    this.atomCount = structure.atomCount;

    this.frameCache = [];
    this.frameCacheSize = 0;
    this.currentFrame = -1;

    this.saveInitialStructure();

    this.frameLoader = new THREE.XHRLoader();
    this.frameLoader.setResponseType( "arraybuffer" );

    this.numframes = undefined;

    this.getNumframes();

};

NGL.Trajectory.prototype = {

    constructor: NGL.Trajectory,

    saveInitialStructure: function(){

        var i = 0;
        var initialStructure = new Float32Array( 3 * this.atomCount );
        
        this.structure.eachAtom( function( a ){

            initialStructure[ i + 0 ] = a.x;
            initialStructure[ i + 1 ] = a.y;
            initialStructure[ i + 2 ] = a.z;

            i += 3;

        } );

        this.initialStructure = initialStructure;

    },

    getNumframes: function(){

        var scope = this;

        var loader = new THREE.XHRLoader();
        var url = "../xtc/numframes/" + this.xtcPath;

        loader.load( url, function( n ){

            n = parseInt( n );
            console.log( "numframes", n );

            scope.numframes = n;
            scope.signals.gotNumframes.dispatch( n );

        });

    },

    setFrame: function( i, callback ){

        if( this.frameCache[ i ] ){

            this.updateStructure( i, callback );

        }else{

            this.loadFrame( i, callback );

        }

        this.currentFrame = i;

    },

    loadFrame: function( i, callback ){

        // console.time( "loadFrame" );

        var scope = this;

        var url = "../xtc/frame/" + i + "/" + this.xtcPath +
            "?natoms=" + this.atomCount;

        this.frameLoader.load( url, function( arrayBuffer ){

            // console.timeEnd( "loadFrame" );

            if( !arrayBuffer ){
                console.error( "empty arrayBuffer for '" + url + "'" );
            }

            var box = new Float32Array( arrayBuffer, 0, 9 );
            var coords = new Float32Array( arrayBuffer, 9 * 4 );

            scope.removePbc( coords, box );
            scope.superpose( coords );

            if( !scope.frameCache[ i ] ){
                scope.frameCache[ i ] = coords;
                scope.frameCacheSize += 1;
            }

            scope.updateStructure( i, callback );

        });

    },

    updateStructure: function( i, callback ){

        this.structure.updatePosition( this.frameCache[ i ] );

        if( typeof callback === "function" ){

            callback();

        }

        this.signals.frameChanged.dispatch( i );

    },

    removePbc: function( x, box ){

        // ported from GROMACS src/gmxlib/rmpbc.c:rm_gropbc()
        // in-place

        var i, j, d, dist;
        var n = x.length;

        for( i = 3; i < n; i += 3 ){

            for( j = 0; j < 3; ++j ){

                dist = x[ i + j ] - x[ i - 3 + j ];

                if( Math.abs( dist ) > 0.9 * box[ j * 3 + j ] ){
                
                    if( dist > 0 ){

                        for( d = 0; d < 3; ++d ){
                            x[ i + d ] -= box[ j * 3 + d ];
                        }

                    }else{

                        for( d = 0; d < 3; ++d ){
                            x[ i + d ] += box[ j * 3 + d ];
                        }

                    }
                }

            }

        }

        return x;

    },

    superpose: function( x ){

        var sele = new NGL.Selection( ".CA" );

        var coords1 = [];
        var coords2 = [];

        var i;
        var n = this.atomCount * 3;
        var y = this.initialStructure;

        this.structure.eachAtom( function( a ){

            i = 3 * a.index;

            coords1.push([ x[ i + 0 ], x[ i + 1 ], x[ i + 2 ] ]);
            coords2.push([ y[ i + 0 ], y[ i + 1 ], y[ i + 2 ] ]);

        }, sele );

        var sp = new NGL.Superposition( coords1, coords2 );

        sp.transform( x );

    }

};


//////////////////
// Superposition

NGL.Superposition = function( atoms1, atoms2 ){

    var coords1 = this.prepCoords( atoms1 );
    var coords2 = this.prepCoords( atoms2 );

    this._superpose( coords1, coords2 );

};

NGL.Superposition.prototype = {

    subMean: function( coords, mean ){

        var i, row;
        var cx = mean[ 0 ];
        var cy = mean[ 1 ];
        var cz = mean[ 2 ];
        var n = coords.length;

        for( i = 0; i < n; ++i ){
            row = coords[ i ];
            row[ 0 ] -= cx;
            row[ 1 ] -= cy;
            row[ 2 ] -= cz;
        }

    },

    addMean: function( coords, mean ){

        var i, row;
        var cx = mean[ 0 ];
        var cy = mean[ 1 ];
        var cz = mean[ 2 ];
        var n = coords.length;

        for( i = 0; i < n; ++i ){
            row = coords[ i ];
            row[ 0 ] += cx;
            row[ 1 ] += cy;
            row[ 2 ] += cz;
        }

    },

    _superpose: function( coords1, coords2 ){

        // calc the matrix that moves coords1 onto coords2

        // console.time( "superpose" );

        this.mean1 = numeric.add.apply( null, coords1 );
        numeric.diveq( this.mean1, coords1.length );

        this.mean2 = numeric.add.apply( null, coords2 );
        numeric.diveq( this.mean2, coords2.length );

        this.subMean( coords1, this.mean1 );
        this.subMean( coords2, this.mean2 );

        coords1 = numeric.transpose( coords1 );
        coords2 = numeric.transpose( coords2 );

        // SVD of covar matrix

        svd = numeric.svd( 
            numeric.dot( coords2, numeric.transpose( coords1 ) )
        );

        // rotation matrix from SVD orthonormal bases

        var VH = numeric.inv( svd.V );
        var R = numeric.dot( svd.U, VH );

        function outer( v1, v2 ){

            var n = v1.length;
            var mat = [];

            for( var i = 0; i < n; ++i ){
                mat.push(
                    numeric.mul( v2, v1[ i ] )
                );
            }

            return mat;

        }

        if( numeric.det( R ) < 0.0 ){

            console.log( "R not a right handed system" );
            
            // R -= outer( U[:, 2], VH[2, :] * 2.0 )
            var a = [].concat.apply(
                [], numeric.getBlock( svd.U, [ 0, 2 ], [ 2, 2 ] )
            );
            var b = numeric.mul(
                numeric.getBlock( VH, [ 2, 0 ], [ 2, 2 ] )[0], 2
            );
            var x = outer( a, b );

            numeric.subeq( R, x );
            numeric.muleq( svd.S, -1 );

        }

        // homogeneous transformation matrix

        var M = numeric.identity( 4 );
        numeric.setBlock( M, [ 0, 0 ], [ 2, 2 ], R );

        // translation

        M[ 0 ][ 3 ] = this.mean2[ 0 ];
        M[ 1 ][ 3 ] = this.mean2[ 1 ];
        M[ 2 ][ 3 ] = this.mean2[ 2 ];

        var T = numeric.identity( 4 );
        T[ 0 ][ 3 ] = -this.mean1[ 0 ];
        T[ 1 ][ 3 ] = -this.mean1[ 1 ];
        T[ 2 ][ 3 ] = -this.mean1[ 2 ];

        M = numeric.dot( M, T );

        // rotation matrix

        this.rotMat = numeric.getBlock( M, [ 0, 0 ], [ 2, 2 ] );

        // rmsd
        
        var E0 = numeric.sum( numeric.mul( coords1, coords1 ) ) +
            numeric.sum( numeric.mul( coords2, coords2 ) );
        var msd = ( E0 - 2 * numeric.sum( svd.S ) ) / coords1[0].length;
        this.rmsd = Math.sqrt( Math.max( msd, 0 ) );

        // console.log( "rmsd", this.rmsd );

        // console.timeEnd( "superpose" );

    },

    prepCoords: function( atoms ){

        var coords = [];

        if( typeof atoms.eachAtom === "function" ){

            atoms.eachAtom( function( a ){

                coords.push([ a.x, a.y, a.z ]);

            } );

        }else if( atoms instanceof Float32Array ){

            n = atoms.length;

            for( i = 0; i < n; i += 3 ){

                coords.push([ atoms[ i + 0 ], atoms[ i + 1 ], atoms[ i + 2 ] ]);

            }

        }else{

            coords = numeric.clone( atoms );

        }

        return coords;

    },

    transform: function( atoms ){

        var coords = this.prepCoords( atoms );

        this.subMean( coords, this.mean1 );

        coords = numeric.transpose(
            numeric.dot( this.rotMat, numeric.transpose( coords ) )
        );

        this.addMean( coords, this.mean2 );

        var n, row;
        var i = 0;

        if( typeof atoms.eachAtom === "function" ){
            
            atoms.eachAtom( function( a ){

                row = coords[ i++ ];

                a.x = row[ 0 ];
                a.y = row[ 1 ];
                a.z = row[ 2 ];

            } );

        }else if( atoms instanceof Float32Array ){

            n = atoms.length;

            for( i = 0; i < n; i += 3 ){

                row = coords[ i / 3 ];

                atoms[ i + 0 ] = row[ 0 ];
                atoms[ i + 1 ] = row[ 1 ];
                atoms[ i + 2 ] = row[ 2 ];

            }

        }else{

            atoms = numeric.clone( coords );

        }

        return atoms;

    }

};


//////////////
// Structure

NGL.Structure = function( name ){

    this.name = name;

    this.atomCount = 0;
    this.residueCount = 0;
    this.chainCount = 0;
    this.modelCount = 0;

    this.models = [];

};

NGL.Structure.prototype = {

    constructor: NGL.Structure,

    parse: function( str ){

        this.bondSet = new NGL.BondSet();

        this._parse( str );

        this.autoBond();

        if( this._doAutoSS ){
            this.autoSS();
        }

        this.center = this.atomCenter();

        console.log( "Structure", this );

    },

    nextAtomIndex: function(){

        return this.atomCount++;

    },

    nextResidueIndex: function(){

        return this.residueCount++;

    },

    nextChainIndex: function(){

        return this.chainCount++;

    },

    nextModelIndex: function(){

        return this.modelCount++;

    },

    addModel: function(){

        var m = new NGL.Model( this );
        m.index = this.nextModelIndex();
        this.models.push( m );
        return m;

    },

    eachAtom: function( callback, selection ){

        this.models.forEach( function( m ){
            m.eachAtom( callback, selection );
        } );

    },

    eachResidue: function( callback ){

        this.models.forEach( function( m ){
            m.eachResidue( callback );
        } );

    },

    eachResidueN: function( n, callback ){

        this.models.forEach( function( m ){
            m.eachResidueN( n, callback );
        } );

    },

    eachFiber: function( callback, selection, padded ){

        this.models.forEach( function( m ){
            m.eachFiber( callback, selection, padded );
        } );

    },

    eachChain: function( callback ){

        this.models.forEach( function( m ){
            m.eachChain( callback );
        } );

    },

    eachModel: function( callback ){

        this.models.forEach( callback );

    },

    getSequence: function(){

        var seq = [];

        this.eachResidue( function( r ){

            if( r.getAtomByName( "CA" ) ){
                seq.push( r.getResname1() );
            }

        } );

        return seq;

    },

    autoBond: function(){

        console.time( "NGL.Structure.autoBond" );

        var bondSet = this.bondSet;

        var i, j, n, a1, a2;

        this.eachResidue( function( r ){

            n = r.atomCount - 1;

            for( i = 0; i < n; i++ ){

                a1 = r.atoms[ i ];

                for( j = i + 1; j <= n; j++ ){

                    a2 = r.atoms[ j ];

                    bondSet.addBondIfConnected( a1, a2 );

                }

            }

        } );

        this.eachResidueN( 2, function( r1, r2 ){

            if( r1.isProtein() && r2.isProtein() ){

                bondSet.addBondIfConnected(
                    r1.getAtomByName( "C" ),
                    r2.getAtomByName( "N" )
                );

            }else if( r1.isNucleic() && r2.isNucleic() ){

                bondSet.addBondIfConnected(
                    r1.getAtomByName( "O3'" ),
                    r2.getAtomByName( "P" )
                );

            }

        } );

        console.timeEnd( "NGL.Structure.autoBond" );

    },

    autoSS: function(){

        // Implementation based on "pv"
        //
        // assigns secondary structure information based on a simple and very fast 
        // algorithm published by Zhang and Skolnick in their TM-align paper. 
        // Reference:
        //
        // TM-align: a protein structure alignment algorithm based on the Tm-score 
        // (2005) NAR, 33(7) 2302-2309

        console.time( "NGL.Structure.autoSS" );

        var zhangSkolnickSS = function(){

            var d;
            
            var ca1 = new THREE.Vector3();
            var ca2 = new THREE.Vector3();

            return function( fiber, i, distances, delta ){
                
                for( var j = Math.max( 0, i - 2 ); j <= i; ++j ){

                    for( var k = 2;  k < 5; ++k ){
                    
                        if( j + k >= fiber.residueCount ){
                            continue;
                        }

                        ca1.copy( fiber.residues[ j ].getAtomByName( "CA" ) );
                        ca2.copy( fiber.residues[ j + k ].getAtomByName( "CA" ) );

                        d = ca1.distanceTo( ca2 );
                        // console.log( d )

                        if( Math.abs( d - distances[ k - 2 ] ) > delta ){
                            return false;
                        }

                    }

                }

                return true;

            };

        }();

        var isHelical = function( fiber, i ){

            var helixDistances = [ 5.45, 5.18, 6.37 ];
            var helixDelta = 2.1;

            return zhangSkolnickSS( fiber, i, helixDistances, helixDelta );
            
        };

        var isSheet = function( fiber, i ){

            var sheetDistances = [ 6.1, 10.4, 13.0 ];
            var sheetDelta = 1.42;

            return zhangSkolnickSS( fiber, i, sheetDistances, sheetDelta );

        };

        var i, n;

        this.eachFiber( function( f ){

            if( !f.isProtein() ) return;

            n = f.residueCount;

            for( i = 0; i < n; ++i ){

                if( isHelical( f, i ) ){

                    // console.log( "helix", i, f.residues[ i ] );

                    f.residues[ i ].ss = "h";

                }else if( isSheet( f, i ) ){

                    // console.log( "sheet", i, f.residues[ i ] );

                    f.residues[ i ].ss = "s";

                }else{

                    // console.log( "no helix, no sheet", i );

                }

            }

        } );

        console.timeEnd( "NGL.Structure.autoSS" );

    },

    updatePosition: function( position ){

        var i = 0;

        this.eachAtom( function( a ){

            a.x = position[ i + 0 ];
            a.y = position[ i + 1 ];
            a.z = position[ i + 2 ];

            i += 3;

        } );

    },

    toPdb: function(){

        // http://www.bmsc.washington.edu/CrystaLinks/man/pdb/part_62.html

        // Sample PDB line, the coords X,Y,Z are fields 5,6,7 on each line.
        // ATOM      1  N   ARG     1      29.292  13.212 -12.751  1.00 33.78      1BPT 108

        // use sprintf %8.3f for coords
        // printf PDB2 ("ATOM  %5d %4s %3s A%4d    %8.3f%8.3f%8.3f%6.2f%6.2f      %4s%2s\n", $index,$atname[$i],$resname[$i],$resnum[$i],$x[$i],$y[$i],$z[$i],$occ[$i],$bfac[$i]),$segid[$i],$element[$i];

        function DEF( x, y ){
            return x !== undefined ? x : y;
        }

        var pdbFormatString =
            "ATOM  %5d %4s %3s %1s%4d    %8.3f%8.3f%8.3f%6.2f%6.2f      %4s%2s\n";

        var ia;
        var im = 1;
        var pdbRecords = [];

        // FIXME multiline if title line longer than 80 chars
        pdbRecords.push( sprintf( "TITEL %-74s\n", this.name ) );

        this.eachModel( function( m ){ 

            pdbRecords.push( sprintf( "MODEL %-74d\n", im++ ) );

            m.eachAtom( function( a ){

                // console.log( a );

                pdbRecords.push(
                    sprintf(
                        pdbFormatString,
                        
                        a.serial, a.atomname, a.resname, a.chainname, a.resno,
                        a.x, a.y, a.z,
                        DEF( a.occurence, 1 ),
                        a.bfactor,
                        DEF( a.segid, "" ),
                        DEF( a.element, "" )
                    )
                );

            } );

            pdbRecords.push( sprintf( "%-80s\n", "ENDMDL" ) );

        } );

        pdbRecords.push( sprintf( "%-80s\n", "END" ) );

        return pdbRecords.join( "" );

    }

};

// ATOM      1    N ILE A   1       3.751   6.807  -2.135  1.00  0.00           N
// ATOM      1    N ILE A   1       3.751   6.807-  2.135- 1.00- 0.00      -   -N
// ATOM      1  N   ILE A   1       3.751   6.807  -2.135  1.00  0.00           N  

NGL.AtomSet.prototype.apply( NGL.Structure.prototype );


NGL.Model = function( structure ){

    this.structure = structure;
    this.chains = [];

    this.atomCount = 0;
    this.residueCount = 0;
    this.chainCount = 0;

};

NGL.Model.prototype = {

    modelno: undefined,

    nextAtomIndex: function(){

        this.atomCount += 1;
        return this.structure.nextAtomIndex();

    },

    nextResidueIndex: function(){

        this.residueCount += 1;
        return this.structure.nextResidueIndex();

    },

    nextChainIndex: function(){

        this.chainCount += 1;
        return this.structure.nextChainIndex();

    },

    addChain: function(){

        var c = new NGL.Chain( this );
        c.index = this.nextChainIndex();
        this.chains.push( c );
        return c;

    },

    eachAtom: function( callback, selection ){

        this.chains.forEach( function( c ){
            c.eachAtom( callback, selection );
        } );

    },

    eachResidue: function( callback ){

        this.chains.forEach( function( c ){
            c.eachResidue( callback );
        } );

    },

    eachResidueN: function( n, callback ){

        this.chains.forEach( function( c ){
            c.eachResidueN( n, callback );
        } );

    },

    eachFiber: function( callback, selection, padded ){

        this.chains.forEach( function( c ){
            c.eachFiber( callback, selection, padded );
        } );

    },

    eachChain: function( callback ){

        this.chains.forEach( callback );

    }

};

NGL.AtomSet.prototype.apply( NGL.Model.prototype );


NGL.Chain = function( model ){

    this.model = model;
    this.residues = [];

    this.atomCount = 0;
    this.residueCount = 0;

};

NGL.Chain.prototype = {

    chainname: undefined,

    nextAtomIndex: function(){

        this.atomCount += 1;
        return this.model.nextAtomIndex();

    },

    nextResidueIndex: function(){

        this.residueCount += 1;
        return this.model.nextResidueIndex();

    },

    addResidue: function(){

        var r = new NGL.Residue( this );
        r.index = this.nextResidueIndex();
        this.residues.push( r );
        return r;

    },

    eachAtom: function( callback, selection ){

        this.residues.forEach( function( r ){
            r.eachAtom( callback, selection );
        } );

    },

    eachResidue: function( callback ){

        this.residues.forEach( callback );

    },

    eachResidueN: function( n, callback ){

        var residues = this.residues;
        var array = new Array( n );
        var len = residues.length;
        var i;

        for( i = 0; i < n; i++ ){

            array[ i ] = residues[ i ];

        }

        callback.apply( this, array );

        for( i = n; i < len; i++ ){

            array.shift();
            array.push( residues[ i ] );

            callback.apply( this, array );

        }

    },

    getFiber: function( i, j, padded ){

        // console.log( i, j, this.residueCount );

        var n = this.residueCount;
        var n1 = n - 1;
        var residues = this.residues.slice( i, j );

        if( padded ){

            var r = this.residues[ i ];
            var rPrev = this.residues[ i - 1 ];
            var rNext = this.residues[ j ];

            if( i === 0 || rPrev.getType() !== r.getType() ){
                
                residues.unshift( this.residues[ i ] );

            }else{

                residues.unshift( rPrev );

            }

            if( j === n || rNext.getType() !== r.getType() ){
                
                residues.push( this.residues[ j - 1 ] );

            }else{

                residues.push( rNext );

            }

        }

        // console.log( residues );

        return new NGL.Fiber( residues );

    },

    eachFiber: function( callback, selection, padded ){

        var scope = this;

        var i = 0;
        var j = 1;
        var residues = this.residues;
        var test = selection ? selection.test : undefined;

        var a1, a2;

        this.eachResidueN( 2, function( r1, r2 ){

            // console.log( r1.resno, r2.resno, r1.isProtein() );

            if( r1.isProtein() && r2.isProtein() ){

                a1 = r1.getAtomByName( 'C' );
                a2 = r2.getAtomByName( 'N' );

            }else if( r1.isNucleic() && r2.isNucleic() ){

                a1 = r1.getAtomByName( "O3'" );
                a2 = r2.getAtomByName( 'P' );

            }else{

                if( ( r1.isProtein() && !r2.isProtein() ) ||
                    ( r1.isNucleic() && !r2.isNucleic() ) ){

                    callback( scope.getFiber( i, j, padded ) );

                }

                i = j;
                ++j;

                return;

            }

            if( !a1 || !a2 || !a1.connectedTo( a2 ) ||
                ( test && ( !test( a1 ) || !test( a2 ) ) ) ){
                
                callback( scope.getFiber( i, j, padded ) );
                i = j;
                
            }

            ++j;

        } );

        if( residues[ i ].isProtein() || residues[ i ].isNucleic() ){
            
            callback( scope.getFiber( i, j, padded ) );

        }

    }

};

NGL.AtomSet.prototype.apply( NGL.Chain.prototype );


NGL.Fiber = function( residues ){

    this.residues = residues;
    this.residueCount = residues.length;

    if( this.isProtein() ){

        this.trace_atomname = "CA";
        this.direction_atomname1 = "C";
        this.direction_atomname2 = "O";

    }else if( this.isNucleic() ){

        this.trace_atomname = "P";
        this.direction_atomname1 = "OP1";
        this.direction_atomname2 = "OP2";

    }

};

NGL.Fiber.prototype = {

    eachAtom: NGL.Chain.prototype.eachAtom,

    eachResidue: NGL.Chain.prototype.eachResidue,

    eachResidueN: NGL.Chain.prototype.eachResidueN,

    isProtein: function(){

        if( this._protein === undefined ){

            this._protein = this.residues[ 0 ].isProtein();

        }

        return this._protein;

    },

    isNucleic: function(){

        if( this._nucleic === undefined ){

            this._nucleic = this.residues[ 0 ].isNucleic();

        }

        return this._nucleic;

    },

    getType: function(){

        if( this._type === undefined ){

            if( this.isProtein() ){
                this._type = NGL.ProteinType;
            }else if( this.isNucleic() ){
                this._type = NGL.NucleicType;
            }else{
                this._type = NGL.UnknownType;
            }

        }

        return this._type;

    }

};


NGL.Residue = function( chain ){

    this.chain = chain;
    this.atoms = [];

    this.atomCount = 0;

};

NGL.Residue.prototype = {

    index: undefined,
    resno: undefined,
    resname: undefined,

    _ss: undefined,
    get ss () {
        return this._ss;
    },
    set ss ( value ) {
        this._ss = value;
        this.atoms.forEach( function( a ){
            a.ss = value;
        } );
    },

    isProtein: function(){

        if( this._protein === undefined ){

            this._protein = this.getAtomByName( "CA" ) !== undefined &&
                this.getAtomByName( "C" ) !== undefined &&
                this.getAtomByName( "N" ) !== undefined &&
                this.getAtomByName( "O" ) !== undefined;

        }

        return this._protein;

    },

    isNucleic: function(){

        if( this._nucleic === undefined ){

            this._nucleic = this.getAtomByName( "P" ) !== undefined &&
                this.getAtomByName( "O3'" ) !== undefined;

        }

        return this._nucleic;

    },

    getResname1: function(){

        return NGL.AA1[ this.resname.toUpperCase() ] || '';

    },

    getType: function(){

        if( this._type === undefined ){

            if( this.isProtein() ){
                this._type = NGL.ProteinType;
            }else if( this.isNucleic() ){
                this._type = NGL.NucleicType;
            }else{
                this._type = NGL.UnknownType;
            }

        }

        return this._type;

    },

    nextAtomIndex: function(){

        this.atomCount += 1;
        return this.chain.nextAtomIndex();

    },

    addAtom: function(){

        var a = new NGL.Atom( this );
        a.index = this.nextAtomIndex();
        this.atoms.push( a );
        return a;

    },

    eachAtom: function( callback, selection ){

        if( selection ){

            var test = selection.test;

            this.atoms.forEach( function( a ){

                if( test( a ) ) callback( a );

            } );

        }else{

            this.atoms.forEach( callback );

        }

    },

    getAtomByName: function( atomname ){

        var atom = undefined;

        this.atoms.some( function( a ){

            if( atomname === a.atomname ){

                atom = a;
                return true;

            }

        } );

        return atom;

    }

    /*everyAtom: function( callback ){

        this.atoms.every( callback );

    },

    someAtom: function( callback ){

        this.atoms.some( callback );

    },*/

};

NGL.AtomSet.prototype.apply( NGL.Residue.prototype );


NGL.Atom = function( residue ){

    this.residue = residue;

    this.globalindex = NGL.nextGlobalAtomindex++;

}

NGL.Atom.prototype = {

    index: undefined,
    atomno: undefined,
    resname: undefined,
    x: undefined,
    y: undefined,
    z: undefined,
    element: undefined,
    chainname: undefined,
    chainindex: undefined,
    resno: undefined,
    resindex: undefined,
    serial: undefined,
    ss: undefined,
    color: undefined,
    vdw: undefined,
    covalent: undefined,
    hetero: undefined,
    bfactor: undefined,
    bonds: undefined,
    altloc: undefined,
    atomname: undefined,
    modelindex: undefined,

    connectedTo: function( atom ){

        if( this.hetero && atom.hetero ) return 0;

        var distSquared = ( this.x - atom.x ) * ( this.x - atom.x ) +
                          ( this.y - atom.y ) * ( this.y - atom.y ) +
                          ( this.z - atom.z ) * ( this.z - atom.z );

        if( isNaN( distSquared ) ) return 0;
        if( distSquared < 0.5 ) return 0; // duplicate or altloc

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


/**
 * An object fro representing a PDB file.
 * @class
 */
NGL.PdbStructure = function( name ){

    NGL.Structure.call( this, name );

};

NGL.PdbStructure.prototype = Object.create( NGL.Structure.prototype );

/**
 * Parses a pdb string. Based on GLmol.parsePDB2.
 * @param  {String} str
 */
NGL.PdbStructure.prototype._parse = function( str ){

    console.time( "NGL.PdbStructure.parse" );

    var bondSet = this.bondSet;

    var atoms = [];

    this.title = '';
    this.id = '';
    this.sheet = [];
    this.helix = [];

    var lines = str.split("\n");

    var guessElem = NGL.guessElement;
    var covRadii = NGL.CovalentRadii;
    var vdwRadii = NGL.VdwRadii;

    var i, j;
    var line, recordName;
    var altloc, serial, elem, chainname, resno, resname;

    var m = this.addModel();
    var c = m.addChain();
    var r = c.addResidue();

    var chainDict = {};
    var serialDict = {};

    var a, currentChainname, currentResno;

    for( i = 0; i < lines.length; i++ ){

        line = lines[i];
        recordName = line.substr( 0, 6 );

        if( recordName == 'ATOM  ' || recordName == 'HETATM' ){

            altLoc = line[ 16 ];
            if( altLoc != ' ' && altLoc != 'A' ) continue; // FIXME: ad hoc

            serial = parseInt( line.substr( 6, 5 ) );
            atomname = line.substr( 12, 4 ).trim();
            element = line.substr( 76, 2 ).trim();
            chainname = line[  21 ];
            resno = parseInt( line.substr( 22, 5 ) );
            resname = line.substr( 17, 3 ).trim();

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

            a = r.addAtom();

            serialDict[ serial ] = a;

            a.resname = resname;
            a.x = parseFloat( line.substr( 30, 8 ) );
            a.y = parseFloat( line.substr( 38, 8 ) );
            a.z = parseFloat( line.substr( 46, 8 ) );
            a.element = element;
            a.hetero = ( line[ 0 ]=='H' ) ? true : false;
            a.chainname = chainname;
            a.resno = resno;
            a.serial = serial;
            a.atomname = atomname;
            a.bonds = [];
            a.ss = 'c';
            a.bfactor = parseFloat( line.substr( 60, 8 ) );
            a.altloc = altLoc;
            a.color = 0xFFFFFF;
            a.vdw = vdwRadii[ element ];
            a.covalent = covRadii[ element ];

            atoms.push( a );

            currentChainname = chainname;
            currentResno = resno;

        }else if( recordName == 'CONECT' ){

            var from = serialDict[ parseInt( line.substr( 6, 5 ) ) ];
            var pos = [ 11, 16, 21, 26 ];

            for (var j = 0; j < 4; j++) {

                var to = serialDict[ parseInt( line.substr( pos[ j ], 5 ) ) ];
                if( to === undefined ) continue;

                bondSet.addBond( from, to );

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

        }else if( recordName == 'MODEL ' ){

            if( a ){

                m = this.addModel();
                c = m.addChain();
                r = c.addResidue();
                a = undefined;

                chainDict = {};
                serialDict = {};

            }

        }

        // FIXME parse MODEL record

    }

    var atom, atom2
    var nAtoms = atoms.length;

    // Assign secondary structures
    for( i = 0; i < nAtoms; i++ ){

        atom = atoms[ i ];
        if( atom == undefined ) continue;

        for( j = 0; j < this.sheet.length; j++ ){

            if (atom.chainname != this.sheet[j][0]) continue;
            if (atom.resno < this.sheet[j][1]) continue;
            if (atom.resno > this.sheet[j][3]) continue;
            atom.ss = 's';
            if (atom.resno == this.sheet[j][1]) atom.ssbegin = true;
            if (atom.resno == this.sheet[j][3]) atom.ssend = true;

        }

        for( j = 0; j < this.helix.length; j++ ){

            if (atom.chainname != this.helix[j][0]) continue;
            if (atom.resno < this.helix[j][1]) continue;
            if (atom.resno > this.helix[j][3]) continue;
            atom.ss = 'h';
            if (atom.resno == this.helix[j][1]) atom.ssbegin = true;
            else if (atom.resno == this.helix[j][3]) atom.ssend = true;

        }

    }

    if( !this.sheet.length && !this.helix.length ){
        this._doAutoSS = true;
    }

    console.timeEnd( "NGL.PdbStructure.parse" );

};


/**
 * An object fro representing a GRO file.
 * @class
 */
NGL.GroStructure = function( name ){

    this._doAutoSS = true;

    NGL.Structure.call( this, name );

};

NGL.GroStructure.prototype = Object.create( NGL.Structure.prototype );

NGL.GroStructure.prototype._parse = function( str ){

    console.time( "NGL.GroStructure.parse" );

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

    var m = this.addModel();
    var c = m.addChain();
    var r = c.addResidue();

    var a, currentResno;

    for( i = 2; i < lines.length-1; i++ ){

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

        a = r.addAtom();

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

        a.color = 0xFFFFFF;
        a.vdw = vdwRadii[ element ];
        a.covalent = covRadii[ element ];

        currentResno = resno;

    }

    console.timeEnd( "NGL.GroStructure.parse" );

};


//////////////
// Selection

NGL.Selection = function( selection ){

    this.selectionStr = "";

    if( Array.isArray( selection ) ){

        this.selection = selection;

    }else{

        this.selectionStr = selection || "";
        this.parse( selection );

    }

    this.test = this.makeTest();

    // console.log( this.selection )

};


NGL.Selection.prototype = {

    constructor: NGL.Selection,

    parse: function( str ){

        this.selection = [];

        if( !str ) return;

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

        var selection = this.selection;
        var chunks = str.trim().split(/\s+/);

        var all = [ "*", "", "ALL" ];

        var c, sele, atomname, chain, resno, resname, model;

        for( var i = 0; i < chunks.length; i++ ){

            c = chunks[ i ];

            if( i === 0 && ( c.toUpperCase() === "NOT" || c === "!" ) ){
                this.negate = true;
                continue;
            }

            sele = {};

            if( c.toUpperCase() === "HETERO" ){
                sele.keyword = "HETERO";
                selection.push( sele );
                continue;
            }

            if( c.toUpperCase() === "PROTEIN" ){
                sele.keyword = "PROTEIN";
                selection.push( sele );
                continue;
            }

            if( c.toUpperCase() === "NUCLEIC" ){
                sele.keyword = "NUCLEIC";
                selection.push( sele );
                continue;
            }

            if( c.toUpperCase() === "BACKBONE" ){
                sele.keyword = "BACKBONE";
                selection.push( sele );
                continue;
            }

            if( all.indexOf( c.toUpperCase() )!==-1 ){
                sele.keyword = "ALL";
                selection.push( sele );
                continue;
            }

            if( ( c.length >= 2 || c.length <= 4 ) &&
                    c[0] !== ":" && c[0] !== "." && c[0] !== "/" &&
                    isNaN( parseInt( c ) ) ){

                sele.resname = c.toUpperCase();
                selection.push( sele );
                continue;
            }

            model = c.split("/");
            if( model.length > 1 && model[1] ){
                if( isNaN( parseInt( model[1] ) ) ){
                    console.error( "model must be an integer" );
                    continue;
                }
                sele.model = parseInt( model[1] );
            }

            atomname = model[0].split(".");
            if( atomname.length > 1 && atomname[1] ){
                if( atomname[1].length > 4 ){
                    console.error( "atomname must be one to four characters" );
                    continue;
                }
                sele.atomname = atomname[1].substring( 0, 4 ).toUpperCase();
            }

            chain = atomname[0].split(":");
            if( chain.length > 1 && chain[1] ){
                if( chain[1].length > 1 ){
                    console.error( "chain identifier must be one character" );
                    continue;
                }
                sele.chainname = chain[1][0].toUpperCase();
            }

            if( chain[0] ){
                resi = chain[0].split("-");
                if( resi.length === 1 ){
                    sele.resno = parseInt( resi[0] );
                }else if( resi.length === 2 ){
                    sele.resno = [ parseInt( resi[0] ), parseInt( resi[1] ) ];
                }else{
                    console.error( "resi range must contain one '-'" );
                    continue;
                }
            }

            selection.push( sele );

        }

    },

    makeTest: function(){

        var n = this.selection.length;
        var selection = this.selection;
        var negate = this.negate;

        var backboneProtein = [
            "CA", "C", "N", "O"
        ];
        var backboneNucleic = [
            "P", "O3'", "O5'", "C5'", "C4'", "C3'", "OP1", "OP2"
        ];

        var t = true;
        var f = false;

        if( negate ){
            t = !t;
            f = !f;
        }

        var i, s;

        return function( a ){

            if( selection.length === 0 ) return true;

            for( i=0; i<n; ++i ){

                s = selection[ i ];

                if( s.keyword!==undefined ){

                    if( s.keyword==="ALL" ) return t;
                    if( s.keyword==="HETERO" && a.hetero===true ) return t;
                    if( s.keyword==="PROTEIN" && a.residue.isProtein() ) return t;
                    if( s.keyword==="NUCLEIC" && a.residue.isNucleic() ) return t;
                    if( s.keyword==="BACKBONE" && (
                            ( a.residue.isProtein() && 
                                backboneProtein.indexOf( a.atomname )!==-1 ) || 
                            ( a.residue.isNucleic() && 
                                backboneNucleic.indexOf( a.atomname )!==-1 )
                        )
                    ) return t;

                    continue;

                }

                if( s.resname!==undefined && s.resname!==a.resname ) continue;
                if( s.chainname!==undefined && s.chainname!==a.chainname ) continue;
                if( s.atomname!==undefined && s.atomname!==a.atomname ) continue;
                if( s.model!==undefined && s.model!==a.residue.chain.model.index ) continue;

                if( s.resno!==undefined ){
                    if( Array.isArray( s.resno ) && s.resno.length===2 ){
                        if( s.resno[0]>a.resno || s.resno[1]<a.resno ) continue;
                    }else{
                        if( s.resno!==a.resno ) continue;
                    }
                }

                return t;

            }

            return f;

        }

    },

};


//////////////
// Alignment

NGL.SubstitutionMatrices = function(){

    var blosum62x = [
        [4,0,-2,-1,-2,0,-2,-1,-1,-1,-1,-2,-1,-1,-1,1,0,0,-3,-2],        // A
        [0,9,-3,-4,-2,-3,-3,-1,-3,-1,-1,-3,-3,-3,-3,-1,-1,-1,-2,-2],    // C
        [-2,-3,6,2,-3,-1,-1,-3,-1,-4,-3,1,-1,0,-2,0,-1,-3,-4,-3],       // D
        [-1,-4,2,5,-3,-2,0,-3,1,-3,-2,0,-1,2,0,0,-1,-2,-3,-2],          // E
        [-2,-2,-3,-3,6,-3,-1,0,-3,0,0,-3,-4,-3,-3,-2,-2,-1,1,3],        // F
        [0,-3,-1,-2,-3,6,-2,-4,-2,-4,-3,0,-2,-2,-2,0,-2,-3,-2,-3],      // G
        [-2,-3,-1,0,-1,-2,8,-3,-1,-3,-2,1,-2,0,0,-1,-2,-3,-2,2],        // H
        [-1,-1,-3,-3,0,-4,-3,4,-3,2,1,-3,-3,-3,-3,-2,-1,3,-3,-1],       // I
        [-1,-3,-1,1,-3,-2,-1,-3,5,-2,-1,0,-1,1,2,0,-1,-2,-3,-2],        // K
        [-1,-1,-4,-3,0,-4,-3,2,-2,4,2,-3,-3,-2,-2,-2,-1,1,-2,-1],       // L
        [-1,-1,-3,-2,0,-3,-2,1,-1,2,5,-2,-2,0,-1,-1,-1,1,-1,-1],        // M
        [-2,-3,1,0,-3,0,1,-3,0,-3,-2,6,-2,0,0,1,0,-3,-4,-2],            // N
        [-1,-3,-1,-1,-4,-2,-2,-3,-1,-3,-2,-2,7,-1,-2,-1,-1,-2,-4,-3],   // P
        [-1,-3,0,2,-3,-2,0,-3,1,-2,0,0,-1,5,1,0,-1,-2,-2,-1],           // Q
        [-1,-3,-2,0,-3,-2,0,-3,2,-2,-1,0,-2,1,5,-1,-1,-3,-3,-2],        // R
        [1,-1,0,0,-2,0,-1,-2,0,-2,-1,1,-1,0,-1,4,1,-2,-3,-2],           // S
        [0,-1,-1,-1,-2,-2,-2,-1,-1,-1,-1,0,-1,-1,-1,1,5,0,-2,-2],       // T
        [0,-1,-3,-2,-1,-3,-3,3,-2,1,1,-3,-2,-2,-3,-2,0,4,-3,-1],        // V
        [-3,-2,-4,-3,1,-2,-2,-3,-3,-2,-1,-4,-4,-2,-3,-3,-2,-3,11,2],    // W
        [-2,-2,-3,-2,3,-3,2,-1,-2,-1,-1,-2,-3,-1,-2,-2,-2,-1,2,7]       // Y
    ];

    var blosum62 = [
        //A  R  N  D  C  Q  E  G  H  I  L  K  M  F  P  S  T  W  Y  V  B  Z  X
        [ 4,-1,-2,-2, 0,-1,-1, 0,-2,-1,-1,-1,-1,-2,-1, 1, 0,-3,-2, 0,-2,-1, 0], // A
        [-1, 5, 0,-2,-3, 1, 0,-2, 0,-3,-2, 2,-1,-3,-2,-1,-1,-3,-2,-3,-1, 0,-1], // R
        [-2, 0, 6, 1,-3, 0, 0, 0, 1,-3,-3, 0,-2,-3,-2, 1, 0,-4,-2,-3, 3, 0,-1], // N
        [-2,-2, 1, 6,-3, 0, 2,-1,-1,-3,-4,-1,-3,-3,-1, 0,-1,-4,-3,-3, 4, 1,-1], // D
        [ 0,-3,-3,-3, 9,-3,-4,-3,-3,-1,-1,-3,-1,-2,-3,-1,-1,-2,-2,-1,-3,-3,-2], // C
        [-1, 1, 0, 0,-3, 5, 2,-2, 0,-3,-2, 1, 0,-3,-1, 0,-1,-2,-1,-2, 0, 3,-1], // Q
        [-1, 0, 0, 2,-4, 2, 5,-2, 0,-3,-3, 1,-2,-3,-1, 0,-1,-3,-2,-2, 1, 4,-1], // E
        [ 0,-2, 0,-1,-3,-2,-2, 6,-2,-4,-4,-2,-3,-3,-2, 0,-2,-2,-3,-3,-1,-2,-1], // G
        [-2, 0, 1,-1,-3, 0, 0,-2, 8,-3,-3,-1,-2,-1,-2,-1,-2,-2, 2,-3, 0, 0,-1], // H
        [-1,-3,-3,-3,-1,-3,-3,-4,-3, 4, 2,-3, 1, 0,-3,-2,-1,-3,-1, 3,-3,-3,-1], // I
        [-1,-2,-3,-4,-1,-2,-3,-4,-3, 2, 4,-2, 2, 0,-3,-2,-1,-2,-1, 1,-4,-3,-1], // L
        [-1, 2, 0,-1,-3, 1, 1,-2,-1,-3,-2, 5,-1,-3,-1, 0,-1,-3,-2,-2, 0, 1,-1], // K
        [-1,-1,-2,-3,-1, 0,-2,-3,-2, 1, 2,-1, 5, 0,-2,-1,-1,-1,-1, 1,-3,-1,-1], // M
        [-2,-3,-3,-3,-2,-3,-3,-3,-1, 0, 0,-3, 0, 6,-4,-2,-2, 1, 3,-1,-3,-3,-1], // F
        [-1,-2,-2,-1,-3,-1,-1,-2,-2,-3,-3,-1,-2,-4, 7,-1,-1,-4,-3,-2,-2,-1,-2], // P
        [ 1,-1, 1, 0,-1, 0, 0, 0,-1,-2,-2, 0,-1,-2,-1, 4, 1,-3,-2,-2, 0, 0, 0], // S
        [ 0,-1, 0,-1,-1,-1,-1,-2,-2,-1,-1,-1,-1,-2,-1, 1, 5,-2,-2, 0,-1,-1, 0], // T
        [-3,-3,-4,-4,-2,-2,-3,-2,-2,-3,-2,-3,-1, 1,-4,-3,-2,11, 2,-3,-4,-3,-2], // W
        [-2,-2,-2,-3,-2,-1,-2,-3, 2,-1,-1,-2,-1, 3,-3,-2,-2, 2, 7,-1,-3,-2,-1], // Y
        [ 0,-3,-3,-3,-1,-2,-2,-3,-3, 3, 1,-2, 1,-1,-2,-2, 0,-3,-1, 4,-3,-2,-1], // V
        [-2,-1, 3, 4,-3, 0, 1,-1, 0,-3,-4, 0,-3,-3,-2, 0,-1,-4,-3,-3, 4, 1,-1], // B
        [-1, 0, 0, 1,-3, 3, 4,-2, 0,-3,-3, 1,-1,-3,-1, 0,-1,-3,-2,-2, 1, 4,-1], // Z
        [ 0,-1,-1,-1,-2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-2, 0, 0,-2,-1,-1,-1,-1,-1]  // X
    ];

    var nucleotides = 'ACTG';

    var aminoacidsX = 'ACDEFGHIKLMNPQRSTVWY';

    var aminoacids = 'ARNDCQEGHILKMFPSTWYVBZ?';

    function prepareMatrix( cellNames, mat ){

        var j;
        var i = 0;
        var matDict = {};

        mat.forEach( function( row ){

            j = 0;
            var rowDict = {};

            row.forEach( function( elm ){

                rowDict[ cellNames[ j++ ] ] = elm;

            } );

            matDict[ cellNames[ i++ ] ] = rowDict;

        } );

        return matDict;

    }

    return {

        blosum62: prepareMatrix( aminoacids, blosum62 ),

        blosum62x: prepareMatrix( aminoacidsX, blosum62x ),

    };

}();


NGL.Alignment = function( seq1, seq2, gapPenalty, gapExtensionPenalty, substMatrix ){

    // TODO try encoding seqs as integers and use array subst matrix, maybe faster

    this.seq1 = seq1;
    this.seq2 = seq2;

    this.gapPenalty = gapPenalty || -10;
    this.gapExtensionPenalty = gapExtensionPenalty || -1;
    this.substMatrix = substMatrix || "blosum62";

    if( this.substMatrix ){
        this.substMatrix = NGL.SubstitutionMatrices[ this.substMatrix ];
    }

};

NGL.Alignment.prototype = {

    initMatrices: function(){

        this.n = this.seq1.length;
        this.m = this.seq2.length;

        //console.log(this.n, this.m);

        this.score = undefined;
        this.ali = '';

        this.S = [];
        this.V = [];
        this.H = [];

        for(var i = 0; i <= this.n; i++){
            this.S[i] = [];
            this.V[i] = [];
            this.H[i] = [];
            for(var j = 0; j <= this.m; j++){
                this.S[i][j] = 0;
                this.V[i][j] = 0;
                this.H[i][j] = 0;
            }
        }

        for(var i = 0; i <= this.n; ++i){
            this.S[i][0] = this.gap(0);
            this.H[i][0] = -Infinity;
        }

        for(var j = 0; j <= this.m; ++j){
            this.S[0][j] = this.gap(0);
            this.V[0][j] = -Infinity;
        }

        this.S[0][0] = 0;

        // console.log(this.S, this.V, this.H);

    },

    gap: function( len ){

        return this.gapPenalty + len * this.gapExtensionPenalty;

    },

    makeScoreFn: function(){

        var seq1 = this.seq1;
        var seq2 = this.seq2;

        var substMatrix = this.substMatrix;

        var c1, c2;

        if( substMatrix ){

            return function( i, j ){

                c1 = seq1[i];
                c2 = seq2[j];

                try{
                    return substMatrix[ c1 ][ c2 ];
                }catch(e){
                    return -4;
                }

            }

        } else {

            console.warn('NGL.Alignment: no subst matrix');

            return function( i, j ){

                c1 = seq1[i];
                c2 = seq2[j];

                return c1==c2 ? 5 : -3;

            }

        }

    },

    calc: function(){
        
        console.time( "NGL.Alignment.calc" );

        this.initMatrices();

        var gap0 = this.gap(0);
        var scoreFn = this.makeScoreFn();
        var gapExtensionPenalty = this.gapExtensionPenalty;

        var V = this.V;
        var H = this.H;
        var S = this.S;

        var n = this.n;
        var m = this.m;

        var Vi1, Si1, Vi, Hi, Si;

        var i, j;

        for( i = 1; i <= n; ++i ){

            Si1 = S[i-1];
            Vi1 = V[i-1];

            Vi = V[i];
            Hi = H[i];
            Si = S[i];

            for( j = 1; j <= m; ++j ){

                Vi[j] = Math.max(
                    Si1[j] + gap0,
                    Vi1[j] + gapExtensionPenalty
                );

                Hi[j] = Math.max(
                    Si[j-1] + gap0,
                    Hi[j-1] + gapExtensionPenalty
                );

                Si[j] = Math.max(
                    Si1[j-1] + scoreFn(i-1, j-1), // match
                    Vi[j], //del
                    Hi[j] // ins
                );

            }

        }

        console.timeEnd( "NGL.Alignment.calc" );

        // console.log(this.S, this.V, this.H);

    },

    trace: function(){

        // console.time( "NGL.Alignment.trace" );

        this.ali1 = '';
        this.ali2 = '';

        var scoreFn = this.makeScoreFn();

        var i = this.n;
        var j = this.m;
        var mat = "S";

        if( this.S[i][j] >= this.V[i][j] && this.S[i][j] >= this.V[i][j] ){
            mat = "S";
            this.score = this.S[i][j];
        }else if( this.V[i][j] >= this.H[i][j] ){
            mat = "V";
            this.score = this.V[i][j];
        }else{
            mat = "H";
            this.score = this.H[i][j];
        }

        // console.log("NGL.Alignment: SCORE", this.score);
        // console.log("NGL.Alignment: S, V, H", this.S[i][j], this.V[i][j], this.H[i][j]);

        while( i > 0 && j > 0 ){

            if( mat=="S" ){

                if( this.S[i][j]==this.S[i-1][j-1] + scoreFn(i-1, j-1) ){
                    this.ali1 = this.seq1[i-1] + this.ali1;
                    this.ali2 = this.seq2[j-1] + this.ali2;
                    --i;
                    --j;
                    mat = "S";
                }else if( this.S[i][j]==this.V[i][j] ){
                    mat = "V";
                }else if( this.S[i][j]==this.H[i][j] ){
                    mat = "H";
                }else{
                    console.error('NGL.Alignment: S');
                    --i;
                    --j;
                }

            }else if( mat=="V" ){

                if( this.V[i][j]==this.V[i-1][j] + this.gapExtensionPenalty ){
                    this.ali1 = this.seq1[i-1] + this.ali1;
                    this.ali2 = '-' + this.ali2;
                    --i;
                    mat = "V";
                }else if( this.V[i][j]==this.S[i-1][j] + this.gap(0) ){
                    this.ali1 = this.seq1[i-1] + this.ali1;
                    this.ali2 = '-' + this.ali2;
                    --i;
                    mat = "S";
                }else{
                    console.error('NGL.Alignment: V');
                    --i;
                }

            }else if( mat=="H" ){

                if( this.H[i][j] == this.H[i][j-1] + this.gapExtensionPenalty ){
                    this.ali1 = '-' + this.ali1;
                    this.ali2 = this.seq2[j-1] + this.ali2;
                    --j;
                    mat = "H";
                }else if( this.H[i][j] == this.S[i][j-1] + this.gap(0) ){
                    this.ali1 = '-' + this.ali1;
                    this.ali2 = this.seq2[j-1] + this.ali2;
                    --j;
                    mat = "S";
                }else{
                    console.error('NGL.Alignment: H');
                    --j;
                }

            }else{

                console.error('NGL.Alignment: no matrix');

            }

        }

        while( i > 0 ){

            this.ali1 = this.seq1[i-1] + this.ali1;
            this.ali2 = '-' + this.ali2;
            --i;

        }

        while( j > 0 ){

            this.ali1 = '-' + this.ali1;
            this.ali2 = this.seq2[j-1] + this.ali2;
            --j;

        }

        // console.timeEnd( "NGL.Alignment.trace" );

        // console.log([this.ali1, this.ali2]);

    }

};


NGL.superpose = function( s1, s2, align, sele ){

    align = align || false;
    sele = sele || "";

    var atoms1, atoms2;

    if( align ){

        var seq1 = s1.getSequence();
        var seq2 = s2.getSequence();

        // console.log( seq1.join("") );
        // console.log( seq2.join("") );

        var ali = new NGL.Alignment( seq1.join(""), seq2.join("") );

        ali.calc();
        ali.trace();

        console.log( ali.score );

        // console.log( ali.ali1 );
        // console.log( ali.ali2 );

        var l, _i, _j, x, y;
        var i = 0;
        var j = 0;
        var n = ali.ali1.length;
        var aliIdx1 = [];
        var aliIdx2 = [];

        for( l = 0; l < n; ++l ){

            x = ali.ali1[ l ];
            y = ali.ali2[ l ];

            _i = 0;
            _j = 0;

            if( x === "-" ){
                aliIdx2[ j ] = false;
            }else{
                aliIdx2[ j ] = true;
                _i = 1;
            }

            if( y === "-" ){
                aliIdx1[ i ] = false;
            }else{
                aliIdx1[ i ] = true;
                _j = 1;
            }

            i += _i;
            j += _j;

        }

        // console.log( i, j );

        // console.log( aliIdx1 );
        // console.log( aliIdx2 );

        atoms1 = new NGL.AtomSet();
        atoms2 = new NGL.AtomSet();

        i = 0;
        s1.eachResidue( function( r ){

            if( !r.getResname1() || !r.getAtomByName( "CA" ) ) return;

            if( aliIdx1[ i ] ){
                atoms1.addAtom( r.getAtomByName( "CA" ) );
            }
            i += 1;

        } );

        i = 0;
        s2.eachResidue( function( r ){

            if( !r.getResname1() || !r.getAtomByName( "CA" ) ) return;

            if( aliIdx2[ i ] ){
                atoms2.addAtom( r.getAtomByName( "CA" ) );
            }
            i += 1;

        } );

    }else{

        var selection = new NGL.Selection( sele + ".CA" );

        atoms1 = new NGL.AtomSet( s1, selection );
        atoms2 = new NGL.AtomSet( s2, selection );

    }

    var superpose = new NGL.Superposition( atoms1, atoms2 );

    var atoms = new NGL.AtomSet( s1, new NGL.Selection( "*" ) );
    superpose.transform( atoms );

    s1.center = s1.atomCenter();

}
