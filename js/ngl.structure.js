/**
 * @file Structure
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


var NGL = NGL || {};

if( typeof importScripts === 'function' ){
    importScripts( 'three/three.js', 'lib/ui/signals.min.js' );
}

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
    "LV": 0xFFFFFF, "UUH": 0xFFFFFF,

    "D": 0xFFFFC0, "T": 0xFFFFA0,

    "": 0xFFFFFF
};


// from Jmol http://jmol.sourceforge.net/jscolors/ (protein + shapely for nucleic)
NGL._ResidueColors = {
    "ALA": 0xC8C8C8,
    "ARG": 0x145AFF,
    "ASN": 0x00DCDC,
    "ASP": 0xE60A0A,
    "CYS": 0xE6E600,
    "GLN": 0x00DCDC,
    "GLU": 0xE60A0A,
    "GLY": 0xEBEBEB,
    "HIS": 0x8282D2,
    "ILE": 0x0F820F,
    "LEU": 0x0F820F,
    "LYS": 0x145AFF,
    "MET": 0xE6E600,
    "PHE": 0x3232AA,
    "PRO": 0xDC9682,
    "SER": 0xFA9600,
    "THR": 0xFA9600,
    "TRP": 0xB45AB4,
    "TYR": 0x3232AA,
    "VAL": 0x0F820F,

    "ASX": 0xFF69B4,
    "GLX": 0xFF69B4,
    "ASN": 0xFF69B4,
    "GLH": 0xFF69B4,

    "A": 0xA0A0FF,
    "G": 0xFF7070,
    "I": 0x80FFFF,
    "C": 0xFF8C4B,
    "T": 0xA0FFA0,
    "U": 0xFF8080,

    "DA": 0xA0A0FF,
    "DG": 0xFF7070,
    "DI": 0x80FFFF,
    "DC": 0xFF8C4B,
    "DT": 0xA0FFA0,
    "DU": 0xFF8080,

    "": 0xBEA06E
};
NGL.ResidueColors = {
    "ALA": 0x8CFF8C,
    "ARG": 0x00007C,
    "ASN": 0xFF7C70,
    "ASP": 0xA00042,
    "CYS": 0xFFFF70,
    "GLN": 0xFF4C4C,
    "GLU": 0x660000,
    "GLY": 0xFFFFFF,
    "HIS": 0x7070FF,
    "ILE": 0x004C00,
    "LEU": 0x455E45,
    "LYS": 0x4747B8,
    "MET": 0xB8A042,
    "PHE": 0x534C52,
    "PRO": 0x525252,
    "SER": 0xFF7042,
    "THR": 0xB84C00,
    "TRP": 0x4F4600,
    "TYR": 0x8C704C,
    "VAL": 0xFF8CFF,

    "ASX": 0xFF00FF,
    "GLX": 0xFF00FF,
    "ASN": 0xFF00FF,
    "GLH": 0xFF00FF,

    "A": 0xA0A0FF,
    "G": 0xFF7070,
    "I": 0x80FFFF,
    "C": 0xFF8C4B,
    "T": 0xA0FFA0,
    "U": 0xFF8080,

    "DA": 0xA0A0FF,
    "DG": 0xFF7070,
    "DI": 0x80FFFF,
    "DC": 0xFF8C4B,
    "DT": 0xA0FFA0,
    "DU": 0xFF8080,

    "": 0xFF00FF
};


// from Jmol http://jmol.sourceforge.net/jscolors/ (shapely)
NGL.StructureColors = {
    "alphaHelix": 0xFF0080,
    "3_10Helix": 0xA00080,
    "piHelix": 0x600080,
    "betaStrand": 0xFFC800,
    "betaTurn": 0x6080FF,
    "coil": 0xFFFFFF,

    "dna": 0xAE00FE,
    "rna": 0xFD0162,

    "carbohydrate": 0xA6A6FA,

    "": 0x808080
}


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
    "CN": 2.0, "UUT": 2.0, "FL": 2.0, "UUP": 2.0, "LV": 2.0, "UUH": 2.0,

    "": 2.0
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
    "CN": 1.6, "UUT": 1.6, "FL": 1.6, "UUP": 1.6, "LV": 1.6, "UUH": 1.6,

    "": 1.6
};


NGL.guessElement = function(){

    var elm1 = [ "H", "C", "O", "N", "S", "P" ];
    var elm2 = [ "NA", "CL" ];

    return function( atomName ){

        var at = atomName.trim().toUpperCase();
        if( parseInt( at.charAt( 0 ) ) ) at = at.substr( 1 );
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


NGL.UnknownType = 0;
NGL.CgType = 1;
NGL.ProteinType = 2;
NGL.NucleicType = 3;
NGL.NucleicBackboneType = 4;
NGL.WaterType = 5;


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


////////////
// Factory

NGL.ColorFactory = function( type, structure ){

    this.type = type;
    this.structure = structure;

    if( structure ){

        this.atomindexScale = chroma
            //.scale( 'Spectral' )
            //.scale( 'RdYlGn' )
            .scale([ "red", "orange", "yellow", "green", "blue" ])
            .mode('lch')
            .domain( [ 0, this.structure.atomCount ]);

        this.residueindexScale = chroma
            //.scale( 'Spectral' )
            //.scale( 'RdYlGn' )
            .scale([ "red", "orange", "yellow", "green", "blue" ])
            .mode('lch')
            .domain( [ 0, this.structure.residueCount ]);

        this.chainindexScale = chroma
            .scale( 'Spectral' )
            //.scale( 'RdYlGn' )
            //.scale([ "red", "orange", "yellow", "green", "blue" ])
            .mode('lch')
            .domain( [ 0, this.structure.chainCount ]);

        this.modelindexScale = chroma
            //.scale( 'Spectral' )
            //.scale( 'RdYlGn' )
            .scale([ "red", "orange", "yellow", "green", "blue" ])
            .mode('lch')
            .domain( [ 0, this.structure.modelCount ]);

    }

    this.chainNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                      "abcdefghijklmnopqrstuvwxyz" +
                      "0123456789";

    this.chainnameScale = chroma
        .scale( 'Spectral' )
        //.scale( 'RdYlGn' )
        //.scale([ "red", "orange", "yellow", "green", "blue" ])
        .mode('lch')
        .domain( [ 0, 26 ]);

}

NGL.ColorFactory.prototype = {

    atomColor: function( a ){

        var type = this.type;
        var elemColors = NGL.ElementColors;
        var resColors = NGL.ResidueColors;
        var strucColors = NGL.StructureColors;

        var defaultElemColor = NGL.ElementColors[""];
        var defaultResColor = NGL.ResidueColors[""];
        var defaultStrucColor = NGL.StructureColors[""];

        var atomindexScale = this.atomindexScale;
        var residueindexScale = this.residueindexScale;
        var chainindexScale = this.chainindexScale;
        var modelindexScale = this.modelindexScale;

        var c, _c;

        switch( type ){

            case "picking":
            
                c = a.globalindex + 1;
                break;

            case "element":
            
                c = elemColors[ a.element ] || defaultElemColor;
                break;

            case "resname":

                c = resColors[ a.resname ] || defaultResColor;
                break;

            case "atomindex":

                _c = atomindexScale( a.index )._rgb;
                c = _c[0] << 16 | _c[1] << 8 | _c[2];
                break;

            case "residueindex":

                _c = residueindexScale( a.residue.index )._rgb;
                c = _c[0] << 16 | _c[1] << 8 | _c[2];
                break;

            case "chainindex":
            
                if( a.residue.chain.chainname === undefined ){
                    _c = this.chainnameScale(
                        this.chainNames.indexOf( a.chainname ) * 10
                    )._rgb;
                }else{
                    _c = chainindexScale( a.residue.chain.index )._rgb;
                }
                c = _c[0] << 16 | _c[1] << 8 | _c[2];
                break;

            case "modelindex":

                _c = modelindexScale( a.residue.chain.model.index )._rgb;
                c = _c[0] << 16 | _c[1] << 8 | _c[2];
                break;

            case "random":

                c = Math.random() * 0xFFFFFF;
                break;

            case "ss":
            
                if( a.ss === "h" ){
                    c = strucColors[ "alphaHelix" ];
                }else if( a.ss === "s" ){
                    c = strucColors[ "betaStrand" ];
                }else if( a.residue.isNucleic() ){
                    c = strucColors[ "dna" ];
                }else if( a.residue.isProtein() ){
                    c = strucColors[ "coil" ];
                }else{
                    c = defaultStrucColor;
                }
                break;

            case undefined:

                c = 0xFFFFFF;
                break;

            default: 
               
                c = type;
                break;

        }

        return c;

    }

};


NGL.RadiusFactory = function( type, scale ){

    this.type = type;
    this.scale = scale || 1.0;

    this.max = 10;

}

NGL.RadiusFactory.prototype = {

    atomRadius: function( a ){

        var type = this.type;
        var scale = this.scale;
        var vdwRadii = NGL.VdwRadii;
        var covalentRadii = NGL.CovalentRadii;

        var defaultVdwRadius = NGL.VdwRadii[""];
        var defaultCovalentRadius = NGL.CovalentRadii[""];
        var defaultBfactor = 1;

        var r;

        switch( type ){

            case "vdw":
            
                r = vdwRadii[ a.element ] || defaultVdwRadius;
                break;

            case "covalent":
            
                r = covalentRadii[ a.element ] || defaultCovalentRadius;
                break;

            case "bfactor":

                r = a.bfactor || defaultBfactor;
                break;

            case "ss":
            
                if( a.ss === "h" ){
                    r = 0.25;
                }else if( a.ss === "s" ){
                    r = 0.25;
                }else if( a.atomname === "P" ){
                    r = 0.4;
                }else{
                    r = 0.1;
                }
                break;

            default: 
               
                r = type || 1.0;
                break;

        }

        return Math.min( r * scale, this.max );

    }

};


////////
// Set

NGL.AtomSet = function( structure, selection ){

    this.atoms = [];
    this.bonds = [];

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
        object.atomIndex = NGL.AtomSet.prototype.atomIndex;

    },

    addAtom: function( atom ){

        this.atoms.push( atom );

        this.atomCount = this.atoms.length;

    },

    fromStructure: function( structure, selection ){

        var scope = this;

        this.structure = structure;

        this.selection = selection;

        this.selection.signals.stringChanged.add( function( string ){

            scope.applySelection();

        } );

        this.applySelection();

    },

    applySelection: function(){

        // atoms

        this.atoms = [];
        var atoms = this.atoms;

        this.structure.eachAtom( function( a ){

            atoms.push( a );

        }, this.selection );

        this.atomCount = this.atoms.length;
        this.center = this.atomCenter();

        this._atomPosition = undefined;

        // bonds
        
        this.bonds = [];
        var bonds = this.bonds;

        this.structure.bondSet.eachBond( function( b ){

            bonds.push( b );

        }, this.selection );

        this.bondCount = this.bonds.length;

        this._bondPositionFrom = undefined;
        this._bondPositionTo = undefined;

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

        var j, position;

        var i = 0;
        var n = this.atomCount;

        if( selection ){

            position = [];

            this.eachAtom( function( a ){

                position[ i + 0 ] = a.x;
                position[ i + 1 ] = a.y;
                position[ i + 2 ] = a.z;

                i += 3;

            }, selection );

            position = new Float32Array( position );

        }else{

            if( this._atomPosition ){

                position = this._atomPosition;

            }else{

                position = new Float32Array( this.atomCount * 3 );

            }

            for( j = 0; j < n; ++j ){

                a = this.atoms[ j ];

                position[ i + 0 ] = a.x;
                position[ i + 1 ] = a.y;
                position[ i + 2 ] = a.z;

                i += 3;

            };

            this._atomPosition = position;

        }

        return position;

    },

    atomColor: function( selection, type ){

        // console.time( "atomColor" );

        // TODO cache
        var c, color;
        var colorFactory = new NGL.ColorFactory( type, this.structure );

        if( selection ){
            color = [];
        }else{
            color = new Float32Array( this.atomCount * 3 );
        }

        var i = 0;

        this.eachAtom( function( a ){

            c = colorFactory.atomColor( a );

            color[ i + 0 ] = ( c >> 16 & 255 ) / 255;
            color[ i + 1 ] = ( c >> 8 & 255 ) / 255;
            color[ i + 2 ] = ( c & 255 ) / 255;

            i += 3;

        }, selection );

        if( selection ) color = new Float32Array( color );

        // console.timeEnd( "atomColor" );

        return color;

    },

    atomRadius: function( selection, type, scale ){

        // TODO cache
        var i, radius;
        var radiusFactory = new NGL.RadiusFactory( type, scale );

        if( selection ){
            radius = [];
        }else{
            radius = new Float32Array( this.atomCount );
        }

        i = 0;

        this.eachAtom( function( a ){

            radius[ i ] = radiusFactory.atomRadius( a );

            i += 1;

        }, selection );

        if( selection ) radius = new Float32Array( radius );

        return radius;

    },

    atomIndex: function( selection ){

        var index = [];

        this.eachAtom( function( a ){

            index.push( a.index );

        }, selection );

        return index;

    },

    atomCenter: function(){

        var box = new THREE.Box3();
        var vector = new THREE.Vector3();

        return function( selection ){

            // console.time( "NGL.AtomSet.atomCenter" );

            var i = 0;
            var n = this.atomCount;

            box.makeEmpty();

            if( selection ){

                var test = selection.test;

                for( i = 0; i < n; ++i ){

                    a = this.atoms[ i ];

                    if( test( a ) ){

                        vector.set( a.x, a.y, a.z );
                        box.expandByPoint( vector );

                    }

                };

            }else{

                for( i = 0; i < n; ++i ){

                    a = this.atoms[ i ];

                    vector.set( a.x, a.y, a.z );
                    box.expandByPoint( vector );

                };

            }

            // console.timeEnd( "NGL.AtomSet.atomCenter" );

            return box.center();

        };

    }(),

    eachBond: function( callback, selection ){

        selection = selection || this.selection;

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

    /*eachBondBAK: function( callback, selection ){

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

    },*/

    bondPosition: function( selection, fromTo ){

        var j, position;

        var i = 0;
        var n = this.bondCount;

        if( selection ){

            position = [];

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

            position = new Float32Array( position );

        }else{

            position = [];

            if( fromTo ){

                if( this._bondPositionFrom ){
                    position = this._bondPositionFrom;
                }

            }else{

                if( this._bondPositionTo ){
                    position = this._bondPositionTo;
                }

            }

            for( j = 0; j < n; ++j ){

                b = this.bonds[ j ];

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

            };

            if( fromTo ){

                if( !this._bondPositionFrom ){
                    this._bondPositionFrom = new Float32Array( position );
                }

            }else{

                if( !this._bondPositionTo ){
                    this._bondPositionTo = new Float32Array( position );
                }

            }

        }

        return position;

    },

    bondColor: function( selection, fromTo, type ){

        var i = 0;
        var color = [];

        var c;
        var colorFactory = new NGL.ColorFactory( type, this.structure );

        this.eachBond( function( b ){

            c = colorFactory.atomColor( fromTo ? b.atom1 : b.atom2 );

            color[ i + 0 ] = ( c >> 16 & 255 ) / 255;
            color[ i + 1 ] = ( c >> 8 & 255 ) / 255;
            color[ i + 2 ] = ( c & 255 ) / 255;

            i += 3;

        }, selection );

        return new Float32Array( color );

    },

    bondRadius: function( selection, fromTo, type, scale ){

        var i = 0;
        var radius = [];
        var radiusFactory = new NGL.RadiusFactory( type, scale );

        this.eachBond( function( b ){

            radius[ i ] = radiusFactory.atomRadius(
                fromTo ? b.atom1 : b.atom2
            );

            i += 1;

        }, selection );

        return new Float32Array( radius );

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

            // console.debug( "bond already known" );

        }else{

            if( !onlyHere ){
                atom1.bonds.push( b );
                atom2.bonds.push( b );
            }
            bonds.push( b );
            bondDict[ qn ] = b;

        }

        this.bondCount = bonds.length;

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

NGL.Trajectory = function( xtcPath, structure, selectionString ){

    var scope = this;

    var SIGNALS = signals;

    this.signals = {

        gotNumframes: new SIGNALS.Signal(),
        frameChanged: new SIGNALS.Signal(),
        selectionChanged: new SIGNALS.Signal(),

        centerPbcParamChanged: new SIGNALS.Signal(),
        removePbcParamChanged: new SIGNALS.Signal(),
        superposeParamChanged: new SIGNALS.Signal(),

    };

    this.params = {
        centerPbc: true,
        removePbc: true,
        superpose: true
    };

    this.name = xtcPath.replace( /^.*[\\\/]/, '' );

    this.xtcPath = xtcPath;
    this.structure = structure;
    this.atomCount = structure.atomCount;

    this.frameCache = [];
    this.frameCacheSize = 0;
    this.currentFrame = -1;

    this.numframes = undefined;
    this.getNumframes();

    if( structure instanceof NGL.StructureSubset ){

        this.atomIndices = [];

        var indices = structure.structure.atomIndex( structure.selection );

        var i, r;
        var p = indices[ 0 ];
        var q = indices[ 0 ];
        var n = indices.length;

        for( i = 1; i < n; ++i ){

            r = indices[ i ];

            if( q + 1 < r ){

                this.atomIndices.push( [ p, q + 1 ] );
                p = r;
                
            }

            q = r;

        }

        this.atomIndices.push( [ p, q + 1 ] );

    }else{

        this.atomIndices = [ [ 0, this.atomCount ] ];

    }

    this.saveInitialStructure();

    this.selection = new NGL.Selection(
        selectionString || "backbone and not hydrogen"
    );
    
    this.selection.signals.stringChanged.add( function( string ){

        scope.makeIndices();
        scope.resetCache();

    } );

    this.backboneIndices = this.structure.atomIndex(
        new NGL.Selection( "backbone and not hydrogen" )
    );
    this.makeIndices();

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

    setSelection: function( string ){

        this.selection.setString( string );

        return this;

    },

    makeIndices: function(){

        this.indices = this.structure.atomIndex( this.selection );

        var i, j;
        var n = this.indices.length * 3;

        this.coords1 = new Float32Array( n );
        this.coords2 = new Float32Array( n );

        var y = this.initialStructure;
        var coords2 = this.coords2;

        for( i = 0; i < n; i += 3 ){

            j = this.indices[ i / 3 ] * 3;

            coords2[ i + 0 ] = y[ j + 0 ];
            coords2[ i + 1 ] = y[ j + 1 ];
            coords2[ i + 2 ] = y[ j + 2 ];

        }

    },

    getNumframes: function(){

        var scope = this;

        var loader = new THREE.XHRLoader();
        var url = "../xtc/numframes/" + this.xtcPath;

        loader.load( url, function( n ){

            n = parseInt( n );
            // console.log( "numframes", n );

            scope.numframes = n;
            scope.signals.gotNumframes.dispatch( n );

        });

    },

    resetCache: function(){

        this.frameCache = [];
        this.frameCacheSize = 0;
        this.setFrame( this.currentFrame );

        return this;

    },

    setCenterPbc: function( value ){

        if( value !== this.params.centerPbc ){

            this.params.centerPbc = value;
            this.resetCache();
            this.signals.centerPbcParamChanged.dispatch( value );

        }

        return this;

    },

    setRemovePbc: function( value ){

        if( value !== this.params.removePbc ){

            this.params.removePbc = value;
            this.resetCache();
            this.signals.removePbcParamChanged.dispatch( value );

        }

        return this;

    },

    setSuperpose: function( value ){

        if( value !== this.params.superpose ){

            this.params.superpose = value;
            this.resetCache();
            this.signals.superposeParamChanged.dispatch( value );

        }

        return this;

    },

    setFrame: function( i, callback ){

        if( i === undefined ) return this;

        i = parseInt( i );

        if( i === -1 || this.frameCache[ i ] ){

            this.updateStructure( i, callback );

        }else{

            this.loadFrame( i, callback );

        }

        this.currentFrame = i;

        return this;

    },

    loadFrame: function( i, callback ){

        // TODO implement max frameCache size, re-use arrays

        // console.time( "loadFrame" );

        var scope = this;

        var request = new XMLHttpRequest();

        var url = "../xtc/frame/" + i + "/" + this.xtcPath;
        var params = "atomIndices=" + this.atomIndices.join(";");

        request.open( "POST", url, true );
        request.responseType = "arraybuffer";
        request.setRequestHeader(
            "Content-type", "application/x-www-form-urlencoded"
        );

        request.addEventListener( 'load', function( event ){

            // console.timeEnd( "loadFrame" );

            var arrayBuffer = this.response;

            if( !arrayBuffer ){
                console.error( "empty arrayBuffer for '" + url + "'" );
                return;
            }

            var box = new Float32Array( arrayBuffer, 0, 9 );
            var coords = new Float32Array( arrayBuffer, 9 * 4 );

            if( scope.backboneIndices.length > 0 && scope.params.centerPbc ){
                var box2 = [ box[ 0 ], box[ 4 ], box[ 8 ] ];
                var mean = scope.getCircularMean(
                    scope.backboneIndices, coords, box2
                );
                scope.centerPbc( coords, mean, box2 );
            }

            if( scope.params.removePbc ){
                scope.removePbc( coords, box );
            }

            if( scope.indices.length > 0 && scope.params.superpose ){
                scope.superpose( coords );
            }

            if( !scope.frameCache[ i ] ){
                scope.frameCache[ i ] = coords;
                scope.frameCacheSize += 1;
            }

            scope.updateStructure( i, callback );

        }, false );
        
        request.send( params );

    },

    updateStructure: function( i, callback ){

        if( i === -1 ){

            this.structure.updatePosition( this.initialStructure );

        }else{

            this.structure.updatePosition( this.frameCache[ i ] );

        }

        this.structure.trajectory = {
            name: this.xtcPath,
            frame: i
        };

        if( typeof callback === "function" ){

            callback();

        }

        this.signals.frameChanged.dispatch( i );

    },

    getCircularMean: function( indices, coords, box ){

        // console.time( "NGL.Trajectory.getCircularMean" );

        var mean = [

            NGL.Utils.circularMean( coords, box[ 0 ], 3, 0, indices ),
            NGL.Utils.circularMean( coords, box[ 1 ], 3, 1, indices ),
            NGL.Utils.circularMean( coords, box[ 2 ], 3, 2, indices )

        ];

        // console.timeEnd( "NGL.Trajectory.getCircularMean" );

        return mean;

    },

    centerPbc: function( coords, mean, box ){

        // console.time( "NGL.Trajectory.centerPbc" );

        var i;
        var n = coords.length;

        var bx = box[ 0 ], by = box[ 1 ], bz = box[ 2 ];
        var mx = mean[ 0 ], my = mean[ 1 ], mz = mean[ 2 ];

        var fx = - mx + bx + bx / 2;
        var fy = - my + by + by / 2;
        var fz = - mz + bz + bz / 2;

        for( i = 0; i < n; i += 3 ){

            coords[ i + 0 ] = ( coords[ i + 0 ] + fx ) % bx;
            coords[ i + 1 ] = ( coords[ i + 1 ] + fy ) % by;
            coords[ i + 2 ] = ( coords[ i + 2 ] + fz ) % bz;

        }

        // console.timeEnd( "NGL.Trajectory.centerPbc" );

    },

    removePbc: function( x, box ){

        // console.time( "NGL.Trajectory.removePbc" );

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

        // console.timeEnd( "NGL.Trajectory.removePbc" );

        return x;

    },

    superpose: function( x ){

        // console.time( "NGL.Trajectory.superpose" );

        var i, j;
        var n = this.indices.length * 3;

        var coords1 = this.coords1;
        var coords2 = this.coords2;

        for( i = 0; i < n; i += 3 ){

            j = this.indices[ i / 3 ] * 3;

            coords1[ i + 0 ] = x[ j + 0 ];
            coords1[ i + 1 ] = x[ j + 1 ];
            coords1[ i + 2 ] = x[ j + 2 ];

        }

        // TODO re-use superposition object
        var sp = new NGL.Superposition( coords1, coords2 );
        sp.transform( x );

        // console.timeEnd( "NGL.Trajectory.superpose" );

    },

    dispose: function(){

        this.frameCache = [];  // aid GC

    }

};


NGL.Matrix = function( columns, rows ){

    var dtype = jsfeat.F32_t | jsfeat.C1_t;

    return new jsfeat.matrix_t( columns, rows, dtype );

}

//////////////////
// Superposition

NGL.Superposition = function( atoms1, atoms2 ){

    // allocate & init data structures

    var n;
    if( typeof atoms1.eachAtom === "function" ){
        n = atoms1.atomCount;
    }else if( atoms1 instanceof Float32Array ){
        n = atoms1.length / 3;
    }

    var coords1 = new NGL.Matrix( 3, n );
    var coords2 = new NGL.Matrix( 3, n );

    this.coords1t = new NGL.Matrix( n, 3 );
    this.coords2t = new NGL.Matrix( n, 3 );

    this.A = new NGL.Matrix( 3, 3 );
    this.W = new NGL.Matrix( 1, 3 );
    this.U = new NGL.Matrix( 3, 3 );
    this.V = new NGL.Matrix( 3, 3 );
    this.VH = new NGL.Matrix( 3, 3 );
    this.R = new NGL.Matrix( 3, 3 );

    this.tmp = new NGL.Matrix( 3, 3 );
    this.c = new NGL.Matrix( 3, 3 );
    this.c.data.set([ 1, 0, 0, 0, 1, 0, 0, 0, -1 ]);

    // prep coords

    this.prepCoords( atoms1, coords1 );
    this.prepCoords( atoms2, coords2 );

    // superpose

    this._superpose( coords1, coords2 );

};

NGL.Superposition.prototype = {

    _superpose: function( coords1, coords2 ){

        // console.time( "superpose" );

        this.mean1 = jsfeat.matmath.mean_rows( coords1 );
        this.mean2 = jsfeat.matmath.mean_rows( coords2 );

        jsfeat.matmath.sub_rows( coords1, this.mean1 );
        jsfeat.matmath.sub_rows( coords2, this.mean2 );

        jsfeat.matmath.transpose( this.coords1t, coords1 );
        jsfeat.matmath.transpose( this.coords2t, coords2 );

        jsfeat.matmath.multiply_ABt( this.A, this.coords2t, this.coords1t );

        var svd = jsfeat.linalg.svd_decompose(
            this.A, this.W, this.U, this.V
        );

        jsfeat.matmath.invert_3x3( this.V, this.VH );
        jsfeat.matmath.multiply_3x3( this.R, this.U, this.VH );

        if( jsfeat.matmath.mat3x3_determinant( this.R ) < 0.0 ){

            console.log( "R not a right handed system" );

            jsfeat.matmath.multiply_3x3( this.tmp, this.c, this.VH );
            jsfeat.matmath.multiply_3x3( this.R, this.U, this.tmp );

        }

        // console.timeEnd( "superpose" );

    },

    prepCoords: function( atoms, coords ){

        var i = 0;
        var cd = coords.data;

        if( typeof atoms.eachAtom === "function" ){

            atoms.eachAtom( function( a ){

                cd[ i + 0 ] = a.x;
                cd[ i + 1 ] = a.y;
                cd[ i + 2 ] = a.z;

                i += 3;

            } );

        }else if( atoms instanceof Float32Array ){

            cd.set( atoms );

        }else{

            console.warn( "prepCoords: input type unknown" );

        }

    },

    transform: function( atoms ){

        // allocate data structures

        var n;
        if( typeof atoms.eachAtom === "function" ){
            n = atoms.atomCount;
        }else if( atoms instanceof Float32Array ){
            n = atoms.length / 3;
        }
        
        var coords = new NGL.Matrix( 3, n );
        var tmp = new NGL.Matrix( n, 3 );

        // prep coords

        this.prepCoords( atoms, coords );

        // do transform

        jsfeat.matmath.sub_rows( coords, this.mean1 );
        jsfeat.matmath.multiply_ABt( tmp, this.R, coords );
        jsfeat.matmath.transpose( coords, tmp );
        jsfeat.matmath.add_rows( coords, this.mean2 );

        var i = 0;
        var cd = coords.data;

        if( typeof atoms.eachAtom === "function" ){
            
            atoms.eachAtom( function( a ){

                a.x = cd[ i + 0 ];
                a.y = cd[ i + 1 ];
                a.z = cd[ i + 2 ];

                i += 3;

            } );

        }else if( atoms instanceof Float32Array ){

            atoms.set( cd.subarray( 0, n * 3 ) );

        }else{

            console.warn( "transform: input type unknown" );

        }

    }

};


//////////////
// Structure

NGL.Structure = function( name, path ){

    this.name = name;
    this.path = path;

    this.reset();

};

NGL.Structure.prototype = {

    constructor: NGL.Structure,

    reset: function(){

        this.atomCount = 0;
        this.residueCount = 0;
        this.chainCount = 0;
        this.modelCount = 0;

        this.atoms = [];
        this.models = [];
        this.bondSet = new NGL.BondSet();

    },

    parse: function( str, callback ){

        var scope = this;

        this._parse( str, function(){

            scope.autoBond();

            if( scope._doAutoSS ){
                scope.autoSS();
            }

            if( scope._doAutoChainName ){
                scope.autoChainName();
            }

            scope.center = scope.atomCenter();

            // console.log( "Structure", scope );

            if( typeof callback === "function" ) callback( scope );

        } );

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

        if( selection ){

            var test = selection.modelTest;

            this.models.forEach( function( m ){

                if( test( m ) ) m.eachAtom( callback, selection );

            } );

        }else{

            this.models.forEach( function( m ){
                m.eachAtom( callback );
            } );

        }

    },

    eachResidue: function( callback, selection ){

        if( selection ){

            var test = selection.modelTest;

            this.models.forEach( function( m ){

                if( test( m ) ) m.eachResidue( callback, selection );

            } );

        }else{

            this.models.forEach( function( m ){
                m.eachResidue( callback );
            } );

        }

    },

    eachResidueN: function( n, callback ){

        this.models.forEach( function( m ){
            m.eachResidueN( n, callback );
        } );

    },

    eachFiber: function( callback, selection, padded ){

        if( selection ){

            var test = selection.modelTest;

            this.models.forEach( function( m ){

                if( test( m ) ) m.eachFiber( callback, selection, padded );

            } );

        }else{

            this.models.forEach( function( m ){
                m.eachFiber( callback, undefined, padded );
            } );

        }

    },

    eachChain: function( callback, selection ){

        if( selection ){

            var test = selection.modelTest;

            this.models.forEach( function( m ){

                if( test( m ) ) m.eachChain( callback, selection );

            } );

        }else{

            this.models.forEach( function( m ){
                m.eachChain( callback );
            } );

        }

    },

    eachModel: function( callback, selection ){

        if( selection ){

            var test = selection.modelTest;

            this.models.forEach( function( m ){

                if( test( m ) ) callback( m );

            } );

        }else{

            this.models.forEach( callback );

        }

    },

    getSequence: function(){

        var seq = [];

        // FIXME nucleic support

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

        // bonds within a residue

        console.time( "NGL.Structure.autoBond within" );

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

        console.timeEnd( "NGL.Structure.autoBond within" );

        // bonds between residues

        console.time( "NGL.Structure.autoBond between" );

        this.eachResidueN( 2, function( r1, r2 ){

            if( r1.isProtein() && r2.isProtein() ){

                bondSet.addBondIfConnected(
                    r1.getAtomByName( "C" ),
                    r2.getAtomByName( "N" )
                );

            }else if( r1.isNucleic() && r2.hasNucleicBackbone() ){

                bondSet.addBondIfConnected(
                    r1.getAtomByName([ "O3'", "O3*" ]),
                    r2.getAtomByName( "P" )
                );

            }else if( r1.isCg() && r2.isCg() ){

                bondSet.addBondIfConnected(
                    r1.getAtomByName( "CA" ),
                    r2.getAtomByName( "CA" )
                );

            }

        } );

        console.timeEnd( "NGL.Structure.autoBond between" );

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

        return function(){

            console.time( "NGL.Structure.autoSS" );

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
                        
                        f.residues[ i ].ss = "";

                    }

                }

            } );

            console.timeEnd( "NGL.Structure.autoSS" );

        }

    }(),

    autoChainName: function(){

        var names = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                    "abcdefghijklmnopqrstuvwxyz" +
                    "0123456789";
        var n = names.length;

        return function(){

            console.time( "NGL.Structure.autoChainName" );

            var name;
            var i = 0;

            this.eachFiber( function( f ){

                name = names[ i ];

                f.eachAtom( function( a ){

                    a.chainname = name;

                } );

                i += 1;

                if( i === n ){

                    console.warn( "out of chain names" );

                    i = 0;

                }

            } );

            console.timeEnd( "NGL.Structure.autoChainName" );

        }

    }(),

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

        return function(){

            var ia;
            var im = 1;
            var pdbRecords = [];

            // FIXME multiline if title line longer than 80 chars
            pdbRecords.push( sprintf( "TITEL %-74s\n", name ) );

            if( this.trajectory ){
                pdbRecords.push( sprintf(
                    "REMARK %-73s\n",
                    "Trajectory '" + this.trajectory.name + "'"
                ) );
                pdbRecords.push( sprintf(
                    "REMARK %-73s\n",
                    "Frame " + this.trajectory.frame + ""
                ) );
            }

            this.eachModel( function( m ){ 

                pdbRecords.push( sprintf( "MODEL %-74d\n", im++ ) );

                m.eachAtom( function( a ){

                    pdbRecords.push(
                        sprintf(
                            pdbFormatString,
                            
                            a.serial, a.atomname, a.resname,
                            DEF( a.chainname, " " ),
                            a.resno,
                            a.x, a.y, a.z,
                            DEF( a.occurence, 1.0 ),
                            DEF( a.bfactor, 0.0 ),
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

    }()

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

        if( selection ){

            var test = selection.chainTest;

            this.chains.forEach( function( c ){

                if( test( c ) ) c.eachAtom( callback, selection );

            } );

        }else{

            this.chains.forEach( function( c ){
                c.eachAtom( callback );
            } );

        }

    },

    eachResidue: function( callback, selection ){

        var i, j, o, c, r;
        var n = this.chainCount;

        if( selection ){

            var test = selection.chainTest;

            for( i = 0; i < n; ++i ){

                c = this.chains[ i ];

                if( !test( c ) ) continue;

                o = c.residueCount;

                var residueTest = selection.residueTest;

                for( j = 0; j < o; ++j ){

                    r = c.residues[ j ];
                    if( residueTest( r ) ) callback( r );

                }

            }

        }else{

            for( i = 0; i < n; ++i ){   

                c = this.chains[ i ];
                o = c.residueCount;

                for( j = 0; j < o; ++j ){

                    callback( c.residues[ j ] );

                }

            }

        }

    },

    eachResidueN: function( n, callback ){

        this.chains.forEach( function( c ){
            c.eachResidueN( n, callback );
        } );

    },

    eachFiber: function( callback, selection, padded ){

        if( selection ){

            var test = selection.chainTest;

            this.chains.forEach( function( c ){

                if( test( c ) ) c.eachFiber( callback, selection, padded );

            } );

        }else{

            this.chains.forEach( function( c ){
                c.eachFiber( callback, undefined, padded );
            } );

        }

    },

    eachChain: function( callback, selection ){

        var i, c;
        var n = this.chainCount;

        if( selection ){

            var test = selection.chainTest;

            for( i = 0; i < n; ++i ){

                c = this.chains[ i ];
                if( test( c ) ) callback( c );

            }

        }else{

            for( i = 0; i < n; ++i ){

                callback( this.chains[ i ] );

            }

        }

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

        var i, j, o, r, a;
        var n = this.residueCount;

        if( selection ){

            var test = selection.residueTest;

            for( i = 0; i < n; ++i ){

                r = this.residues[ i ];

                if( !test( r ) ) continue;

                o = r.atomCount;

                var atomTest = selection.test;

                for( j = 0; j < o; ++j ){

                    a = r.atoms[ j ];
                    if( atomTest( a ) ) callback( a );

                }

            }

        }else{

            for( i = 0; i < n; ++i ){   

                r = this.residues[ i ];
                o = r.atomCount;

                for( j = 0; j < o; ++j ){

                    callback( r.atoms[ j ] );

                }

            }

        }

    },

    eachResidue: function( callback, selection ){

        var i, r;
        var n = this.residueCount;

        if( selection ){

            var test = selection.residueTest;

            for( i = 0; i < n; ++i ){

                r = this.residues[ i ];
                if( test( r ) ) callback( r );

            }

        }else{

            for( i = 0; i < n; ++i ){

                callback( this.residues[ i ] );

            }

        }

    },

    eachResidueN: function( n, callback ){

        if( this.residues.length < n ) return;

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

            var rPrev = this.residues[ i - 1 ];
            var rStart = this.residues[ i ];
            var rEnd = this.residues[ j - 1 ];
            var rNext = this.residues[ j ];

            if( i === 0 || rPrev.getType() !== rStart.getType() ||
                    !rPrev.connectedTo( rStart ) ){
                
                residues.unshift( rStart );

            }else{

                residues.unshift( rPrev );

            }

            if( j === n || rNext.getType() !== rStart.getType() ||
                    !rEnd.connectedTo( rNext ) ){
                
                residues.push( rEnd );

            }else{

                residues.push( rNext );

            }

        }

        // console.log( residues );

        return new NGL.Fiber( residues, this.model.structure );

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

            }else if( r1.hasNucleicBackbone() && r2.hasNucleicBackbone() ){

                a1 = r1.getAtomByName([ "O3'", "O3*" ]);
                a2 = r2.getAtomByName( 'P' );

            }else if( r1.isCg() && r2.isCg() ){

                a1 = r1.getAtomByName( 'CA' );
                a2 = r2.getAtomByName( 'CA' );

            }else{

                if( ( r1.isProtein() && !r2.isProtein() ) ||
                    ( r1.isCg() && !r2.isCg() ) ||
                    ( r1.hasNucleicBackbone() && !r2.hasNucleicBackbone() ) ){

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

        if( residues[ i ].isProtein() ||
            residues[ i ].isCg() || 
            residues[ i ].hasNucleicBackbone() ){
            
            callback( scope.getFiber( i, j, padded ) );

        }

    }

};

NGL.AtomSet.prototype.apply( NGL.Chain.prototype );


NGL.Fiber = function( residues, structure ){

    this.structure = structure;

    this.residues = residues;
    this.residueCount = residues.length;

    if( this.isProtein() ){

        this.traceAtomname = "CA";
        this.directionAtomname1 = "C";
        this.directionAtomname2 = [ "O", "OC1", "O1" ];

    }else if( this.isNucleic() ){

        this.traceAtomname = "P";
        this.directionAtomname1 = [ "OP1", "O1P" ];
        this.directionAtomname2 = [ "OP2", "O2P" ];

    }else if( this.isCg() ){

        this.traceAtomname = "CA";
        this.directionAtomname1 = "CA";
        this.directionAtomname2 = "CA";

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

    isCg: function(){

        if( this._cg === undefined ){

            this._cg = this.residues[ 0 ].isCg();

        }

        return this._cg;

    },

    isNucleic: function(){

        if( this._nucleic === undefined ){

            this._nucleic = this.residues[ 0 ].isNucleic();

        }

        return this._nucleic;

    },

    getType: NGL.Chain.prototype.getType

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

        var i;
        var n = this.atomCount;
        var atoms = this.atoms;

        for( i = 0; i < n; ++i ){

            atoms[ i ].ss = value;

        }

    },

    isProtein: function(){

        if( this._protein === undefined ){

            this._protein = this.getAtomByName( "CA" ) !== undefined &&
                this.getAtomByName( "C" ) !== undefined &&
                this.getAtomByName( "N" ) !== undefined &&
                this.getAtomByName([ "O", "OC1", "O1" ]) !== undefined;

        }

        return this._protein;

    },

    isCg: function(){

        var AA3 = Object.keys( NGL.AA1 );

        return function(){

            if( this._cg === undefined ){

                this._cg = !this.isProtein() && this.getAtomByName( "CA" ) &&
                    AA3.indexOf( this.resname ) !== -1;

            }

            return this._cg;

        }

    }(),

    isNucleic: function(){

        var bases = [
            "A", "C", "T", "G", "U",
            "DA", "DC", "DT", "DG", "DU"
        ];

        return function(){

            if( this._nucleic === undefined ){

                this._nucleic = ( this.getAtomByName( "P" ) !== undefined
                        || bases.indexOf( this.resname ) !== -1
                    ) &&
                    this.getAtomByName([ "O3'", "O3*" ]) !== undefined;

            }

            return this._nucleic;

        }

    }(),

    hasNucleicBackbone: function(){

        if( this._nucleicBackbone === undefined ){

            this._nucleicBackbone = this.isNucleic() &&
                this.getAtomByName( "P" ) !== undefined;

        }

        return this._nucleicBackbone;

    },

    isHetero: function(){

        if( this._hetero === undefined ){

            this._hetero = this.atoms.length && this.atoms[0].hetero;

        }

        return this._hetero;

    },

    isWater: function(){

        var water = [ "SOL", "WAT", "HOH", "H2O" ];

        return function(){

            if( this._water === undefined ){

                this._water = water.indexOf( this.resname ) !== -1;

            }

            return this._water;

        }

    }(),

    getResname1: function(){

        return NGL.AA1[ this.resname.toUpperCase() ] || '';

    },

    getType: function(){

        if( this._type === undefined ){

            if( this.isProtein() ){
                this._type = NGL.ProteinType;
            }else if( this.hasNucleicBackbone() ){
                this._type = NGL.NucleicBackboneType;
            }else if( this.isNucleic() ){
                this._type = NGL.NucleicType;
            }else if( this.isCg() ){
                this._type = NGL.CgType;
            }else if( this.isWater() ){
                this._type = NGL.WaterType;
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

        var i, a;
        var n = this.atomCount;

        if( selection ){

            var test = selection.test;

            for( i = 0; i < n; ++i ){

                a = this.atoms[ i ];
                if( test( a ) ) callback( a );

            }

        }else{

            for( i = 0; i < n; ++i ){

                callback( this.atoms[ i ] );

            }

        }

    },

    getAtomByName: function( atomname ){

        var i, a;
        var atom = undefined;
        var n = this.atomCount;

        if( Array.isArray( atomname ) ){

            for( i = 0; i < n; ++i ){

                a = this.atoms[ i ];
                
                if( atomname.indexOf( a.atomname ) !== -1 ){

                    atom = a;
                    break

                }

            }

        }else{

            for( i = 0; i < n; ++i ){

                a = this.atoms[ i ];
                
                if( atomname === a.atomname ){

                    atom = a;
                    break

                }

            }

        }

        return atom;

    },

    getBackboneAtomStart: function(){

        if( this.isProtein() ){

            return this.getAtomByName( 'C' );

        }else if( this.hasNucleicBackbone() ){

            return this.getAtomByName([ "O3'", "O3*" ]);

        }else if( this.isCg() ){

            return this.getAtomByName( 'CA' );

        }

    },

    getBackboneAtomEnd: function(){

        if( this.isProtein() ){

            return this.getAtomByName( 'N' );

        }else if( this.hasNucleicBackbone() ){

            return this.getAtomByName( 'P' );

        }else if( this.isCg() ){

            return this.getAtomByName( 'CA' );

        }

    },

    connectedTo: function( rNext ){

        return this.getBackboneAtomStart().connectedTo(
            rNext.getBackboneAtomEnd()
        );

    }

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
    vdw: undefined,
    covalent: undefined,
    hetero: undefined,
    bfactor: undefined,
    bonds: undefined,
    altloc: undefined,
    atomname: undefined,
    modelindex: undefined,

    connectedTo: function( atom ){

        if( this.hetero && atom.hetero ) return false;

        var distSquared = ( this.x - atom.x ) * ( this.x - atom.x ) +
                          ( this.y - atom.y ) * ( this.y - atom.y ) +
                          ( this.z - atom.z ) * ( this.z - atom.z );

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


NGL.StructureSubset = function( structure, sele ){

    NGL.Structure.call( this, structure.name + " [subset]" );

    this.structure = structure;
    this.selection = new NGL.Selection( sele );

    this.bondSet = new NGL.BondSet();

    this._build();

};

NGL.StructureSubset.prototype = Object.create( NGL.Structure.prototype );

NGL.StructureSubset.prototype._build = function(){

    console.time( "NGL.StructureSubset._build" );

    var structure = this.structure;
    var selection = this.selection;
    var bondSet = this.bondSet;

    var _s = this;
    var _m, _c, _r, _a;

    var atomIndexDict = {};

    structure.eachModel( function( m ){

        _m = _s.addModel();

        m.eachChain( function( c ){
            
            _c = _m.addChain();
            _c.chainname = c.chainname;

            c.eachResidue( function( r ){

                _r = _c.addResidue();
                _r.resno = r.resno;
                _r.resname = r.resname;

                r.eachAtom( function( a ){

                    _a = _r.addAtom();
                    _a.atomno = a.atomno;
                    _a.resname = a.resname;
                    _a.x = a.x;
                    _a.y = a.y;
                    _a.z = a.z;
                    _a.element = a.element;
                    _a.chainname = a.chainname;
                    _a.chainindex = a.chainindex;
                    _a.resno = a.resno;
                    _a.resindex = a.resindex;
                    _a.serial = a.serial;
                    _a.ss = a.ss;
                    _a.vdw = a.vdw;
                    _a.covalent = a.covalent;
                    _a.hetero = a.hetero;
                    _a.bfactor = a.bfactor;
                    _a.bonds = [];
                    _a.altloc = a.altloc;
                    _a.atomname = a.atomname;
                    _a.modelindex = a.modelindex;

                    atomIndexDict[ a.index ] = _a;

                }, selection );

                if( _r.atoms.length === 0 ){
                    _c.residues.pop();
                    --_c.residueCount;
                    --_m.residueCount;
                    --_s.residueCount;
                }

            }, selection );

            if( _c.residues.length === 0 ){
                _m.chains.pop();
                --_m.chainCount;
                --_s.chainCount;
            }

        }, selection );

        if( _m.chains.length === 0 ){
            _s.models.pop();
            --_s.modelCount;
        }

    }, selection );

    structure.bondSet.eachBond( function( b ){

        _s.bondSet.addBond(
            atomIndexDict[ b.atom1.index ],
            atomIndexDict[ b.atom2.index ]
        );

    }, selection );

    _s.center = _s.atomCenter();

    console.timeEnd( "NGL.StructureSubset._build" );

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
NGL.PdbStructure.prototype._parse = function( str, callback ){

    console.time( "NGL.PdbStructure.parse" );

    var scope = this;

    var atoms = this.atoms;
    var bondSet = this.bondSet;

    this.title = '';
    this.id = '';
    this.sheet = [];
    this.helix = [];

    var lines = str.split( "\n" );

    var guessElem = NGL.guessElement;
    var covRadii = NGL.CovalentRadii;
    var vdwRadii = NGL.VdwRadii;

    var i, j;
    var line, recordName;
    var altloc, serial, elem, chainname, resno, resname, atomname, element;

    var m = this.addModel();
    var c = m.addChain();
    var r = c.addResidue();

    var chainDict = {};
    var serialDict = {};

    var id = this.id;
    var title = this.title;
    var sheet = this.sheet;
    var helix = this.helix;

    var a, currentChainname, currentResno;

    var n = lines.length;

    var _i = 0;
    var _step = 10000;
    var _n = Math.min( _step, n );

    function _chunked(){

        for( i = _i; i < _n; i++ ){

            line = lines[i];
            recordName = line.substr( 0, 6 );

            if( recordName === 'ATOM  ' || recordName === 'HETATM' ){

                altloc = line[ 16 ];
                if( altloc !== ' ' && altloc !== 'A' ) continue; // FIXME: ad hoc

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
                a.hetero = ( line[ 0 ] === 'H' ) ? true : false;
                a.chainname = chainname;
                a.resno = resno;
                a.serial = serial;
                a.atomname = atomname;
                a.bonds = [];
                a.ss = 'c';
                a.bfactor = parseFloat( line.substr( 60, 8 ) );
                a.altloc = altloc;
                a.vdw = vdwRadii[ element ];
                a.covalent = covRadii[ element ];

                currentChainname = chainname;
                currentResno = resno;

                atoms.push( a );

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
                helix.push([ startChain, startResi, endChain, endResi ]);

            }else if( recordName == 'SHEET ' ){

                var startChain = line[ 21 ];
                var startResi = parseInt( line.substr( 22, 4 ) );
                var endChain = line[ 32 ];
                var endResi = parseInt( line.substr( 33, 4 ) );
                sheet.push([ startChain, startResi, endChain, endResi ]);

            }else if( recordName == 'HEADER' ){

                id = line.substr( 62, 4 );

            }else if( recordName == 'TITLE ' ){

                title += line.substr( 10, 70 ) + "\n";

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

        }

        if( _n === n ){

            console.timeEnd( "NGL.PdbStructure.parse" );

            _postProcess();
            callback( scope );

        }else{

            _i += _step;
            _n = Math.min( _n + _step, n );

            setTimeout( _chunked );

        }

    }

    function _postProcess(){

        // assign secondary structures

        console.time( "NGL.PdbStructure.parse ss" );

        for( j = 0; j < sheet.length; j++ ){

            var selection = new NGL.Selection(
                sheet[j][1] + "-" + sheet[j][3] + ":" + sheet[j][0]
            );

            scope.eachResidue( function( r ){

                r.ss = "s";

            }, selection );

        }

        for( j = 0; j < helix.length; j++ ){

            var selection = new NGL.Selection(
                helix[j][1] + "-" + helix[j][3] + ":" + helix[j][0]
            );

            scope.eachResidue( function( r ){

                r.ss = "h";

            }, selection );

        }

        console.timeEnd( "NGL.PdbStructure.parse ss" );

        if( sheet.length === 0 && helix.length === 0 ){
            scope._doAutoSS = true;
        }

        // check for chain names

        var _doAutoChainName = true;
        scope.eachChain( function( c ){
            if( c.chainname && c.chainname !== " " ) _doAutoChainName = false;
        } );
        scope._doAutoChainName = _doAutoChainName;

    }

    setTimeout( _chunked );

};


/**
 * An object fro representing a GRO file.
 * @class
 */
NGL.GroStructure = function( name, path, callback ){

    this._doAutoSS = true;
    this._doAutoChainName = true;

    NGL.Structure.call( this, name, path, callback );

};

NGL.GroStructure.prototype = Object.create( NGL.Structure.prototype );

NGL.GroStructure.prototype._parse = function( str, callback ){

    console.time( "NGL.GroStructure.parse" );

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

            a.vdw = vdwRadii[ element ];
            a.covalent = covRadii[ element ];

            currentResno = resno;

            atoms.push( a );

        }

        if( _n === n ){

            console.timeEnd( "NGL.GroStructure.parse" );
            callback( scope );

        }else{

            _i += _step;
            _n = Math.min( _n + _step, n );

            setTimeout( _chunked );

        }

    }

    setTimeout( _chunked );

};


///////////
// Worker

onmessage = function( event ){

    var pdbStructure = new NGL.PdbStructure();
    
    pdbStructure._parse( event.data );

    postMessage( pdbStructure );
    // postMessage( "moin" );
    
};


//////////////
// Selection

NGL.Selection = function( string ){

    var SIGNALS = signals;

    this.signals = {

        stringChanged: new SIGNALS.Signal(),

    };

    this.setString( string );

};


NGL.Selection.prototype = {

    constructor: NGL.Selection,

    setString: function( string ){

        string = string || "";

        if( string === this.string ){
            return;
        }

        try{

            this.parse( string );

        }catch( e ){

            // console.error( e.stack );
            this.selection = { "error": e.message };

        }

        this.string = string;

        this.test = this.makeAtomTest();
        this.residueTest = this.makeResidueTest();
        this.chainTest = this.makeChainTest();
        this.modelTest = this.makeModelTest();

        this.signals.stringChanged.dispatch( string );

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

        // console.log( string, chunks )

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
                
                // console.log( "(" );

                not = false;
                createNewContext();
                continue;

            }else if( c === ")" ){
                
                // console.log( ")" );

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

                // console.log( "AND" );

                if( selection.operator === "OR" ){
                    var lastRule = selection.rules.pop();
                    createNewContext( "AND" );
                    pushRule( lastRule );
                }else{
                    selection.operator = "AND";
                }
                continue;

            }else if( c.toUpperCase() === "OR" ){

                // console.log( "OR" );

                if( selection.operator === "AND" ){
                    getPrevContext( "OR" );
                }else{
                    selection.operator = "OR";
                }
                continue;

            }else if( c.toUpperCase() === "NOT" ){

                // console.log( "NOT", j );

                not = 1;
                createNewContext();
                selection.negate = true;
                continue;

            }else{

                // console.log( "chunk", c, j, selection );

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

            if( c.toUpperCase() === "HYDROGEN" ){
                sele.element = "H";
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
                sele = {
                    operator: undefined,
                    negate: true,
                    rules: [
                        { keyword: "BACKBONE" }
                    ]
                };
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
                        {
                            operator: undefined,
                            negate: true,
                            rules: [
                                { keyword: "BACKBONE" }
                            ]
                        },
                        { atomname: "CA" }
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

            if( c.charAt( 0 ) === "#" ){
                sele.element = c.substr( 1 ).toUpperCase();
                pushRule( sele );
                continue;
            }

            if( ( c.length >= 2 && c.length <= 4 ) &&
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
                if( chain[1].length > 1 ){
                    throw new Error( "chain identifier must be one character" );
                }
                sele.rules.push( {
                    chainname: chain[1][0]
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
        if( selection.error ) return function(){ return true; }
        
        var n = selection.rules.length;
        if( n === 0 ) return function(){ return true; }

        var t = selection.negate ? false : true;
        var f = selection.negate ? true : false;

        var i, s, and, ret;

        var subTests = [];

        for( i=0; i<n; ++i ){

            s = selection.rules[ i ];

            if( s.hasOwnProperty( "operator" ) ){

                subTests[ i ] = this._makeTest( fn, s );

            }

        }

        return function( entity ){

            and = selection.operator === "AND";

            for( i=0; i<n; ++i ){

                s = selection.rules[ i ];

                if( s.hasOwnProperty( "operator" ) ){

                    ret = subTests[ i ]( entity );

                    if( ret === -1 ){

                        return -1;

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

                        return -1;

                    }else if( ret === true){

                        if( and ){ continue; }else{ return t; }

                    }else{

                        if( and ){ return f; }else{ continue; }

                    }

                }

            }

            if( and ){ return t; }else{ return f; }

        }

    },

    makeAtomTest: function(){

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
            "CA"
        ];

        var fn = function( a, s ){

            // returning -1 means the rule is not applicable

            if( s.keyword!==undefined ){

                if( s.keyword==="HETERO" && a.hetero===true ) return true;
                if( s.keyword==="PROTEIN" && a.residue.isProtein() ) return true;
                if( s.keyword==="NUCLEIC" && a.residue.isNucleic() ) return true;
                if( s.keyword==="WATER" && a.residue.isWater() ) return true;
                if( s.keyword==="HELIX" && a.ss==="h" ) return true;
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

                return false;

            }

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

            return true;

        }

        return this._makeTest( fn );

    },

    makeResidueTest: function(){

        var fn = function( r, s ){

            // returning -1 means the rule is not applicable

            if( s.keyword!==undefined ){

                if( s.keyword==="HETERO" && r.isHetero() ) return true;
                if( s.keyword==="PROTEIN" && r.isProtein() ) return true;
                if( s.keyword==="NUCLEIC" && r.isNucleic() ) return true;
                if( s.keyword==="WATER" && r.isWater() ) return true;

            }

            if( s.chainname===undefined && s.model===undefined &&
                    s.resname===undefined && s.resno===undefined
            ) return -1;
            if( s.chainname!==undefined && r.chain.chainname===undefined ) return -1;

            // support autoChainNames which work only on atoms
            if( s.chainname!==" " && r.chain.chainname===" " ) return -1;

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

        return this._makeTest( fn );

    },

    makeChainTest: function(){

        var fn = function( c, s ){

            // returning -1 means the rule is not applicable

            if( s.chainname!==undefined && c.chainname===undefined ) return -1;
            if( s.chainname===undefined && s.model===undefined ) return -1;

            // support autoChainNames which work only on atoms
            if( s.chainname!==" " && c.chainname===" " ) return -1;

            if( s.chainname!==undefined && s.chainname!==c.chainname ) return false;
            if( s.model!==undefined && s.model!==c.model.index ) return false;

            return true;

        }

        return this._makeTest( fn );

    },

    makeModelTest: function(){

        var fn = function( m, s ){

            // returning -1 means the rule is not applicable

            if( s.model===undefined ) return -1;
            if( s.model!==m.index ) return false;

            return true;

        }

        return this._makeTest( fn );

    }

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

        // console.log( "superpose alignment score", ali.score );

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


////////////
// Surface

NGL.Surface = function( object, name, path ){

    this.name = name;
    this.path = path;

    if( object instanceof THREE.Geometry ){

        geo = object;

        // TODO check if needed
        geo.computeFaceNormals( true );
        geo.computeVertexNormals( true );

    }else{

        geo = object.children[0].geometry;

    }

    geo.computeBoundingSphere();

    this.center = new THREE.Vector3().copy( geo.boundingSphere.center );

    var position = NGL.Utils.positionFromGeometry( geo );
    var color = NGL.Utils.colorFromGeometry( geo );
    var index = NGL.Utils.indexFromGeometry( geo );
    var normal = NGL.Utils.normalFromGeometry( geo );

    this.buffer = new NGL.MeshBuffer( position, color, index, normal );

}

NGL.Surface.prototype = {

    setVisibility: function( value ){

        this.buffer.mesh.visible = value;

    }

}


///////////
// Script

NGL.Script = function( str, name, path ){

    this.name = name;
    this.path = path;
    this.dir = path.substring( 0, path.lastIndexOf( '/' ) + 1 );

    try {

        this.fn = new Function(
            'stage', 'finish',
            '__name__', '__path__', '__dir__',
            str
        );

    }catch( e ){

        console.log( "NGL.Script compilation failed", e );
        this.fn = null;

    }

}

NGL.Script.prototype = {

    call: function( stage, onFinish ){

        if( this.fn ){

            if( typeof onFinish !== "function" ){

                onFinish = function(){};

            }

            this.fn( stage, onFinish, this.name, this.path, this.dir );

        }else{

            console.log( "NGL.Script.call no function available" );

        }

    }

}
