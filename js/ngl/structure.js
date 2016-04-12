/**
 * @file Structure
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


////////////
// GidPool

NGL.GidPool = {

    // REMEMBER not synced with worker

    nextGid: 1,

    objectList: [],

    rangeList: [],

    getBaseObject: function( object ){

        if( object.type === "StructureView" ){
            object = object.getStructure();
        }

        return object;

    },

    addObject: function( object ){

        object = this.getBaseObject( object );

        NGL.GidPool.objectList.push( object );
        NGL.GidPool.rangeList.push( NGL.GidPool.allocateGidRange( object ) );

        return NGL.GidPool;

    },

    removeObject: function( object ){

        object = this.getBaseObject( object );

        var idx = NGL.GidPool.objectList.indexOf( object );

        if( idx !== -1 ){

            NGL.GidPool.objectList.splice( idx, 1 );
            NGL.GidPool.rangeList.splice( idx, 1 );

            if( NGL.GidPool.objectList.length === 0 ){
                NGL.GidPool.nextGid = 1;
            }

        }

        return NGL.GidPool;

    },

    updateObject: function( object, silent ){

        object = this.getBaseObject( object );

        var idx = NGL.GidPool.objectList.indexOf( object );

        if( idx !== -1 ){

            var range = NGL.GidPool.rangeList[ idx ];

            if( range[1] === NGL.GidPool.nextGid ){
                var count = NGL.GidPool.getGidCount( object );
                NGL.GidPool.nextGid += count - ( range[1] - range[0] );
                range[ 1 ] = NGL.GidPool.nextGid;
            }else{
                NGL.GidPool.rangeList[ idx ] = NGL.GidPool.allocateGidRange( object );
            }

        }else{

            if( !silent ){
                NGL.warn( "NGL.GidPool.updateObject: object not found." );
            }

        }

        return NGL.GidPool;

    },

    getGidCount: function( object ){

        object = this.getBaseObject( object );

        var count = 0;

        if( object.type === "Structure" ){
            count = (
                object.atomStore.count +
                object.bondStore.count +
                object.backboneBondStore.count +
                object.rungBondStore.count
            );
        }else if( object.type === "Volume" ){
            count = object.__data.length;
        }else{
            NGL.warn( "NGL.GidPool.getGidCount: unknown object type" );
        }

        return count;

    },

    allocateGidRange: function( object ){

        object = this.getBaseObject( object );

        var firstGid = NGL.GidPool.nextGid;

        NGL.GidPool.nextGid += NGL.GidPool.getGidCount( object );

        if( NGL.GidPool.nextGid > Math.pow( 2, 24 ) ){
            NGL.error( "NGL.GidPool.allocateGidRange: GidPool overflown" );
        }

        return [ firstGid, NGL.GidPool.nextGid ];

    },

    freeGidRange: function( object ){

        object = this.getBaseObject( object );
        // TODO

    },

    getNextGid: function(){

        return NGL.GidPool.nextGid++;

    },

    getGid: function( object, offset ){

        object = this.getBaseObject( object );
        offset = offset || 0;

        var gid = 0;
        var idx = NGL.GidPool.objectList.indexOf( object );

        if( idx !== -1 ){

            var range = NGL.GidPool.rangeList[ idx ];
            var first = range[ 0 ];

            gid = first + offset;

        }else{

            NGL.warn( "NGL.GidPool.getGid: object not found." );

        }

        return gid;

    },

    getByGid: function( gid ){

        var entity;

        NGL.GidPool.objectList.forEach( function( o, i ){

            var range = NGL.GidPool.rangeList[ i ];
            if( gid < range[ 0 ] || gid >= range[ 1 ] ){
                return;
            }
            var offset = gid - range[ 0 ];

            if( o.type === "Structure" ){

                if( offset <= o.atomStore.count ){

                    entity = o.getAtomProxy( offset );

                }else if( offset <= o.atomStore.count + o.bondStore.count ){

                    offset -= o.atomStore.count
                    entity = o.getBondProxy( offset );

                }else if( offset <= o.atomStore.count + o.bondStore.count + o.backboneBondStore.count ){

                    offset -= ( o.atomStore.count + o.bondStore.count );
                    entity = o.getBondProxy( offset );
                    entity.bondStore = o.backboneBondStore;

                }else if( offset <= o.atomStore.count + o.bondStore.count + o.backboneBondStore.count + o.rungBondStore.count ){

                    offset -= ( o.atomStore.count + o.bondStore.count + o.backboneBondStore.count );
                    entity = o.getBondProxy( offset );
                    entity.bondStore = o.rungBondStore;

                }else{

                    NGL.warn( "NGL.GidPool.getByGid: invalid Structure gid", gid );

                }

            }else if( o.type === "Volume" ){

                entity = {
                    volume: o,
                    index: offset,
                    value: o.data[ offset ],
                    x: o.dataPosition[ offset * 3 ],
                    y: o.dataPosition[ offset * 3 + 1 ],
                    z: o.dataPosition[ offset * 3 + 2 ],
                };

            }else{

                NGL.warn( "NGL.GidPool.getByGid: unknown object type for gid", gid );

            }

        } );

        return entity;

    }

}


///////////////
// ColorMaker

NGL.ColorMakerRegistry = {

    signals: {

        // typesChanged: new signals.Signal(),

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

    types: {},

    userSchemes: {},

    getScheme: function( params ){

        var p = params || {};

        var id = p.scheme || "";

        var schemeClass;

        if( id in NGL.ColorMakerRegistry.types ){

            schemeClass = NGL.ColorMakerRegistry.types[ id ];

        }else if( id in NGL.ColorMakerRegistry.userSchemes ){

            schemeClass = NGL.ColorMakerRegistry.userSchemes[ id ];

        }else{

            schemeClass = NGL.ColorMaker;

        }

        return new schemeClass( params );

    },

    getPickingScheme: function( params ){

        var p = Object.assign( params || {} );
        p.scheme = "picking";

        return NGL.ColorMakerRegistry.getScheme( p );

    },

    getTypes: function(){

        var types = {};

        Object.keys( NGL.ColorMakerRegistry.types ).forEach( function( k ){
            // NGL.ColorMakerRegistry.types[ k ]
            types[ k ] = k;
        } );

        Object.keys( NGL.ColorMakerRegistry.userSchemes ).forEach( function( k ){
            types[ k ] = k.split( "|" )[ 1 ];
        } );

        return types;

    },

    getScales: function(){

        return NGL.ColorMakerRegistry.scales;

    },

    getModes: function(){

        return NGL.ColorMakerRegistry.modes;

    },

    addScheme: function( scheme, label ){

        if( !( scheme instanceof NGL.ColorMaker ) ){

            scheme = NGL.ColorMakerRegistry.createScheme( scheme, label );

        }

        label = label || "";
        var id = "" + THREE.Math.generateUUID() + "|" + label;

        NGL.ColorMakerRegistry.userSchemes[ id ] = scheme;
        // NGL.ColorMakerRegistry.signals.typesChanged.dispatch();

        return id;

    },

    removeScheme: function( id ){

        delete NGL.ColorMakerRegistry.userSchemes[ id ];
        // NGL.ColorMakerRegistry.signals.typesChanged.dispatch();

    },

    createScheme: function( constructor, label ){

        var ColorMaker = function( params ){

            NGL.ColorMaker.call( this, params );

            this.label = label || "";

            constructor.call( this, params );

        }

        ColorMaker.prototype = NGL.ColorMaker.prototype;

        ColorMaker.prototype.constructor = ColorMaker;

        return ColorMaker;

    },

    addSelectionScheme: function( pairList, label ){

        return NGL.ColorMakerRegistry.addScheme( function( params ){

            var colorList = [];
            var selectionList = [];

            pairList.forEach( function( pair ){

                colorList.push( new THREE.Color( pair[ 0 ] ).getHex() );
                selectionList.push( new NGL.Selection( pair[ 1 ] ) );

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

}


NGL.ColorMaker = function( params ){

    var p = params || {};

    this.scale = p.scale || "uniform";
    this.mode = p.mode || "hcl";
    this.domain = p.domain || [ 0, 1 ];
    this.value = new THREE.Color( p.value || 0xFFFFFF ).getHex();

    this.structure = p.structure;
    this.volume = p.volume;
    this.surface = p.surface;

    if( this.structure ){
        this.atomProxy = this.structure.getAtomProxy();
    }

};

NGL.ColorMaker.prototype = {

    constructor: NGL.ColorMaker,

    getScale: function( params ){

        var p = params || {};

        var scale = p.scale || this.scale;
        if( scale === "rainbow" || scale === "roygb" ){
            scale = [ "red", "orange", "yellow", "green", "blue" ];
        }else if( scale === "rwb" ){
            scale = [ "red", "white", "blue" ];
        }

        return chroma
            .scale( scale )
            .mode( p.mode || this.mode )
            .domain( p.domain || this.domain )
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

    atomColor: function( a ){

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

    volumeColor: function( i ){

        return 0xFFFFFF;

    },

    volumeColorToArray: function( i, array, offset ){

        return this.colorToArray(
            this.volumeColor( i ), array, offset
        );

    },

    positionColor: function( v ){

        return 0xFFFFFF;

    },

    positionColorToArray: function( v, array, offset ){

        return this.colorToArray(
            this.positionColor( v ), array, offset
        );

    }

};


NGL.VolumeColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    var valueScale = this.getScale();
    var volume = this.volume;
    var inverseMatrix = volume.inverseMatrix;
    var data = volume.__data;
    var nx = volume.nx;
    var ny = volume.ny;
    var nz = volume.nz;
    var vec = new THREE.Vector3();

    this.positionColor = function( v ){

        vec.copy( v );
        vec.applyMatrix4( inverseMatrix );
        vec.round();

        var index = ( ( ( ( vec.z * ny ) + vec.y ) * nx ) + vec.x );

        return valueScale( data[ index ] );

    };

};

NGL.VolumeColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.VolumeColorMaker.prototype.constructor = NGL.VolumeColorMaker;


NGL.ValueColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    var valueScale = this.getScale();

    this.volumeColor = function( i ){

        return valueScale( this.volume.data[ i ] );

    };

};

NGL.ValueColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.ValueColorMaker.prototype.constructor = NGL.ValueColorMaker;


NGL.PickingColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

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

    this.atomColor = function( a ){

        return NGL.GidPool.getGid( this.structure, a.index );

    };

    this.bondColor = function( b, fromTo ){

        return NGL.GidPool.getGid( this.structure, offset + b.index );

    };

    this.volumeColor = function( i ){

        return NGL.GidPool.getGid( this.volume, i );

    };

};

NGL.PickingColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.PickingColorMaker.prototype.constructor = NGL.PickingColorMaker;


NGL.RandomColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    this.atomColor = function( a ){

        return Math.random() * 0xFFFFFF;

    };

};

NGL.RandomColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.RandomColorMaker.prototype.constructor = NGL.RandomColorMaker;


NGL.UniformColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

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

};

NGL.UniformColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.UniformColorMaker.prototype.constructor = NGL.UniformColorMaker;


NGL.AtomindexColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

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

};

NGL.AtomindexColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.AtomindexColorMaker.prototype.constructor = NGL.AtomindexColorMaker;


NGL.ResidueindexColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "roygb";
    }
    if( !params.domain ){
        this.domain = [ 0, this.structure.residueStore.count ];
    }
    var residueindexScale = this.getScale();

    this.atomColor = function( a ){
        return residueindexScale( a.residueIndex );
    };

};

NGL.ResidueindexColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.ResidueindexColorMaker.prototype.constructor = NGL.ResidueindexColorMaker;


NGL.ChainindexColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "Spectral";
    }
    if( !params.domain ){
        this.domain = [ 0, this.structure.chainStore.count ];
    }
    var chainindexScale = this.getScale();

    this.atomColor = function( a ){
        return chainindexScale( a.chainIndex );
    };

};

NGL.ChainindexColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.ChainindexColorMaker.prototype.constructor = NGL.ChainindexColorMaker;


NGL.ModelindexColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

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

};

NGL.ModelindexColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.ModelindexColorMaker.prototype.constructor = NGL.ModelindexColorMaker;


NGL.SstrucColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    var strucColors = NGL.StructureColors;
    var defaultStrucColor = NGL.StructureColors[""];
    var rp = this.structure.getResidueProxy();

    this.atomColor = function( ap ){

        var sstruc = ap.sstruc;

        if( sstruc === "h" ){
            return strucColors[ "alphaHelix" ];
        }else if( sstruc === "g" ){
            return strucColors[ "3_10Helix" ];
        }else if( sstruc === "i" ){
            return strucColors[ "piHelix" ];
        }else if( sstruc === "e" || sstruc === "b" ){
            return strucColors[ "betaStrand" ];
        }else{
            rp.index = ap.residueIndex;
            if( rp.isNucleic() ){
                return strucColors[ "dna" ];
            }else if( rp.isProtein() || sstruc === "s" || sstruc === "t" || sstruc === "l" ){
                return strucColors[ "coil" ];
            }else{
                return defaultStrucColor;
            }
        }

    };

};

NGL.SstrucColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.SstrucColorMaker.prototype.constructor = NGL.SstrucColorMaker;


NGL.ElementColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    var elemColors = NGL.ElementColors;
    var defaultElemColor = NGL.ElementColors[""];
    var colorValue = this.value;
    if( params.value === undefined ){
        colorValue = NGL.ElementColors[ "C" ];
    }

    this.atomColor = function( a ){

        var element = a.element;

        if( element === "C" ){
            return colorValue;
        }else{
            return elemColors[ element ] || defaultElemColor;
        }

    };

};

NGL.ElementColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.ElementColorMaker.prototype.constructor = NGL.ElementColorMaker;


NGL.ResnameColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    var resColors = NGL.ResidueColors;
    var defaultResColor = NGL.ResidueColors[""];

    this.atomColor = function( a ){

        return resColors[ a.resname ] || defaultResColor;

    };

};

NGL.ResnameColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.ResnameColorMaker.prototype.constructor = NGL.ResnameColorMaker;


NGL.BfactorColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "OrRd";
    }

    if( !params.domain ){

        var selection;
        var min = Infinity;
        var max = -Infinity;

        if( params.sele ){
            selection = new NGL.Selection( params.sele );
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

};

NGL.BfactorColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.BfactorColorMaker.prototype.constructor = NGL.BfactorColorMaker;


NGL.OccupancyColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

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

};

NGL.OccupancyColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.OccupancyColorMaker.prototype.constructor = NGL.OccupancyColorMaker;


NGL.HydrophobicityColorMaker = function( params ){

    NGL.ColorMaker.call( this, params );

    if( !params.scale ){
        this.scale = "RdYlGn";
    }

    var idx = 0;  // 0: DGwif, 1: DGwoct, 2: Oct-IF

    var resHF = {};
    for( var name in NGL.ResidueHydrophobicity ){
        resHF[ name ] = NGL.ResidueHydrophobicity[ name ][ idx ];
    }
    var defaultResHF = resHF[""];

    if( !params.domain ){

        var val;
        var min = Infinity;
        var max = -Infinity;

        for( var name in resHF ){

            val = resHF[ name ];
            min = Math.min( min, val );
            max = Math.max( max, val );

        }

        this.domain = [ min, 0, max ];

    }

    var hfScale = this.getScale();

    this.atomColor = function( a ){

        return hfScale( resHF[ a.resname ] || defaultResHF );

    };

};

NGL.HydrophobicityColorMaker.prototype = NGL.ColorMaker.prototype;

NGL.HydrophobicityColorMaker.prototype.constructor = NGL.HydrophobicityColorMaker;


NGL.ColorMakerRegistry.types = {

    "": NGL.ColorMaker,
    "picking": NGL.PickingColorMaker,
    "random": NGL.RandomColorMaker,
    "uniform": NGL.UniformColorMaker,
    "atomindex": NGL.AtomindexColorMaker,
    "residueindex": NGL.ResidueindexColorMaker,
    "chainindex": NGL.ChainindexColorMaker,
    "modelindex": NGL.ModelindexColorMaker,
    "sstruc": NGL.SstrucColorMaker,
    "element": NGL.ElementColorMaker,
    "resname": NGL.ResnameColorMaker,
    "bfactor": NGL.BfactorColorMaker,
    "hydrophobicity": NGL.HydrophobicityColorMaker,
    "value": NGL.ValueColorMaker,
    "volume": NGL.VolumeColorMaker,
    "occupancy": NGL.OccupancyColorMaker

};


////////////
// Factory

NGL.RadiusFactory = function( type, scale ){

    this.type = type;
    this.scale = scale || 1.0;

    this.max = 10;

};

NGL.RadiusFactory.types = {

    "": "",
    "vdw": "by vdW radius",
    "covalent": "by covalent radius",
    "sstruc": "by secondary structure",
    "bfactor": "by bfactor",
    "size": "size"

};

NGL.RadiusFactory.prototype = {

    constructor: NGL.RadiusFactory,

    atomRadius: function( a ){

        var type = this.type;
        var scale = this.scale;
        var vdwRadii = NGL.VdwRadii;
        var covalentRadii = NGL.CovalentRadii;

        var defaultVdwRadius = NGL.VdwRadii[""];
        var defaultCovalentRadius = NGL.CovalentRadii[""];
        var defaultBfactor = 1;

        var nucleic = [ "C3'", "C3*", "C4'", "C4*", "P" ];

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

            case "sstruc":

                var sstruc = a.sstruc;
                if( sstruc === "h" ){
                    r = 0.25;
                }else if( sstruc === "g" ){
                    r = 0.25;
                }else if( sstruc === "i" ){
                    r = 0.25;
                }else if( sstruc === "e" ){
                    r = 0.25;
                }else if( sstruc === "b" ){
                    r = 0.25;
                }else if( nucleic.indexOf( a.atomname ) !== -1 ){
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


NGL.LabelFactory = function( type, text ){

    this.type = type;
    this.text = text || {};

};

NGL.LabelFactory.types = {

    "": "",
    "atomname": "atom name",
    "atomindex": "atom index",
    "atom": "atom name + index",
    "resname": "residue name",
    "resno": "residue no",
    "res": "residue name + no",
    "text": "text"

};

NGL.LabelFactory.prototype = {

    constructor: NGL.LabelFactory,

    atomLabel: function( a ){

        var type = this.type;

        var l;

        switch( type ){

            case "atomname":
                l = a.atomname;
                break;

            case "atomindex":
                l = "" + a.index;
                break;

            case "atom":
                l = a.atomname + "|" + a.index;
                break;

            case "resname":
                l = a.resname;
                break;

            case "resno":
                l = "" + a.resno;
                break;

            case "res":
                l = ( NGL.AA1[ a.resname.toUpperCase() ] || '' ) + a.resno;
                break;

            case "text":
                l = this.text[ a.index ];
                break;

            default:
                l = a.qualifiedName();
                break;

        }

        return l === undefined ? '' : l;

    }

};


//////////////
// Structure

NGL.Structure = function( name, path ){

    var SIGNALS = signals;
    this.signals = {
        refreshed: new SIGNALS.Signal(),
    };

    this.name = name;
    this.path = path;
    this.title = "";
    this.id = "";

    this.atomSetCache = {};
    this.atomSetDict = {};
    this.biomolDict = {};
    this.helices = [];
    this.sheets = [];
    this.unitcell = new NGL.Unitcell();
    this.selection = undefined;

    this.frames = [];
    this.boxes = [];

    this.bondStore = new NGL.BondStore( 0 );
    this.backboneBondStore = new NGL.BondStore( 0 );
    this.rungBondStore = new NGL.BondStore( 0 );
    this.atomStore = new NGL.AtomStore( 0 );
    this.residueStore = new NGL.ResidueStore( 0 );
    this.chainStore = new NGL.ChainStore( 0 );
    this.modelStore = new NGL.ModelStore( 0 );

    this.atomMap = new NGL.AtomMap( this );
    this.residueMap = new NGL.ResidueMap( this );

    this.atomSet = this.getAtomSet( this.selection );
    this.bondSet = this.getBondSet();

    this.center = new THREE.Vector3();
    this.boundingBox = new THREE.Box3();

    NGL.GidPool.addObject( this );

    this._ap = this.getAtomProxy();
    this._rp = this.getResidueProxy();
    this._cp = this.getChainProxy();

};

NGL.Structure.prototype = {

    constructor: NGL.Structure,
    type: "Structure",

    refresh: function(){

        if( NGL.debug ) NGL.time( "NGL.Structure.refresh" );

        this.atomSetCache = {};

        this.atomSet = this.getAtomSet2( this.selection );
        this.bondSet = this.getBondSet();

        for( var name in this.atomSetDict ){
            var as = this.atomSetDict[ name ];
            var as2 = this.getAtomSet2( false );
            this.atomSetCache[ "__" + name ] = as2.intersection( as );
        }

        this.boundingBox = this.getBoundingBox();
        this.center = this.boundingBox.center();

        NGL.GidPool.updateObject( this );

        if( NGL.debug ) NGL.timeEnd( "NGL.Structure.refresh" );

        this.signals.refreshed.dispatch();

    },

    getBondProxy: function( index ){

        return new NGL.BondProxy( this, index );

    },

    getAtomProxy: function( index, tmp ){

        if( tmp ){
            if( this.__tmpAtomProxy === undefined ){
                this.__tmpAtomProxy = new NGL.AtomProxy( this, index );
            }
            return this.__tmpAtomProxy;
        }else{
            return new NGL.AtomProxy( this, index );
        }

    },

    getResidueProxy: function( index, tmp ){

        if( tmp ){
            if( this.__tmpResidueProxy === undefined ){
                this.__tmpResidueProxy = new NGL.ResidueProxy( this, index );
            }
            return this.__tmpResidueProxy;
        }else{
            return new NGL.ResidueProxy( this, index );
        }

    },

    getChainProxy: function( index ){

        return new NGL.ChainProxy( this, index );

    },

    getModelProxy: function( index ){

        return new NGL.ModelProxy( this, index );

    },

    getBondSet: function( selection ){

        if( NGL.debug ) NGL.time( "NGL.Structure.getBondSet" );

        var n = this.bondStore.count;
        var bs = new TypedFastBitSet( n );
        var as = this.atomSet;

        if( as ){

            var bp = this.getBondProxy();

            for( var i = 0; i < n; ++i ){
                bp.index = i;
                if( as.has( bp.atomIndex1 ) && as.has( bp.atomIndex2 ) ){
                    bs.add_unsafe( bp.index );
                }
            }

        }else{

            bs.set_all( true );

        }

        if( NGL.debug ) NGL.timeEnd( "NGL.Structure.getBondSet" );

        return bs;

    },

    getBackboneBondSet: function( selection ){

        if( NGL.debug ) NGL.time( "NGL.Structure.getBackboneBondSet" );

        var n = this.backboneBondStore.count;
        var bs = new TypedFastBitSet( n );
        var as = this.atomSetCache[ "__backbone" ];

        if( as ){

            var bp = this.getBondProxy();
            bp.bondStore = this.backboneBondStore;

            for( var i = 0; i < n; ++i ){
                bp.index = i;
                if( as.has( bp.atomIndex1 ) && as.has( bp.atomIndex2 ) ){
                    bs.add_unsafe( bp.index );
                }
            }

        }else{

            bs.set_all( true );

        }

        if( NGL.debug ) NGL.timeEnd( "NGL.Structure.getBackboneBondSet" );

        return bs;

    },

    getRungBondSet: function( selection ){

        if( NGL.debug ) NGL.time( "NGL.Structure.getRungBondSet" );

        var n = this.rungBondStore.count;
        var bs = new TypedFastBitSet( n );
        var as = this.atomSetCache[ "__rung" ];

        if( as ){

            var bp = this.getBondProxy();
            bp.bondStore = this.rungBondStore;

            for( var i = 0; i < n; ++i ){
                bp.index = i;
                if( as.has( bp.atomIndex1 ) && as.has( bp.atomIndex2 ) ){
                    bs.add_unsafe( bp.index );
                }
            }

        }else{

            bs.set_all( true );

        }

        if( NGL.debug ) NGL.timeEnd( "NGL.Structure.getRungBondSet" );

        return bs;

    },

    getAtomSet: function( selection ){

        if( NGL.debug ) NGL.time( "NGL.Structure.getAtomSet" );

        var as;
        var n = this.atomStore.count;

        if( selection === false ){

            as = new TypedFastBitSet( n );

        }else if( selection === true ){

            as = new TypedFastBitSet( n );
            as.set_all( true );

        }else if( selection && selection.test ){

            var seleString = selection.string;
            as = this.atomSetCache[ seleString ];

            if( !seleString ) console.warn( "empty seleString" );

            if( as === undefined ){

                // TODO can be faster by setting ranges of atoms
                //      but for that must loop over hierarchy itself
                as = new TypedFastBitSet( n );
                var ap = this.getAtomProxy();
                var test = selection.test;
                for( var i = 0; i < n; ++i ){
                    ap.index = i;
                    if( test( ap ) ) as.add_unsafe( ap.index );
                }
                this.atomSetCache[ seleString ] = as;

            }else{

                // console.log( "getting atomSet from cache", seleString );

            }

        }else{

            as = new TypedFastBitSet( n );
            as.set_all( true );

        }

        if( NGL.debug ) NGL.timeEnd( "NGL.Structure.getAtomSet" );

        return as;

    },

    getAtomSet2: function( selection ){

        if( NGL.debug ) NGL.time( "NGL.Structure.getAtomSet2" );

        var as;
        var n = this.atomStore.count;

        if( selection === false ){

            as = new TypedFastBitSet( n );

        }else if( selection === true ){

            as = new TypedFastBitSet( n );
            as.set_all( true );

        }else if( selection && selection.test ){

            var seleString = selection.string;
            as = this.atomSetCache[ seleString ];

            if( !seleString ) console.warn( "empty seleString" );

            if( as === undefined ){

                as = new TypedFastBitSet( n );
                this.eachAtom2( function( ap ){
                    as.add_unsafe( ap.index );
                }, selection );
                this.atomSetCache[ seleString ] = as;

            }else{

                // console.log( "getting atomSet from cache", seleString );

            }

        }else{

            as = new TypedFastBitSet( n );
            as.set_all( true );

        }

        if( NGL.debug ) NGL.timeEnd( "NGL.Structure.getAtomSet2" );

        return as;

    },

    setSelection: function( selection ){

        this.selection = selection;

        this.refresh();

    },

    getSelection: function(){

        return this.selection;

    },

    getStructure: function(){

        return this;

    },

    //

    eachBond: function( callback, selection ){

        var bp = this.getBondProxy();
        var bs = this.bondSet;

        if( selection && selection.test ){
            if( bs ){
                bs = bs.new_intersection( this.getBondSet( selection ) );
            }else{
                bs = this.getBondSet( selection );
            }
        }

        if( bs ){
            bs.forEach( function( index ){
                bp.index = index;
                callback( bp );
            } );
        }else{
            var n = this.bondStore.count;
            for( var i = 0; i < n; ++i ){
                bp.index = i;
                callback( bp );
            }
        }

    },

    getAtomSet3: function( selection ){

        if( NGL.debug ) NGL.time( "NGL.Structure.getAtomSet3" );

        var as = this.atomSet;

        if( selection && selection.test ){
            if( as ){
                as = as.new_intersection( this.getAtomSet2( selection ) );
            }else{
                as = this.getAtomSet2( selection );
            }
        }

        if( NGL.debug ) NGL.timeEnd( "NGL.Structure.getAtomSet3" );

        return as;

    },

    eachAtom: function( callback, selection ){

        var ap = this.getAtomProxy();
        var as = this.getAtomSet3( selection );
        var n = this.atomStore.count;

        if( as && as.size() < n ){
            as.forEach( function( index ){
                ap.index = index;
                callback( ap );
            } );
        }else{
            for( var i = 0; i < n; ++i ){
                ap.index = i;
                callback( ap );
            }
        }

    },

    eachAtom2: function( callback, selection ){

        if( selection && selection.test ){
            this.eachModel( function( mp ){
                mp.eachAtom2( callback, selection )
            }, selection );
        }else{
            var an = this.atomStore.count;
            var ap = this.getAtomProxy();
            for( var i = 0; i < an; ++i ){
                ap.index = i;
                callback( ap );
            }
        }

    },

    eachResidue: function( callback, selection ){

        if( selection && selection.test ){
            var mn = this.modelStore.count;
            var mp = this.getModelProxy();
            if( selection.modelOnlyTest ){
                var modelOnlyTest = selection.modelOnlyTest;
                for( var i = 0; i < mn; ++i ){
                    mp.index = i;
                    if( modelOnlyTest( mp ) ){
                        mp.eachResidue( callback, selection );
                    }
                }
            }else{
                for( var i = 0; i < mn; ++i ){
                    mp.index = i;
                    mp.eachResidue( callback, selection );
                }
            }
        }else{
            var rn = this.residueStore.count;
            var rp = this.getResidueProxy();
            for( var i = 0; i < rn; ++i ){
                rp.index = i;
                callback( rp );
            }
        }

    },

    eachResidueN: function( n, callback ){

        var rn = this.residueStore.count;
        if( rn < n ) return;
        var array = new Array( n );

        for( var i = 0; i < n; ++i ){
            array[ i ] = this.getResidueProxy( i );
        }
        callback.apply( this, array );

        for( var j = n; j < rn; ++j ){
            for( var i = 0; i < n; ++i ){
                array[ i ].index += 1;
            }
            callback.apply( this, array );
        }

    },

    eachPolymer: function( callback, selection ){

        if( selection && selection.modelOnlyTest ){

            var modelOnlyTest = selection.modelOnlyTest;

            this.eachModel( function( mp ){
                if( modelOnlyTest( mp ) ){
                    mp.eachPolymer( callback, selection );
                }
            } );

        }else{

            this.eachModel( function( mp ){
                mp.eachPolymer( callback, selection );
            } );

        }

    },

    eachChain: function( callback, selection ){

        if( selection && selection.test ){
            this.eachModel( function( mp ){
                mp.eachChain( callback, selection );
            } );
        }else{
            var cn = this.chainStore.count;
            var cp = this.getChainProxy();
            for( var i = 0; i < cn; ++i ){
                cp.index = i;
                callback( cp );
            }
        }

    },

    eachModel: function( callback, selection ){

        var n = this.modelStore.count;
        var mp = this.getModelProxy();

        if( selection && selection.test ){
            var modelOnlyTest = selection.modelOnlyTest;
            if( modelOnlyTest ){
                for( var i = 0; i < n; ++i ){
                    mp.index = i;
                    if( modelOnlyTest( mp ) ){
                        callback( mp, selection );
                    }
                }
            }else{
                for( var i = 0; i < n; ++i ){
                    mp.index = i;
                    callback( mp, selection );
                }
            }
        }else{
            for( var i = 0; i < n; ++i ){
                mp.index = i;
                callback( mp );
            }
        }

    },

    //

    getAtomData: function( params ){

        var p = Object.assign( {}, params );
        if( p.colorParams ) p.colorParams.structure = this.getStructure();

        var what = p.what;
        var atomSet = p.atomSet || this.atomSet;

        var radiusFactory, colorMaker, pickingColorMaker;
        var position, color, pickingColor, radius;

        var atomData = {};
        var ap = this.getAtomProxy();
        var atomCount = atomSet.size();

        if( !what || what[ "position" ] ){
            position = new Float32Array( atomCount * 3 );
            atomData[ "position" ] = position;
        }
        if( !what || what[ "color" ] ){
            color = new Float32Array( atomCount * 3 );
            atomData[ "color" ] = color;
            colorMaker = NGL.ColorMakerRegistry.getScheme( p.colorParams );
        }
        if( !what || what[ "pickingColor" ] ){
            pickingColor = new Float32Array( atomCount * 3 );
            atomData[ "pickingColor" ] = pickingColor;
            var pickingColorParams = Object.assign( p.colorParams, { scheme: "picking" } );
            pickingColorMaker = NGL.ColorMakerRegistry.getScheme( pickingColorParams );
        }
        if( !what || what[ "radius" ] ){
            radius = new Float32Array( atomCount );
            atomData[ "radius" ] = radius;
            radiusFactory = new NGL.RadiusFactory( p.radiusParams.radius, p.radiusParams.scale );
        }

        atomSet.forEach( function( index, i ){
            var i3 = i * 3;
            ap.index = index;
            if( position ){
                ap.positionToArray( position, i3 );
            }
            if( color ){
                colorMaker.atomColorToArray( ap, color, i3 );
            }
            if( pickingColor ){
                pickingColorMaker.atomColorToArray( ap, pickingColor, i3 );
            }
            if( radius ){
                radius[ i ] = radiusFactory.atomRadius( ap );
            }
        } );

        return atomData;

    },

    getBondData: function( params ){

        var p = Object.assign( {}, params );
        if( p.colorParams ) p.colorParams.structure = this.getStructure();

        var what = p.what;
        var bondSet = p.bondSet || this.bondSet;

        var radiusFactory, colorMaker, pickingColorMaker;
        var position1, position2, color1, color2, pickingColor1, pickingColor2, radius1, radius2;

        var bondData = {};
        var bp = this.getBondProxy();
        if( p.bondStore ) bp.bondStore = p.bondStore;
        var ap1 = this.getAtomProxy();
        var ap2 = this.getAtomProxy();
        var bondCount = bondSet.size();

        if( !what || what[ "position" ] ){
            position1 = new Float32Array( bondCount * 3 );
            position2 = new Float32Array( bondCount * 3 );
            bondData[ "position1" ] = position1;
            bondData[ "position2" ] = position2;
        }
        if( !what || what[ "color" ] ){
            color1 = new Float32Array( bondCount * 3 );
            color2 = new Float32Array( bondCount * 3 );
            bondData[ "color1" ] = color1;
            bondData[ "color2" ] = color2;
            colorMaker = NGL.ColorMakerRegistry.getScheme( p.colorParams );
        }
        if( !what || what[ "pickingColor" ] ){
            pickingColor1 = new Float32Array( bondCount * 3 );
            pickingColor2 = new Float32Array( bondCount * 3 );
            bondData[ "pickingColor1" ] = pickingColor1;
            bondData[ "pickingColor2" ] = pickingColor2;
            var pickingColorParams = Object.assign( p.colorParams, { scheme: "picking" } );
            pickingColorMaker = NGL.ColorMakerRegistry.getScheme( pickingColorParams );
        }
        if( !what || what[ "radius" ] ){
            radiusFactory = new NGL.RadiusFactory( p.radiusParams.radius, p.radiusParams.scale );
        }
        if( !what || what[ "radius" ] ){
            radius1 = new Float32Array( bondCount );
            if( p.radius2 ){
                radius2 = new Float32Array( bondCount );
                bondData[ "radius1" ] = radius1;
                bondData[ "radius2" ] = radius2;
            }else{
                bondData[ "radius" ] = radius1;
            }
        }

        bondSet.forEach( function( index, i ){
            var i3 = i * 3;
            bp.index = index
            ap1.index = bp.atomIndex1;
            ap2.index = bp.atomIndex2;
            if( position1 ){
                ap1.positionToArray( position1, i3 );
                ap2.positionToArray( position2, i3 );
            }
            if( color1 ){
                colorMaker.bondColorToArray( bp, 1, color1, i3 );
                colorMaker.bondColorToArray( bp, 0, color2, i3 );
            }
            if( pickingColor1 ){
                pickingColorMaker.bondColorToArray( bp, 1, pickingColor1, i3 );
                pickingColorMaker.bondColorToArray( bp, 0, pickingColor2, i3 );
            }
            if( radius1 ){
                radius1[ i ] = radiusFactory.atomRadius( ap1 );
            }
            if( radius2 ){
                radius2[ i ] = radiusFactory.atomRadius( ap2 );
            }
        } );

        return bondData;

    },

    getBackboneAtomData: function( params ){

        params = Object.assign( {
            atomSet: this.atomSetCache[ "__backbone" ],
        }, params );

        return this.getAtomData( params );

    },

    getBackboneBondData: function( params ){

        params = Object.assign( {
            bondSet: this.getBackboneBondSet(),
            bondStore: this.backboneBondStore
        }, params );

        return this.getBondData( params );

    },

    getRungAtomData: function( params ){

        params = Object.assign( {
            atomSet: this.atomSetCache[ "__rung" ],
        }, params );

        return this.getAtomData( params );

    },

    getRungBondData: function( params ){

        params = Object.assign( {
            bondSet: this.getRungBondSet(),
            bondStore: this.rungBondStore
        }, params );

        return this.getBondData( params );

    },

    //

    getView: function( selection ){

        return new NGL.StructureView( this, selection );

    },

    getBoundingBox: function( selection ){

        if( NGL.debug ) console.time( "getBoundingBox" );

        var box = new THREE.Box3();

        var minX = +Infinity;
        var minY = +Infinity;
        var minZ = +Infinity;

        var maxX = -Infinity;
        var maxY = -Infinity;
        var maxZ = -Infinity;

        this.eachAtom( function( ap ){

            var x = ap.x;
            var y = ap.y;
            var z = ap.z;

            if( x < minX ) minX = x;
            if( y < minY ) minY = y;
            if( z < minZ ) minZ = z;

            if( x > maxX ) maxX = x;
            if( y > maxY ) maxY = y;
            if( z > maxZ ) maxZ = z;

        }, selection );

        box.min.set( minX, minY, minZ );
        box.max.set( maxX, maxY, maxZ );

        if( NGL.debug ) console.timeEnd( "getBoundingBox" );

        return box;

    },

    atomCenter: function( selection ){

        if( selection ){
            return this.getBoundingBox( selection ).center();
        }else{
            return this.center.clone();
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

    getAtomIndices: function( selection ){

        // Best to use only when the selection resolves to just a few indices!!!

        var indices = [];

        this.eachAtom2( function( ap ){
            indices.push( ap.index );
        }, selection );

        return indices;

    },

    atomIndex: function(){

        var i = 0;
        var index = new Float32Array( this.atomCount );

        this.eachAtom( function( ap ){
            index[ i ] = ap.index;
        } );

        return index;

    },

    //

    updatePosition: function( position ){

        var i = 0;

        this.eachAtom( function( ap ){
            ap.positionFromArray( position, i );
            i += 3;
        } );

    },

    //

    toJSON: function(){

        if( NGL.debug ) NGL.time( "NGL.Structure.toJSON" );

        var output = {

            metadata: {
                version: 0.1,
                type: 'Structure',
                generator: 'StructureExporter'
            },

            name: this.name,
            path: this.path,
            title: this.title,
            id: this.id,

            biomolDict: {},
            helices: this.helices,
            sheets: this.sheets,
            unitcell: this.unitcell.toJSON(),

            frames: this.frames,
            boxes: this.boxes,

            center: this.center.toArray(),
            boundingBox: [
                this.boundingBox.min.toArray(),
                this.boundingBox.max.toArray()
            ],

            bondStore: this.bondStore.toJSON(),
            backboneBondStore: this.backboneBondStore.toJSON(),
            rungBondStore: this.rungBondStore.toJSON(),
            atomStore: this.atomStore.toJSON(),
            residueStore: this.residueStore.toJSON(),
            chainStore: this.chainStore.toJSON(),
            modelStore: this.modelStore.toJSON(),

            bondSet: this.bondSet.toJSON(),
            atomSet: this.atomSet.toJSON(),

            atomSetDict: {},
            atomSetCache: {},

            atomMap: this.atomMap.toJSON(),
            residueMap: this.residueMap.toJSON()

        };

        for( var name in this.biomolDict ){
            output.biomolDict[ name ] = this.biomolDict[ name ].toJSON()
        }
        for( var name in this.atomSetDict ){
            output.atomSetDict[ name ] = this.atomSetDict[ name ].toJSON()
        }
        for( var name in this.atomSetCache ){
            output.atomSetCache[ name ] = this.atomSetCache[ name ].toJSON()
        }

        if( NGL.debug ) NGL.timeEnd( "NGL.Structure.toJSON" );

        return output;

    },

    fromJSON: function( input ){

        if( NGL.debug ) NGL.time( "NGL.Structure.fromJSON" );

        this.name = input.name;
        this.path = input.path;
        this.title = input.title;
        this.id = input.id;

        this.biomolDict = input.biomolDict;
        this.helices = input.helices;
        this.sheets = input.sheets;
        this.unitcell = new NGL.Unitcell().fromJSON( input.unitcell );

        this.frames = input.frames;
        this.boxes = input.boxes;

        this.center = new THREE.Vector3().fromArray( input.center );
        this.boundingBox = new THREE.Box3(
            new THREE.Vector3().fromArray( input.boundingBox[ 0 ] ),
            new THREE.Vector3().fromArray( input.boundingBox[ 1 ] )
        );

        this.bondStore.fromJSON( input.bondStore );
        this.backboneBondStore.fromJSON( input.backboneBondStore );
        this.rungBondStore.fromJSON( input.rungBondStore );
        this.atomStore.fromJSON( input.atomStore );
        this.residueStore.fromJSON( input.residueStore );
        this.chainStore.fromJSON( input.chainStore );
        this.modelStore.fromJSON( input.modelStore );

        this.bondSet.fromJSON( input.bondSet );
        this.atomSet.fromJSON( input.atomSet );

        this.biomolDict = {};
        for( var name in input.biomolDict ){
            var assembly = new NGL.Assembly();
            this.biomolDict[ name ] = assembly.fromJSON( input.biomolDict[ name ] );
        }
        this.atomSetDict = {};
        for( var name in input.atomSetDict ){
            var as = new TypedFastBitSet();
            this.atomSetDict[ name ] = as.fromJSON( input.atomSetDict[ name ] );
        }
        this.atomSetCache = {};
        for( var name in input.atomSetCache ){
            var as = new TypedFastBitSet();
            this.atomSetCache[ name ] = as.fromJSON( input.atomSetCache[ name ] );
        }

        this.atomMap.fromJSON( input.atomMap );
        this.residueMap.fromJSON( input.residueMap );

        NGL.GidPool.updateObject( this );

        if( NGL.debug ) NGL.timeEnd( "NGL.Structure.fromJSON" );

        return this;

    },

    getTransferable: function(){

        var transferable = [];

        transferable.concat( this.bondStore.getTransferable() );
        transferable.concat( this.backboneBondStore.getTransferable() );
        transferable.concat( this.rungBondStore.getTransferable() );
        transferable.concat( this.atomStore.getTransferable() );
        transferable.concat( this.residueStore.getTransferable() );
        transferable.concat( this.chainStore.getTransferable() );
        transferable.concat( this.modelStore.getTransferable() );

        if( this.frames ){
            var frames = this.frames;
            var n = this.frames.length;
            for( var i = 0; i < n; ++i ){
                transferable.push( frames[ i ].buffer );
            }
        }
        if( this.boxes ){
            var boxes = this.boxes;
            var n = this.boxes.length;
            for( var i = 0; i < n; ++i ){
                transferable.push( boxes[ i ].buffer );
            }
        }

        transferable.concat( this.bondSet.getTransferable() );
        transferable.concat( this.atomSet.getTransferable() );

        for( var name in this.atomSetDict ){
            transferable.concat( this.atomSetDict[ name ].getTransferable() );
        }
        for( var name in this.atomSetCache ){
            transferable.concat( this.atomSetCache[ name ].getTransferable() );
        }

        return transferable;

    },

    dispose: function(){

        NGL.GidPool.removeObject( this );

        if( this.frames ) this.frames.length = 0;
        if( this.boxes ) this.boxes.length = 0;

        this.bondStore.dispose();
        this.backboneBondStore.dispose();
        this.rungBondStore.dispose();
        this.atomStore.dispose();
        this.residueStore.dispose();
        this.chainStore.dispose();
        this.modelStore.dispose();

        delete this.bondStore;
        delete this.atomStore;
        delete this.residueStore;
        delete this.chainStore;
        delete this.modelStore;

        delete this.frames;
        delete this.boxes;
        delete this.cif;

        delete this.bondSet;
        delete this.atomSet;

    }

};


NGL.StructureView = function( structure, selection ){

    var SIGNALS = signals;
    this.signals = {
        refreshed: new SIGNALS.Signal(),
    };

    this.structure = structure;
    this.selection = selection;

    this.center = new THREE.Vector3();
    this.boundingBox = new THREE.Box3();

    // to allow creating an empty object to call .fromJSON onto
    if( !structure && !selection ) return;

    this.init();

    this.refresh();

};

NGL.StructureView.prototype = NGL.createObject(

    NGL.Structure.prototype, {

    constructor: NGL.StructureView,
    type: "StructureView",

    init: function(){

        Object.defineProperties( this, {
            atomSetDict: {
                get: function(){ return this.structure.atomSetDict }
            },
            bondStore: {
                get: function(){ return this.structure.bondStore }
            },
            backboneBondStore: {
                get: function(){ return this.structure.backboneBondStore }
            },
            rungBondStore: {
                get: function(){ return this.structure.rungBondStore }
            },
            atomStore: {
                get: function(){ return this.structure.atomStore }
            },
            residueStore: {
                get: function(){ return this.structure.residueStore }
            },
            chainStore: {
                get: function(){ return this.structure.chainStore }
            },
            modelStore: {
                get: function(){ return this.structure.modelStore }
            },
            atomMap: {
                get: function(){ return this.structure.atomMap }
            },
            residueMap: {
                get: function(){ return this.structure.residueMap }
            }
        } );

        this._ap = this.getAtomProxy();
        this._rp = this.getResidueProxy();
        this._cp = this.getChainProxy();

        // FIXME should selection be serializable?
        if( this.selection ){
            this.selection.signals.stringChanged.add( function( string ){
                this.refresh();
            }, this );
        }

        this.structure.signals.refreshed.add( this.refresh, this );

    },

    refresh: function(){

        if( NGL.debug ) NGL.time( "NGL.StructureView.refresh" );

        this.atomSetCache = {};

        this.atomSet = this.getAtomSet2( this.selection );
        if( this.structure.atomSet ){
            if( NGL.debug ) NGL.time( "NGL.StructureView.refresh#atomSet.intersection" );
            this.atomSet = this.atomSet.intersection( this.structure.atomSet );
            if( NGL.debug ) NGL.timeEnd( "NGL.StructureView.refresh#atomSet.intersection" );
        }

        this.bondSet = this.getBondSet();

        if( NGL.debug ) NGL.time( "NGL.StructureView.refresh#atomSetDict.new_intersection" );
        for( var name in this.atomSetDict ){
            var as = this.atomSetDict[ name ];
            this.atomSetCache[ "__" + name ] = as.new_intersection( this.atomSet );
        }
        if( NGL.debug ) NGL.timeEnd( "NGL.StructureView.refresh#atomSetDict.new_intersection" );

        if( NGL.debug ) NGL.time( "NGL.StructureView.refresh#size" );
        this.atomCount = this.atomSet.size();
        this.bondCount = this.bondSet.size();
        if( NGL.debug ) NGL.timeEnd( "NGL.StructureView.refresh#size" );

        this.boundingBox = this.getBoundingBox();
        this.center = this.boundingBox.center();

        if( NGL.debug ) NGL.timeEnd( "NGL.StructureView.refresh" );

        this.signals.refreshed.dispatch();

    },

    getSelection: function(){

        var parentSelection = this.structure.getSelection();
        if( parentSelection ){
            if( parentSelection.string && this.selection.string ){
                return new NGL.Selection(
                    "( " + parentSelection.string + " ) AND " +
                    "( " + this.selection.string + " )"
                );
            }else if( parentSelection.string ){
                return new NGL.Selection( parentSelection.string );
            }else if( this.selection.string ){
                return new NGL.Selection( this.selection.string );
            }else{
                return new NGL.Selection( "" );
            }
        }else{
            return this.selection;
        }

    },

    getStructure: function(){

        return this.structure.getStructure();

    },

    toJSON: function(){

        var output = {

            metadata: {
                version: 0.1,
                type: 'StructureView',
                generator: 'StructureViewExporter'
            },

            structure: this.structure.toJSON(),
            // selection: this.selection.toJSON(),

            atomSet: this.atomSet.toJSON(),
            bondSet: this.bondSet.toJSON(),

            atomCount: this.atomCount,
            bondCount: this.bondCount,

            atomSetCache: {}

        };

        for( var name in this.atomSetCache ){
            output.atomSetCache[ name ] = this.atomSetCache[ name ].toJSON()
        }

        return output;

    },

    fromJSON: function( input ){

        if( input.structure.metadata.type === "Structure" ){
            this.structure = new NGL.Structure().fromJSON( input.structure );
        }else if( input.structure.metadata.type === "StructureView" ){
            this.structure = new NGL.StructureView().fromJSON( input.structure );
        }

        this.atomSet = new TypedFastBitSet().fromJSON( input.atomSet );
        this.bondSet = new TypedFastBitSet().fromJSON( input.bondSet );

        this.atomCount = input.atomCount;
        this.bondCount = input.bondCount;

        this.atomSetCache = {};
        for( var name in input.atomSetCache ){
            var as = new TypedFastBitSet();
            this.atomSetCache[ name ] = as.fromJSON( input.atomSetCache[ name ] );
        }

        this.init();

        return this;

    },

    getTransferable: function(){

        var transferable = [];

        transferable.concat( this.structure.getTransferable() );

        transferable.concat( this.bondSet.getTransferable() );
        transferable.concat( this.atomSet.getTransferable() );

        for( var name in this.atomSetCache ){
            transferable.concat( this.atomSetCache[ name ].getTransferable() );
        }

        return transferable;

    },

    dispose: function(){

        delete this.structure;

        delete this.atomSet;
        delete this.bondSet;

        delete this.atomCount;
        delete this.bondCount;

    }

} );
