/**
 * @file Structure
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


// FIXME remove every trace of NGL.Viewer and GUI

// rename residue to group
// eachPolymer


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

    atomColor: function( selection ){

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

            c = elemColors[ a.element ];
            if( !c ) c = 0xCCCCCC;

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

        if( selection ){

            var test = selection.test;

            this.atoms.forEach( function( a ){

                if( test( a ) ){

                    a.bonds.forEach( function( b ){

                        if( b.atom1 === a && test( b.atom2 ) ){

                            callback( b );

                        }else if( b.atom2 === a && test( b.atom2 ) ){

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

    bondColor: function( selection, fromTo ){

        var i = 0;
        var color = [];

        var c;
        var elemColors = NGL.ElementColors;

        this.eachBond( function( b ){

            if( fromTo ){

                c = elemColors[ b.atom1.element ];
                if( !c ) c = 0xCCCCCC;

            }else{

                c = elemColors[ b.atom2.element ];
                if( !c ) c = 0xCCCCCC;

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

    },

    getColor: function(){

        console.warn( "AtomSet.getColor - To be removed" );

        var na = this.size;
        var atoms = this.atoms;
        var color = new Float32Array( this.size * 3 );

        var a, c, j;
        var elemColors = NGL.ElementColors;

        for( var i = 0; i < na; ++i ){

            a = atoms[ i ];

            j = i * 3;

            c = elemColors[ a.element ];
            if( !c ) c = 0xCCCCCC;

            color[ j + 0 ] = ( c >> 16 & 255 ) / 255;
            color[ j + 1 ] = ( c >> 8 & 255 ) / 255;
            color[ j + 2 ] = ( c & 255 ) / 255;

        }

        return color;

    },

    getRadius: function( size, scale ){

        console.warn( "AtomSet.getRadius - To be removed" );

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
                r = vdwRadii[ a.element ];
                radius[ i ] = ( r ? r : 1.5 ) * scale;
            }

        }

        return radius;

    }

};


NGL.BondSet = function(){

    this.bonds = [];
    this.bondDict = Object.create( null );

};

NGL.BondSet.prototype = {

    constructor: NGL.BondSet,

    addBond: function( atom1, atom2 ){

        var bonds = this.bonds;
        var bondDict = this.bondDict;

        var b = new NGL.Bond( atom1, atom2 );
        var qn = b.qualifiedName();

        if( bondDict[ qn ] ){

            console.log( "bond already known" );

        }else{

            atom1.bonds.push( b );
            atom2.bonds.push( b );
            bonds.push( b );
            bondDict[ qn ] = b;

        }

    },

    addBondIfConnected: function( atom1, atom2 ){

        if( atom1.connectedTo( atom2 ) ){

            this.addBond( atom1, atom2 );

        }

    }

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


//////////////
// Structure

NGL.Structure = function( name, viewer ){

    this.name = name;
    this.viewer = viewer;

    this.reprList = [];

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

        this.center = this.atomCenter();

        // console.log( this );

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

    eachFiber: function( callback ){

        this.models.forEach( function( m ){
            m.eachFiber( callback );
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

    centerView: function(){

        var t = new THREE.Vector3();

        return function(){

            t.copy( this.center ).multiplyScalar( -1 );

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
        this.gui.add( this, 'centerView' );
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

    eachFiber: function( callback ){

        this.chains.forEach( function( c ){
            c.eachFiber( callback );
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

    eachFiber: function( callback ){

        var i = 0;
        var j = 1;
        var residues = this.residues;
        var a1, a2;

        this.eachResidueN( 2, function( r1, r2 ){

            // console.log( r1.resno, r2.resno, r1.isProtein() );

            if( r1.isProtein() ){

                a1 = r1.getAtomByName( 'C' );
                a2 = r2.getAtomByName( 'N' );

            }else if( r1.isNucleic() ){

                a1 = r1.getAtomByName( "O3'" );
                a2 = r2.getAtomByName( 'P' );

            }else{

                i = j;
                ++j;

                return;

            }

            if( !a1 || !a2 || !a1.connectedTo( a2 ) ){
                
                callback( new NGL.Fiber( residues.slice( i, j ) ) );
                i = j;
                
            }

            ++j;

        } );

        if( residues[ i ].isProtein() || residues[ i ].isNucleic() ){

            // console.log( i, j, residues[ i ].isProtein() );
            
            callback( new NGL.Fiber( residues.slice( i, j ) ) );

        }

    }

};

NGL.AtomSet.prototype.apply( NGL.Chain.prototype );


NGL.Fiber = function( residues ){

    this.residues = residues;
    this.residueCount = residues.length;

    var r = residues[ 0 ];

    if( r.isProtein() ){

        this.atomname = "CA";

    }else if( r.isNucleic() ){

        this.atomname = "P";

    }

};

NGL.Fiber.prototype = {

    eachAtom: NGL.Chain.prototype.eachAtom,

    eachResidue: NGL.Chain.prototype.eachResidue,

    eachResidueN: NGL.Chain.prototype.eachResidueN

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

    connectedTo: function( atom ){

        if( this.hetero && atom.hetero ) return 0;

        var distSquared = ( this.x - atom.x ) * ( this.x - atom.x ) +
                          ( this.y - atom.y ) * ( this.y - atom.y ) +
                          ( this.z - atom.z ) * ( this.z - atom.z );

        if( isNaN( distSquared ) ) return 0;
        if( distSquared < 0.5 ) return 0; // duplicate or altloc

        var d = this.covalent + atom.covalent + 0.3;
        return distSquared < ( d * d );

    }

}


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

    console.timeEnd( "NGL.PdbStructure.parse" );

};


/**
 * An object fro representing a GRO file.
 * @class
 */
NGL.GroStructure = function( name, viewer ){

    NGL.Structure.call( this, name, viewer );

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

                sele.resname = c.toUpperCase();
                selection.push( sele );
                continue;
            }

            atomname = c.split(".");
            if( atomname.length>1 && atomname[1] ){
                if( atomname[1].length>4 ){
                    console.error( "atomname must be one to four characters" );
                    continue;
                }
                sele.atomname = atomname[1].substring( 0, 4 ).toUpperCase();
            }

            chain = atomname[0].split(":");
            if( chain.length>1 && chain[1] ){
                if( chain[1].length>1 ){
                    console.error( "chain identifier must be one character" );
                    continue;
                }
                sele.chainname = chain[1][0].toUpperCase();
            }

            if( chain[0] ){
                resi = chain[0].split("-");
                if( resi.length===1 ){
                    sele.resno = parseInt( resi[0] );
                }else if( resi.length===2 ){
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

                if( typeof s === "string" ){

                    if( s==="ALL" ) return t;
                    if( s==="HETERO" && a.hetero===true ) return t;

                    return f;

                }

                if( s.resname!==undefined && s.resname!==a.resname ) continue;
                if( s.chainname!==undefined && s.chainname!==a.chainname ) continue;
                if( s.atomname!==undefined && s.atomname!==a.atomname ) continue;

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
