/**
 * @file Color Maker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Color, Vector3 } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import Selection from "../selection.js";
import { generateUUID } from "../math/math-utils.js";

import {
    PolymerEntity, NonPolymerEntity, MacrolideEntity, WaterEntity,
    WaterType, IonType, ProteinType, RnaType, DnaType, SaccharideType,
    ResidueHydrophobicity, DefaultResidueHydrophobicity
} from "../structure/structure-constants.js";

import chroma from "../../lib/chroma.es6.js";
// import Signal from "../../lib/signals.es6.js";


// from Jmol http://jmol.sourceforge.net/jscolors/ (or 0xFFFFFF)
var ElementColors = {
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

    "D": 0xFFFFC0, "T": 0xFFFFA0
};
var DefaultElementColor = 0xFFFFFF;


// from Jmol http://jmol.sourceforge.net/jscolors/ (protein + shapely for nucleic)
var ResidueColors = {
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
    "ASH": 0xFF00FF,
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
    "DU": 0xFF8080
};
var DefaultResidueColor = 0xFF00FF;

// from Jmol http://jmol.sourceforge.net/jscolors/ (shapely)
var StructureColors = {
    "alphaHelix": 0xFF0080,
    "threeTenHelix": 0xA00080,
    "piHelix": 0x600080,
    "betaStrand": 0xFFC800,
    "betaTurn": 0x6080FF,
    "coil": 0xFFFFFF,

    "dna": 0xAE00FE,
    "rna": 0xFD0162,

    "carbohydrate": 0xA6A6FA
};
var DefaultStructureColor = 0x808080;


function ColorMakerRegistry(){

}

ColorMakerRegistry.prototype = {

    signals: {

        // typesChanged: new Signal(),

    },

    scales: {

        "": "",

        // Sequential
        "OrRd": "[S] Orange-Red",
        "PuBu": "[S] Purple-Blue",
        "BuPu": "[S] Blue-Purple",
        "Oranges": "[S] Oranges",
        "BuGn": "[S] Blue-Green",
        "YlOrBr": "[S] Yellow-Orange-Brown",
        "YlGn": "[S] Yellow-Green",
        "Reds": "[S] Reds",
        "RdPu": "[S] Red-Purple",
        "Greens": "[S] Greens",
        "YlGnBu": "[S] Yellow-Green-Blue",
        "Purples": "[S] Purples",
        "GnBu": "[S] Green-Blue",
        "Greys": "[S] Greys",
        "YlOrRd": "[S] Yellow-Orange-Red",
        "PuRd": "[S] Purple-Red",
        "Blues": "[S] Blues",
        "PuBuGn": "[S] Purple-Blue-Green",

        // Diverging
        "Spectral": "[D] Spectral",
        "RdYlGn": "[D] Red-Yellow-Green",
        "RdBu": "[D] Red-Blue",
        "PiYG": "[D] Pink-Yellowgreen",
        "PRGn": "[D] Purplered-Green",
        "RdYlBu": "[D] Red-Yellow-Blue",
        "BrBG": "[D] Brown-Bluegreen",
        "RdGy": "[D] Red-Grey",
        "PuOr": "[D] Purple-Orange",

        // Qualitative
        "Set1": "[Q] Set1",
        "Set2": "[Q] Set2",
        "Set3": "[Q] Set3",
        "Dark2": "[Q] Dark2",
        "Paired": "[Q] Paired",
        "Pastel1": "[Q] Pastel1",
        "Pastel2": "[Q] Pastel2",
        "Accent": "[Q] Accent",

        // Other
        "roygb": "[?] Rainbow",
        "rwb": "[?] Red-White-Blue",

    },

    modes: {

        "": "",

        "rgb": "Red Green Blue",
        "hsv": "Hue Saturation Value",
        "hsl": "Hue Saturation Lightness",
        "hsi": "Hue Saturation Intensity",
        "lab": "CIE L*a*b*",
        "hcl": "Hue Chroma Lightness"

    },

    userSchemes: {},

    getScheme: function( params ){

        var p = params || {};

        var id = p.scheme || "";

        var schemeClass;

        if( id in ColorMakerRegistry.types ){

            schemeClass = ColorMakerRegistry.types[ id ];

        }else if( id in this.userSchemes ){

            schemeClass = this.userSchemes[ id ];

        }else{

            schemeClass = ColorMaker;

        }

        return new schemeClass( params );

    },

    getPickingScheme: function( params ){

        var p = Object.assign( params || {} );
        p.scheme = "picking";

        return this.getScheme( p );

    },

    getTypes: function(){

        var types = {};

        Object.keys( ColorMakerRegistry.types ).forEach( function( k ){
            types[ k ] = k;
        } );

        Object.keys( this.userSchemes ).forEach( function( k ){
            types[ k ] = k.split( "|" )[ 1 ];
        } );

        return types;

    },

    getScales: function(){

        return this.scales;

    },

    getModes: function(){

        return this.modes;

    },

    addScheme: function( scheme, label ){

        if( !( scheme instanceof ColorMaker ) ){

            scheme = this.createScheme( scheme, label );

        }

        label = label || "";
        var id = "" + generateUUID() + "|" + label;

        this.userSchemes[ id ] = scheme;
        // this.signals.typesChanged.dispatch();

        return id;

    },

    removeScheme: function( id ){

        delete this.userSchemes[ id ];
        // this.signals.typesChanged.dispatch();

    },

    createScheme: function( constructor, label ){

        var _ColorMaker = function( params ){

            ColorMaker.call( this, params );

            this.label = label || "";

            constructor.call( this, params );

        };

        _ColorMaker.prototype = ColorMaker.prototype;

        _ColorMaker.prototype.constructor = ColorMaker;

        return _ColorMaker;

    },

    addSelectionScheme: function( pairList, label ){

        return this.addScheme( function(){

            var colorList = [];
            var selectionList = [];

            pairList.forEach( function( pair ){

                colorList.push( new Color( pair[ 0 ] ).getHex() );
                selectionList.push( new Selection( pair[ 1 ] ) );

            } );

            var n = pairList.length;

            this.atomColor = function( a ){

                for( var i = 0; i < n; ++i ){

                    if( selectionList[ i ].test( a ) ){

                        return colorList[ i ];

                    }

                }

                return 0xFFFFFF;

            };

        }, label );

    }

};


function ColorMaker( params ){

    var p = params || {};

    this.scale = defaults( p.scale, "uniform" );
    this.mode = defaults( p.mode, "hcl" );
    this.domain = defaults( p.domain, [ 0, 1 ] );
    this.value = new Color( defaults( p.value, 0xFFFFFF ) ).getHex();

    this.structure = p.structure;
    this.volume = p.volume;
    this.surface = p.surface;
    this.gidPool = p.gidPool;

    if( this.structure ){
        this.atomProxy = this.structure.getAtomProxy();
    }

}

ColorMaker.prototype = {

    constructor: ColorMaker,

    getScale: function( params ){

        var p = params || {};

        var scale = defaults( p.scale, this.scale );
        if( scale === "rainbow" || scale === "roygb" ){
            scale = [ "red", "orange", "yellow", "green", "blue" ];
        }else if( scale === "rwb" ){
            scale = [ "red", "white", "blue" ];
        }

        return chroma
            .scale( scale )
            .mode( defaults( p.mode, this.mode ) )
            .domain( defaults( p.domain, this.domain ) )
            .out( "num" );

    },

    colorToArray: function( color, array, offset ){

        if( array === undefined ) array = [];
        if( offset === undefined ) offset = 0;

        array[ offset + 0 ] = ( color >> 16 & 255 ) / 255;
        array[ offset + 1 ] = ( color >> 8 & 255 ) / 255;
        array[ offset + 2 ] = ( color & 255 ) / 255;

        return array;

    },

    atomColor: function(){

        return 0xFFFFFF;

    },

    atomColorToArray: function( a, array, offset ){

        return this.colorToArray(
            this.atomColor( a ), array, offset
        );

    },

    bondColor: function( b, fromTo ){

        this.atomProxy.index = fromTo ? b.atomIndex1 : b.atomIndex2;
        return this.atomColor( this.atomProxy );

    },

    bondColorToArray: function( b, fromTo, array, offset ){

        return this.colorToArray(
            this.bondColor( b, fromTo ), array, offset
        );

    },

    volumeColor: function(){

        return 0xFFFFFF;

    },

    volumeColorToArray: function( i, array, offset ){

        return this.colorToArray(
            this.volumeColor( i ), array, offset
        );

    },

    positionColor: function(){

        return 0xFFFFFF;

    },

    positionColorToArray: function( v, array, offset ){

        return this.colorToArray(
            this.positionColor( v ), array, offset
        );

    }

};


function VolumeColorMaker( params ){

    ColorMaker.call( this, params );

    var valueScale = this.getScale();
    var volume = this.volume;
    var inverseMatrix = volume.inverseMatrix;
    var data = volume.__data;
    var nx = volume.nx;
    var ny = volume.ny;
    var vec = new Vector3();

    this.positionColor = function( v ){

        vec.copy( v );
        vec.applyMatrix4( inverseMatrix );
        vec.round();

        var index = ( ( ( ( vec.z * ny ) + vec.y ) * nx ) + vec.x );

        return valueScale( data[ index ] );

    };

}

VolumeColorMaker.prototype = ColorMaker.prototype;

VolumeColorMaker.prototype.constructor = VolumeColorMaker;


function ValueColorMaker( params ){

    ColorMaker.call( this, params );

    var valueScale = this.getScale();

    this.volumeColor = function( i ){

        return valueScale( this.volume.data[ i ] );

    };

}

ValueColorMaker.prototype = ColorMaker.prototype;

ValueColorMaker.prototype.constructor = ValueColorMaker;


function PickingColorMaker( params ){

    ColorMaker.call( this, params );

    var offset;
    if( this.structure ){
        offset = this.structure.atomStore.count;
        if( params.backbone ){
            offset += this.structure.bondStore.count;
        }else if( params.rung ){
            offset += this.structure.bondStore.count;
            offset += this.structure.backboneBondStore.count;
        }
    }

    if( !this.gidPool ){
        console.warn( "no gidPool" );
        this.gidPool = {
            getGid: function(){ return 0; }
        };
    }

    this.atomColor = function( a ){

        return this.gidPool.getGid( this.structure, a.index );

    };

    this.bondColor = function( b ){

        return this.gidPool.getGid( this.structure, offset + b.index );

    };

    this.volumeColor = function( i ){

        return this.gidPool.getGid( this.volume, i );

    };

}

PickingColorMaker.prototype = ColorMaker.prototype;

PickingColorMaker.prototype.constructor = PickingColorMaker;


function RandomColorMaker( params ){

    ColorMaker.call( this, params );

    this.atomColor = function(){

        return Math.random() * 0xFFFFFF;

    };

}

RandomColorMaker.prototype = ColorMaker.prototype;

RandomColorMaker.prototype.constructor = RandomColorMaker;


function UniformColorMaker( params ){

    ColorMaker.call( this, params );

    var color = this.value;

    this.atomColor = function(){

        return color;

    };

    this.bondColor = function(){

        return color;

    };

    this.valueColor = function(){

        return color;

    };

}

UniformColorMaker.prototype = ColorMaker.prototype;

UniformColorMaker.prototype.constructor = UniformColorMaker;


function AtomindexColorMaker( params ){

    ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "roygb";
    }
    if( !params.domain ){

        var scalePerModel = {};

        this.structure.eachModel( function( mp ){
            this.domain = [ mp.atomOffset, mp.atomEnd ];
            scalePerModel[ mp.index ] = this.getScale();
        }.bind( this ) );

        this.atomColor = function( a ){
            return scalePerModel[ a.modelIndex ]( a.index );
        };

    }else{

        var atomindexScale = this.getScale();

        this.atomColor = function( a ){
            return atomindexScale( a.index );
        };

    }

}

AtomindexColorMaker.prototype = ColorMaker.prototype;

AtomindexColorMaker.prototype.constructor = AtomindexColorMaker;


function ResidueindexColorMaker( params ){

    ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "roygb";
    }
    if( !params.domain ){

        // this.domain = [ 0, this.structure.residueStore.count ];

        var scalePerChain = {};

        this.structure.eachChain( function( cp ){
            this.domain = [ cp.residueOffset, cp.residueEnd ];
            scalePerChain[ cp.index ] = this.getScale();
        }.bind( this ) );

        this.atomColor = function( a ){
            return scalePerChain[ a.chainIndex ]( a.residueIndex );
        };

    }else{

        var residueindexScale = this.getScale();

        this.atomColor = function( a ){
            return residueindexScale( a.residueIndex );
        };

    }

}

ResidueindexColorMaker.prototype = ColorMaker.prototype;

ResidueindexColorMaker.prototype.constructor = ResidueindexColorMaker;


function ChainindexColorMaker( params ){

    ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "Spectral";
    }
    if( !params.domain ){

        var scalePerModel = {};

        this.structure.eachModel( function( mp ){
            this.domain = [ mp.chainOffset, mp.chainEnd ];
            scalePerModel[ mp.index ] = this.getScale();
        }.bind( this ) );

        this.atomColor = function( a ){
            return scalePerModel[ a.modelIndex ]( a.chainIndex );
        };

    }else{

        var chainindexScale = this.getScale();

        this.atomColor = function( a ){
            return chainindexScale( a.chainIndex );
        };

    }

}

ChainindexColorMaker.prototype = ColorMaker.prototype;

ChainindexColorMaker.prototype.constructor = ChainindexColorMaker;


function ChainnameColorMaker( params ){

    ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "Spectral";
    }

    var chainnameDictPerModel = {};
    var scalePerModel = {};

    this.structure.eachModel( function( mp ){
        var i = 0;
        var chainnameDict = {};
        mp.eachChain( function( cp ){
            if( chainnameDict[ cp.chainname ] === undefined ){
                chainnameDict[ cp.chainname ] = i;
                i += 1;
            }
        } );
        this.domain = [ 0, i - 1 ];
        chainnameDictPerModel[ mp.index ] = chainnameDict;
        scalePerModel[ mp.index ] = this.getScale();
    }.bind( this ) );

    this.atomColor = function( a ){
        var chainnameDict = chainnameDictPerModel[ a.modelIndex ];
        return scalePerModel[ a.modelIndex ]( chainnameDict[ a.chainname ] );
    };

}

ChainnameColorMaker.prototype = ColorMaker.prototype;

ChainnameColorMaker.prototype.constructor = ChainnameColorMaker;


function ChainidColorMaker( params ){

    ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "Spectral";
    }

    var chainidDictPerModel = {};
    var scalePerModel = {};

    this.structure.eachModel( function( mp ){
        var i = 0;
        var chainidDict = {};
        mp.eachChain( function( cp ){
            if( chainidDict[ cp.chainid ] === undefined ){
                chainidDict[ cp.chainid ] = i;
                i += 1;
            }
        } );
        this.domain = [ 0, i - 1 ];
        chainidDictPerModel[ mp.index ] = chainidDict;
        scalePerModel[ mp.index ] = this.getScale();
    }.bind( this ) );

    this.atomColor = function( a ){
        var chainidDict = chainidDictPerModel[ a.modelIndex ];
        return scalePerModel[ a.modelIndex ]( chainidDict[ a.chainid ] );
    };

}

ChainidColorMaker.prototype = ColorMaker.prototype;

ChainidColorMaker.prototype.constructor = ChainidColorMaker;


function EntityindexColorMaker( params ){

    ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "Spectral";
    }
    if( !params.domain ){
        this.domain = [ 0, this.structure.entityList.length - 1 ];
    }
    var entityindexScale = this.getScale();

    this.atomColor = function( a ){
        return entityindexScale( a.entityIndex );
    };

}

EntityindexColorMaker.prototype = ColorMaker.prototype;

EntityindexColorMaker.prototype.constructor = EntityindexColorMaker;


function ModelindexColorMaker( params ){

    ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "roygb";
    }
    if( !params.domain ){
        this.domain = [ 0, this.structure.modelStore.count ];
    }
    var modelindexScale = this.getScale();

    this.atomColor = function( a ){
        return modelindexScale( a.modelIndex );
    };

}

ModelindexColorMaker.prototype = ColorMaker.prototype;

ModelindexColorMaker.prototype.constructor = ModelindexColorMaker;


function EntityTypeColorMaker( params ){

    ColorMaker.call( this, params );

    this.atomColor = function( a ){
        var e = a.entity;
        var et = e ? e.entityType : undefined;
        switch( et ){
            case PolymerEntity:
                return 0x7fc97f;
            case NonPolymerEntity:
                return 0xfdc086;
            case MacrolideEntity:
                return 0xbeaed4;
            case WaterEntity:
                return 0x386cb0;
            default:
                return 0xffff99;
        }
    };

}

EntityTypeColorMaker.prototype = ColorMaker.prototype;

EntityTypeColorMaker.prototype.constructor = EntityTypeColorMaker;


function MoleculeTypeColorMaker( params ){

    ColorMaker.call( this, params );

    this.atomColor = function( a ){
        switch( a.residueType.moleculeType ){
            case WaterType:
                return 0x386cb0;
            case IonType:
                return 0xf0027f;
            case ProteinType:
                return 0xbeaed4;
            case RnaType:
                return 0xfdc086;
            case DnaType:
                return 0xbf5b17;
            case SaccharideType:
                return 0x7fc97f
            default:
                return 0xffff99;
        }
    };

}

MoleculeTypeColorMaker.prototype = ColorMaker.prototype;

MoleculeTypeColorMaker.prototype.constructor = MoleculeTypeColorMaker;


function SstrucColorMaker( params ){

    ColorMaker.call( this, params );

    var rp = this.structure.getResidueProxy();

    this.atomColor = function( ap ){

        var sstruc = ap.sstruc;

        if( sstruc === "h" ){
            return StructureColors.alphaHelix;
        }else if( sstruc === "g" ){
            return StructureColors.threeTenHelix;
        }else if( sstruc === "i" ){
            return StructureColors.piHelix;
        }else if( sstruc === "e" || sstruc === "b" ){
            return StructureColors.betaStrand;
        }else{
            rp.index = ap.residueIndex;
            if( rp.isNucleic() ){
                return StructureColors.dna;
            }else if( rp.isProtein() || sstruc === "s" || sstruc === "t" || sstruc === "l" ){
                return StructureColors.coil;
            }else{
                return DefaultStructureColor;
            }
        }

    };

}

SstrucColorMaker.prototype = ColorMaker.prototype;

SstrucColorMaker.prototype.constructor = SstrucColorMaker;


function ElementColorMaker( params ){

    ColorMaker.call( this, params );

    var colorValue = this.value;
    if( params.value === undefined ){
        colorValue = ElementColors.C;
    }

    this.atomColor = function( a ){

        var element = a.element;

        if( element === "C" ){
            return colorValue;
        }else{
            return ElementColors[ element ] || DefaultElementColor;
        }

    };

}

ElementColorMaker.prototype = ColorMaker.prototype;

ElementColorMaker.prototype.constructor = ElementColorMaker;


function ResnameColorMaker( params ){

    ColorMaker.call( this, params );

    this.atomColor = function( a ){
        return ResidueColors[ a.resname ] || DefaultResidueColor;
    };

}

ResnameColorMaker.prototype = ColorMaker.prototype;

ResnameColorMaker.prototype.constructor = ResnameColorMaker;


function BfactorColorMaker( params ){

    ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "OrRd";
    }

    if( !params.domain ){

        var selection;
        var min = Infinity;
        var max = -Infinity;

        if( params.sele ){
            selection = new Selection( params.sele );
        }

        this.structure.eachAtom( function( a ){
            var bfactor = a.bfactor;
            min = Math.min( min, bfactor );
            max = Math.max( max, bfactor );
        }, selection );

        this.domain = [ min, max ];

    }

    var bfactorScale = this.getScale();

    this.atomColor = function( a ){
        return bfactorScale( a.bfactor );
    };

}

BfactorColorMaker.prototype = ColorMaker.prototype;

BfactorColorMaker.prototype.constructor = BfactorColorMaker;


function OccupancyColorMaker( params ){

    ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "PuBu";
    }

    if( !params.domain ){
        this.domain = [ 0.0, 1.0 ];
    }

    var occupancyScale = this.getScale();

    this.atomColor = function( a ){
        return occupancyScale( a.occupancy );
    };

}

OccupancyColorMaker.prototype = ColorMaker.prototype;

OccupancyColorMaker.prototype.constructor = OccupancyColorMaker;


function HydrophobicityColorMaker( params ){

    ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "RdYlGn";
    }

    var name;
    var idx = 0;  // 0: DGwif, 1: DGwoct, 2: Oct-IF

    var resHF = {};
    for( name in ResidueHydrophobicity ){
        resHF[ name ] = ResidueHydrophobicity[ name ][ idx ];
    }

    if( !params.domain ){

        var val;
        var min = Infinity;
        var max = -Infinity;

        for( name in resHF ){

            val = resHF[ name ];
            min = Math.min( min, val );
            max = Math.max( max, val );

        }

        this.domain = [ min, 0, max ];

    }

    var hfScale = this.getScale();

    this.atomColor = function( a ){
        return hfScale( resHF[ a.resname ] || DefaultResidueHydrophobicity );
    };

}

HydrophobicityColorMaker.prototype = ColorMaker.prototype;

HydrophobicityColorMaker.prototype.constructor = HydrophobicityColorMaker;


ColorMakerRegistry.types = {

    "": ColorMaker,
    "picking": PickingColorMaker,
    "random": RandomColorMaker,
    "uniform": UniformColorMaker,
    "atomindex": AtomindexColorMaker,
    "residueindex": ResidueindexColorMaker,
    "chainindex": ChainindexColorMaker,
    "chainname": ChainnameColorMaker,
    "chainid": ChainidColorMaker,
    "entityindex": EntityindexColorMaker,
    "modelindex": ModelindexColorMaker,
    "entitytype": EntityTypeColorMaker,
    "moleculetype": MoleculeTypeColorMaker,
    "sstruc": SstrucColorMaker,
    "element": ElementColorMaker,
    "resname": ResnameColorMaker,
    "bfactor": BfactorColorMaker,
    "hydrophobicity": HydrophobicityColorMaker,
    "value": ValueColorMaker,
    "volume": VolumeColorMaker,
    "occupancy": OccupancyColorMaker

};


export {
	ColorMaker,
	ColorMakerRegistry
};
