// File:js/ngl/core.js

/**
 * @file Core
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


//////////////
// Polyfills

if( typeof importScripts !== 'function' && !HTMLCanvasElement.prototype.toBlob ){

    HTMLCanvasElement.prototype.toBlob = function(){

        function dataURLToBlob( dataURL ){

            // https://github.com/ebidel/filer.js/blob/master/src/filer.js

            var base64Marker = ';base64,';

            if( dataURL.indexOf( base64Marker ) === -1) {
                var parts = dataURL.split( ',' );
                var contentType = parts[ 0 ].split( ':' )[ 1 ];
                var raw = decodeURIComponent( parts[ 1 ] );

                return new Blob( [ raw ], { type: contentType } );
            }

            var parts = dataURL.split( base64Marker );
            var contentType = parts[ 0 ].split( ':' )[ 1 ];
            var raw = window.atob( parts[ 1 ] );
            var rawLength = raw.length;

            var uInt8Array = new Uint8Array( rawLength );

            for( var i = 0; i < rawLength; ++i ){
                uInt8Array[ i ] = raw.charCodeAt( i );
            }

            return new Blob( [ uInt8Array ], { type: contentType } );

        }

        return function( callback, type, quality ){

            callback( dataURLToBlob( this.toDataURL( type, quality ) ) );

        }

    }();

}


if ( !Number.isInteger ) {

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger

    Number.isInteger = function isInteger( nVal ){
        return typeof nVal === "number" && isFinite( nVal ) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor( nVal ) === nVal;
    };

}


if ( !Number.isNaN ) {

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN

    Number.isNaN = function isNaN( value ){
        return value !== value;
    };

}



if ( !Object.assign ) {

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

    Object.defineProperty( Object, "assign", {

        enumerable: false,
        configurable: true,
        writable: true,

        value: function(target, firstSource) {

            "use strict";
            if (target === undefined || target === null)
            throw new TypeError("Cannot convert first argument to object");

            var to = Object(target);

            var hasPendingException = false;
            var pendingException;

            for (var i = 1; i < arguments.length; i++) {

                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null)
                    continue;

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {

                    var nextKey = keysArray[nextIndex];
                    try {
                        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                        if (desc !== undefined && desc.enumerable)
                            to[nextKey] = nextSource[nextKey];
                    } catch (e) {
                        if (!hasPendingException) {
                            hasPendingException = true;
                            pendingException = e;
                        }
                    }

                }

                if (hasPendingException)
                    throw pendingException;

            }

            return to;

        }

    } );

}


////////////////
// Workarounds

HTMLElement.prototype.getBoundingClientRect = function(){

    // workaround for ie11 behavior with disconnected dom nodes

    var _getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

    return function(){
        try{
            return _getBoundingClientRect.apply( this, arguments );
        }catch( e ){
            return {
                top: 0,
                left: 0,
                width: this.width,
                height: this.height
            };
        }
    };

}();


///////////////
// Extensions

Object.values = function ( obj ){

    var valueList = [];

    for( var key in obj ) {

        if ( obj.hasOwnProperty( key ) ) {
            valueList.push( obj[ key ] );
        }

    }

    return valueList;

}


////////
// NGL

var NGL = {

    REVISION: '1dev',
    EPS: 0.0000001,
    disableImpostor: false,
    indexUint16: false

};


NGL.LeftMouseButton = 1;
NGL.MiddleMouseButton = 2;
NGL.RightMouseButton = 3;


NGL.SideTypes = {};
NGL.SideTypes[ THREE.FrontSide ] = "front";
NGL.SideTypes[ THREE.BackSide ] = "back";
NGL.SideTypes[ THREE.DoubleSide ] = "double";


NGL.GET = function( id ){

    var a = new RegExp( id + "=([^&#=]*)" );
    var m = a.exec( window.location.search );

    if( m ) return decodeURIComponent( m[1] );

};


NGL.createObject = function( prototype, properties ){

    var object = Object.create( prototype );

    for( var key in properties ) {

        if ( properties.hasOwnProperty( key ) ) {

            object[ key ] = properties[ key ];

        }

    }

    return object;

};


NGL.download = function( data, downloadName ){

    if( !data ){
        console.warn( "NGL.download: no data given" );
        return;
    }

    downloadName = downloadName || "download";

    var a = document.createElement( 'a' );
    a.style.display = "hidden";
    document.body.appendChild( a );
    if( data instanceof Blob ){
        a.href = URL.createObjectURL( data );
    }else{
        a.href = data;
    }
    a.download = downloadName;
    a.target = "_blank";
    a.click();

    document.body.removeChild( a );
    if( data instanceof Blob ){
        URL.revokeObjectURL( data );
    }

};


NGL.unicodeHelper = function(){

    var replace_map = {
        "{alpha}": "\u03B1",
        "{beta}": "\u03B2",
        "{gamma}": "\u03B3",
        "{dot}": "\u00B7",
        "{bullet}": "\u2022",
    }

    var keys = Object.keys( replace_map ).join('|');

    var rg = new RegExp( '(' + keys + ')', 'gi' );

    return function( str ){

        return str.replace(
            rg, function( s, p1, p2, offset, sx ){
                return replace_map[ String( s ) ];
            }
        );

    };

}();


NGL.getFileInfo = function( file ){

    var compressedExtList = [ "gz", "zip", "lzma", "bz2" ];

    var path, compressed, protocol;

    if( file instanceof File ){

        path = file.name;

    }else{

        path = file

    }

    var name = path.replace( /^.*[\\\/]/, '' );
    var base = name.substring( 0, name.lastIndexOf('.') );
    var ext = path.split('.').pop().toLowerCase();

    var protoMatch = path.match( /^(.+):\/\/(.+)$/ );
    if( protoMatch ){
        protocol = protoMatch[ 1 ].toLowerCase();
        path = protoMatch[ 2 ];
    }

    if( compressedExtList.indexOf( ext ) !== -1 ){

        compressed = ext;

        var n = path.length - ext.length - 1;
        ext = path.substr( 0, n ).split('.').pop().toLowerCase();

        var m = base.length - ext.length - 1;
        base = base.substr( 0, m );

    }else{

        compressed = false;

    }

    return {
        "path": path,
        "name": name,
        "ext": ext,
        "base": base,
        "compressed": compressed,
        "protocol": protocol
    };

}


///////////
// Object

NGL.makeObjectSignals = function( object ){

    var s = {};

    Object.keys( object.signals ).forEach( function( name ){

        s[ name ] = new signals.Signal();

    } );

    return s;

};


NGL.ObjectMetadata = function(){};

NGL.ObjectMetadata.test = function( what, repr, comp ){

    what = what || {};

    if( repr && what[ "repr" ] &&
        (
            (
                Array.isArray( what[ "repr" ] ) &&
                what[ "repr" ].indexOf( repr.name ) === -1
            )
            ||
            (
                !Array.isArray( what[ "repr" ] ) &&
                what[ "repr" ] !== repr.name
            )
        )
    ){
        return false;
    }

    if( what[ "tag" ] &&
        (
            (
                Array.isArray( what[ "tag" ] ) &&
                what[ "tag" ].indexOf( repr.name ) === -1
            )
            ||
            (
                !Array.isArray( what[ "tag" ] ) &&
                what[ "tag" ] !== repr.name
            )
        )
    ){
        return false;
    }

    if( comp && what[ "comp" ] &&
            what[ "comp" ] !== comp.name &&
            what[ "comp" ] !== comp.id
    ){
        return false;
    }

    return true;

}

NGL.ObjectMetadata.prototype = {

    constructor: NGL.ObjectMetadata,

    apply: function( object ){

        object.setName = NGL.ObjectMetadata.prototype.setName;
        object.addTag = NGL.ObjectMetadata.prototype.addTag;
        object.removeTag = NGL.ObjectMetadata.prototype.removeTag;
        object.setTags = NGL.ObjectMetadata.prototype.setTags;

        object.tags = [];

        object.signals[ "nameChanged" ] = null;

    },

    setName: function( value ){

        this.name = value;
        this.signals.nameChanged.dispatch( value );

    },

    addTag: function( value ){

    },

    removeTag: function( value ){

    },

    setTags: function( value ){

        this.tags = arguments || [];

    },

};

// File:js/ngl/geometry.js

/**
 * @file Geometry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


///////////
// Spline

NGL.Spline = function( fiber, arrows ){

    this.arrows = arrows || false;

    this.fiber = fiber;
    this.size = fiber.residueCount - 2;
    this.traceAtomname = fiber.traceAtomname;
    this.directionAtomname1 = fiber.directionAtomname1;
    this.directionAtomname2 = fiber.directionAtomname2;

    this.isNucleic = this.fiber.residues[ 0 ].isNucleic();
    this.tension = this.isNucleic ? 0.5 : 0.9;

};

NGL.Spline.prototype = {

    constructor: NGL.Spline,

    // from THREE.js
    // ASR added tension
    interpolate: function( p0, p1, p2, p3, t, tension ) {

        var v0 = ( p2 - p0 ) * tension;
        var v1 = ( p3 - p1 ) * tension;
        var t2 = t * t;
        var t3 = t * t2;
        return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 +
               ( -3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 +
               v0 * t + p1;

    },

    getSubdividedColor: function( m, type ){

        var n = this.size;
        var n1 = n - 1;
        var traceAtomname = this.traceAtomname;

        var col = new Float32Array( n1 * m * 3 + 3 );
        var pcol = new Float32Array( n1 * m * 3 + 3 );

        var colorFactory = new NGL.ColorFactory( type, this.fiber.structure );

        var k = 0;
        var j, l, mh, a2, c2, pc2, a3, c3, pc3;

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            mh = Math.ceil( m / 2 );

            a2 = r2.getAtomByName( traceAtomname );

            c2 = colorFactory.atomColor( a2 );
            pc2 = a2.globalindex + 1;

            for( j = 0; j < mh; ++j ){

                l = k + j * 3;

                col[ l + 0 ] = ( c2 >> 16 & 255 ) / 255;
                col[ l + 1 ] = ( c2 >> 8 & 255 ) / 255;
                col[ l + 2 ] = ( c2 & 255 ) / 255;

                pcol[ l + 0 ] = ( pc2 >> 16 & 255 ) / 255;
                pcol[ l + 1 ] = ( pc2 >> 8 & 255 ) / 255;
                pcol[ l + 2 ] = ( pc2 & 255 ) / 255;

            }

            a3 = r3.getAtomByName( traceAtomname );

            c3 = colorFactory.atomColor( a3 );
            pc3 = a3.globalindex + 1;

            for( j = mh; j < m; ++j ){

                l = k + j * 3;

                col[ l + 0 ] = ( c3 >> 16 & 255 ) / 255;
                col[ l + 1 ] = ( c3 >> 8 & 255 ) / 255;
                col[ l + 2 ] = ( c3 & 255 ) / 255;

                pcol[ l + 0 ] = ( pc3 >> 16 & 255 ) / 255;
                pcol[ l + 1 ] = ( pc3 >> 8 & 255 ) / 255;
                pcol[ l + 2 ] = ( pc3 & 255 ) / 255;

            }

            k += 3 * m;

        } );

        col[ n1 * m * 3 + 0 ] = col[ n1 * m * 3 - 3 ];
        col[ n1 * m * 3 + 1 ] = col[ n1 * m * 3 - 2 ];
        col[ n1 * m * 3 + 2 ] = col[ n1 * m * 3 - 1 ];

        pcol[ n1 * m * 3 + 0 ] = pcol[ n1 * m * 3 - 3 ];
        pcol[ n1 * m * 3 + 1 ] = pcol[ n1 * m * 3 - 2 ];
        pcol[ n1 * m * 3 + 2 ] = pcol[ n1 * m * 3 - 1 ];

        return {
            "color": col,
            "pickingColor": pcol
        };

    },

    getSubdividedPosition: function( m, tension ){

        if( isNaN( tension ) ) tension = this.tension;

        var pos = this.getPosition( m, tension );

        return {
            "position": pos
        }

    },

    getSubdividedOrientation: function( m, tension ){

        if( isNaN( tension ) ) tension = this.tension;

        var tan = this.getTangent( m, tension );
        var normals = this.getNormals( m, tension, tan );

        return {
            "tangent": tan,
            "normal": normals.normal,
            "binormal": normals.binormal
        }

    },

    getSubdividedSize: function( m, type, scale ){

        var n = this.size;
        var n1 = n - 1;
        var traceAtomname = this.traceAtomname;
        var arrows = this.arrows;

        var size = new Float32Array( n1 * m + 1 );

        var radiusFactory = new NGL.RadiusFactory( type, scale );

        var k = 0;
        var j, l, a2, a3, s2, s3, t;

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            a2 = r2.getAtomByName( traceAtomname );
            a3 = r3.getAtomByName( traceAtomname );

            s2 = radiusFactory.atomRadius( a2 );
            s3 = radiusFactory.atomRadius( a3 );

            if( arrows && (
                    ( r2.ss==="s" && r3.ss!=="s" ) ||
                    ( r2.ss==="h" && r3.ss!=="h" ) ||
                    ( r2.ss==="g" && r3.ss!=="g" ) ||
                    ( r2.ss==="i" && r3.ss!=="i" )
                )
            ){

                s2 *= 1.7;
                var m2 = Math.ceil( m / 2 );

                for( j = 0; j < m2; ++j ){

                    // linear interpolation
                    t = j / m2;
                    size[ k + j ] = ( 1 - t ) * s2 + t * s3;

                }

                for( j = m2; j < m; ++j ){

                    size[ k + j ] = s3;

                }

            }else{

                for( j = 0; j < m; ++j ){

                    // linear interpolation
                    t = j / m;
                    size[ k + j ] = ( 1 - t ) * s2 + t * s3;

                }

            }

            k += m;

        } );

        size[ k ] = size[ k - 1 ];

        return {
            "size": size
        };

    },

    getPosition: function( m, tension, atomname ){

        if( isNaN( tension ) ) tension = this.tension;

        if( !atomname ){
            atomname = this.traceAtomname;
        }

        var interpolate = this.interpolate;

        var n = this.size;
        var n1 = n - 1;

        var pos = new Float32Array( n1 * m * 3 + 3 );

        var k = 0;
        var dt = 1.0 / m;

        var j, l, d;
        var a1, a2, a3, a4;

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            a1 = r1.getAtomByName( atomname );
            a2 = r2.getAtomByName( atomname );
            a3 = r3.getAtomByName( atomname );
            a4 = r4.getAtomByName( atomname );

            for( j = 0; j < m; ++j ){

                d = dt * j
                l = k + j * 3;

                pos[ l + 0 ] = interpolate( a1.x, a2.x, a3.x, a4.x, d, tension );
                pos[ l + 1 ] = interpolate( a1.y, a2.y, a3.y, a4.y, d, tension );
                pos[ l + 2 ] = interpolate( a1.z, a2.z, a3.z, a4.z, d, tension );

            }

            k += 3 * m;

        } );

        a3.positionToArray( pos, k );

        return pos;

    },

    getTangent: function( m, tension, atomname ){

        if( isNaN( tension ) ) tension = this.tension;

        if( !atomname ){
            atomname = this.traceAtomname;
        }

        var interpolate = this.interpolate;

        var p1 = new THREE.Vector3();
        var p2 = new THREE.Vector3();

        var n = this.size;
        var n1 = n - 1;

        var tan = new Float32Array( n1 * m * 3 + 3 );

        var k = 0;
        var dt = 1.0 / m;
        var delta = 0.0001;

        var j, l, d, d1, d2;
        var a1, a2, a3, a4;

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            a1 = r1.getAtomByName( atomname );
            a2 = r2.getAtomByName( atomname );
            a3 = r3.getAtomByName( atomname );
            a4 = r4.getAtomByName( atomname );

            for( j = 0; j < m; ++j ){

                d = dt * j
                d1 = d - delta;
                d2 = d + delta;
                l = k + j * 3;

                // capping as a precation
                if ( d1 < 0 ) d1 = 0;
                if ( d2 > 1 ) d2 = 1;

                p1.x = interpolate( a1.x, a2.x, a3.x, a4.x, d1, tension );
                p1.y = interpolate( a1.y, a2.y, a3.y, a4.y, d1, tension );
                p1.z = interpolate( a1.z, a2.z, a3.z, a4.z, d1, tension );

                p2.x = interpolate( a1.x, a2.x, a3.x, a4.x, d2, tension );
                p2.y = interpolate( a1.y, a2.y, a3.y, a4.y, d2, tension );
                p2.z = interpolate( a1.z, a2.z, a3.z, a4.z, d2, tension );

                p2.sub( p1 ).normalize();
                p2.toArray( tan, l );

            }

            k += 3 * m;

        } );

        p2.toArray( tan, k );

        // var o = n1 * m * 3;
        // NGL.Utils.copyArray( tan, tan, o - 3, o, 3 );

        return tan;

    },

    getNormals: function( m, tension, tan ){

        var interpolate = this.interpolate;
        var traceAtomname = this.traceAtomname;
        var directionAtomname1 = this.directionAtomname1;
        var directionAtomname2 = this.directionAtomname2;
        var isNucleic = this.isNucleic;

        var n = this.size;
        var n1 = n - 1;

        var norm = new Float32Array( n1 * m * 3 + 3 );
        var bin = new Float32Array( n1 * m * 3 + 3 );

        var p1 = new THREE.Vector3();
        var p2 = new THREE.Vector3();

        var vSub1 = new THREE.Vector3();
        var vSub2 = new THREE.Vector3();
        var vSub3 = new THREE.Vector3();
        var vSub4 = new THREE.Vector3();

        var vDir = new THREE.Vector3();
        var vTan = new THREE.Vector3();
        var vNorm = new THREE.Vector3();
        var vBin = new THREE.Vector3();
        var vBinPrev = new THREE.Vector3();

        var d1a1 = new THREE.Vector3();
        var d1a2 = new THREE.Vector3();
        var d1a3 = new THREE.Vector3();
        var d1a4 = new THREE.Vector3();

        var d2a1 = new THREE.Vector3();
        var d2a2 = new THREE.Vector3();
        var d2a3 = new THREE.Vector3();
        var d2a4 = new THREE.Vector3();

        var k = 0;
        var dt = 1.0 / m;
        var first = true;
        var m2 = Math.ceil( m / 2 );

        var j, l, d, d1, d2;

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            if( first ){

                first = false;

                vNorm.set( 0, 0, 1 );

                d1a1.copy( r1.getAtomByName( directionAtomname1 ) );
                d1a2.copy( r2.getAtomByName( directionAtomname1 ) );
                d1a3.copy( r3.getAtomByName( directionAtomname1 ) );

                d2a1.copy( r1.getAtomByName( directionAtomname2 ) );
                d2a2.copy( r2.getAtomByName( directionAtomname2 ) );
                d2a3.copy( r3.getAtomByName( directionAtomname2 ) );

                vSub1.subVectors( d2a1, d1a1 );
                vSub2.subVectors( d2a2, d1a2 );
                if( vSub1.dot( vSub2 ) < 0 ){
                    vSub2.multiplyScalar( -1 );
                    d2a2.addVectors( d1a2, vSub2 );
                }

                vSub3.subVectors( d2a3, d1a3 );
                if( vSub2.dot( vSub3 ) < 0 ){
                    vSub3.multiplyScalar( -1 );
                    d2a3.addVectors( d1a3, vSub3 );
                }

            }else{

                d1a1.copy( d1a2 );
                d1a2.copy( d1a3 );
                d1a3.copy( d1a4 );

                d2a1.copy( d2a2 );
                d2a2.copy( d2a3 );
                d2a3.copy( d2a4 );

                vSub3.copy( vSub4 );

            }

            d1a4.copy( r4.getAtomByName( directionAtomname1 ) );
            d2a4.copy( r4.getAtomByName( directionAtomname2 ) );

            vSub4.subVectors( d2a4, d1a4 );
            if( vSub3.dot( vSub4 ) < 0 ){
                vSub4.multiplyScalar( -1 );
                d2a4.addVectors( d1a4, vSub4 );
            }

            for( j = 0; j < m; ++j ){

                l = k + j * 3;

                if( traceAtomname === directionAtomname1 ){

                    vDir.copy( vNorm );

                }else{

                    if( !isNucleic ){
                        // shift half a residue
                        l += m2 * 3;
                    }
                    d = dt * j

                    p1.x = interpolate( d1a1.x, d1a2.x, d1a3.x, d1a4.x, d, tension );
                    p1.y = interpolate( d1a1.y, d1a2.y, d1a3.y, d1a4.y, d, tension );
                    p1.z = interpolate( d1a1.z, d1a2.z, d1a3.z, d1a4.z, d, tension );

                    p2.x = interpolate( d2a1.x, d2a2.x, d2a3.x, d2a4.x, d, tension );
                    p2.y = interpolate( d2a1.y, d2a2.y, d2a3.y, d2a4.y, d, tension );
                    p2.z = interpolate( d2a1.z, d2a2.z, d2a3.z, d2a4.z, d, tension );

                    vDir.subVectors( p2, p1 ).normalize();

                }

                vTan.fromArray( tan, l );

                vBin.crossVectors( vDir, vTan ).normalize();
                vBin.toArray( bin, l );

                vNorm.crossVectors( vTan, vBin ).normalize();
                vNorm.toArray( norm, l );

            }

            k += 3 * m;

        } );

        if( traceAtomname !== directionAtomname1 && !isNucleic ){

            vBin.fromArray( bin, m2 * 3 );
            vNorm.fromArray( norm, m2 * 3 );

            for( j = 0; j < m2; ++j ){
                vBin.toArray( bin, j * 3 );
                vNorm.toArray( norm, j * 3 );
            }

        }else{

            vBin.toArray( bin, k );
            vNorm.toArray( norm, k );

        }

        return {
            "normal": norm,
            "binormal": bin
        }

    }

};


////////////////
// Helixorient

NGL.Helixorient = function( fiber ){

    this.fiber = fiber;
    this.traceAtomname = fiber.traceAtomname;

    this.size = fiber.residueCount;

};

NGL.Helixorient.prototype = {

    constructor: NGL.Helixorient,

    getFiber: function( smooth, padded ){

        var center = this.getPosition().center;

        var i, j, a, r, fr, fa;
        var residues = [];
        var n = center.length / 3;

        for( i = 0; i < n; ++i ){

            fr = this.fiber.residues[ i ];
            fa = fr.getAtomByName( this.traceAtomname );

            r = new NGL.Residue();
            a = new NGL.Atom( r, fa.globalindex );

            r.atoms.push( a );
            r.atomCount += 1;
            r.resname = fr.resname;
            r.index = fr.index;
            r.chain = fr.chain;

            j = 3 * i;

            a.positionFromArray( center, j );

            if( smooth ){

                var l, k, t;
                var w = Math.min( smooth, i, n - i - 1 );

                for( k = 1; k <= w; ++k ){

                    l = k * 3;
                    t = ( w + 1 - k ) / ( w + 1 );

                    a.x += t * center[ j - l + 0 ] + t * center[ j + l + 0 ];
                    a.y += t * center[ j - l + 1 ] + t * center[ j + l + 1 ];
                    a.z += t * center[ j - l + 2 ] + t * center[ j + l + 2 ];

                }

                a.x /= w + 1;
                a.y /= w + 1;
                a.z /= w + 1;

            }

            a.atomname = fa.atomname;
            a.index = fa.index;
            a.resname = fa.resname;
            a.chainname = fa.chainname;
            a.bfactor = fa.bfactor;
            a.ss = fa.ss;

            residues.push( r );

            if( padded && ( i === 0 || i === n-1 ) ){
                residues.push( r );
            }

        }

        var f = new NGL.Fiber( residues, this.fiber.structure );

        return f;

    },

    getColor: function( type ){

        var n = this.size;
        var traceAtomname = this.traceAtomname;

        var col = new Float32Array( n * 3 );
        var pcol = new Float32Array( n * 3 );

        var colorFactory = new NGL.ColorFactory( type );

        var i = 0;
        var a, c, pc;

        this.fiber.eachResidue( function( r ){

            a = r.getAtomByName( traceAtomname );

            c = colorFactory.atomColor( a );
            colorFactory.atomColorToArray( a, col, i );

            pc = a.globalindex + 1;
            pcol[ i + 0 ] = ( pc >> 16 & 255 ) / 255;
            pcol[ i + 1 ] = ( pc >> 8 & 255 ) / 255;
            pcol[ i + 2 ] = ( pc & 255 ) / 255;

            i += 3;

        } );

        return {
            "color": col,
            "pickingColor": pcol
        };

    },

    getSize: function( type, scale ){

        var n = this.size;
        var traceAtomname = this.traceAtomname;

        var size = new Float32Array( n );

        var radiusFactory = new NGL.RadiusFactory( type, scale );

        var i = 0;
        var a;

        this.fiber.eachResidue( function( r ){

            a = r.getAtomByName( traceAtomname );

            size[ i ] = radiusFactory.atomRadius( a );

            i += 1;

        } );

        return {
            "size": size
        };

    },

    getPosition: function(){

        var traceAtomname = this.traceAtomname;

        var i = 0;
        var n = this.size;

        var center = new Float32Array( 3 * n );
        var axis = new Float32Array( 3 * n );
        var diff = new Float32Array( n );
        var radius = new Float32Array( n );
        var rise = new Float32Array( n );
        var twist = new Float32Array( n );
        var resdir = new Float32Array( 3 * n );

        var tmp, j;
        var a1, a2, a3, a4;
        var diff13Length, diff24Length;

        var r12 = new THREE.Vector3();
        var r23 = new THREE.Vector3();
        var r34 = new THREE.Vector3();

        var diff13 = new THREE.Vector3();
        var diff24 = new THREE.Vector3();

        var v1 = new THREE.Vector3();
        var v2 = new THREE.Vector3();

        var _axis = new THREE.Vector3();
        var _prevAxis = new THREE.Vector3();

        var _resdir = new THREE.Vector3();
        var _crossdir = new THREE.Vector3();
        var _center = new THREE.Vector3( 0, 0, 0 );

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            j = 3 * i;

            a1 = r1.getAtomByName( traceAtomname );
            a2 = r2.getAtomByName( traceAtomname );
            a3 = r3.getAtomByName( traceAtomname );
            a4 = r4.getAtomByName( traceAtomname );

            // ported from GROMACS src/tools/gmx_helixorient.c

            r12.subVectors( a2, a1 );
            r23.subVectors( a3, a2 );
            r34.subVectors( a4, a3 );

            diff13.subVectors( r12, r23 );
            diff24.subVectors( r23, r34 );

            _axis.crossVectors( diff13, diff24 ).normalize();
            _axis.toArray( axis, j );

            if( i > 0 ){
                diff[ i ] = _axis.angleTo( _prevAxis );
            }

            tmp = Math.cos( diff13.angleTo( diff24 ) );
            twist[ i ] = 180.0 / Math.PI * Math.acos( tmp );

            diff13Length = diff13.length();
            diff24Length = diff24.length();

            radius[ i ] = (
                Math.sqrt( diff24Length * diff13Length ) /
                ( 2.0 * ( 1.0 - tmp ) )
            );

            rise[ i ] = Math.abs( r23.dot( _axis ) );

            //

            v1.copy( diff13 ).multiplyScalar( radius[ i ] / diff13Length );
            v2.copy( diff24 ).multiplyScalar( radius[ i ] / diff24Length );

            v1.subVectors( a2, v1 );
            v2.subVectors( a3, v2 );

            v1.toArray( center, j + 3 );
            v2.toArray( center, j + 6 );

            //

            _resdir.subVectors( a1, _center );
            _resdir.toArray( resdir, j );

            i += 1;
            _prevAxis.copy( _axis );
            _center.copy( v1 );

        } );

        //

        var res = this.fiber.residues;

        // calc axis as dir of second and third center pos
        // project first traceAtom onto axis to get first center pos
        v1.fromArray( center, 3 );
        v2.fromArray( center, 6 );
        _axis.subVectors( v1, v2 ).normalize();
        _center.copy( res[ 0 ].getAtomByName( traceAtomname ) );
        v1 = NGL.Utils.pointVectorIntersection( _center, v1, _axis );
        v1.toArray( center, 0 );

        // calc first resdir
        _resdir.subVectors( _center, v1 );
        _resdir.toArray( resdir, 0 );

        // calc axis as dir of n-1 and n-2 center pos
        // project last traceAtom onto axis to get last center pos
        v1.fromArray( center, 3 * n - 6 );
        v2.fromArray( center, 3 * n - 9 );
        _axis.subVectors( v1, v2 ).normalize();
        _center.copy( res[ n - 1 ].getAtomByName( traceAtomname ) );
        v1 = NGL.Utils.pointVectorIntersection( _center, v1, _axis );
        v1.toArray( center, 3 * n - 3 );

        // calc last three resdir
        for( i = n - 3; i < n; ++i ){

            v1.fromArray( center, 3 * i );
            _center.copy( res[ i ].getAtomByName( traceAtomname ) );

            _resdir.subVectors( _center, v1 );
            _resdir.toArray( resdir, 3 * i );

        }

        // average measures to define them on the residues

        var resRadius = new Float32Array( n );
        var resTwist = new Float32Array( n );
        var resRise = new Float32Array( n );
        var resBending = new Float32Array( n );

        resRadius[ 1 ] = radius[ 0 ];
        resTwist[ 1 ] = twist[ 0 ];
        resRise[ 1 ] = radius[ 0 ];

        for( i = 2; i < n - 2; i++ ){

            resRadius[ i ] = 0.5 * ( radius[ i - 2 ] + radius[ i - 1 ] );
            resTwist[ i ] = 0.5 * ( twist[ i - 2 ] + twist[ i - 1 ] );
            resRise[ i ] = 0.5 * ( rise[ i - 2 ] + rise[ i - 1 ] );

            v1.fromArray( axis, 3 * ( i - 2 ) );
            v2.fromArray( axis, 3 * ( i - 1 ) );
            resBending[ i ] = 180.0 / Math.PI * Math.acos( Math.cos( v1.angleTo( v2 ) ) );

        }

        resRadius[ n - 2 ] = radius[ n - 4 ];
        resTwist[ n - 2 ] = twist[ n - 4 ];
        resRise[ n - 2 ] = rise[ n - 4 ];

        // average helix axes to define them on the residues

        var resAxis = new Float32Array( 3 * n );

        NGL.Utils.copyArray( axis, resAxis, 0, 0, 3 );
        NGL.Utils.copyArray( axis, resAxis, 0, 3, 3 );

        for( i = 2; i < n - 2; i++ ){

            v1.fromArray( axis, 3 * ( i - 2 ) );
            v2.fromArray( axis, 3 * ( i - 1 ) );

            _axis.addVectors( v2, v1 ).multiplyScalar( 0.5 ).normalize();
            _axis.toArray( resAxis, 3 * i );

        }

        NGL.Utils.copyArray( axis, resAxis, 3 * n - 12, 3 * n - 6, 3 );
        NGL.Utils.copyArray( axis, resAxis, 3 * n - 12, 3 * n - 3, 3 );

        return {
            "center": center,
            "axis": resAxis,
            "bending": resBending,
            "radius": resRadius,
            "rise": resRise,
            "twist": resTwist,
            "resdir": resdir,
        };

    }

};


//////////
// Helix

NGL.Helix = function(){

    this.begin = new THREE.Vector3();
    this.end = new THREE.Vector3();
    this.axis = new THREE.Vector3();
    this.center = new THREE.Vector3();

    this.length = 0;

    this.residues = [];
    this.size = 0;

};

NGL.Helix.prototype = {

    constructor: NGL.Helix,

    fromHelixbundleAxis: function(){

        var v = new THREE.Vector3();

        return function( axis, i ){

            this.begin.fromArray( axis.begin, i * 3 );
            this.end.fromArray( axis.end, i * 3 );
            this.axis.fromArray( axis.axis, i * 3 );
            this.center.fromArray( axis.center, i * 3 );

            this.length = v.subVectors( this.begin, this.end ).length();

            this.residues = axis.residue[ i ];
            this.size = this.residues.length;

            return this;

        }

    }(),

    angleTo: function(){

        var v = new THREE.Vector3();

        return function( helix ){

            var s = v.crossVectors( this.axis, helix.axis ).length();
            var c = this.axis.dot( helix.axis );
            var angle = Math.atan2( s, c );

            return c < 0 ? -angle : angle;

        }

    }(),

    distanceTo: function(){

        var x = new THREE.Vector3();
        var y = new THREE.Vector3();
        var c = new THREE.Vector3();

        return function( helix ){

            this.crossingPoints( helix, x, y );

            c.subVectors( y, x );

            return c.length();

        }

    }(),

    crossingPoints: function(){

        var w = new THREE.Vector3();
        var v = new THREE.Vector3();
        var ca = new THREE.Vector3();
        var cb = new THREE.Vector3();

        return function( helix, x, y ){

            // U = A2-A1;
            // V = B2-B1;
            // W = cross(U,V);
            // X = A1 + dot(cross(B1-A1,V),W)/dot(W,W)*U;
            // Y = B1 + dot(cross(B1-A1,U),W)/dot(W,W)*V;
            // d = norm(Y-X);

            if( !x ) x = new THREE.Vector3();
            if( !y ) y = new THREE.Vector3();

            w.crossVectors( this.axis, helix.axis );
            v.subVectors( helix.begin, this.begin );

            var dotWW = w.dot( w );
            var dotA = ca.crossVectors( v, helix.axis ).dot( w );
            var dotB = cb.crossVectors( v, this.axis ).dot( w );

            x.copy( this.axis ).multiplyScalar( dotA / dotWW ).add( this.begin );
            y.copy( helix.axis ).multiplyScalar( dotB / dotWW ).add( helix.begin );

            return [ x, y ];

        }

    }(),

    crossing: function( helix ){

        var data = {};

        var angle = this.angleTo( helix ) / ( Math.PI / 180 );
        var cp = this.crossingPoints( helix );

        var lineContact = (
            NGL.Utils.isPointOnSegment( cp[ 0 ], this.begin, this.end ) &&
            NGL.Utils.isPointOnSegment( cp[ 1 ], helix.begin, helix.end )
        );

        var i1 = NGL.Utils.pointVectorIntersection(
            this.begin, helix.begin, helix.axis
        );
        var i2 = NGL.Utils.pointVectorIntersection(
            this.end, helix.begin, helix.axis
        );
        var i3 = NGL.Utils.pointVectorIntersection(
            helix.begin, this.begin, this.axis
        );
        var i4 = NGL.Utils.pointVectorIntersection(
            helix.end, this.begin, this.axis
        );

        var c1 = NGL.Utils.isPointOnSegment(
            i1, helix.begin, helix.end
        );
        var c2 = NGL.Utils.isPointOnSegment(
            i2, helix.begin, helix.end
        );
        var c3 = NGL.Utils.isPointOnSegment(
            i3, this.begin, this.end
        );
        var c4 = NGL.Utils.isPointOnSegment(
            i4, this.begin, this.end
        );

        var overlap = [ 0, 0, 0, 0 ];

        if( c1 && c2 ){
            overlap[ 0 ] = i1.distanceTo( i2 );
        }
        if( c3 && c4 ){
            overlap[ 1 ] = i3.distanceTo( i4 );
        }
        if( c1 && !c2 ){
            if( i2.distanceTo( helix.begin ) < i2.distanceTo( helix.end ) ){
                overlap[ 2 ] = i1.distanceTo( helix.begin );
            }else{
                overlap[ 2 ] = i1.distanceTo( helix.end );
            }
        }
        if( !c1 && c2 ){
            if( i1.distanceTo( helix.begin ) < i1.distanceTo( helix.end ) ){
                overlap[ 2 ] = i2.distanceTo( helix.begin );
            }else{
                overlap[ 2 ] = i2.distanceTo( helix.end );
            }
        }
        if( c3 && !c4 ){
            if( i4.distanceTo( this.begin ) < i4.distanceTo( this.end ) ){
                overlap[ 3 ] = i3.distanceTo( this.begin );
            }else{
                overlap[ 3 ] = i3.distanceTo( this.end );
            }
        }
        if( !c3 && c4 ){
            if( i3.distanceTo( this.begin ) < i3.distanceTo( this.end ) ){
                overlap[ 3 ] = i4.distanceTo( this.begin );
            }else{
                overlap[ 3 ] = i4.distanceTo( this.end );
            }
        }

        var maxOverlap = Math.max.apply( null, overlap );

        var onSegment = [ c1, c2, c3, c4 ];

        if( !lineContact ){

            var candidates = [];

            if( angle > 120 || angle < 60 ){

                candidates.push( {
                    "distance": this.begin.distanceTo( i1 ),
                    "contact": c1,
                    "p1": this.begin,
                    "p2": i1
                } );

                candidates.push( {
                    "distance": this.end.distanceTo( i2 ),
                    "contact": c2,
                    "p1": this.end,
                    "p2": i2
                } );

                candidates.push( {
                    "distance": helix.begin.distanceTo( i3 ),
                    "contact": c3,
                    "p1": helix.begin,
                    "p2": i3
                } );

                candidates.push( {
                    "distance": helix.end.distanceTo( i4 ),
                    "contact": c4,
                    "p1": helix.end,
                    "p2": i4
                } );

            }

            //

            if( maxOverlap > 0 && ( angle > 120 || angle < 60 ) ){

                candidates.push( {
                    "distance": this.begin.distanceTo( helix.begin ),
                    "contact": true,
                    "p1": this.begin,
                    "p2": helix.begin
                } );

                candidates.push( {
                    "distance": this.begin.distanceTo( helix.end ),
                    "contact": true,
                    "p1": this.begin,
                    "p2": helix.end
                } );

                candidates.push( {
                    "distance": this.end.distanceTo( helix.begin ),
                    "contact": true,
                    "p1": this.end,
                    "p2": helix.begin
                } );

                candidates.push( {
                    "distance": this.end.distanceTo( helix.end ),
                    "contact": true,
                    "p1": this.end,
                    "p2": helix.end
                } );

            }

            //

            data.distance = Infinity;
            candidates.forEach( function( c ){
                if( c.contact && c.distance < data.distance ){
                    data = c;
                }
            } );

        }else{

            data = {
                "distance": this.distanceTo( helix ),
                "contact": true,
                "p1": cp[ 0 ],
                "p2": cp[ 1 ]
            };

        }

        return Object.assign( {
            "distance": Infinity,
            "contact": false,
            "angle": angle,
            "onSegment": onSegment,
            "overlap": overlap,
            "maxOverlap": maxOverlap,
            "lineContact": lineContact
        }, data );

    }

};


////////////////
// Helixbundle

NGL.Helixbundle = function( fiber ){

    this.fiber = fiber;
    this.traceAtomname = fiber.traceAtomname;

    this.helixorient = new NGL.Helixorient( fiber );
    this.position = this.helixorient.getPosition();

    this.size = fiber.residueCount;

};

NGL.Helixbundle.prototype = {

    constructor: NGL.Helixbundle,

    getFiber: function( smooth ){

    },

    getColor: function( type ){

    },

    getSize: function( type, scale ){

    },

    getAxis: function( localAngle, centerDist, ssBorder, color, radius, scale ){

        localAngle = localAngle || 30;
        centerDist = centerDist || 2.5;
        ssBorder = ssBorder === undefined ? false : ssBorder;

        var pos = this.position;

        var colorFactory = new NGL.ColorFactory( color, this.fiber.structure );
        var radiusFactory = new NGL.RadiusFactory( radius, scale );

        var i, r, r2, a;
        var j = 0;
        var k = 0;
        var n = this.size;
        var traceAtomname = this.traceAtomname;

        var res = this.fiber.residues;

        var axis = [];
        var center = [];
        var beg = [];
        var end = [];
        var col = [];
        var pcol = [];
        var size = [];
        var residue = [];

        var tmpAxis = [];
        var tmpCenter = [];

        var _axis, _center
        var _beg = new THREE.Vector3();
        var _end = new THREE.Vector3();

        var c = new THREE.Vector3();
        var c2 = new THREE.Vector3();

        var split = false;

        for( i = 0; i < n; ++i ){

            r = res[ i ];
            c.fromArray( pos.center, i * 3 );

            if( i === n - 1 ){
                split = true;
            }else{

                r2 = res[ i + 1 ];
                c2.fromArray( pos.center, i * 3 + 3 );

                if( ssBorder && r.ss !== r2.ss ){
                    split = true;
                }else if( c.distanceTo( c2 ) > centerDist ){
                    split = true;
                }else if( pos.bending[ i ] > localAngle ){
                    split = true;
                }

            }

            if( split ){

                if( i - j < 4 ){

                    j = i;
                    split = false;
                    continue;

                }

                a = r.getAtomByName( traceAtomname );

                // ignore first and last axis
                tmpAxis = pos.axis.subarray( j * 3 + 3, i * 3 );
                tmpCenter = pos.center.subarray( j * 3, i * 3 + 3 );

                _axis = NGL.Utils.calculateMeanVector3( tmpAxis ).normalize();
                _center = NGL.Utils.calculateMeanVector3( tmpCenter );

                _beg.fromArray( tmpCenter );
                _beg = NGL.Utils.pointVectorIntersection( _beg, _center, _axis );

                _end.fromArray( tmpCenter, tmpCenter.length - 3 );
                _end = NGL.Utils.pointVectorIntersection( _end, _center, _axis );

                _axis.subVectors( _end, _beg );

                _axis.toArray( axis, k );
                _center.toArray( center, k );
                _beg.toArray( beg, k );
                _end.toArray( end, k );

                colorFactory.atomColorToArray( a, col, k );

                var pc = a.globalindex + 1;
                pcol[ k + 0 ] = ( pc >> 16 & 255 ) / 255;
                pcol[ k + 1 ] = ( pc >> 8 & 255 ) / 255;
                pcol[ k + 2 ] = ( pc & 255 ) / 255;

                size.push( radiusFactory.atomRadius( a ) );

                residue.push( res.slice( j, i + 1 ) );

                k += 3;
                j = i;
                split = false;

            }

        }

        return {
            "axis": new Float32Array( axis ),
            "center": new Float32Array( center ),
            "begin": new Float32Array( beg ),
            "end": new Float32Array( end ),
            "color": new Float32Array( col ),
            "pickingColor": new Float32Array( pcol ),
            "size": new Float32Array( size ),
            "residue": residue,
        };

    },

    getPosition: function(){

    }

};


/////////////////
// HelixCrossing

NGL.HelixCrossing = function( helices ){

    this.helices = helices;

};

NGL.HelixCrossing.prototype = {

    constructor: NGL.HelixCrossing,

    getCrossing: function( minDistance ){

        minDistance = minDistance || 12;

        var helices = this.helices;

        var helixLabel = [];
        var helixCenter = [];
        var crossingBeg = [];
        var crossingEnd = [];
        var info = [];

        var k = 0;

        for( var i = 0; i < helices.length; ++i ){

            var h1 = helices[ i ];

            helixLabel.push( "H" + ( i + 1 ) );
            h1.center.toArray( helixCenter, i * 3 );

            for( var j = i + 1; j < helices.length; ++j ){

                var c = h1.crossing( helices[ j ] );

                if( c.contact && c.distance < minDistance ){

                    info.push( {
                        "helix1": i + 1,
                        "helix2": j + 1,
                        "angle": c.angle,
                        "distance": c.distance,
                        "overlap": c.maxOverlap
                    } );

                    c.p1.toArray( crossingBeg, k * 3 );
                    c.p2.toArray( crossingEnd, k * 3 );
                    k += 1;

                }

            }

        }

        return {
            "helixLabel": helixLabel,
            "helixCenter": helixCenter,
            "begin": crossingBeg,
            "end": crossingEnd,
            "info": info
        }

    }

};


// File:js/ngl/structure.js

/**
 * @file Structure
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
    "LV": 0xFFFFFF, "UUH": 0xFFFFFF,

    "D": 0xFFFFC0, "T": 0xFFFFA0,

    "": 0xFFFFFF
};


// from Jmol http://jmol.sourceforge.net/jscolors/ (protein + shapely for nucleic)
/*NGL._ResidueColors = {
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
    "ASH": 0xFF69B4,
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
};*/
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


// PDB helix record encoding
NGL.HelixTypes = {
    1: "h",  // Right-handed alpha (default)
    2: "h",  // Right-handed omega
    3: "i",  // Right-handed pi
    4: "h",  // Right-handed gamma
    5: "g",  // Right-handed 310
    6: "h",  // Left-handed alpha
    7: "h",  // Left-handed omega
    8: "h",  // Left-handed gamma
    9: "h",  // 27 ribbon/helix
    10: "h",  // Polyproline
    "": "h",
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


// molecule types
NGL.UnknownType = 0;
NGL.CgType = 1;
NGL.ProteinType = 2;
NGL.ProteinBackboneType = 3;
NGL.NucleicType = 4;
NGL.NucleicBackboneType = 5;
NGL.WaterType = 6;


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
    'THR': 'T',
    'UNK': ''
};


// REMEMBER not synced with worker
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

NGL.ColorFactory.types = {

    "": "",
    "element": "by element",
    "resname": "by residue name",
    "ss": "by secondary structure",
    "atomindex": "by atom index",
    "residueindex": "by residue index",
    "chainindex": "by chain index",
    "modelindex": "by model index",
    "picking": "by picking id",
    "random": "random",
    "color": "color"

}

NGL.ColorFactory.prototype = {

    constructor: NGL.ColorFactory,

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
                }else if( a.ss === "g" ){
                    c = strucColors[ "3_10Helix" ];
                }else if( a.ss === "i" ){
                    c = strucColors[ "piHelix" ];
                }else if( a.ss === "s" ){
                    c = strucColors[ "betaStrand" ];
                }else if( a.residue.isNucleic() ){
                    c = strucColors[ "dna" ];
                }else if( a.residue.isProtein() || a.ss === "c" ){
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

    },

    atomColorToArray: function( a, array, offset ){

        var c = this.atomColor( a );

        if( array === undefined ) array = [];
        if( offset === undefined ) offset = 0;

        array[ offset + 0 ] = ( c >> 16 & 255 ) / 255;
        array[ offset + 1 ] = ( c >> 8 & 255 ) / 255;
        array[ offset + 2 ] = ( c & 255 ) / 255;

        return array;

    }

};


NGL.RadiusFactory = function( type, scale ){

    this.type = type;
    this.scale = scale || 1.0;

    this.max = 10;

}

NGL.RadiusFactory.types = {

    "": "",
    "vdw": "by vdW radius",
    "covalent": "by covalent radius",
    "ss": "by secondary structure",
    "bfactor": "by bfactor",
    "size": "size"

}

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

            case "ss":

                if( a.ss === "h" ){
                    r = 0.25;
                }else if( a.ss === "g" ){
                    r = 0.25;
                }else if( a.ss === "i" ){
                    r = 0.25;
                }else if( a.ss === "s" ){
                    r = 0.25;
                // }else if( a.atomname === "P" ){
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

}

NGL.LabelFactory.types = {

    "": "",
    "atomname": "atom name",
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

                l = this.text[ a.globalindex ];
                break;

            default:

                l = a.qualifiedName();
                break;

        }

        return l === undefined ? '' : l;

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

        object.getAtoms = NGL.AtomSet.prototype.getAtoms;

        object.getBoundingBox = NGL.AtomSet.prototype.getBoundingBox;

        object.atomPosition = NGL.AtomSet.prototype.atomPosition;
        object.atomColor = NGL.AtomSet.prototype.atomColor;
        object.atomRadius = NGL.AtomSet.prototype.atomRadius;
        object.atomCenter = NGL.AtomSet.prototype.atomCenter;
        object.atomIndex = NGL.AtomSet.prototype.atomIndex;

    },

    getAtoms: function( selection, first ){

        var atoms;

        if( selection ){

            atoms = [];

            this.eachAtom( function( a ){

                atoms.push( a );

            }, selection );

        }else{

            atoms = this.atoms;

        }

        if( first ){

            // TODO early exit after first atom is found
            return atoms[ 0 ];

        }else{

            return atoms;

        }

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

    getBoundingBox: function( selection ){

        var box = new THREE.Box3();
        var vector = new THREE.Vector3();

        var a;
        var i = 0;
        var n = this.atomCount;

        if( selection ){

            var test = selection.test;

            for( i = 0; i < n; ++i ){

                a = this.atoms[ i ];

                if( test( a ) ){

                    vector.copy( a );
                    box.expandByPoint( vector );

                }

            };

        }else{

            for( i = 0; i < n; ++i ){

                vector.copy( this.atoms[ i ] );
                box.expandByPoint( vector );

            };

        }

        return box;

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

        var j, position, a;

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

            var a;
            var i = 0;
            var n = this.atomCount;

            box.makeEmpty();

            if( selection ){

                var test = selection.test;

                for( i = 0; i < n; ++i ){

                    a = this.atoms[ i ];

                    if( test( a ) ){

                        vector.copy( a );
                        box.expandByPoint( vector );

                    }

                };

            }else{

                for( i = 0; i < n; ++i ){

                    vector.copy( this.atoms[ i ] );
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

        var j, position, b;

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
    this.bondCount = 0;

};

NGL.BondSet.prototype = {

    constructor: NGL.BondSet,

    addBond: function( atom1, atom2, notToAtoms ){

        var b = new NGL.Bond( atom1, atom2 );

        if( !notToAtoms ){
            atom1.bonds.push( b );
            atom2.bonds.push( b );
        }
        this.bonds.push( b );

        this.bondCount += 1;

    },

    addBondIfConnected: function( atom1, atom2, notToAtoms ){

        if( atom1.connectedTo( atom2 ) ){

            this.addBond( atom1, atom2, notToAtoms );

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

    constructor: NGL.Bond,

    atom1: undefined,
    atom2: undefined,
    bondOrder: undefined,

    qualifiedName: function(){

        return this.atom1.index + "=" + this.atom2.index;

    }

};


/////////
// Math

NGL.Matrix = function( columns, rows ){

    var dtype = jsfeat.F32_t | jsfeat.C1_t;

    return new jsfeat.matrix_t( columns, rows, dtype );

};


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

    constructor: NGL.Superposition,

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

    postProcess: function( callback ){

        var self = this;

        async.series( [

            function( wcallback ){

                self.autoBond();
                wcallback();

            },

            function( wcallback ){

                if( self._doAutoSS ){
                    self.autoSS();
                }
                wcallback();

            },

            function( wcallback ){

                if( self._doAutoChainName ){
                    self.autoChainName();
                }
                wcallback();

            },

            function( wcallback ){

                self.center = self.atomCenter();
                self.boundingBox = self.getBoundingBox();
                wcallback();

            }

        ], function(){

            callback();

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

    /*autoBond2: function( callback ){

        console.time( "NGL.Structure.autoBond" );

        var bondSet = this.bondSet;

        var i, j, n, ra, a1, a2;

        // bonds within a residue

        console.time( "NGL.Structure.autoBond within" );

        var chainRes = [];

        this.eachChain( function( c ){

            chainRes.push( c.residues );

        } );

        function _chunked( _i, _n ){

            for( var k = _i; k < _n; ++k ){

                var cr = chainRes[ k ];
                var crn = cr.length

                for( var l = 0; l < crn; ++l ){

                    var r = cr[ l ];
                    n = r.atomCount - 1;
                    ra = r.atoms;

                    for( i = 0; i < n; i++ ){

                        a1 = ra[ i ];

                        for( j = i + 1; j <= n; j++ ){

                            a2 = ra[ j ];

                            bondSet.addBondIfConnected( a1, a2 );

                        }

                    }

                }

            }

        }

        NGL.processArray(

            chainRes,

            _chunked,

            function(){

                console.timeEnd( "NGL.Structure.autoBond within" );

                callback();

            },

            100

        );

    },*/

    autoBond: function(){

        console.time( "NGL.Structure.autoBond" );

        var bondSet = this.bondSet;

        var i, j, n, ra, a1, a2;

        // bonds within a residue

        console.time( "NGL.Structure.autoBond within" );

        this.eachResidue( function( r ){

            ra = r.atoms;
            n = r.atomCount - 1;

            for( i = 0; i < n; i++ ){

                a1 = ra[ i ];

                for( j = i + 1; j <= n; j++ ){

                    a2 = ra[ j ];

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
                    r1.getAtomByName([ "CA", "BB" ]),
                    r2.getAtomByName([ "CA", "BB" ])
                );

            }

        } );

        console.timeEnd( "NGL.Structure.autoBond between" );

        console.timeEnd( "NGL.Structure.autoBond" );

    },

    autoSS: function(){

        // Implementation for proteins based on "pv"
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

        var proteinFiber = function( f ){

            var i;

            var n = f.residueCount;

            for( i = 0; i < n; ++i ){

                if( isHelical( f, i ) ){

                    f.residues[ i ].ss = "h";

                }else if( isSheet( f, i ) ){

                    f.residues[ i ].ss = "s";

                }else{

                    f.residues[ i ].ss = "c";

                }

            }

        }

        var cgFiber = function( f ){

            var localAngle = 20;
            var centerDist = 2.0;

            var helixbundle = new NGL.Helixbundle( f );

            var pos = helixbundle.position;
            var res = helixbundle.fiber.residues;

            var n = helixbundle.size;

            var c = new THREE.Vector3();
            var c2 = new THREE.Vector3();

            var i, d, r, r2;

            for( i = 0; i < n - 1; ++i ){

                r = res[ i ];
                r2 = res[ i + 1 ];

                c.fromArray( pos.center, i * 3 );
                c2.fromArray( pos.center, i * 3 + 3 );

                d = c.distanceTo( c2 );

                // console.log( r.ss, r2.ss, c.distanceTo( c2 ), pos.bending[ i ] )

                if( d < centerDist && d > 1.0 &&
                        pos.bending[ i ] < localAngle ){

                    r.ss = "h";
                    r2.ss = "h";

                }

            }

        }

        return function(){

            console.time( "NGL.Structure.autoSS" );

            // assign secondary structure

            this.eachFiber( function( f ){

                if( f.residueCount < 4 ) return;

                if( f.isProtein() ){

                    proteinFiber( f );

                }else if( f.isCg() ){

                    cgFiber( f );

                }

            } );

            // set lone secondary structure assignments to "c"

            this.eachFiber( function( f ){

                if( !f.isProtein() && !f.isCg ) return;

                var r;
                var ssType = undefined;
                var ssCount = 0;

                f.eachResidueN( 2, function( r1, r2 ){

                    if( r1.ss===r2.ss ){

                        ssCount += 1;

                    }else{

                        if( ssCount===1 ){

                            r1.ss = "c";

                        }

                        ssCount = 1;

                    }

                    r = r2;

                } );

                if( ssCount===1 ){

                    r.ss = "c";

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

            var i, name;

            this.eachModel( function( m ){

                i = 0;

                m.eachFiber( function( f ){

                    name = names[ i ];

                    f.eachAtom( function( a ){

                        a.chainname = name;

                    } );

                    i += 1;

                    if( i === n ){

                        console.warn( "out of chain names" );

                        i = 0;

                    }

                } )

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
            pdbRecords.push( sprintf( "TITEL %-74s\n", this.name ) );

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

NGL.AtomSet.prototype.apply( NGL.Structure.prototype );


NGL.Model = function( structure ){

    this.structure = structure;
    this.chains = [];

    this.atomCount = 0;
    this.residueCount = 0;
    this.chainCount = 0;

};

NGL.Model.prototype = {

    constructor: NGL.Model,

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

                // console.log( c.chainname, selection.selection, selection.string )

                if( test( c ) ){
                    c.eachAtom( callback, selection );
                }else{
                    // console.log( "chain", c.chainname );
                }

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

    constructor: NGL.Chain,

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

            // console.log( r1.resno, r2.resno );

            if( r1.hasProteinBackbone() && r2.hasProteinBackbone() ){

                a1 = r1.getAtomByName( 'C' );
                a2 = r2.getAtomByName( 'N' );

            }else if( r1.hasNucleicBackbone() && r2.hasNucleicBackbone() ){

                a1 = r1.getAtomByName([ "O3'", "O3*" ]);
                a2 = r2.getAtomByName( 'P' );

            }else if( r1.isCg() && r2.isCg() ){

                a1 = r1.getAtomByName([ 'CA', 'BB' ]);
                a2 = r2.getAtomByName([ 'CA', 'BB' ]);

            }else{

                if( ( r1.hasProteinBackbone() && !r2.hasProteinBackbone() ) ||
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

        if( residues[ i ].hasProteinBackbone() ||
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

        var bases = [ "A", "C", "T", "G", "U" ];

        if( bases.indexOf( this.residues[ 0 ].resname ) !== -1 ){

            this.traceAtomname = [ "C4'", "C4*" ];
            this.directionAtomname1 = [ "C1'", "C1*" ];
            this.directionAtomname2 = [ "C3'", "C3*" ];

        }else{

            this.traceAtomname = [ "C3'", "C3*" ];
            this.directionAtomname1 = [ "C2'", "C2*" ];
            this.directionAtomname2 = [ "O4'", "O4*" ];

        }

    }else if( this.isCg() ){

        this.traceAtomname = [ "CA", "BB" ];
        this.directionAtomname1 = this.traceAtomname;
        this.directionAtomname2 = this.traceAtomname;

    }else{

        console.error( "NGL.fiber: could not determine molecule type" );

    }

};

NGL.Fiber.prototype = {

    constructor: NGL.Fiber,

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

    }

};


NGL.Residue = function( chain ){

    this.chain = chain;
    this.atoms = [];

    this.atomCount = 0;

};

NGL.Residue.prototype = {

    constructor: NGL.Residue,

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
                this.getAtomByName( "N" ) !== undefined;

        }

        return this._protein;

    },

    hasProteinBackbone: function(){

        if( this._proteinBackbone === undefined ){

            this._proteinBackbone = this.isProtein() &&
                this.getAtomByName([ "O", "OC1", "O1" ]) !== undefined;

        }

        return this._proteinBackbone;

    },

    isCg: function(){

        var AA3 = Object.keys( NGL.AA1 );

        return function(){

            if( this._cg === undefined ){

                this._cg = !this.isProtein() &&
                    this.getAtomByName([ "CA", "BB" ]) &&
                    this.atomCount <= 5 &&
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

                this._nucleic = ( this.getAtomByName([ "C3'", "C3*" ]) !== undefined
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
                this.getAtomByName([ "P" ]) !== undefined &&
                this.getAtomByName([ "C3'", "C3*" ]) !== undefined;

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

        var water = [ "SOL", "WAT", "HOH", "H2O", "W" ];

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

            if( this.hasProteinBackbone() ){
                this._type = NGL.ProteinBackboneType;
            }else if( this.isProtein() ){
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

    addAtom: function( a ){

        if( !a ){
            a = new NGL.Atom( this );
        }else{
            a.residue = this;
        }
        a.index = this.nextAtomIndex();
        this.atoms.push( a );
        return a;

    },

    addProxyAtom: function( atomArray ){

        var a = new NGL.ProxyAtom( atomArray, this.nextAtomIndex() );
        a.residue = this;
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

            return this.getAtomByName([ 'CA', 'BB' ]);

        }

    },

    getBackboneAtomEnd: function(){

        if( this.isProtein() ){

            return this.getAtomByName( 'N' );

        }else if( this.hasNucleicBackbone() ){

            return this.getAtomByName( 'P' );
            // return this.getAtomByName([ "C3'", "C3*" ]);

        }else if( this.isCg() ){

            return this.getAtomByName([ 'CA', 'BB' ]);

        }

    },

    connectedTo: function( rNext ){

        return this.getBackboneAtomStart().connectedTo(
            rNext.getBackboneAtomEnd()
        );

    }

};

NGL.AtomSet.prototype.apply( NGL.Residue.prototype );


NGL.Atom = function( residue, globalindex ){

    this.residue = residue;

    if( globalindex === undefined ){
        globalindex = NGL.nextGlobalAtomindex++;
    }
    this.globalindex = globalindex;

}

NGL.Atom.prototype = {

    constructor: NGL.Atom,

    index: undefined,
    atomno: undefined,
    resname: undefined,
    x: undefined,
    y: undefined,
    z: undefined,
    element: undefined,
    chainname: undefined,
    resno: undefined,
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

        if( this.hetero && atom.hetero &&
            this.residue.chain.model.structure.hasConnect ) return false;

        if( !( this.altloc === '' || atom.altloc === '' ||
                ( this.altloc === atom.altloc ) ) ) return false;

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

    },

    positionFromArray: function( array, offset ){

        if( offset === undefined ) offset = 0;

        this.x = array[ offset + 0 ];
        this.y = array[ offset + 1 ];
        this.z = array[ offset + 2 ];

        return this;

    },

    positionToArray: function( array, offset ){

        if( array === undefined ) array = [];
        if( offset === undefined ) offset = 0;

        array[ offset + 0 ] = this.x;
        array[ offset + 1 ] = this.y;
        array[ offset + 2 ] = this.z;

        return array;

    },

    copy: function( atom ){

        this.index = atom.index;
        this.atomno = atom.atomno;
        this.resname = atom.resname;
        this.x = atom.x;
        this.y = atom.y;
        this.z = atom.z;
        this.element = atom.element;
        this.chainname = atom.chainname;
        this.resno = atom.resno;
        this.serial = atom.serial;
        this.ss = atom.ss;
        this.vdw = atom.vdw;
        this.covalent = atom.covalent;
        this.hetero = atom.hetero;
        this.bfactor = atom.bfactor;
        this.bonds = atom.bonds;
        this.altloc = atom.altloc;
        this.atomname = atom.atomname;
        this.modelindex = atom.modelindex;

        this.residue = atom.residue;

        return this;

    }

}


NGL.AtomArray = function( sizeOrObject ){

    this.useBuffer = false;

    if( Number.isInteger( sizeOrObject ) ){

        this.init( sizeOrObject );

    }else{

        this.fromObject( sizeOrObject );

    }

};

NGL.AtomArray.prototype = {

    constructor: NGL.AtomArray,

    init: function( size ){

        this.length = size;

        if( this.useBuffer ){

            this.makeOffsetAndSize();
            this.buffer = new ArrayBuffer( this.byteLength );
            this.makeTypedArrays();

        }else{

            this.atomno = new Int32Array( size );
            this.resname = new Uint8Array( 5 * size );
            this.x = new Float32Array( size );
            this.y = new Float32Array( size );
            this.z = new Float32Array( size );
            this.element = new Uint8Array( 3 * size );
            this.chainname = new Uint8Array( 4 * size );
            this.resno = new Int32Array( size );
            this.serial = new Int32Array( size );
            this.ss = new Uint8Array( size );
            this.vdw = new Float32Array( size );
            this.covalent = new Float32Array( size );
            this.hetero = new Uint8Array( size );
            this.bfactor = new Float32Array( size );
            this.altloc = new Uint8Array( size );
            this.atomname = new Uint8Array( 4 * size );

        }

        this.makeBonds();
        this.makeResidue();

    },

    getBufferList: function(){

        if( this.useBuffer ){

            return [ this.buffer ];

        }else{

            return [
                this.atomno.buffer,
                this.resname.buffer,
                this.x.buffer,
                this.y.buffer,
                this.z.buffer,
                this.element.buffer,
                this.chainname.buffer,
                this.resno.buffer,
                this.serial.buffer,
                this.ss.buffer,
                this.vdw.buffer,
                this.covalent.buffer,
                this.hetero.buffer,
                this.bfactor.buffer,
                this.altloc.buffer,
                this.atomname.buffer
            ];

        }

    },

    makeOffsetAndSize: function(){

        var size = this.length;

        // align the offset to multiple of 4
        // (offset + 3) & ~0x3 == (offset + 3) / 4 * 4;

        this.atomnoOffset = 0;
        this.atomnoSize = 4 * size;

        this.resnameOffset = this.atomnoSize;
        this.resnameSize =  5 * size;

        this.xOffset = ( this.resnameOffset + this.resnameSize + 3 ) & ~0x3;
        this.xSize = 4 * size;

        this.yOffset = this.xOffset + this.xSize;
        this.ySize = 4 * size;

        this.zOffset = this.yOffset + this.ySize;
        this.zSize = 4 * size;

        this.elementOffset = this.zOffset + this.zSize;
        this.elementSize = 3 * size;

        this.chainnameOffset = this.elementOffset + this.elementSize;
        this.chainnameSize = 4 * size;

        this.resnoOffset = ( this.chainnameOffset + this.chainnameSize + 3 ) & ~0x3;
        this.resnoSize = 4 * size;

        this.serialOffset = this.resnoOffset + this.resnoSize;
        this.serialSize = 4 * size;

        this.ssOffset = this.serialOffset + this.serialSize;
        this.ssSize = size;

        this.vdwOffset = ( this.ssOffset + this.ssSize + 3 ) & ~0x3;
        this.vdwSize = 4 * size;

        this.covalentOffset = this.vdwOffset + this.vdwSize;
        this.covalentSize = 4 * size;

        this.heteroOffset = this.covalentOffset + this.covalentSize;
        this.heteroSize = size;

        this.bfactorOffset = ( this.heteroOffset + this.heteroSize + 3 ) & ~0x3;
        this.bfactorSize = 4 * size;

        this.altlocOffset = this.bfactorOffset + this.bfactorSize;
        this.altlocSize = size;

        this.atomnameOffset = this.altlocOffset + this.altlocSize;
        this.atomnameSize = 4 * size;

        this.byteLength = this.atomnameOffset + this.atomnameSize;

    },

    makeTypedArrays: function(){

        var size = this.length;

        this.atomno = new Int32Array( this.buffer, this.atomnoOffset, this.atomnoSize / 4 );
        this.resname = new Uint8Array( this.buffer, this.resnameOffset, this.resnameSize );
        this.x = new Float32Array( this.buffer, this.xOffset, this.xSize / 4 );
        this.y = new Float32Array( this.buffer, this.yOffset, this.ySize / 4 );
        this.z = new Float32Array( this.buffer, this.zOffset, this.zSize / 4 );
        this.element = new Uint8Array( this.buffer, this.elementOffset, this.elementSize );
        this.chainname = new Uint8Array( this.buffer, this.chainnameOffset, this.chainnameSize );
        this.resno = new Int32Array( this.buffer, this.resnoOffset, this.resnoSize / 4 );
        this.serial = new Int32Array( this.buffer, this.serialOffset, this.serialSize / 4 );
        this.ss = new Uint8Array( this.buffer, this.ssOffset, this.ssSize );
        this.vdw = new Float32Array( this.buffer, this.vdwOffset, this.vdwSize / 4 );
        this.covalent = new Float32Array( this.buffer, this.covalentOffset, this.covalentSize / 4 );
        this.hetero = new Uint8Array( this.buffer, this.heteroOffset, this.heteroSize );
        this.bfactor = new Float32Array( this.buffer, this.bfactorOffset, this.bfactorSize / 4 );
        this.altloc = new Uint8Array( this.buffer, this.altlocOffset, this.altlocSize );
        this.atomname = new Uint8Array( this.buffer, this.atomnameOffset, this.atomnameSize );

    },

    makeResidue: function(){

        this.residue = new Array( this.length );

    },

    makeBonds: function(){

        var size = this.length;

        this.bonds = new Array( size );

        for( var i = 0; i < size; ++i ){
            this.bonds[ i ] = [];
        }

    },

    toObject: function(){

        if( this.useBuffer ){

            return {
                length: this.length,

                buffer: this.buffer,

                bonds: this.bonds,
                residue: this.residue
            };

        }else{

            return {
                length: this.length,

                atomno: this.atomno,
                resname: this.resname,
                x: this.x,
                y: this.y,
                z: this.z,
                element: this.element,
                chainname: this.chainname,
                resno: this.resno,
                serial: this.serial,
                ss: this.ss,
                vdw: this.vdw,
                covalent: this.covalent,
                hetero: this.hetero,
                bfactor: this.bfactor,
                altloc: this.altloc,
                atomname: this.atomname,

                bonds: this.bonds,
                residue: this.residue
            };

        }

    },

    fromObject: function( obj ){

        this.length = obj.length;

        if( this.useBuffer ){

            this.makeOffsetAndSize();
            this.buffer = obj.buffer;
            this.makeTypedArrays();

        }else{

            this.atomno = obj.atomno;
            this.resname = obj.resname;
            this.x = obj.x;
            this.y = obj.y;
            this.z = obj.z;
            this.element = obj.element;
            this.chainname = obj.chainname;
            this.resno = obj.resno;
            this.serial = obj.serial;
            this.ss = obj.ss;
            this.vdw = obj.vdw;
            this.covalent = obj.covalent;
            this.hetero = obj.hetero;
            this.bfactor = obj.bfactor;
            this.altloc = obj.altloc;
            this.atomname = obj.atomname;

        }

        if( obj.bonds ){
            this.bonds = obj.bonds;
        }else{
            this.makeBonds();
        }

        if( obj.residue ){
            this.residue = obj.residue;
        }else{
            this.makeResidue();
        }

    },

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

        var j = 4 * i;
        this.chainname[ j ] = str.charCodeAt( 0 );
        this.chainname[ j + 1 ] = str.charCodeAt( 1 );
        this.chainname[ j + 2 ] = str.charCodeAt( 2 );
        this.chainname[ j + 3 ] = str.charCodeAt( 3 );

    },

    getChainname: function( i ){

        var code;
        var chainname = "";
        var j = 4 * i;
        for( var k = 0; k < 4; ++k ){
            code = this.chainname[ j + k ];
            if( code ){
                chainname += String.fromCharCode( code );
            }else{
                break;
            }
        }
        return chainname;

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

    }

};


NGL.ProxyAtom = function( atomArray, index ){

    this.atomArray = atomArray;
    this.index = index;

    this.globalindex = NGL.nextGlobalAtomindex++;

};

NGL.ProxyAtom.prototype = {

    constructor: NGL.ProxyAtom,

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

    // connectedTo: NGL.Atom.prototype.connectedTo,

    connectedTo: function( atom ){

        var taa = this.atomArray;
        var aaa = atom.atomArray;
        var ti = this.index;
        var ai = atom.index;

        if( taa.hetero[ ti ] && aaa.hetero[ ai ] ) return false;

        var ta = this.altloc;
        var aa = atom.altloc;

        if( !( ta === '' || aa === '' || ( ta === aa ) ) ) return false;

        var x = taa.x[ ti ] - aaa.x[ ai ];
        var y = taa.y[ ti ] - aaa.y[ ai ];
        var z = taa.z[ ti ] - aaa.z[ ai ];

        var distSquared = x * x + y * y + z * z;

        // console.log( distSquared );
        if( taa.residue[ ti ].isCg() && distSquared < 28.0 ) return true;

        if( isNaN( distSquared ) ) return false;
        if( distSquared < 0.5 ) return false; // duplicate or altloc

        var d = taa.covalent[ ti ] + aaa.covalent[ ai ] + 0.3;
        return distSquared < ( d * d );

    },

    qualifiedName: NGL.Atom.prototype.qualifiedName,

    positionFromArray: NGL.Atom.prototype.positionFromArray,

    positionToArray: NGL.Atom.prototype.positionToArray,

    copy: NGL.Atom.prototype.copy

}


NGL.StructureSubset = function( structure, sele ){

    NGL.Structure.call( this, structure.name + " [subset]" );

    this.structure = structure;
    this.selection = new NGL.Selection( sele );

    this.atoms = [];
    this.bondSet = new NGL.BondSet();

    this._build();

};

NGL.StructureSubset.prototype = Object.create( NGL.Structure.prototype );

NGL.StructureSubset.prototype.constructor = NGL.StructureSubset;

NGL.StructureSubset.prototype._build = function(){

    console.time( "NGL.StructureSubset._build" );

    var structure = this.structure;
    var selection = this.selection;
    var atoms = this.atoms;
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
                _r.ss = r.ss;

                r.eachAtom( function( a ){

                    _a = _r.addAtom();
                    _a.atomno = a.atomno;
                    _a.resname = a.resname;
                    _a.x = a.x;
                    _a.y = a.y;
                    _a.z = a.z;
                    _a.element = a.element;
                    _a.chainname = a.chainname;
                    _a.resno = a.resno;
                    _a.serial = a.serial;
                    _a.ss = a.ss;
                    _a.vdw = a.vdw;
                    _a.covalent = a.covalent;
                    _a.hetero = a.hetero;
                    _a.bfactor = a.bfactor;
                    _a.bonds = [];
                    _a.altloc = a.altloc;
                    _a.atomname = a.atomname;

                    atomIndexDict[ a.index ] = _a;
                    atoms.push( _a );

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
    _s.boundingBox = _s.getBoundingBox();

    if( structure.frames ) _s.frames = structure.frames;
    if( structure.boxes ) _s.boxes = structure.boxes;

    console.timeEnd( "NGL.StructureSubset._build" );

}


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

    setString: function( string, silent ){

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

        if( !silent ){
            this.signals.stringChanged.dispatch( string );
        }

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

            if( c.toUpperCase() === "POLYMER" ){
                sele.keyword = "POLYMER";
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
                sele.keyword = "SIDECHAIN";
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
                        { keyword: "SIDECHAIN" },
                        { atomname: "CA" },
                        { atomname: "BB" }
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

            if( c.charAt( 0 ) === "@" ){
                sele.globalindex = parseInt( c.substr( 1 ) );
                pushRule( sele );
                continue;
            }

            if( c.charAt( 0 ) === "#" ){
                sele.element = c.substr( 1 ).toUpperCase();
                pushRule( sele );
                continue;
            }

            if( c.charAt( 0 ) === "~" ){
                sele.altloc = c.substr( 1 );
                pushRule( sele );
                continue;
            }

            if( ( c.length >= 1 && c.length <= 4 ) &&
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
                sele.rules.push( {
                    chainname: chain[1]
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

        var i, s, and, ret, na;

        var subTests = [];

        for( i=0; i<n; ++i ){

            s = selection.rules[ i ];

            if( s.hasOwnProperty( "operator" ) ){

                subTests[ i ] = this._makeTest( fn, s );

            }

        }

        return function( entity ){

            and = selection.operator === "AND";
            na = false;

            for( i=0; i<n; ++i ){

                s = selection.rules[ i ];

                if( s.hasOwnProperty( "operator" ) ){

                    ret = subTests[ i ]( entity );

                    if( ret === -1 ){

                        // return -1;
                        na = true;
                        continue;

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

                        // return -1;
                        na = true;
                        continue;

                    }else if( ret === true){

                        if( and ){ continue; }else{ return t; }

                    }else{

                        if( and ){ return f; }else{ continue; }

                    }

                }

            }

            if( na ){

                return -1;

            }else{

                if( and ){ return t; }else{ return f; }

            }

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
            "CA", "BB"
        ];

        var helixTypes = [
            "h", "g", "i"
        ];

        var fn = function( a, s ){

            // returning -1 means the rule is not applicable

            if( s.keyword!==undefined ){

                if( s.keyword==="HETERO" && a.hetero===true ) return true;
                if( s.keyword==="PROTEIN" && (
                        a.residue.isProtein() || a.residue.isCg()
                    )
                ) return true;
                if( s.keyword==="NUCLEIC" && a.residue.isNucleic() ) return true;
                if( s.keyword==="POLYMER" && (
                        a.residue.isProtein() ||
                        a.residue.isNucleic() ||
                        a.residue.isCg()
                    )
                ) return true;
                if( s.keyword==="WATER" && a.residue.isWater() ) return true;
                if( s.keyword==="HELIX" && helixTypes.indexOf( a.ss )!==-1 ) return true;
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
                if( s.keyword==="SIDECHAIN" && (
                        ( a.residue.isProtein() &&
                            backboneProtein.indexOf( a.atomname )===-1 ) ||
                        ( a.residue.isNucleic() &&
                            backboneNucleic.indexOf( a.atomname )===-1 ) ||
                        ( a.residue.isCg() &&
                            backboneCg.indexOf( a.atomname )===-1 )
                    )
                ) return true;

                return false;

            }

            if( s.globalindex!==undefined && s.globalindex!==a.globalindex ) return false;
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

            if( s.altloc!==undefined && s.altloc!==a.altloc ) return false;

            return true;

        }

        return this._makeTest( fn );

    },

    makeResidueTest: function(){

        var fn = function( r, s ){

            // returning -1 means the rule is not applicable

            if( s.keyword!==undefined ){

                if( s.keyword==="HETERO" && r.isHetero() ) return true;
                if( s.keyword==="PROTEIN" && (
                        r.isProtein() || r.isCg() )
                ) return true;
                if( s.keyword==="NUCLEIC" && r.isNucleic() ) return true;
                if( s.keyword==="POLYMER" && (
                        r.isProtein() || r.isNucleic() || r.isCg() )
                ) return true;
                if( s.keyword==="WATER" && r.isWater() ) return true;

            }

            if( s.chainname===undefined && s.model===undefined &&
                    s.resname===undefined && s.resno===undefined
            ) return -1;
            if( s.chainname!==undefined && r.chain.chainname===undefined ) return -1;

            // support autoChainNames which work only on atoms
            if( s.chainname!=="" && r.chain.chainname==="" ) return -1;

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
            if( s.chainname!=="" && c.chainname==="" ) return -1;

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

    constructor: NGL.Alignment,

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


NGL.superpose = function( s1, s2, align, sele1, sele2, xsele1, xsele2 ){

    align = align || false;
    sele1 = sele1 || "";
    sele2 = sele2 || "";
    xsele1 = xsele1 || "";
    xsele2 = xsele2 || "";

    var atoms1, atoms2;

    if( align ){

        var _s1 = s1;
        var _s2 = s2;

        if( sele1 && sele2 ){
            _s1 = new NGL.StructureSubset( s1, sele1 );
            _s2 = new NGL.StructureSubset( s2, sele2 );
        }

        var seq1 = _s1.getSequence();
        var seq2 = _s2.getSequence();

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
        _s1.eachResidue( function( r ){

            if( !r.getResname1() || !r.getAtomByName( "CA" ) ) return;

            if( aliIdx1[ i ] ){
                atoms1.addAtom( r.getAtomByName( "CA" ) );
            }
            i += 1;

        } );

        i = 0;
        _s2.eachResidue( function( r ){

            if( !r.getResname1() || !r.getAtomByName( "CA" ) ) return;

            if( aliIdx2[ i ] ){
                atoms2.addAtom( r.getAtomByName( "CA" ) );
            }
            i += 1;

        } );

    }else{

        atoms1 = new NGL.AtomSet(
            s1, new NGL.Selection( sele1 + " and .CA" )
        );
        atoms2 = new NGL.AtomSet(
            s2, new NGL.Selection( sele2 + " and .CA" )
        );

    }

    if( xsele1 && xsele2 ){

        var _atoms1 = new NGL.AtomSet();
        var _atoms2 = new NGL.AtomSet();

        var xselection1 = new NGL.Selection( xsele1 );
        var xselection2 = new NGL.Selection( xsele2 );

        var test1 = xselection1.test;
        var test2 = xselection2.test;

        var i, a1, a2;
        var n = atoms1.atomCount;

        for( i = 0; i < n; ++i ){

            a1 = atoms1.atoms[ i ];
            a2 = atoms2.atoms[ i ];

            if( test1( a1 ) && test2( a2 ) ){

                _atoms1.addAtom( a1 );
                _atoms2.addAtom( a2 );

                // console.log( a1.qualifiedName(), a2.qualifiedName() )

            }

        }

        atoms1 = _atoms1;
        atoms2 = _atoms2;

    }

    var superpose = new NGL.Superposition( atoms1, atoms2 );

    var atoms = new NGL.AtomSet( s1, new NGL.Selection( "*" ) );
    superpose.transform( atoms );

    s1.center = s1.atomCenter();

}

// File:js/ngl/trajectory.js

/**
 * @file Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */



NGL.makeTrajectory = function( trajPath, structure, sele ){

    var traj;

    if( !trajPath && structure.frames ){

        traj = new NGL.StructureTrajectory( trajPath, structure, sele );

    }else{

        traj = new NGL.RemoteTrajectory( trajPath, structure, sele );

    }

    return traj;

}


///////////////
// Trajectory

// TODO params handling in constructor and getParameters method
NGL.Trajectory = function( trajPath, structure, selectionString ){

    var scope = this;

    var SIGNALS = signals;

    this.signals = {

        gotNumframes: new SIGNALS.Signal(),
        frameChanged: new SIGNALS.Signal(),
        selectionChanged: new SIGNALS.Signal(),
        playerChanged: new SIGNALS.Signal(),

    };

    this.params = {
        centerPbc: true,
        removePbc: true,
        superpose: true
    };

    this.name = trajPath.replace( /^.*[\\\/]/, '' );

    this.selection = new NGL.Selection(
        selectionString || "backbone and not hydrogen"
    );

    this.selection.signals.stringChanged.add( function( string ){

        scope.makeIndices();
        scope.resetCache();

    } );

    // should come after this.selection is set
    this.setStructure( structure );

    this.trajPath = trajPath;

    this.numframes = undefined;
    this.getNumframes();

};

NGL.Trajectory.prototype = {

    constructor: NGL.Trajectory,

    setStructure: function( structure ){

        this.structure = structure;
        this.atomCount = structure.atomCount;

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

        this.backboneIndices = this.structure.atomIndex(
            new NGL.Selection( "backbone and not hydrogen" )
        );
        this.makeIndices();

        this.frameCache = [];
        this.boxCache = [];
        this.pathCache = [];
        this.frameCacheSize = 0;
        this.currentFrame = -1;

    },

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

        console.error( "Trajectory.loadFrame not implemented" );

    },

    resetCache: function(){

        this.frameCache = [];
        this.boxCache = [];
        this.pathCache = [];
        this.frameCacheSize = 0;
        this.setFrame( this.currentFrame );

        return this;

    },

    setParameters: function( params ){

        var p = params;
        var tp = this.params;
        var resetCache = false;

        if( p.centerPbc !== tp.centerPbc ){

            tp.centerPbc = p.centerPbc;
            resetCache = true;

        }

        if( p.removePbc !== tp.removePbc ){

            tp.removePbc = p.removePbc;
            resetCache = true;

        }

        if( p.superpose !== tp.superpose ){

            tp.superpose = p.superpose;
            resetCache = true;

        }

        if( resetCache ) this.resetCache();

    },

    setFrame: function( i, callback ){

        if( i === undefined ) return this;

        this.inProgress = true;

        i = parseInt( i );

        if( i === -1 || this.frameCache[ i ] ){

            this.updateStructure( i, callback );

        }else{

            this.loadFrame( i, callback );

        }

        return this;

    },

    loadFrame: function( i, callback ){

        console.error( "Trajectory.loadFrame not implemented" );

    },

    updateStructure: function( i, callback ){

        if( this._disposed ) return;

        if( i === -1 ){

            this.structure.updatePosition( this.initialStructure );

        }else{

            this.structure.updatePosition( this.frameCache[ i ] );

        }

        this.structure.trajectory = {
            name: this.trajPath,
            frame: i
        };

        if( typeof callback === "function" ){

            callback();

        }

        this.currentFrame = i;

        this.inProgress = false;

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

        if( box[ 0 ]===0 || box[ 8 ]===0 || box[ 4 ]===0 ){
            return;
        }

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

        if( box[ 0 ]===0 || box[ 8 ]===0 || box[ 4 ]===0 ){
            return;
        }

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
        this._disposed = true;
        if( this.player ) this.player.stop();

    },

    setPlayer: function( player ){

        this.player = player;
        this.signals.playerChanged.dispatch( player );

    },

    getPath: function( index, callback ){

        console.error( "Trajectory.getPath not implemented" );

    },

    download: function( step ){

        // TODO format needs to include the number of atoms
        // TODO lower precision, e.g. 20 bit integers
        // TODO don't process, use raw data

        var scope = this;

        var n = this.numframes;
        var k = step;

        var m = Math.ceil( n / k );
        var u = 0;

        var bbt = new Float32Array( m * ( 9 + 3 * this.atomCount ) );

        function getData( j, v ){

            var l = v * ( 9 + 3 * scope.atomCount );

            bbt.set( scope.boxCache[ j ], l );
            bbt.set( scope.frameCache[ j ], l + 9 );

            if( v === m - 1 ){

                var blob = new Blob(
                    [ bbt ], { type: 'application/octet-binary' }
                );

                NGL.download( blob, "traj.bbt" );

            }

        }

        for( var i = 0; i < n; i += k ){

            this.loadFrame( i, function(){

                getData( i, u );

            } );

            u += 1;

        }

    }

};


NGL.RemoteTrajectory = function( trajPath, structure, selectionString ){

    NGL.Trajectory.call( this, trajPath, structure, selectionString );

}

NGL.RemoteTrajectory.prototype = NGL.createObject(

    NGL.Trajectory.prototype, {

    constructor: NGL.RemoteTrajectory,

    type: "remote",

    loadFrame: function( i, callback ){

        // TODO implement max frameCache size, re-use arrays

        // console.time( "loadFrame" );

        var scope = this;

        var request = new XMLHttpRequest();

        var url = "../traj/frame/" + i + "/" + this.trajPath;
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
                scope.boxCache[ i ] = box;
                scope.frameCacheSize += 1;
            }

            scope.updateStructure( i, callback );

        }, false );

        request.send( params );

    },

    getNumframes: function(){

        var scope = this;

        var loader = new THREE.XHRLoader();
        var url = "../traj/numframes/" + this.trajPath;

        loader.load( url, function( n ){

            n = parseInt( n );
            // console.log( "numframes", n );

            scope.numframes = n;
            scope.signals.gotNumframes.dispatch( n );

        });

    },

    getPath: function( index, callback ){

        if( this.pathCache[ index ] ){
            callback( this.pathCache[ index ] );
            return;
        }

        console.time( "loadPath" );

        var scope = this;

        var request = new XMLHttpRequest();

        var url = "../traj/path/" + index + "/" + this.trajPath;
        var params = "";
        // var params = "frameIndices=" + this.atomIndices.join(";");

        request.open( "POST", url, true );
        request.responseType = "arraybuffer";
        request.setRequestHeader(
            "Content-type", "application/x-www-form-urlencoded"
        );

        request.addEventListener( 'load', function( event ){

            console.timeEnd( "loadPath" );

            var arrayBuffer = this.response;

            if( !arrayBuffer ){
                console.error( "empty arrayBuffer for '" + url + "'" );
                return;
            }

            var path = new Float32Array( arrayBuffer );

            scope.pathCache[ index ] = path;

            // console.log( path )

            callback( path );

        }, false );

        request.send( params );

    }

} );


NGL.StructureTrajectory = function( trajPath, structure, selectionString ){

    // if( !trajPath ) trajPath = structure.path;
    trajPath = "";

    NGL.Trajectory.call( this, trajPath, structure, selectionString );

}

NGL.StructureTrajectory.prototype = NGL.createObject(

    NGL.Trajectory.prototype, {

    constructor: NGL.StructureTrajectory,

    type: "structure",

    loadFrame: function( i, callback ){

        var coords = new Float32Array( this.structure.frames[ i ] );
        var box = this.structure.boxes[ i ];

        if( box ){

            if( this.backboneIndices.length > 0 && this.params.centerPbc ){
                var box2 = [ box[ 0 ], box[ 4 ], box[ 8 ] ];
                var mean = this.getCircularMean(
                    this.backboneIndices, coords, box2
                );
                this.centerPbc( coords, mean, box2 );
            }

            if( this.params.removePbc ){
                this.removePbc( coords, box );
            }

        }

        if( this.indices.length > 0 && this.params.superpose ){
            this.superpose( coords );
        }

        if( !this.frameCache[ i ] ){
            this.frameCache[ i ] = coords;
            this.boxCache[ i ] = box;
            this.frameCacheSize += 1;
        }

        this.updateStructure( i, callback );

    },

    getNumframes: function(){

        this.numframes = this.structure.frames.length;
        this.signals.gotNumframes.dispatch( this.numframes );

    },

    getPath: function( index, callback ){

        var i, j, f;
        var n = this.numframes;
        var k = index * 3;

        var path = new Float32Array( n * 3 );

        for( i = 0; i < n; ++i ){

            j = 3 * i;
            f = this.structure.frames[ i ];

            path[ j + 0 ] = f[ k + 0 ];
            path[ j + 1 ] = f[ k + 1 ];
            path[ j + 2 ] = f[ k + 2 ];

        }

        callback( path );

    }

} );


/*NGL.BinaryTrajectory = function( trajPath, structure, selectionString ){

    if( !trajPath ) trajPath = structure.path;

    NGL.Trajectory.call( this, trajPath, structure, selectionString );

}

NGL.BinaryTrajectory.prototype = NGL.createObject(

    NGL.Trajectory.prototype, {

    constructor: NGL.BinaryTrajectory,

    type: "binary",

    loadFrame: function( i, callback ){

        var coords = new Float32Array( this.structure.frames[ i ] );
        var box = this.structure.boxes[ i ];

        if( box ){

            if( this.backboneIndices.length > 0 && this.params.centerPbc ){
                var box2 = [ box[ 0 ], box[ 4 ], box[ 8 ] ];
                var mean = this.getCircularMean(
                    this.backboneIndices, coords, box2
                );
                this.centerPbc( coords, mean, box2 );
            }

            if( this.params.removePbc ){
                this.removePbc( coords, box );
            }

        }

        if( this.indices.length > 0 && this.params.superpose ){
            this.superpose( coords );
        }

        if( !this.frameCache[ i ] ){
            this.frameCache[ i ] = coords;
            this.boxCache[ i ] = box;
            this.frameCacheSize += 1;
        }

        this.updateStructure( i, callback );

    },

    getNumframes: function(){

        this.numframes = this.structure.frames.length;
        this.signals.gotNumframes.dispatch( this.numframes );

    }

} );*/


///////////
// Player

NGL.TrajectoryPlayer = function( traj, step, timeout, start, end ){

    var SIGNALS = signals;

    this.signals = {

        startedRunning: new SIGNALS.Signal(),
        haltedRunning: new SIGNALS.Signal(),

    };

    var scope = this;

    traj.signals.playerChanged.add( function( player ){
        if( player !== scope ){
            scope.pause();
        }
    } );

    this.traj = traj;
    this.step = step || Math.ceil( ( traj.numframes + 1 ) / 100 );
    this.timeout = timeout || 50;
    this.start = start || 0;
    this.end = end || traj.numframes - 1;
    this.end = Math.min( this.end, traj.numframes - 1 );

    this.mode = "loop"; // loop, once
    this.direction = "forward"; // forward, backward

    this._stopFlag = false;
    this._running = false;

};

NGL.TrajectoryPlayer.prototype = {

    constructor: NGL.TrajectoryPlayer,

    _animate: function(){

        var i;
        this._running = true;

        if( !this.traj.inProgress && !this._stopFlag ){

            if( this.direction === "forward" ){
                i = this.traj.currentFrame + this.step;
            }else{
                i = this.traj.currentFrame - this.step;
            }

            if( i >= this.end || i < this.start ){

                if( this.mode === "once" ){

                    this.pause();

                    if( this.direction === "forward" ){
                        i = this.end;
                    }else{
                        i = this.start;
                    }

                }else{

                    if( this.direction === "forward" ){
                        i = this.start;
                    }else{
                        i = this.end;
                    }

                }

            }

            this.traj.setFrame( i );

        }

        if( !this._stopFlag ){
            setTimeout( this._animate.bind( this ), this.timeout );
        }else{
            this._running = false;
        }

    },

    toggle: function(){

        if( this._running ){
            this.pause();
        }else{
            this.play();
        }

    },

    play: function(){

        if( !this._running ){

            if( this.traj.player !== this ){
                this.traj.setPlayer( this );
            }

            // snap to grid implied by this.step thus minimizing cache misses
            this.traj.setFrame(
                Math.ceil( this.traj.currentFrame / this.step ) * this.step
            );

            this._stopFlag = false;
            this._animate();
            this.signals.startedRunning.dispatch();

        }

    },

    pause: function(){

        if( this._running ){
            this._stopFlag = true;
            this.signals.haltedRunning.dispatch();
        }

    },

    stop: function(){

        this.traj.setFrame( this.start );
        this.pause();

    }

};


// File:js/ngl/surface.js

/**
 * @file Surface
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


////////////
// Surface

NGL.Surface = function( object, name, path ){

    this.name = name;
    this.path = path;

    this.object = object;

}

NGL.Surface.prototype = {

	constructor: NGL.Surface,

}

// File:js/ngl/script.js

/**
 * @file Script
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


///////////
// Script

NGL.Script = function( functionBody, name, path ){

    var SIGNALS = signals;

    this.signals = {

        elementAdded: new SIGNALS.Signal(),
        nameChanged: new SIGNALS.Signal(),

    };

    this.name = name;
    this.path = path;
    this.dir = path.substring( 0, path.lastIndexOf( '/' ) + 1 );

    try {

        this.fn = new Function(

            'stage', 'panel',
            '__name__', '__path__', '__dir__',

            Object.keys( NGL.makeScriptHelper() ).join( ',' ),

            functionBody

        );

    }catch( e ){

        console.error( "NGL.Script compilation failed", e );
        this.fn = null;

    }

}

NGL.Script.prototype = {

    constructor: NGL.Script,

    call: function( stage, onFinish ){

        var scope = this;

        var panel = {

            add: function( element ){

                scope.signals.elementAdded.dispatch( arguments );

            },

            setName: function( value ){

                scope.signals.nameChanged.dispatch( value );

            }

        };

        var queue = new NGL.ScriptQueue( stage, this.dir, onFinish );
        var helper = NGL.makeScriptHelper( stage, queue, panel );

        if( this.fn ){

            var args = [
                stage, panel,
                this.name, this.path, this.dir
            ];

            try{

                this.fn.apply(
                    null, args.concat( Object.values( helper ) )
                );

            }catch( e ){

                console.error( "NGL.Script.fn", e );

            }

        }else{

            console.log( "NGL.Script.call no function available" );

        }

        function finish(){
            if( typeof onFinish === "function" ) onFinish();
        }

        function error(){
            panel.add( new UI.Text( "ERROR" ) );
            finish();
        }

        queue.then( finish, error );

    }

}


NGL.ScriptQueue = function( stage, dir, onFinish ){

    this.stage = stage;
    this.dir = dir || "";
    this.onFinish = onFinish;

    this.promise = new Promise( function( resolve, reject ){

        resolve();

    } );

};

NGL.ScriptQueue.prototype = {

    constructor: NGL.ScriptQueue,

    load: function( file, params, callback, loadParams ){

        var status = {};

        // TODO check for pdbid or http...
        var path = this.dir + file;

        this.stage.loadFile(

            path,

            function( component ){

                component.requestGuiVisibility( false );

                if( typeof callback === "function" ){
                    callback( component );
                }

                if( status.resolve ){
                    status.resolve();
                }else{
                    status.success = true;
                }

            },

            params,

            function( e ){

                if( status.reject ){
                    status.reject( e );
                }else{
                    status.error = e || "error";
                }

            },

            loadParams

        );

        var handle = function( resolve, reject ){

            if( status.success === true ){
                resolve();
            }else if( status.error !== undefined ){
                reject( status.error );
            }else{
                status.resolve = resolve;
                status.reject = reject;
            }

        };

        this.promise = this.promise.then( function(){

            return new Promise( handle );

        } );

    },

    then: function( callback, onError ){

        this.promise = this.promise.then( callback, function( e ){

            console.error( "NGL.ScriptQueue.then", e );

            if( typeof onError === "function" ) onError();

        } );

    }

};


NGL.makeScriptHelper = function( stage, queue, panel ){

    var U = NGL.unicodeHelper;

    //

    function load(){

        queue.load.apply( queue, arguments );

    }


    function then(){

        queue.then.apply( queue, arguments );

    }

    // TODO
    // get, color, radius, center
    // alias, to create some sort of variables?

    function structure( name ){

        var component;

        stage.eachComponent( function( o ){

            if( name === o.name || name === o.id ){

                component = o;

            }

        }, NGL.StructureComponent );

        return component;

    }


    function color( what, value ){

        stage.eachRepresentation( function( repr, comp ){

            if( NGL.ObjectMetadata.test( what, repr, comp ) ){

                repr.setColor( value );

            }

        }, NGL.StructureComponent );

    }


    function visibility( what, value ){

        stage.eachComponent( function( comp ){

            if( !what || ( what && !what[ "repr" ] && NGL.ObjectMetadata.test( what, null, comp ) ) ){
                comp.setVisibility( value );
            }

            if( what && what[ "repr" ] ){
                comp.eachRepresentation( function( repr ){

                    if( NGL.ObjectMetadata.test( what, repr, comp ) ){
                        repr.setVisibility( value );
                    }

                } );
            }

        }, NGL.StructureComponent );

    }


    function hide( what ){

        visibility( what, false );

    }


    function show( what, only ){

        if( only ) hide();

        visibility( what, true );

    }


    function superpose( comp1, comp2, align, sele1, sele2, xsele1, xsele2 ){

        comp1.superpose( comp2, align, sele1, sele2, xsele1, xsele2 );

    }

    //

    function uiText( text, newline ){

        var elm = new UI.Text( U( text ) );

        panel.add( elm );

        if( newline ) uiBreak( 1 );

        return elm;

    }


    function uiHtml( html, newline ){

        var elm = new UI.Html( U( html ) );

        panel.add( elm );

        if( newline ) uiBreak( 1 );

        return elm;

    }


    function uiBreak( n ){

        n = n === undefined ? 1 : n;

        for( var i = 0; i < n; ++i ){

            panel.add( new UI.Break() );

        }

    }


    function uiButton( label, callback ){

        var btn = new UI.Button( U( label ) ).onClick( function(){
            callback( btn );
        } );

        panel.add( btn );

        return btn;

    }


    function uiToggleButton( labelA, labelB, callbackA, callbackB ){

        var flag = true;

        var btn = new UI.Button( U( labelB ) ).onClick( function(){

            if( flag ){

                flag = false;
                btn.setLabel( U( labelA ) );
                callbackB();

            }else{

                flag = true;
                btn.setLabel( U( labelB ) );
                callbackA();

            }

        } );

        panel.add( btn );

        return btn;

    }


    function uiVisibilityButton( label, what ){

        if( !label ) label = what ? "": "all";
        label = U( label );

        function isVisible(){

            var visible = false;

            stage.eachComponent( function( comp ){

                if( ( !what || ( what && !what[ "repr" ] && NGL.ObjectMetadata.test( what, null, comp ) ) ) && comp.visible ){
                    visible = true;
                }

                if( what && what[ "repr" ] ){
                    comp.eachRepresentation( function( repr ){

                        if( NGL.ObjectMetadata.test( what, repr, comp ) && repr.visible ){
                            visible = true;
                        }

                    } );
                }

            }, NGL.StructureComponent );

            return visible;

        }

        function getLabel( value ){

            return ( isVisible() ? "hide " : "show " ) + label;

        }

        stage.eachComponent( function( comp ){

            if( !what || ( what && !what[ "repr" ] && NGL.ObjectMetadata.test( what, null, comp ) ) ){

                comp.signals.visibilityChanged.add( function( value ){

                    btn.setLabel( getLabel() );

                } );

            }

            comp.eachRepresentation( function( repr ){

                if( NGL.ObjectMetadata.test( what, repr, comp ) ){

                    repr.signals.visibilityChanged.add( function( value ){

                        btn.setLabel( getLabel() );

                    } );

                }

            } );

        }, NGL.StructureComponent );

        var btn = new UI.Button( getLabel() )
            .onClick( function(){

                visibility( what, !isVisible() );

            } )

        panel.add( btn );

        return btn;

    }


    function uiPlayButton( label, traj, step, timeout, start, end ){

        label = U( label );

        var player = new NGL.TrajectoryPlayer( traj, step, timeout, start, end );
        player.mode = "once";

        var btn = new UI.Button( "play " + label )
            .onClick( function(){
                player.toggle();
            } );

        player.signals.startedRunning.add( function(){
            btn.setLabel( "pause " + label );
        } );

        player.signals.haltedRunning.add( function(){
            btn.setLabel( "play " + label );
        } );

        panel.add( btn );

        return btn;

    }

    //

    return {

        'load': load,
        'then': then,

        'structure': structure,

        'visibility': visibility,
        'hide': hide,
        'show': show,
        'superpose': superpose,

        'uiText': uiText,
        'uiHtml': uiHtml,
        'uiBreak': uiBreak,
        'uiButton': uiButton,
        'uiToggleButton': uiToggleButton,
        'uiVisibilityButton': uiVisibilityButton,
        'uiPlayButton': uiPlayButton,

    };

};

// File:js/ngl/parser.js

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

    constructor: NGL.StructureParser,

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

NGL.PdbParser.prototype.constructor = NGL.PdbParser;

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

    var currentBiomol;

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

                var a = new NGL.Atom();
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
                    }/*else if( to < from ){
                        // likely a duplicate in standard PDB format
                        // but not necessarily so better remove duplicates
                        // in a pass after parsing (and auto bonding)
                        continue;
                    }*/

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

                    var ls = line.split( /\s+/ );

                    var row = parseInt( line[ 18 ] ) - 1;
                    var mat = ls[ 3 ].trim();

                    if( row === 0 ){
                        currentBiomol.matrixDict[ mat ] = new THREE.Matrix4();
                    }

                    var elms = currentBiomol.matrixDict[ mat ].elements;

                    elms[ 4 * 0 + row ] = parseFloat( ls[ 4 ] );
                    elms[ 4 * 1 + row ] = parseFloat( ls[ 5 ] );
                    elms[ 4 * 2 + row ] = parseFloat( ls[ 6 ] );
                    elms[ 4 * 3 + row ] = parseFloat( ls[ 7 ] );

                }else if(
                    line.substr( 11, 30 ) === 'APPLY THE FOLLOWING TO CHAINS:' ||
                    line.substr( 11, 30 ) === '                   AND CHAINS:'
                ){

                    line.substr( 41, 30 ).split( "," ).forEach( function( v ){

                        var c = v.trim();
                        if( c ){
                            currentBiomol.chainList.push( c )
                        }

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

                    if( !firstModelOnly ) serialDict = {};

                }

            }else if( recordName === 'ENDMDL' ){

                if( asTrajectory && !doFrames ){

                    frames.push( new Float32Array( currentFrame ) );
                    doFrames = true;

                }

                modelIdx += 1;

            }else if( recordName === 'CRYST1' ){

                // CRYST1   55.989   55.989   55.989  90.00  90.00  90.00 P 1           1
                //  7 - 15       Real(9.3)      a (Angstroms)
                // 16 - 24       Real(9.3)      b (Angstroms)
                // 25 - 33       Real(9.3)      c (Angstroms)
                // 34 - 40       Real(7.2)      alpha         alpha (degrees).
                // 41 - 47       Real(7.2)      beta          beta (degrees).
                // 48 - 54       Real(7.2)      gamma         gamma (degrees).
                // 56 - 66       LString        sGroup        Space group.
                // 67 - 70       Integer        z             Z value.

                var a = parseFloat( line.substr( 6, 9 ) );
                var b = parseFloat( line.substr( 15, 9 ) );
                var c = parseFloat( line.substr( 24, 9 ) );

                var alpha = parseFloat( line.substr( 33, 7 ) );
                var beta = parseFloat( line.substr( 40, 7 ) );
                var gamma = parseFloat( line.substr( 47, 7 ) );

                var sGroup = line.substr( 55, 11 ).trim();
                var z = parseInt( line.substr( 66, 4 ) );

                // console.log( a, b, c, alpha, beta, gamma, sGroup, z )

                if( a===1.0 && b===1.0 && c===1.0 &&
                    alpha===90.0 && beta===90.0 && gamma===90.0 &&
                    sGroup==="P 1" && z===1
                ){

                    // console.info(
                    //     "unitcell is just a unit cube, " +
                    //     "likely meaningless, so ignore"
                    // );

                }else{

                    var box = new Float32Array( 9 );
                    box[ 0 ] = a;
                    box[ 4 ] = b;
                    box[ 8 ] = c;
                    boxes.push( box );

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

NGL.GroParser.prototype.constructor = NGL.GroParser;

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

            if( !line ) continue;

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

                    return true;

                }

                modelIdx += 1;

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

NGL.CifParser.prototype.constructor = NGL.CifParser;

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

    var currentBiomol;

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

                        if( currentLoopIndex === loopPointers.length ){
                            currentLoopIndex = 0;
                        }
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

                        var a = new NGL.Atom();
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

    function _ensureArray( dict, field ){

        if( !Array.isArray( dict[ field ] ) ){
            Object.keys( dict ).forEach( function( key ){
                dict[ key ] = [ dict[ key ] ];
            } );
        }

    }

    async.series( [

        // assign helix
        function( wcallback ){

            var helixTypes = NGL.HelixTypes;

            var sc = cif.struct_conf;

            if( !sc ){

                wcallback();
                return;

            }

            // ensure data is in lists
            _ensureArray( sc, "id" );

            NGL.processArray(

                sc.beg_auth_seq_id,

                function( _i, _n ){

                    for( var i = _i; i < _n; ++i ){

                        var selection = new NGL.Selection(
                            sc.beg_auth_seq_id[ i ] + "-" +
                            sc.end_auth_seq_id[ i ] + ":" +
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

            // ensure data is in lists
            _ensureArray( ssr, "id" );

            NGL.processArray(

                ssr.beg_auth_seq_id,

                function( _i, _n ){

                    for( var i = _i; i < _n; ++i ){

                        var selection = new NGL.Selection(
                            ssr.beg_auth_seq_id[ i ] + "-" +
                            ssr.end_auth_seq_id[ i ] + ":" +
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

            // ensure data is in lists
            _ensureArray( sc, "id" );

            NGL.processArray(

                sc.id,

                function( _i, _n ){

                    for( var i = _i; i < _n; ++i ){

                        if( sc.conn_type_id[ i ] === "hydrog" ) continue;

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

                500

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
            _ensureArray( op, "id" );

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

                elms[  3 ] = parseFloat( op[ "vector[1]" ][ i ] );
                elms[  7 ] = parseFloat( op[ "vector[2]" ][ i ] );
                elms[ 11 ] = parseFloat( op[ "vector[3]" ][ i ] );

                m.transpose();

                operDict[ id ] = m;

            } );

        }

        if( cif.pdbx_struct_assembly_gen ){

            var gen = cif.pdbx_struct_assembly_gen;

            // ensure data is in lists
            _ensureArray( gen, "assembly_id" );

            function getMatrixDict( expr ){

                var matDict = {};

                var l = expr.replace( /[\(\)']/g, "" ).split( "," );

                l.forEach( function( e ){

                    if( e.indexOf( "-" ) !== -1 ){

                        var es = e.split( "-" );

                        var j = parseInt( es[ 0 ] );
                        var m = parseInt( es[ 1 ] );

                        for( ; j <= m; ++j ){

                            matDict[ j ] = operDict[ j ];

                        }

                    }else{

                        matDict[ e ] = operDict[ e ];

                    }

                } );

                return matDict;

            }

            gen.assembly_id.forEach( function( id, i ){

                var md = {};
                var oe = gen.oper_expression[ i ];

                if( oe.indexOf( ")(" ) !== -1 ){

                    oe = oe.split( ")(" );

                    var md1 = getMatrixDict( oe[ 0 ] );
                    var md2 = getMatrixDict( oe[ 1 ] );

                    Object.keys( md1 ).forEach( function( k1 ){

                        Object.keys( md2 ).forEach( function( k2 ){

                            var mat = new THREE.Matrix4();

                            mat.multiplyMatrices( md1[ k1 ], md2[ k2 ] );
                            md[ k1 + "x" + k2 ] = mat;

                        } );

                    } );

                }else{

                    md = getMatrixDict( oe );

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


// File:js/ngl/loader.js

/**
 * @file Loader
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.Uint8ToString = function( u8a ){
    // from http://stackoverflow.com/a/12713326/1435042
    var CHUNK_SZ = 0x8000;
    var c = [];
    for( var i = 0; i < u8a.length; i += CHUNK_SZ ){
        c.push( String.fromCharCode.apply(
            null, u8a.subarray( i, i + CHUNK_SZ )
        ) );
    }
    return c.join("");
}


NGL.decompress = function( data, file, callback ){

    var binData, decompressedData;
    var ext = NGL.getFileInfo( file ).compressed;

    console.time( "decompress " + ext );

    if( data instanceof ArrayBuffer ){

        data = new Uint8Array( data );

    }

    if( ext === "gz" ){

        binData = pako.ungzip( data );

    }else if( ext === "zip" ){

        var zip = new JSZip( data );
        var name = Object.keys( zip.files )[ 0 ];
        binData = zip.files[ name ].asUint8Array();

    }else if( ext === "lzma" ){

        var inStream = {
            data: data,
            offset: 0,
            readByte: function(){
                return this.data[ this.offset++ ];
            }
        };

        var outStream = {
            data: [ /* Uncompressed data will be putted here */ ],
            offset: 0,
            writeByte: function( value ){
                this.data[ this.offset++ ] = value;
            }
        };

        LZMA.decompressFile( inStream, outStream );
        binData = new Uint8Array( outStream.data );

    }else if( ext === "bz2" ){

        var bitstream = bzip2.array( data );
        decompressedData = bzip2.simple( bitstream )

    }else{

        console.warn( "no decompression method available for '" + ext + "'" );
        decompressedData = data;

    }

    if( typeof callback === "function" ){

        if( decompressedData === undefined ){

            NGL.Uint8ToString( binData, callback );

        }else{

            callback( decompressedData );

        }

    }else{

        if( decompressedData === undefined ){

            decompressedData = NGL.Uint8ToString( binData );

        }

    }

    console.timeEnd( "decompress " + ext );

    return decompressedData;

}


///////////
// Loader

NGL.XHRLoader = function ( manager ) {

    /**
     * @author mrdoob / http://mrdoob.com/
     */

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.XHRLoader.prototype = {

    constructor: NGL.XHRLoader,

    load: function ( url, onLoad, onProgress, onError ) {

        var scope = this;

        var cached = scope.cache.get( url );

        if ( cached !== undefined ) {

            if ( onLoad ) onLoad( cached );
            return;

        }

        var request = new XMLHttpRequest();
        request.open( 'GET', url, true );

        request.addEventListener( 'load', function ( event ) {

            if ( request.status === 200 || request.status === 304 ) {

                var data = this.response;

                if( scope.responseType === "arraybuffer" ){

                    data = NGL.decompress( data, url );

                }

                scope.cache.add( url, data );

                if ( onLoad ) onLoad( data );

            } else {

                if ( onError ) onError( request.status );

            }

            scope.manager.itemEnd( url );

        }, false );

        if ( onProgress !== undefined ) {

            request.addEventListener( 'progress', function ( event ) {

                onProgress( event );

            }, false );

        }

        if ( onError !== undefined ) {

            request.addEventListener( 'error', function ( event ) {

                onError( event );

            }, false );

        }

        if ( this.crossOrigin !== undefined ) request.crossOrigin = this.crossOrigin;
        if ( this.responseType !== undefined ) request.responseType = this.responseType;

        request.send( null );

        scope.manager.itemStart( url );

    },

    setResponseType: function ( value ) {

        this.responseType = value;

    },

    setCrossOrigin: function ( value ) {

        this.crossOrigin = value;

    }

};


NGL.FileLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.FileLoader.prototype = {

    constructor: NGL.FileLoader,

    load: function ( file, onLoad, onProgress, onError ) {

        var scope = this;

        var cached = scope.cache.get( file );

        if ( cached !== undefined ) {

            onLoad( cached );
            return;

        }

        var reader = new FileReader();

        reader.onload = function( event ){

            // scope.cache.add( file, this.response );

            var data = event.target.result;

            if( scope.responseType === "arraybuffer" ){

                data = NGL.decompress( data, file );

            }

            onLoad( data );
            scope.manager.itemEnd( file );

        }

        if ( onProgress !== undefined ) {

            reader.onprogress = function ( event ) {

                onProgress( event );

            }

        }

        if ( onError !== undefined ) {

            reader.onerror = function ( event ) {

                onError( event );

            }

        }

        if( this.responseType === "arraybuffer" ){

            reader.readAsArrayBuffer( file );

        }else{

            reader.readAsText( file );

        }

        scope.manager.itemStart( file );

    },

    setResponseType: function ( value ) {

        this.responseType = value.toLowerCase();

    }

};


NGL.StructureLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.StructureLoader.prototype = Object.create( NGL.XHRLoader.prototype );

NGL.StructureLoader.prototype.constructor = NGL.StructureLoader;

NGL.StructureLoader.prototype.init = function( str, name, path, ext, callback, params ){

    params = params || {};

    var parsersClasses = {

        "gro": NGL.GroParser,
        "pdb": NGL.PdbParser,
        "cif": NGL.CifParser,

    };

    var parser = new parsersClasses[ ext ](
        name, path, params
    );

    return parser.parse( str, callback );

};


NGL.ObjLoader = function( manager ){

    // this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.ObjLoader.prototype = Object.create( THREE.OBJLoader.prototype );

NGL.StructureLoader.prototype.constructor = NGL.ObjLoader;

NGL.ObjLoader.prototype.init = function( data, name, path, ext, callback ){

    if( typeof data === "string" ){

        data = this.parse( data );

    }

    var obj = new NGL.Surface( data, name, path )

    if( typeof callback === "function" ) callback( obj );

    return obj;

};


NGL.PlyLoader = function( manager ){

    // this.cache = new THREE.Cache();
    // this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.PlyLoader.prototype = Object.create( THREE.PLYLoader.prototype );

NGL.StructureLoader.prototype.constructor = NGL.PlyLoader;

NGL.PlyLoader.prototype.init = function( data, name, path, ext, callback ){

    if( typeof data === "string" ){

        data = this.parse( data );

    }

    var ply = new NGL.Surface( data, name, path );

    if( typeof callback === "function" ) callback( ply );

    return ply;

};


NGL.ScriptLoader = function( manager ){

    this.cache = new THREE.Cache();
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

NGL.ScriptLoader.prototype = Object.create( NGL.XHRLoader.prototype );

NGL.StructureLoader.prototype.constructor = NGL.ScriptLoader;

NGL.ScriptLoader.prototype.init = function( data, name, path, ext, callback ){

    var script = new NGL.Script( data, name, path );

    if( typeof callback === "function" ) callback( script );

    return script;

};


NGL.autoLoad = function(){

    var loaders = {

        "gro": NGL.StructureLoader,
        "pdb": NGL.StructureLoader,
        "cif": NGL.StructureLoader,

        "obj": NGL.ObjLoader,
        "ply": NGL.PlyLoader,

        "ngl": NGL.ScriptLoader,

    }

    return function( file, onLoad, onProgress, onError, params ){

        var object, rcsb, loader;

        var fileInfo = NGL.getFileInfo( file );

        // console.log( fileInfo );

        var path = fileInfo.path;
        var name = fileInfo.name;
        var ext = fileInfo.ext;
        var compressed = fileInfo.compressed;
        var protocol = fileInfo.protocol;

        if( protocol === "rcsb" ){

            // ext = "pdb";
            // file = "http://www.rcsb.org/pdb/files/" + name + ".pdb";
            ext = "cif";
            compressed = "gz";
            path = "http://www.rcsb.org/pdb/files/" + name + ".cif.gz";
            protocol = "http";

        }

        if( ext in loaders ){

            loader = new loaders[ ext ];

        }else{

            error( "NGL.autoLoading: ext '" + ext + "' unknown" );

            return null;

        }

        function init( data ){

            if( data ){

                try{

                    object = loader.init( data, name, file, ext, function( _object ){

                        if( typeof onLoad === "function" ) onLoad( _object );

                    }, params );

                }catch( e ){

                    console.error( e );
                    error( "initialization failed" );

                }

            }else{

                error( "empty response" );

            }

        }

        function error( e ){

            if( typeof onError === "function" ){

                onError( e );

            }else{

                console.error( e );

            }

        }

        if( file instanceof File ){

            var fileLoader = new NGL.FileLoader();
            if( compressed ) fileLoader.setResponseType( "arraybuffer" );
            fileLoader.load( file, init, onProgress, error );

        }else if( [ "http", "https", "ftp" ].indexOf( protocol ) !== -1 ){

            if( compressed ) loader.setResponseType( "arraybuffer" );
            loader.load( path, init, onProgress, error );

        }else if( protocol === "data" ){

            if( compressed ) loader.setResponseType( "arraybuffer" );
            loader.load( "../data/" + path, init, onProgress, error );

        }else{ // default: protocol === "file"

            if( compressed ) loader.setResponseType( "arraybuffer" );
            loader.load( "../file/" + path, init, onProgress, error );

        }

        return object;

    }

}();

// File:js/ngl/viewer.js

/**
 * @file Viewer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


/**
 * [Resources description]
 * @type {Object}
 * @private
 */
NGL.Resources = {

    // fonts
    '../fonts/Arial.fnt': null,
    '../fonts/Arial.png': 'image',
    '../fonts/DejaVu.fnt': null,
    '../fonts/DejaVu.png': 'image',
    '../fonts/LatoBlack.fnt': null,
    '../fonts/LatoBlack.png': 'image',

    // sprites
    '../img/circle.png': 'image',
    '../img/spark1.png': 'image',
    '../img/radial.png': 'image',

    // shaders
    '../shader/CylinderImpostor.vert': null,
    '../shader/CylinderImpostor.frag': null,
    '../shader/HyperballStickImpostor.vert': null,
    '../shader/HyperballStickImpostor.frag': null,
    '../shader/Line.vert': null,
    '../shader/Line.frag': null,
    '../shader/LineSprite.vert': null,
    '../shader/LineSprite.frag': null,
    '../shader/Mesh.vert': null,
    '../shader/Mesh.frag': null,
    '../shader/ParticleSprite.vert': null,
    '../shader/ParticleSprite.frag': null,
    '../shader/Quad.vert': null,
    '../shader/Quad.frag': null,
    '../shader/Ribbon.vert': null,
    '../shader/Ribbon.frag': null,
    '../shader/SDFFont.vert': null,
    '../shader/SDFFont.frag': null,
    '../shader/SphereHalo.vert': null,
    '../shader/SphereHalo.frag': null,
    '../shader/SphereImpostor.vert': null,
    '../shader/SphereImpostor.frag': null,

    // shader chunks
    '../shader/chunk/fog.glsl': null,
    '../shader/chunk/fog_params.glsl': null,
    '../shader/chunk/light.glsl': null,
    '../shader/chunk/light_params.glsl': null,

};


/**
 * [UniformsLib description]
 * @type {Object}
 * @private
 */
NGL.UniformsLib = {

    'fog': THREE.UniformsLib[ "fog" ],

    'lights': THREE.UniformsUtils.merge([
        THREE.UniformsLib[ "lights" ],
        {
            "ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) },
            "emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
        }
    ])

};


/**
 * [Utils description]
 * @namespace NGL.Utils
 * @type {Object}
 */
NGL.Utils = {

    /**
     * Converted to JavaScript from
     * {@link http://paulbourke.net/geometry/pointlineplane/lineline.c}
     *
     * @param  {THREE.Vector3} p1
     * @param  {THREE.Vector3} p2
     * @param  {THREE.Vector3} p3
     * @param  {THREE.Vector3} p4
     * @return {Array.<THREE.Vector3, THREE.Vector3>}
     */
    lineLineIntersect: function( p1, p2, p3, p4 ){

        var EPS = NGL.EPS;

        var p13 = new THREE.Vector3(),
            p43 = new THREE.Vector3(),
            p21 = new THREE.Vector3();
        var d1343, d4321, d1321, d4343, d2121;
        var denom, numer;

        p13.x = p1.x - p3.x;
        p13.y = p1.y - p3.y;
        p13.z = p1.z - p3.z;
        p43.x = p4.x - p3.x;
        p43.y = p4.y - p3.y;
        p43.z = p4.z - p3.z;
        if( Math.abs(p43.x) < EPS && Math.abs(p43.y) < EPS && Math.abs(p43.z) < EPS )
            return null;

        p21.x = p2.x - p1.x;
        p21.y = p2.y - p1.y;
        p21.z = p2.z - p1.z;
        if( Math.abs(p21.x) < EPS && Math.abs(p21.y) < EPS && Math.abs(p21.z) < EPS )
            return null;

        d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
        d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
        d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
        d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
        d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;

        denom = d2121 * d4343 - d4321 * d4321;
        if( Math.abs(denom) < EPS )
            return null;
        numer = d1343 * d4321 - d1321 * d4343;

        var mua = numer / denom;
        var mub = ( d1343 + d4321 * mua ) / d4343;

        var pa = new THREE.Vector3(
            p1.x + mua * p21.x,
            p1.y + mua * p21.y,
            p1.z + mua * p21.z
        );
        var pb = new THREE.Vector3(
            p3.x + mub * p43.x,
            p3.y + mub * p43.y,
            p3.z + mub * p43.z
        );

        return [ pa, pb ];

    },

    circularMean: function(){

        // http://en.wikipedia.org/wiki/Center_of_mass#Systems_with_periodic_boundary_conditions

        // Bai, Linge; Breen, David (2008). Calculating Center of Mass in an Unbounded 2D Environment. Journal of Graphics, GPU, and Game Tools 13 (4): 53–60.

        // http://stackoverflow.com/questions/18166507/using-fft-to-find-the-center-of-mass-under-periodic-boundary-conditions

        var twoPi = 2 * Math.PI;

        return function( array, max, stride, offset, indices ){

            stride = stride || 1;
            offset = offset || 0;

            var n = indices ? indices.length : array.length;
            var angle, i, c;

            var cosMean = 0;
            var sinMean = 0;

            if( indices ){

                for( i = 0; i < n; ++i ){

                    //console.log( indices[ i ], stride, offset, indices[ i ] * stride + offset, array.length, array[ indices[ i ] * stride + offset ] );

                    c = ( array[ indices[ i ] * stride + offset ] + max ) % max;

                    angle = ( c / max ) * twoPi - Math.PI;

                    cosMean += Math.cos( angle );
                    sinMean += Math.sin( angle );

                }

            }else{

                for( i = offset; i < n; i += stride ){

                    c = ( array[ i ] + max ) % max;

                    angle = ( c / max ) * twoPi - Math.PI;

                    cosMean += Math.cos( angle );
                    sinMean += Math.sin( angle );

                }

            }

            cosMean /= n;
            sinMean /= n;

            var meanAngle = Math.atan2( sinMean, cosMean );

            var mean = ( meanAngle + Math.PI ) / twoPi * max;

            return mean;

        }

    }(),

    calculateCenterArray: function( array1, array2, center, offset ){

        var n = array1.length;
        center = center || new Float32Array( n );
        offset = offset || 0;

        for( var i = 0; i < n; i+=3 ){

            center[ offset + i + 0 ] = ( array1[ i + 0 ] + array2[ i + 0 ] ) / 2.0;
            center[ offset + i + 1 ] = ( array1[ i + 1 ] + array2[ i + 1 ] ) / 2.0;
            center[ offset + i + 2 ] = ( array1[ i + 2 ] + array2[ i + 2 ] ) / 2.0;

        }

        return center;

    },

    calculateDirectionArray: function( array1, array2 ){

        var n = array1.length;
        var direction = new Float32Array( n );

        for( var i = 0; i < n; i+=3 ){

            direction[ i + 0 ] = array2[ i + 0 ] - array1[ i + 0 ];
            direction[ i + 1 ] = array2[ i + 1 ] - array1[ i + 1 ];
            direction[ i + 2 ] = array2[ i + 2 ] - array1[ i + 2 ];

        }

        return direction;

    },

    positionFromGeometry: function( geometry ){

        var vertices = geometry.vertices;

        var j, v3;
        var n = vertices.length;
        var position = new Float32Array( n * 3 );

        for( var v = 0; v < n; v++ ){

            j = v * 3;
            v3 = vertices[ v ];

            position[ j + 0 ] = v3.x;
            position[ j + 1 ] = v3.y;
            position[ j + 2 ] = v3.z;

        }

        return position;

    },

    colorFromGeometry: function( geometry ){

        var faces = geometry.faces;
        var vn = geometry.vertices.length;

        var j, f, c;
        var n = faces.length;
        var color = new Float32Array( vn * 3 );

        for( var v = 0; v < n; v++ ){

            f = faces[ v ];
            c = f.color;

            j = f.a * 3;
            color[ j + 0 ] = c.r;
            color[ j + 1 ] = c.g;
            color[ j + 2 ] = c.b;

            j = f.b * 3;
            color[ j + 0 ] = c.r;
            color[ j + 1 ] = c.g;
            color[ j + 2 ] = c.b;

            j = f.c * 3;
            color[ j + 0 ] = c.r;
            color[ j + 1 ] = c.g;
            color[ j + 2 ] = c.b;

        }

        return color;

    },

    indexFromGeometry: function( geometry ){

        var faces = geometry.faces;

        var j, f;
        var n = faces.length;
        var index = new Uint32Array( n * 3 );

        for( var v = 0; v < n; v++ ){

            j = v * 3;
            f = faces[ v ];

            index[ j + 0 ] = f.a;
            index[ j + 1 ] = f.b;
            index[ j + 2 ] = f.c;

        }

        return index;

    },

    normalFromGeometry: function( geometry ){

        var faces = geometry.faces;
        var vn = geometry.vertices.length;

        var j, f, nn, n1, n2, n3;
        var n = faces.length;
        var normal = new Float32Array( vn * 3 );

        for( var v = 0; v < n; v++ ){

            f = faces[ v ];
            nn = f.vertexNormals;
            n1 = nn[ 0 ];
            n2 = nn[ 1 ];
            n3 = nn[ 2 ];

            j = f.a * 3;
            normal[ j + 0 ] = n1.x;
            normal[ j + 1 ] = n1.y;
            normal[ j + 2 ] = n1.z;

            j = f.b * 3;
            normal[ j + 0 ] = n2.x;
            normal[ j + 1 ] = n2.y;
            normal[ j + 2 ] = n2.z;

            j = f.c * 3;
            normal[ j + 0 ] = n3.x;
            normal[ j + 1 ] = n3.y;
            normal[ j + 2 ] = n3.z;

        }

        return normal;

    },

    uniformArray: function( n, a ){

        var array = new Float32Array( n );

        for( var i = 0; i < n; ++i ){

            array[ i ] = a;

        }

        return array;

    },

    uniformArray3: function( n, a, b, c ){

        var array = new Float32Array( n * 3 );

        var j;

        for( var i = 0; i < n; ++i ){

            j = i * 3;

            array[ j + 0 ] = a;
            array[ j + 1 ] = b;
            array[ j + 2 ] = c;

        }

        return array;

    },

    randomColorArray: function( n ){

        var array = new Float32Array( n * 3 );

        var j;

        for( var i = 0; i < n; ++i ){

            j = i * 3;

            array[ j + 0 ] = Math.random();
            array[ j + 1 ] = Math.random();
            array[ j + 2 ] = Math.random();

        }

        return array;

    },

    replicateArray3Entries: function( array, m ){

        var n = array.length / 3;

        var repArr = new Float32Array( n * m * 3 );

        var i, j, k, l, v;
        var a, b, c;

        for( i = 0; i < n; ++i ){

            v = i * 3;
            k = i * m * 3;

            a = array[ v + 0 ];
            b = array[ v + 1 ];
            c = array[ v + 2 ];

            for( j = 0; j < m; ++j ){

                l = k + j * 3;

                repArr[ l + 0 ] = a;
                repArr[ l + 1 ] = b;
                repArr[ l + 2 ] = c;

            }

        }

        return repArr;

    },

    calculateMeanArray: function( array1, array2 ){

        var n = array1.length;
        var mean = new Float32Array( n );

        for( var i = 0; i < n; i++ ){

            mean[ i ] = ( array1[ i ] + array2[ i ] ) / 2.0;

        }

        return mean;

    },

    calculateMinArray: function( array1, array2 ){

        var n = array1.length;
        var min = new Float32Array( n );

        for( var i = 0; i < n; i++ ){

            min[ i ] = Math.min( array1[ i ],  array2[ i ] );

        }

        return min;

    },

    calculateMeanVector3: function( array ){

        var n = array.length;
        var m = array.length / 3;

        var x = 0;
        var y = 0;
        var z = 0;

        var i;

        for( i = 0; i < n; i += 3 ){

            x += array[ i + 0 ];
            y += array[ i + 1 ];
            z += array[ i + 2 ];

        }

        return new THREE.Vector3( x / m, y / m, z / m );

    },

    isPointOnSegment: function( p, l1, l2 ){

        var len = l1.distanceTo( l2 );

        return p.distanceTo( l1 ) <= len && p.distanceTo( l2 ) <= len;

    },

    pointVectorIntersection: function(){

        var v = new THREE.Vector3();
        var v1 = new THREE.Vector3();

        return function( point, origin, vector ){

            v.copy( vector );
            v1.subVectors( point, origin );
            var distOriginI = Math.cos( v.angleTo( v1 ) ) * v1.length();
            var vectorI = v.normalize().multiplyScalar( distOriginI );
            var pointI = new THREE.Vector3().addVectors( vectorI, origin );

            return pointI;

        }

    }(),

    copyArray: function( src, dst, srcOffset, dstOffset, length ){

        var i;
        var n = length;

        for( i = 0; i < n; ++i ){

            dst[ dstOffset + i ] = src[ srcOffset + i ];

        }

    }

};


NGL.debug = false;


NGL.init = function( onload, baseUrl ){

    NGL.debug = NGL.GET( "debug" );

    this.textures = [];

    NGL.initResources( onload, baseUrl );

    return this;

};


NGL.dataURItoImage = function( dataURI ){

    var img = document.createElement( "img" );
    img.src = dataURI;

    return img;

};


NGL.initResources = function( onLoad, baseUrl ){

    baseUrl = baseUrl || "";

    var loadingManager = new THREE.LoadingManager( function(){

        console.log( "NGL initialized" );

        if( onLoad !== undefined ){

            onLoad();

        }

    });

    var imageLoader = new THREE.ImageLoader( loadingManager );

    var xhrLoader = new THREE.XHRLoader( loadingManager );

    Object.keys( NGL.Resources ).forEach( function( url ){

        var v = NGL.Resources[ url ];
        var url2 = baseUrl + url;

        if( v==="image" ){

            imageLoader.load( url2, function( image ){

                NGL.Resources[ url ] = image;

            });

        }else if( v!==null ){

            return;

        }else{

            xhrLoader.load( url2, function( data ){

                NGL.Resources[ url ] = data;

            });

        }

    });

};


NGL.getShader = function(){

    var re = /^(?!\/\/)\s*#include\s+(\S+)/gmi;
    var cache = {};

    return function( name ){

        var shader = NGL.Resources[ '../shader/' + name ];

        if( !cache[ name ] ){

            cache[ name ] = shader.replace( re, function( match, p1 ){

                var path = '../shader/chunk/' + p1 + '.glsl';
                var chunk = NGL.Resources[ path ] || THREE.ShaderChunk[ p1 ];

                return chunk ? chunk : "";

            });

        }

        return cache[ name ];

    }

}();


NGL.trimCanvas = function( canvas, r, g, b, a ){

    var canvasHeight = canvas.height;
    var canvasWidth = canvas.width;

    var ctx = canvas.getContext( '2d' );
    var pixels = ctx.getImageData(0, 0, canvasWidth, canvasHeight ).data;

    var x, y, doBreak;

    doBreak = false;
    for( y = 0; y < canvasHeight; y++ ) {
        for( x = 0; x < canvasWidth; x++ ) {
            var off = ( y * canvasWidth + x ) * 4;
            if( pixels[ off ] !== r || pixels[ off + 1 ] !== g ||
                    pixels[ off + 2 ] !== b || pixels[ off + 3 ] !== a ){
                doBreak = true;
                break;
            }
        }
        if( doBreak ){
            break;
        }
    }
    var topY = y;

    doBreak = false;
    for( x = 0; x < canvasWidth; x++ ) {
        for( y = 0; y < canvasHeight; y++ ) {
            var off = ( y * canvasWidth + x ) * 4;
            if( pixels[ off ] !== r || pixels[ off + 1 ] !== g ||
                    pixels[ off + 2 ] !== b || pixels[ off + 3 ] !== a ){
                doBreak = true;
                break;
            }
        }
        if( doBreak ){
            break;
        }
    }
    var topX = x;

    doBreak = false;
    for( y = canvasHeight-1; y >= 0; y-- ) {
        for( x = canvasWidth-1; x >= 0; x-- ) {
            var off = ( y * canvasWidth + x ) * 4;
            if( pixels[ off ] !== r || pixels[ off + 1 ] !== g ||
                    pixels[ off + 2 ] !== b || pixels[ off + 3 ] !== a ){
                doBreak = true;
                break;
            }
        }
        if( doBreak ){
            break;
        }
    }
    var bottomY = y;

    doBreak = false;
    for( x = canvasWidth-1; x >= 0; x-- ) {
        for( y = canvasHeight-1; y >= 0; y-- ) {
            var off = ( y * canvasWidth + x ) * 4;
            if( pixels[ off ] !== r || pixels[ off + 1 ] !== g ||
                    pixels[ off + 2 ] !== b || pixels[ off + 3 ] !== a ){
                doBreak = true;
                break;
            }
        }
        if( doBreak ){
            break;
        }
    }
    var bottomX = x;

    var trimedCanvas = document.createElement( 'canvas' );
    trimedCanvas.style.display = "hidden";
    document.body.appendChild( trimedCanvas );

    trimedCanvas.width = bottomX - topX;
    trimedCanvas.height = bottomY - topY;

    var trimedCtx = trimedCanvas.getContext( '2d' );

    trimedCtx.drawImage(
        canvas,
        topX, topY,
        trimedCanvas.width, trimedCanvas.height,
        0, 0,
        trimedCanvas.width, trimedCanvas.height
    );

    return trimedCanvas;

}


//////////
// Stats

NGL.Stats = function(){

    var SIGNALS = signals;

    this.signals = {

        updated: new SIGNALS.Signal(),

    };

    this.begin();

    this.maxDuration = -Infinity;
    this.minDuration = Infinity;
    this.lastDuration = Infinity;

    this.lastFps = Infinity;

}

NGL.Stats.prototype = {

    update: function(){

        this.startTime = this.end();

        this.signals.updated.dispatch();

    },

    begin: function(){

        this.startTime = Date.now();
        this.prevFpsTime = this.startTime;

    },

    end: function(){

        var time = Date.now();

        this.lastDuration = time - this.startTime;

        this.minDuration = Math.min( this.minDuration, this.lastDuration );
        this.maxDuration = Math.max( this.maxDuration, this.lastDuration );

        this.frames += 1;

        if( time > this.prevFpsTime + 1000 ) {

            this.lastFps = Math.round(
                ( this.frames * 1000 ) / ( time - this.startTime )
            );

            this.prevFpsTime = time;

        }

        this.frames = 0;

        return time;

    }

};


///////////
// Viewer

/**
 * [Viewer description]
 * @class
 * @param {String} eid
 */
NGL.Viewer = function( eid ){

    if( eid ){

        this.eid = eid;

        this.container = document.getElementById( eid );

        if ( this.container === document ) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        } else {
            var box = this.container.getBoundingClientRect();
            this.width = box.width;
            this.height = box.height;
        }

    }else{

        this.container = document.createElement( 'div' );

    }

    this.aspect = this.width / this.height;

    this.initParams();

    this.initCamera();

    this.initScene();

    this.initRenderer();

    this.initLights();

    this.initControls();

    this.initStats();

    window.addEventListener(
        'resize', this.onWindowResize.bind( this ), false
    );

    // fog & background
    this.setBackground();
    this.setFog();

    this.boundingBox = new THREE.Box3();

    this.info = {

        memory: {
            programs: 0,
            geometries: 0,
            textures: 0
        },

        render: {
            calls: 0,
            vertices: 0,
            faces: 0,
            points: 0
        }

    };

};

NGL.Viewer.prototype = {

    constructor: NGL.Viewer,

    initParams: function(){

        this.params = {

            fogType: null,
            fogColor: 0x000000,
            fogNear: 50,
            fogFar: 100,
            fogDensity: 0.00025,

            // backgroundColor: 0xFFFFFF,
            backgroundColor: 0x000000,

            cameraType: 1,
            cameraFov: 40,
            cameraZ: -80, // FIXME initial value should be automatically determined

            clipNear: 0,
            clipFar: 100,
            clipDist: 20,

            specular: 0x050505,

        };

    },

    initCamera: function(){

        var p = this.params;
        var lookAt = new THREE.Vector3( 0, 0, 0 );

        this.perspectiveCamera = new THREE.PerspectiveCamera(
            p.cameraFov, this.aspect, 0.1, 10000
        );
        this.perspectiveCamera.position.z = p.cameraZ;
        this.perspectiveCamera.lookAt( lookAt );

        this.camera = this.perspectiveCamera;

        this.camera.updateProjectionMatrix();

    },

    initRenderer: function(){

        this.renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true,
            alpha: true,
            antialias: true
        });
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.width, this.height );
        this.renderer.autoClear = false;
        this.renderer.sortObjects = true;

        var _glExtensionFragDepth = this.renderer.context.getExtension(
            'EXT_frag_depth'
        );
        if( !_glExtensionFragDepth ){
            console.info( "EXT_frag_depth not available" );
        }
        NGL.extensionFragDepth = _glExtensionFragDepth;

        var _glStandardDerivatives = this.renderer.context.getExtension(
            'OES_standard_derivatives'
        );
        if( !_glStandardDerivatives ){
            console.error( "OES_standard_derivatives not available" );
        }

        var _glElementIndexUint = this.renderer.context.getExtension(
            'OES_element_index_uint'
        );
        if( !_glElementIndexUint ){
            NGL.indexUint16 = true;
            console.info( "OES_element_index_uint not available" );
        }

        if( this.eid ){
            this.container.appendChild( this.renderer.domElement );
        }

    },

    initScene: function(){

        if( !this.scene ){
            this.scene = new THREE.Scene();
        }

        this.rotationGroup = new THREE.Group();
        this.rotationGroup.name = "rotationGroup";
        this.scene.add( this.rotationGroup );

        this.modelGroup = new THREE.Group();
        this.modelGroup.name = "modelGroup";
        this.rotationGroup.add( this.modelGroup );

        this.pickingGroup = new THREE.Group();
        this.pickingGroup.name = "pickingGroup";
        this.rotationGroup.add( this.pickingGroup );

        this.backgroundGroup = new THREE.Group();
        this.backgroundGroup.name = "backgroundGroup";
        this.rotationGroup.add( this.backgroundGroup );

        this.transparentGroup = new THREE.Group();
        this.transparentGroup.name = "transparentGroup";
        this.rotationGroup.add( this.transparentGroup );

        this.surfaceGroup = new THREE.Group();
        this.surfaceGroup.name = "surfaceGroup";
        this.rotationGroup.add( this.surfaceGroup );

        this.textGroup = new THREE.Group();
        this.textGroup.name = "textGroup";
        this.rotationGroup.add( this.textGroup );

    },

    initLights: function(){

        var directionalLight = new THREE.DirectionalLight( 0xFFFFFF );
        directionalLight.position.copy( new THREE.Vector3( 1, 1, -2.5 ).normalize() );
        directionalLight.intensity = 0.5;

        var ambientLight = new THREE.AmbientLight( 0x101010 );

        var hemisphereLight = new THREE.HemisphereLight( 0xffffff, 0.01 );

        this.scene.add( directionalLight );
        this.scene.add( ambientLight );
        this.scene.add( hemisphereLight );

    },

    initControls: function(){

        this.controls = new THREE.TrackballControls(
            this.camera, this.renderer.domElement
        );

        this.controls.rotateSpeed = 2.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.staticMoving = true;
        // this.controls.dynamicDampingFactor = 0.3;
        this.controls.keys = [ 65, 83, 68 ];

        this.controls.addEventListener(
            'change', this.requestRender.bind( this )
        );

    },

    initStats: function(){

        this.stats = new NGL.Stats();

    },

    add: function( buffer, matrixList, background ){

        // console.time( "Viewer.add" );

        var group, pickingGroup;

        group = new THREE.Group();
        if( buffer.pickable ){
            pickingGroup = new THREE.Group();
        }

        if( buffer.size > 0 ){

            if( matrixList ){

                matrixList.forEach( function( matrix ){

                    this.addBuffer(
                        buffer, group, pickingGroup, background, matrix
                    );

                }, this );

            }else{

                this.addBuffer(
                    buffer, group, pickingGroup, background
                );

            }

            if( background ){
                this.backgroundGroup.add( group );
            }else if( buffer instanceof NGL.TextBuffer ){
                this.textGroup.add( group );
            }else if( buffer.transparent ){
                if( buffer instanceof NGL.SurfaceBuffer ){
                    this.surfaceGroup.add( group );
                }else{
                    this.transparentGroup.add( group );
                }
            }else{
                this.modelGroup.add( group );
            }

            if( buffer.pickable ){
                this.pickingGroup.add( pickingGroup );
            }

        }

        buffer.group = group;
        if( buffer.pickable ){
            buffer.pickingGroup = pickingGroup;
        }

        this.rotationGroup.updateMatrixWorld();

        // When adding a lot of buffers at once, requesting
        // a render somehow slows chrome drastically down.
        // this.requestRender();

        // console.timeEnd( "Viewer.add" );

    },

    addBuffer: function( buffer, group, pickingGroup, background, matrix ){

        // console.time( "Viewer.addBuffer" );

        var bg = background ? "background" : undefined;

        if( !buffer.material ){
            buffer.material = buffer.getMaterial( bg );
        }

        var mesh = buffer.getMesh(
            bg, buffer.material
        );
        mesh.frustumCulled = false;
        if( matrix ){
            mesh.applyMatrix( matrix );
            mesh.userData[ "matrix" ] = matrix;
        }
        group.add( mesh );

        if( buffer.pickable ){

            if( !buffer.pickingMaterial ){
                buffer.pickingMaterial = buffer.getMaterial( "picking" );
            }

            var pickingMesh = buffer.getMesh(
                "picking", buffer.pickingMaterial
            );
            pickingMesh.frustumCulled = false;
            if( matrix ){
                pickingMesh.applyMatrix( matrix );
                pickingMesh.userData[ "matrix" ] = matrix;
            }
            pickingGroup.add( pickingMesh );

        }

        this.updateBoundingBox( buffer.geometry, matrix );

        // console.timeEnd( "Viewer.addBuffer" );

    },

    remove: function( buffer ){

        this.rotationGroup.children.forEach( function( group ){
            group.remove( buffer.group );
        } );

        if( buffer.pickable ){
            this.pickingGroup.remove( buffer.pickingGroup );
        }

        this.updateBoundingBox();

        // this.requestRender();

    },

    updateBoundingBox: function( geometry, matrix ){

        var gbb;
        var bb = this.boundingBox;

        if( this.boundingBoxMesh ){
            this.modelGroup.remove( this.boundingBoxMesh );
        }

        if( geometry ){

            if( !geometry.boundingBox ){
                geometry.computeBoundingBox();
            }

            if( matrix ){
                gbb = geometry.boundingBox.clone();
                gbb.applyMatrix4( matrix );
            }else{
                gbb = geometry.boundingBox;
            }

            bb.expandByPoint( gbb.min );
            bb.expandByPoint( gbb.max );

        }else{

            bb.makeEmpty();

            this.rotationGroup.traverse( function ( node ){

                if ( node.geometry !== undefined ){

                    if( !node.geometry.boundingBox ){
                        node.geometry.computeBoundingBox();
                    }

                    if( node.userData[ "matrix" ] ){
                        gbb = node.geometry.boundingBox.clone();
                        gbb.applyMatrix4( node.userData[ "matrix" ] );
                    }else{
                        gbb = node.geometry.boundingBox;
                    }

                    bb.expandByPoint( gbb.min );
                    bb.expandByPoint( gbb.max );

                }

            } );

        }

        this.controls.maxDistance = bb.size().length() * 10;

        if( NGL.debug ){

            var bbSize = bb.size();
            var material = new THREE.MeshBasicMaterial( {
                color: Math.random() * 0xFFFFFF, wireframe: true
            } );
            var boxGeometry = new THREE.BoxGeometry(
                bbSize.x, bbSize.y, bbSize.z
            );
            this.boundingBoxMesh = new THREE.Mesh( boxGeometry, material );
            bb.center( this.boundingBoxMesh.position );
            this.modelGroup.add( this.boundingBoxMesh );

        }

    },

    fullscreen: function(){

        var elem = this.container;

        if( elem.requestFullscreen ){
            elem.requestFullscreen();
        }else if( elem.msRequestFullscreen ){
            elem.msRequestFullscreen();
        }else if( elem.mozRequestFullScreen ){
            elem.mozRequestFullScreen();
        }else if( elem.webkitRequestFullscreen ){
            elem.webkitRequestFullscreen();
        }

    },

    getImage: function( type, quality ){

        return this.renderer.domElement.toBlob( type, quality );

    },

    /**
     * [setFog description]
     * @param {String} type - Either 'linear' or 'exp2'.
     * @param {String} color - Fog color.
     * @param {Number} near - Where the fog effect starts (only 'linear').
     * @param {Number} far - Where the fog effect ends (only 'linear').
     * @param {Number} density - Density of the fog (only 'exp2').
     */
    setFog: function( type, color, near, far, density, foo ){

        var p = this.params;

        if( type!==null ) p.fogType = type;
        if( color ) p.fogColor = color;
        if( near ) p.fogNear = near;
        if( far ) p.fogFar = far;
        if( density ) p.fogDensity = density;

        this.requestRender();

    },

    /**
     * Sets the background color (and also the fog color).
     * @param {String} color
     */
    setBackground: function( color ){

        var p = this.params;

        if( color ) p.backgroundColor = color;

        this.setFog( null, p.backgroundColor );
        this.renderer.setClearColor( p.backgroundColor, 1 );

        this.requestRender();

    },

    setCamera: function( type, fov, near, far ){

        var p = this.params;

        if( type!==null ) p.cameraType = type;
        if( fov ) p.cameraFov = fov;
        if( near ) p.cameraNear = near;
        if( far ) p.cameraFar = far;

        this.camera = this.perspectiveCamera;

        this.perspectiveCamera.fov = p.cameraFov;
        this.perspectiveCamera.near = p.cameraNear;
        this.perspectiveCamera.far = p.cameraFar;

        this.controls.object = this.camera;
        this.camera.updateProjectionMatrix();

        this.requestRender();

    },

    setClip: function( near, far ){

        var p = this.params;

        if( near ) p.clipNear = near;
        if( far ) p.clipFar = far;

        this.requestRender();

    },

    onWindowResize: function(){

        this.renderer.setPixelRatio( window.devicePixelRatio );

        if ( this.container === document ) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        } else {
            var box = this.container.getBoundingClientRect();
            this.width = box.width;
            this.height = box.height;
        }
        this.aspect = this.width / this.height;

        this.perspectiveCamera.aspect = this.aspect;

        this.camera.updateProjectionMatrix();
        this.renderer.setSize( this.width, this.height );
        this.controls.handleResize();

        this.requestRender();

    },

    updateInfo: function( reset ){

        var info = this.info;
        var memory = info.memory;
        var render = info.render;

        if( reset ){

            memory.programs = 0;
            memory.geometries = 0;
            memory.textures = 0;

            render.calls = 0;
            render.vertices = 0;
            render.faces = 0;
            render.points = 0;

        }else{

            var rInfo = this.renderer.info;
            var rMemory = rInfo.memory;
            var rRender = rInfo.render;

            memory.programs = rMemory.programs;
            memory.geometries = rMemory.geometries;
            memory.textures = rMemory.textures;

            render.calls += rRender.calls;
            render.vertices += rRender.vertices;
            render.faces += rRender.faces;
            render.points += rRender.points;

        }

    },

    animate: function(){

        requestAnimationFrame( this.animate.bind( this ) );

        this.controls.update();
        this.stats.update();

    },

    screenshot: function( params ){

        NGL.screenshot( this, params );

    },

    requestRender: function(){

        if( this._renderPending ){
            // console.info( "there is still a 'render' call pending" );
            return;
        }

        this._renderPending = true;
        requestAnimationFrame( this.render.bind( this ) );

    },

    render: function( e, picking, tileing ){

        // console.time( "Viewer.render" );

        if( this._rendering ){
            console.warn( "tried to call 'render' from within 'render'" );
            return;
        }

        this._rendering = true;

        // clipping

        var cDist = this.camera.position.length();
        if( !cDist ){
            // recover from a broken (NaN) camera position
            this.camera.position.set( 0, 0, this.params.cameraZ );
        }

        var bRadius = this.boundingBox.size().length() * 0.5;
        var nearFactor = ( 50 - this.params.clipNear ) / 50;
        var farFactor = - ( 50 - this.params.clipFar ) / 50;
        var nearClip = cDist - ( bRadius * nearFactor );
        this.camera.near = Math.max(
            0.1,
            // cDist - ( bRadius * nearFactor ),
            this.params.clipDist
        );
        this.camera.far = Math.max(
            1,
            cDist + ( bRadius * farFactor )
        );

        // fog

        var fogNearFactor = ( 50 - this.params.fogNear ) / 50;
        var fogFarFactor = - ( 50 - this.params.fogFar ) / 50;
        var fog = new THREE.Fog(
            this.params.fogColor,
            Math.max( 0.1, cDist - ( bRadius * fogNearFactor ) ),
            Math.max( 1, cDist + ( bRadius * fogFarFactor ) )
        );
        this.modelGroup.fog = fog;
        this.textGroup.fog = fog;
        this.transparentGroup.fog = fog;
        this.surfaceGroup.fog = fog;

        //

        this.camera.updateMatrix();
        this.camera.updateMatrixWorld( true );
        this.camera.matrixWorldInverse.getInverse( this.camera.matrixWorld );
        if( !tileing ) this.camera.updateProjectionMatrix();

        this.updateDynamicUniforms( this.scene, nearClip );

        this.sortProjectedPosition( this.scene, this.camera );

        // render

        this.renderer.clear();

        this.updateInfo( true );

        if( picking ){

            this.renderer.render( this.pickingGroup, this.camera );
            this.updateInfo();

        }else{

            this.renderer.render( this.backgroundGroup, this.camera );
            this.renderer.clearDepth();
            this.updateInfo();

            this.renderer.render( this.modelGroup, this.camera );
            this.updateInfo();

            this.renderer.render( this.textGroup, this.camera );
            this.updateInfo();

            this.renderer.render( this.transparentGroup, this.camera );
            this.updateInfo();

            this.renderer.render( this.surfaceGroup, this.camera );
            this.updateInfo();

        }

        this._rendering = false;
        this._renderPending = false;

        // console.timeEnd( "Viewer.render" );
        // console.log( this.info.memory, this.info.render );

    },

    updateDynamicUniforms: function(){

        var u;
        var matrix = new THREE.Matrix4();
        var bgColor = new THREE.Color();

        return function( group, nearClip ){

            var camera = this.camera;
            var params = this.params;

            bgColor.set( params.backgroundColor );

            group.traverse( function ( o ){

                if( !o.material ) return;

                u = o.material.uniforms;
                if( !u ) return;

                if( u.backgroundColor ){
                    u.backgroundColor.value = bgColor;
                }

                if( u.nearClip ){
                    u.nearClip.value = nearClip;
                }

                if( u.modelViewMatrixInverse ){
                    matrix.multiplyMatrices(
                        camera.matrixWorldInverse, o.matrixWorld
                    );
                    u.modelViewMatrixInverse.value.getInverse( matrix );
                }

                if( u.modelViewMatrixInverseTranspose ){
                    if( u.modelViewMatrixInverse ){
                        u.modelViewMatrixInverseTranspose.value.copy(
                            u.modelViewMatrixInverse.value
                        ).transpose();
                    }else{
                        matrix.multiplyMatrices(
                            camera.matrixWorldInverse, o.matrixWorld
                        );
                        u.modelViewMatrixInverseTranspose.value
                            .getInverse( matrix )
                            .transpose();
                    }
                }

                if( u.projectionMatrixInverse ){
                    u.projectionMatrixInverse.value.getInverse(
                        camera.projectionMatrix
                    );
                }

                if( u.projectionMatrixTranspose ){
                    u.projectionMatrixTranspose.value.copy(
                        camera.projectionMatrix
                    ).transpose();
                }

                if( u.modelViewProjectionMatrix ){
                    matrix.multiplyMatrices(
                        camera.matrixWorldInverse, o.matrixWorld
                    );
                    u.modelViewProjectionMatrix.value.multiplyMatrices(
                        camera.projectionMatrix, matrix
                    )
                }

                if( u.modelViewProjectionMatrixInverse ){
                    if( u.modelViewProjectionMatrix ){
                        u.modelViewProjectionMatrixInverse.value.copy(
                            u.modelViewProjectionMatrix.value
                        );
                        u.modelViewProjectionMatrixInverse.value.getInverse(
                            u.modelViewProjectionMatrixInverse.value
                        );
                    }else{
                        matrix.multiplyMatrices(
                            camera.matrixWorldInverse, o.matrixWorld
                        );
                        u.modelViewProjectionMatrixInverse.value.multiplyMatrices(
                            camera.projectionMatrix, matrix
                        )
                        u.modelViewProjectionMatrixInverse.value.getInverse(
                            u.modelViewProjectionMatrixInverse.value
                        );
                    }
                }

            } );

        }

    }(),

    sortProjectedPosition: function(){

        var lastCall = 0;

        var vertex = new THREE.Vector3();
        var matrix = new THREE.Matrix4();
        var modelViewProjectionMatrix = new THREE.Matrix4();

        var i, j, n, attributes, sortArray;

        return function( scene, camera ){

            // console.time( "sort" );

            scene.traverseVisible( function ( o ){

                if( o instanceof THREE.PointCloud && o.sortParticles ){

                    matrix.multiplyMatrices(
                        camera.matrixWorldInverse, o.matrixWorld
                    );
                    modelViewProjectionMatrix.multiplyMatrices(
                        camera.projectionMatrix, matrix
                    )
                    attributes = o.geometry.attributes;
                    n = attributes.position.length / 3;
                    sortArray = [];

                    for( i = 0; i < n; ++i ){

                        vertex.fromArray( attributes.position.array, i * 3 );
                        vertex.applyProjection( modelViewProjectionMatrix );

                        sortArray[ i ] = [ vertex.z, i ];

                    }

                    sortArray.sort( function( a, b ){
                        return b[ 0 ] - a[ 0 ];
                    } );

                    if( !o.userData.sortData ){
                        o.userData.sortData = {};
                    }

                    var index, indexSrc, indexDst, tmpTab;

                    for( var val in attributes ){

                        if( !o.userData.sortData[ val ] ){
                            o.userData.sortData[ val ] = new Float32Array(
                                attributes[ val ].itemSize * n
                            );
                        }

                        tmpTab = o.userData.sortData[ val ];
                        o.userData.sortData[ val ] = attributes[ val ].array;

                        // tmpTab = new Float32Array(
                        //     attributes[ val ].itemSize * n
                        // )

                        for( i = 0; i < n; ++i ){

                            index = sortArray[ i ][ 1 ];

                            for( j = 0; j < attributes[ val ].itemSize; ++j ){
                                indexSrc = index * attributes[ val ].itemSize + j;
                                indexDst = i * attributes[ val ].itemSize + j;
                                tmpTab[ indexDst ] = attributes[ val ].array[indexSrc];
                            }

                        }

                        attributes[ val ].array = tmpTab;
                        attributes[ val ].needsUpdate = true;

                    }

                }

            } );

            // console.timeEnd( "sort" );

        }

    }(),

    clear: function(){

        console.log( "scene cleared" );

        this.scene.remove( this.rotationGroup );

        this.initScene();

        this.renderer.clear();

    },

    centerView: function(){

        var t = new THREE.Vector3();

        return function( center, zoom ){

            center = center || this.boundingBox.center();

            // remove any paning/translation
            this.controls.object.position.sub( this.controls.target );
            this.controls.target.copy( this.controls.target0 );

            t.copy( center ).multiplyScalar( -1 );

            if( zoom ){

                if( zoom === true ){

                    // automatic zoom that shows
                    // everything inside the bounding box

                    zoom = this.boundingBox.size().length() /
                        2 / Math.tan( Math.PI * this.camera.fov / 360 );

                }

                zoom = Math.max( zoom, 1.2 * this.params.clipDist );

                this.camera.position.multiplyScalar(
                    zoom / this.camera.position.length()
                );

            }

            this.rotationGroup.position.copy( t );
            this.rotationGroup.updateMatrixWorld();

            this.requestRender();

        }

    }(),

    getOrientation: function(){

        return [
            this.camera.position.toArray(),
            this.camera.up.toArray(),
            this.rotationGroup.position.toArray()
        ];

    },

    setOrientation: function( orientation ){

        // remove any paning/translation
        this.controls.object.position.sub( this.controls.target );
        this.controls.target.copy( this.controls.target0 );

        this.camera.position.fromArray( orientation[ 0 ] );
        this.camera.up.fromArray( orientation[ 1 ] );

        this.rotationGroup.position.fromArray( orientation[ 2 ] );
        this.rotationGroup.updateMatrixWorld();

        this.requestRender();

    }

};


/////////////
// Renderer

NGL.TiledRenderer = function( renderer, camera, viewer, params ){

    var p = params || {};

    this.renderer = renderer;
    this.camera = camera;
    this.viewer = viewer;

    this.factor = p.factor!==undefined ? p.factor : 2;
    this.antialias = p.antialias!==undefined ? p.antialias : false;

    this.onProgress = p.onProgress;
    this.onFinish = p.onFinish;

    this.init();

};

NGL.TiledRenderer.prototype = {

    init: function(){

        if( this.antialias ) this.factor *= 2;

        this.n = this.factor * this.factor;

        // canvas

        var canvas = document.createElement( 'canvas' );
        canvas.style.display = "hidden";
        document.body.appendChild( canvas );

        if( this.antialias ){

            canvas.width = this.viewer.width * this.factor / 2;
            canvas.height = this.viewer.height * this.factor / 2;

        }else{

            canvas.width = this.viewer.width * this.factor;
            canvas.height = this.viewer.height * this.factor;

        }

        this.ctx = canvas.getContext( '2d' );
        this.canvas = canvas;

        //

        this.shearMatrix = new THREE.Matrix4();
        this.scaleMatrix = new THREE.Matrix4();

        var halfFov = THREE.Math.degToRad( this.camera.fov * 0.5 );

        this.near = this.camera.near;
        this.top = Math.tan( halfFov ) * this.near;
        this.bottom = -this.top;
        this.left = this.camera.aspect * this.bottom;
        this.right = this.camera.aspect * this.top;
        this.width = Math.abs( this.right - this.left );
        this.height = Math.abs( this.top - this.bottom );

    },

    makeAsymmetricFrustum: function( projectionMatrix, i ){

        var factor = this.factor;
        var near = this.near;
        var width = this.width;
        var height = this.height;

        var x = i % factor;
        var y = Math.floor( i / factor );

        this.shearMatrix.set(
            1, 0, ( x - ( factor - 1 ) * 0.5 ) * width / near, 0,
            0, 1, -( y - ( factor - 1 ) * 0.5 ) * height / near, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        this.scaleMatrix.set(
            factor, 0, 0, 0,
            0, factor, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        projectionMatrix
            .multiply( this.shearMatrix )
            .multiply( this.scaleMatrix );

        return projectionMatrix;

    },

    renderTile: function( i ){

        this.makeAsymmetricFrustum( this.camera.projectionMatrix, i );

        this.viewer.render( null, null, true );

        var x = ( i % this.factor ) * this.viewer.width;
        var y = Math.floor( i / this.factor ) * this.viewer.height;

        if( this.antialias ){

            this.ctx.drawImage(
                this.renderer.domElement,
                Math.round( x / 2 ),
                Math.round( y / 2 ),
                Math.round( this.viewer.width / 2 ),
                Math.round( this.viewer.height / 2 )
            );

        }else{

            this.ctx.drawImage( this.renderer.domElement, x, y );

        }

        this.camera.updateProjectionMatrix();

        if( typeof this.onProgress === "function" ){

            this.onProgress( i + 1, this.n, false );

        }

    },

    render: function(){

        var n = this.n;

        for( var i = 0; i <= n; ++i ){

            if( i === n ){

                if( typeof this.onFinish === "function" ){

                    this.onFinish( i + 1, n, false );

                }

            }else{

                this.renderTile( i );

            }

        }

    },

    renderAsync: function(){

        var n = this.n;
        var renderTile = this.renderTile.bind( this );
        var onFinish = this.onFinish;

        for( var i = 0; i <= n; ++i ){

            setTimeout( ( function( i ){

                return function(){

                    if( i === n ){

                        if( typeof onFinish === "function" ){

                            onFinish( i + 1, n, false );

                        }

                    }else{

                        renderTile( i );

                    }

                }

            } )( i ) );

        }

    },

    dispose: function(){

        document.body.removeChild( this.canvas );

    }

};


NGL.screenshot = function( viewer, params ){

    var p = params || {};

    var trim = p.trim!==undefined ? p.trim : false;
    var type = p.type!==undefined ? p.type : "image/png";
    var quality = p.quality!==undefined ? p.quality : 1.0;
    var transparent = p.transparent!==undefined ? p.transparent : false;

    var factor = p.factor!==undefined ? p.factor : false;
    var antialias = p.antialias!==undefined ? p.antialias : false;

    var renderer = viewer.renderer;
    var camera = viewer.camera;

    var originalClearAlpha = renderer.getClearAlpha();
    var backgroundColor = renderer.getClearColor();

    if( transparent ){

        renderer.setClearAlpha( 0 );

    }

    var tiledRenderer = new NGL.TiledRenderer(

        renderer, camera, viewer,
        {
            factor: factor,
            antialias: antialias,
            onProgress: onProgress,
            onFinish: onFinish
        }

    );

    tiledRenderer.renderAsync();

    //

    function onProgress( i, n, finished ){

        if( typeof p.onProgress === "function" ){

            p.onProgress( i, n, finished );

        }

    }

    function onFinish( i, n ){

        save( n );

        if( transparent ){

            renderer.setClearAlpha( originalClearAlpha );

        }

        viewer.requestRender();

    }

    function save( n ){

        var canvas;
        var ext = type.split( "/" )[ 1 ];

        if( trim ){

            var bg = backgroundColor;
            var r = ( bg.r * 255 ) | 0;
            var g = ( bg.g * 255 ) | 0;
            var b = ( bg.b * 255 ) | 0;
            var a = transparent ? 0 : 255;

            canvas = NGL.trimCanvas( tiledRenderer.canvas, r, g, b, a );

        }else{

            canvas = tiledRenderer.canvas;

        }

        canvas.toBlob(

            function( blob ){

                NGL.download( blob, "screenshot." + ext );
                onProgress( n, n, true );

                tiledRenderer.dispose();

            },
            type, quality

        );

    }

};

// File:js/ngl/buffer.js

/**
 * @file Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


////////////////
// Buffer Core

/**
 * The core buffer class.
 * @class
 * @private
 */
NGL.Buffer = function( position, color, pickingColor ){

    // required properties:
    // - size
    // - attributeSize
    // - vertexShader
    // - fragmentShader

    this.pickable = false;
    this.transparent = this.transparent || false;
    this.side = this.side !== undefined ? this.side : THREE.DoubleSide;
    this.opacity = this.opacity !== undefined ? this.opacity : 1.0;
    this.nearClip = this.nearClip !== undefined ? this.nearClip : true;

    this.attributes = {};
    this.geometry = new THREE.BufferGeometry();

    this.addAttributes({
        "position": { type: "v3", value: position },
        "color": { type: "c", value: color },
    });

    if( pickingColor ){

        this.addAttributes({
            "pickingColor": { type: "c", value: pickingColor },
        });

        this.pickable = true;

    }

    this.uniforms = THREE.UniformsUtils.merge([
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
        {
            "opacity": { type: "f", value: this.opacity },
            "nearClip": { type: "f", value: 0.0 },
        }
    ]);

};

NGL.Buffer.prototype = {

    constructor: NGL.Buffer,

    finalize: function(){

        this.makeIndex();

        if( NGL.indexUint16 ){

            this.geometry.drawcalls = this.geometry.computeOffsets();

        }

    },

    getMesh: function( type, material ){

        material = material || this.getMaterial( type );

        if( type === "wireframe" || this.wireframe ){

            return new THREE.Line(
                this.geometry, material, THREE.LinePieces
            );

        }else{

            return new THREE.Mesh( this.geometry, material );

        }

    },

    getMaterial: function( type ){

        var material;
        var uniforms = THREE.UniformsUtils.clone( this.uniforms );

        if( type === "picking" ){

            material = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                attributes: this.attributes,
                vertexShader: NGL.getShader( this.vertexShader ),
                fragmentShader: NGL.getShader( this.fragmentShader ),
                depthTest: true,
                transparent: false,
                depthWrite: true,
                lights: true,
                fog: false
            });

            material.side = this.side;
            material.defines[ "PICKING" ] = 1;

        }else if( type === "wireframe" || this.wireframe ){

            material = new THREE.LineBasicMaterial({
                uniforms: uniforms,
                attributes: this.attributes,
                vertexColors: true,
                fog: true
            });

        }else{

            material = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                attributes: this.attributes,
                vertexShader: NGL.getShader( this.vertexShader ),
                fragmentShader: NGL.getShader( this.fragmentShader ),
                depthTest: true,
                transparent: this.transparent,
                depthWrite: true,
                lights: true,
                fog: true
            });

            material.side = this.side;

            if( type === "background" ){

                material.defines[ "NOLIGHT" ] = 1;

            }

        }

        if( this.nearClip && !( type === "wireframe" || this.wireframe ) ){

            material.defines[ "NEAR_CLIP" ] = 1;

        }

        return material;

    },

    addUniforms: function( uniforms ){

        this.uniforms = THREE.UniformsUtils.merge(
            [ this.uniforms, uniforms ]
        );

    },

    addAttributes: function( attributes ){

        var itemSize = {
            "f": 1, "v2": 2, "v3": 3, "c": 3
        };

        Object.keys( attributes ).forEach( function( name ){

            var buf;
            var a = attributes[ name ];

            this.attributes[ name ] = {
                "type": a.type, "value": null
            };

            if( a.value ){

                if( this.attributeSize * itemSize[ a.type ] !== a.value.length ){
                    console.error( "attribute value has wrong length", name );
                }

                buf = a.value;

            }else{

                buf = new Float32Array(
                    this.attributeSize * itemSize[ a.type ]
                );

            }

            this.geometry.addAttribute(
                name,
                new THREE.BufferAttribute( buf, itemSize[ a.type ] )
            );

        }, this );

    },

    /**
     * Sets buffer attributes
     * @param {Object} data - An object where the keys are the attribute names
     *      and the values are the attribute data.
     * @example
     * var buffer = new NGL.Buffer();
     * buffer.setAttributes({ attrName: attrData });
     */
    setAttributes: function( data ){

        var attributes = this.geometry.attributes;

        Object.keys( data ).forEach( function( name ){

            attributes[ name ].set( data[ name ] );

            attributes[ name ].needsUpdate = true;
            this.attributes[ name ].needsUpdate = true;

        }, this );

    },

    makeIndex: function(){

        if( this.index ){

            this.geometry.addAttribute(
                "index",
                new THREE.BufferAttribute( this.index, 1 )
            );

        }

    },

    setVisibility: function( value ){

        this.group.visible = value;
        if( this.pickable ){
            this.pickingGroup.visible = value;
        }

    },

    dispose: function(){

        this.group.traverse( function ( o ){
            if( o.material ){
                o.material.dispose();
            }
        } );

        if( this.pickable ){
            this.pickingGroup.traverse( function ( o ){
                if( o.material ){
                    o.material.dispose();
                }
            } );
        }

        this.geometry.dispose();

    }

};


/**
 * [MeshBuffer description]
 * @class
 * @augments {NGL.Buffer}
 * @param {Float32Array} position
 * @param {Float32Array} color
 * @param {Float32Array} index
 * @param {Float32Array} normal
 */
NGL.MeshBuffer = function( position, color, index, normal, pickingColor, wireframe, transparent, side, opacity, nearClip ){

    this.wireframe = wireframe || false;
    this.transparent = transparent !== undefined ? transparent : false;
    this.side = side !== undefined ? side : THREE.DoubleSide;
    this.opacity = opacity !== undefined ? opacity : 1.0;
    this.nearClip = nearClip !== undefined ? nearClip : true;

    this.size = position.length / 3;
    this.attributeSize = this.size;
    this.vertexShader = 'Mesh.vert';
    this.fragmentShader = 'Mesh.frag';

    this.index = index;

    NGL.Buffer.call( this, position, color, pickingColor );

    this.addAttributes({
        "normal": { type: "v3", value: normal },
    });

    this.finalize();

};

NGL.MeshBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.MeshBuffer.prototype.constructor = NGL.MeshBuffer;


/**
 * [MappedBuffer description]
 * @class
 * @private
 * @augments {NGL.Buffer}
 */
NGL.MappedBuffer = function(){

    this.mappedSize = this.size * this.mappingSize;
    this.attributeSize = this.mappedSize;

    NGL.Buffer.call( this );

    this.addAttributes({
        "mapping": { type: this.mappingType, value: null },
    });

};

NGL.MappedBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.MappedBuffer.prototype.constructor = NGL.MappedBuffer;

NGL.MappedBuffer.prototype.finalize = function(){

    this.makeMapping();

    NGL.Buffer.prototype.finalize.call( this );

};

NGL.MappedBuffer.prototype.setAttributes = function( data ){

    var attributes = this.geometry.attributes;
    var size = this.size;
    var mappingSize = this.mappingSize;

    var a, d, itemSize, array, n, i, j;

    Object.keys( data ).forEach( function( name ){

        d = data[ name ];
        a = attributes[ name ];
        itemSize = a.itemSize;
        array = a.array;

        for( var k = 0; k < size; ++k ) {

            n = k * itemSize;
            i = n * mappingSize;

            for( var l = 0; l < mappingSize; ++l ) {

                j = i + (itemSize * l);

                for( var m = 0; m < itemSize; ++m ) {

                    array[ j + m ] = d[ n + m ];

                }

            }

        }

        a.needsUpdate = true;
        this.attributes[ name ].needsUpdate = true;

    }, this );

};

NGL.MappedBuffer.prototype.makeMapping = function(){

    var size = this.size;
    var mapping = this.mapping;
    var mappingSize = this.mappingSize;
    var mappingItemSize = this.mappingItemSize;

    var aMapping = this.geometry.attributes[ "mapping" ].array;

    for( var v = 0; v < size; v++ ) {

        aMapping.set( mapping, v * mappingItemSize * mappingSize );

    }

};

NGL.MappedBuffer.prototype.makeIndex = function(){

    var size = this.size;
    var mappingSize = this.mappingSize;
    var mappingIndices = this.mappingIndices;
    var mappingIndicesSize = this.mappingIndicesSize;
    var mappingItemSize = this.mappingItemSize;

    this.geometry.addAttribute(
        "index",
        new THREE.BufferAttribute(
            new Uint32Array( size * mappingIndicesSize ), 1
        )
    );

    var index = this.geometry.attributes[ "index" ].array;

    var i, ix, it;

    for( var v = 0; v < size; v++ ) {

        i = v * mappingItemSize * mappingSize;
        ix = v * mappingIndicesSize;
        it = v * mappingSize;

        index.set( mappingIndices, ix );

        for( var s=0; s<mappingIndicesSize; ++s ){
            index[ ix + s ] += it;
        }

    }

};


/**
 * [QuadBuffer description]
 * @class
 * @private
 * @augments {NGL.MappedBuffer}
 */
NGL.QuadBuffer = function(){

    this.mapping = new Float32Array([
        -1.0,  1.0,
        -1.0, -1.0,
         1.0,  1.0,
         1.0, -1.0
    ]);

    this.mappingIndices = new Uint32Array([
        0, 1, 2,
        1, 3, 2
    ]);

    this.mappingIndicesSize = 6;
    this.mappingType = "v2";
    this.mappingSize = 4;
    this.mappingItemSize = 2;

    NGL.MappedBuffer.call( this );

};

NGL.QuadBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );

NGL.QuadBuffer.prototype.constructor = NGL.QuadBuffer;


/**
 * [BoxBuffer description]
 * @class
 * @private
 * @augments {NGL.MappedBuffer}
 */
NGL.BoxBuffer = function(){

    this.mapping = new Float32Array([
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0
    ]);

    this.mappingIndices = new Uint32Array([
        0, 1, 2,
        0, 2, 3,
        1, 5, 6,
        1, 6, 2,
        4, 6, 5,
        4, 7, 6,
        0, 7, 4,
        0, 3, 7,
        0, 5, 1,
        0, 4, 5,
        3, 2, 6,
        3, 6, 7
    ]);

    this.mappingIndicesSize = 36;
    this.mappingType = "v3";
    this.mappingSize = 8;
    this.mappingItemSize = 3;

    NGL.MappedBuffer.call( this );

};

NGL.BoxBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );

NGL.BoxBuffer.prototype.constructor = NGL.BoxBuffer;


/**
 * [AlignedBoxBuffer description]
 * @class
 * @private
 * @augments {NGL.MappedBuffer}
 */
NGL.AlignedBoxBuffer = function(){

    this.mapping = new Float32Array([
        -1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0
    ]);

    this.mappingIndices = new Uint32Array([
        0, 1, 2,
        1, 4, 2,
        2, 4, 3,
        4, 5, 3
    ]);

    this.mappingIndicesSize = 12;
    this.mappingType = "v3";
    this.mappingSize = 6;
    this.mappingItemSize = 3;

    NGL.MappedBuffer.call( this );

};

NGL.AlignedBoxBuffer.prototype = Object.create( NGL.MappedBuffer.prototype );

NGL.AlignedBoxBuffer.prototype.constructor = NGL.AlignedBoxBuffer;


////////////////////////
// Impostor Primitives

/**
 * [SphereImpostorBuffer description]
 * @class
 * @augments {NGL.MappedBuffer}
 * @param {Float32Array} position
 * @param {Float32Array} color
 * @param {Float32Array} radius
 */
NGL.SphereImpostorBuffer = function( position, color, radius, pickingColor, transparent, side, opacity ){

    this.transparent = transparent !== undefined ? transparent : false;
    this.side = side !== undefined ? side : THREE.DoubleSide;
    this.opacity = opacity !== undefined ? opacity : 1.0;

    this.size = position.length / 3;
    this.vertexShader = 'SphereImpostor.vert';
    this.fragmentShader = 'SphereImpostor.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
    });

    this.addAttributes({
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "color": color,
        "radius": radius,
    });

    if( pickingColor ){

        this.addAttributes({
            "pickingColor": { type: "c", value: null },
        });

        this.setAttributes({
            "pickingColor": pickingColor,
        });

        this.pickable = true;

    }

    this.finalize();

};

NGL.SphereImpostorBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );

NGL.SphereImpostorBuffer.prototype.constructor = NGL.SphereImpostorBuffer;


/**
 * [CylinderImpostorBuffer description]
 * @class
 * @augments {NGL.AlignedBoxBuffer}
 * @param {Float32Array} from
 * @param {Float32Array} to
 * @param {Float32Array} color
 * @param {Float32Array} color2
 * @param {Float32Array} radius
 * @param {Float} shift - Moves the cylinder in camera space
 *      to i.e. get multiple aligned cylinders.
 * @param {Boolean} cap - If true the cylinders are capped.
 */
NGL.CylinderImpostorBuffer = function( from, to, color, color2, radius, shift, cap, pickingColor, pickingColor2, transparent, side, opacity ){

    if( !shift ) shift = 0;

    this.cap = cap === undefined ? true : cap;
    this.transparent = transparent !== undefined ? transparent : false;
    this.side = side !== undefined ? side : THREE.DoubleSide;
    this.opacity = opacity !== undefined ? opacity : 1.0;

    this.size = from.length / 3;
    this.vertexShader = 'CylinderImpostor.vert';
    this.fragmentShader = 'CylinderImpostor.frag';

    NGL.AlignedBoxBuffer.call( this );

    this.addUniforms({
        'modelViewMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'shift': { type: "f", value: shift },
    });

    this.addAttributes({
        "position1": { type: "v3", value: null },
        "position2": { type: "v3", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": NGL.Utils.calculateCenterArray( from, to ),

        "position1": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius,
    });

    if( pickingColor ){

        this.addAttributes({
            "pickingColor": { type: "c", value: null },
            "pickingColor2": { type: "c", value: null },
        });

        this.setAttributes({
            "pickingColor": pickingColor,
            "pickingColor2": pickingColor2,
        });

        this.pickable = true;

    }

    this.finalize();

    // FIXME
    // if( cap ){
    //     this.material.defines[ "CAP" ] = 1;
    // }

};

NGL.CylinderImpostorBuffer.prototype = Object.create( NGL.AlignedBoxBuffer.prototype );

NGL.CylinderImpostorBuffer.prototype.constructor = NGL.CylinderImpostorBuffer;

NGL.CylinderImpostorBuffer.prototype.getMaterial = function( type ){

    var material = NGL.Buffer.prototype.getMaterial.call( this, type );

    if( this.cap ){
        material.defines[ "CAP" ] = 1;
    }

    return material;

}


NGL.HyperballStickImpostorBuffer = function( position1, position2, color, color2, radius1, radius2, shrink, pickingColor, pickingColor2, transparent, side, opacity ){

    this.transparent = transparent !== undefined ? transparent : false;
    this.side = side !== undefined ? side : THREE.DoubleSide;
    this.opacity = opacity !== undefined ? opacity : 1.0;

    this.size = position1.length / 3;
    this.vertexShader = 'HyperballStickImpostor.vert';
    this.fragmentShader = 'HyperballStickImpostor.frag';

    NGL.BoxBuffer.call( this );

    this.addUniforms({
        'modelViewProjectionMatrix': { type: "m4", value: new THREE.Matrix4() },
        'modelViewProjectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
        'modelViewMatrixInverseTranspose': { type: "m4", value: new THREE.Matrix4() },
        'shrink': { type: "f", value: shrink },
    });

    this.addAttributes({
        "color": { type: "c", value: null },
        "color2": { type: "c", value: null },
        "radius": { type: "f", value: null },
        "radius2": { type: "f", value: null },
        "position1": { type: "v3", value: null },
        "position2": { type: "v3", value: null },
    });

    this.setAttributes({
        "color": color,
        "color2": color2,
        "radius": radius1,
        "radius2": radius2,
        "position1": position1,
        "position2": position2,

        "position": NGL.Utils.calculateCenterArray( position1, position2 ),
    });

    if( pickingColor ){

        this.addAttributes({
            "pickingColor": { type: "c", value: null },
            "pickingColor2": { type: "c", value: null },
        });

        this.setAttributes({
            "pickingColor": pickingColor,
            "pickingColor2": pickingColor2,
        });

        this.pickable = true;

    }

    this.finalize();

};

NGL.HyperballStickImpostorBuffer.prototype = Object.create( NGL.BoxBuffer.prototype );

NGL.HyperballStickImpostorBuffer.prototype.constructor = NGL.HyperballStickImpostorBuffer;


////////////////////////
// Geometry Primitives


/**
 * [GeometryBuffer description]
 * @class
 * @private
 * @augments {NGL.MappedBuffer}
 */
NGL.GeometryBuffer = function( position, color, pickingColor, transparent, side, opacity ){

    this.wireframe = false;
    this.transparent = transparent !== undefined ? transparent : false;
    this.side = side !== undefined ? side : THREE.DoubleSide;
    this.opacity = opacity !== undefined ? opacity : 1.0;

    var geo = this.geo;

    var n = position.length / 3;
    var m = geo.vertices.length;
    var o = geo.faces.length;

    this.size = n * m;
    this.positionCount = n;

    this.geoPosition = NGL.Utils.positionFromGeometry( geo );
    this.geoNormal = NGL.Utils.normalFromGeometry( geo );
    this.geoIndex = NGL.Utils.indexFromGeometry( geo );

    this.meshPosition = new Float32Array( this.size * 3 );
    this.meshNormal = new Float32Array( this.size * 3 );
    this.meshIndex = new Uint32Array( n * o * 3 );
    this.meshColor = new Float32Array( this.size * 3 );
    this.meshPickingColor = new Float32Array( this.size * 3 );

    this.transformedGeoPosition = new Float32Array( m * 3 );
    this.transformedGeoNormal = new Float32Array( m * 3 );

    this.makeIndex();

    this.setAttributes({
        "position": position,
        "color": color,
        "pickingColor": pickingColor
    });

    this.meshBuffer = new NGL.MeshBuffer(
        this.meshPosition, this.meshColor, this.meshIndex,
        this.meshNormal, this.meshPickingColor, this.wireframe,
        this.transparent, this.side, this.opacity
    );

    this.pickable = this.meshBuffer.pickable;
    this.geometry = this.meshBuffer.geometry;

};

NGL.GeometryBuffer.prototype = {

    constructor: NGL.GeometryBuffer,

    applyPositionTransform: function(){},

    setAttributes: function(){

        var matrix = new THREE.Matrix4();
        var normalMatrix = new THREE.Matrix3();

        return function( data ){

            var position, color, pickingColor;

            if( data[ "position" ] ){
                position = data[ "position" ];
                var geoPosition = this.geoPosition;
                var meshPosition = this.meshPosition;
                var transformedGeoPosition = this.transformedGeoPosition;
            }

            if( data[ "color" ] ){
                color = data[ "color" ];
                var meshColor = this.meshColor;
            }

            if( data[ "pickingColor" ] ){
                pickingColor = data[ "pickingColor" ];
                var meshPickingColor = this.meshPickingColor;
            }

            var updateNormals = ( this.updateNormals && position ) || !this.meshBuffer;

            if( updateNormals ){
                var geoNormal = this.geoNormal;
                var meshNormal = this.meshNormal;
                var transformedGeoNormal = this.transformedGeoNormal;
            }

            var n = this.positionCount;
            var m = this.geo.vertices.length;

            var i, j, k, l, i3;

            for( i = 0; i < n; ++i ){

                k = i * m * 3;
                i3 = i * 3;

                if( position ){

                    transformedGeoPosition.set( geoPosition );
                    matrix.makeTranslation(
                        position[ i3 + 0 ], position[ i3 + 1 ], position[ i3 + 2 ]
                    );
                    this.applyPositionTransform( matrix, i, i3 );
                    matrix.applyToVector3Array( transformedGeoPosition );

                    meshPosition.set( transformedGeoPosition, k );

                }

                if( updateNormals ){

                    transformedGeoNormal.set( geoNormal );
                    normalMatrix.getNormalMatrix( matrix );
                    normalMatrix.applyToVector3Array( transformedGeoNormal );

                    meshNormal.set( transformedGeoNormal, k );

                }

                if( color ){

                    for( j = 0; j < m; ++j ){

                        l = k + 3 * j;

                        meshColor[ l + 0 ] = color[ i3 + 0 ];
                        meshColor[ l + 1 ] = color[ i3 + 1 ];
                        meshColor[ l + 2 ] = color[ i3 + 2 ];

                    }

                }

                if( pickingColor ){

                    for( j = 0; j < m; ++j ){

                        l = k + 3 * j;

                        meshPickingColor[ l + 0 ] = pickingColor[ i3 + 0 ];
                        meshPickingColor[ l + 1 ] = pickingColor[ i3 + 1 ];
                        meshPickingColor[ l + 2 ] = pickingColor[ i3 + 2 ];

                    }

                }

            }

            var meshData = {};

            if( position ){
                meshData[ "position" ] = meshPosition;
            }

            if( updateNormals ){
                meshData[ "normal" ] = meshNormal;
            }

            if( color ){
                meshData[ "color" ] = meshColor;
            }

            if( pickingColor ){
                meshData[ "pickingColor" ] = meshPickingColor;
            }

            if( this.meshBuffer ){
                this.meshBuffer.setAttributes( meshData );
            }

        }

    }(),

    makeIndex: function(){

        var geoIndex = this.geoIndex;
        var meshIndex = this.meshIndex;

        var n = this.positionCount;
        var m = this.geo.vertices.length;
        var o = this.geo.faces.length;

        var p, i, j, q;
        var o3 = o * 3;

        for( i = 0; i < n; ++i ){

            j = i * o3;
            q = j + o3;

            meshIndex.set( geoIndex, j );
            for( p = j; p < q; ++p ) meshIndex[ p ] += i * m;

        }

    },

    getMesh: function( type, material ){

        return this.meshBuffer.getMesh( type, material );

    },

    getMaterial: function( type ){

        return this.meshBuffer.getMaterial( type );

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

}


NGL.SphereGeometryBuffer = function( position, color, radius, pickingColor, detail, transparent, side, opacity ){

    detail = detail!==undefined ? detail : 1;

    this.geo = new THREE.IcosahedronGeometry( 1, detail );

    this.setPositionTransform( radius );

    NGL.GeometryBuffer.call( this, position, color, pickingColor, transparent, side, opacity );

};

NGL.SphereGeometryBuffer.prototype = Object.create( NGL.GeometryBuffer.prototype );

NGL.CylinderImpostorBuffer.prototype.constructor = NGL.CylinderImpostorBuffer;

NGL.SphereGeometryBuffer.prototype.setPositionTransform = function( radius ){

    var r;
    var scale = new THREE.Vector3();

    this.applyPositionTransform = function( matrix, i ){

        r = radius[ i ];
        scale.set( r, r, r );
        matrix.scale( scale );

    }

};

NGL.SphereGeometryBuffer.prototype.setAttributes = function( data ){

    if( data[ "radius" ] ){
        this.setPositionTransform( data[ "radius" ] );
    }

    NGL.GeometryBuffer.prototype.setAttributes.call( this, data );

}


NGL.CylinderGeometryBuffer = function( from, to, color, color2, radius, pickingColor, pickingColor2, radiusSegments, transparent, side, opacity ){

    radiusSegments = radiusSegments || 10;

    this.updateNormals = true;

    var matrix = new THREE.Matrix4().makeRotationX( Math.PI/ 2  );

    this.geo = new THREE.CylinderGeometry(1, 1, 1, radiusSegments, 1, true);
    this.geo.applyMatrix( matrix );

    var n = from.length;
    var m = radius.length;

    this._position = new Float32Array( n * 2 );
    this._color = new Float32Array( n * 2 );
    this._pickingColor = new Float32Array( n * 2 );
    this._from = new Float32Array( n * 2 );
    this._to = new Float32Array( n * 2 );
    this._radius = new Float32Array( m * 2 );

    this.__center = new Float32Array( n );

    this.setAttributes({
        "position1": from,
        "position2": to,
        "color": color,
        "color2": color2,
        "radius": radius,
        "pickingColor": pickingColor,
        "pickingColor2": pickingColor2
    }, true );

    this.setPositionTransform( this._from, this._to, this._radius );

    NGL.GeometryBuffer.call(
        this, this._position, this._color, this._pickingColor,
        transparent, side, opacity
    );

};

NGL.CylinderGeometryBuffer.prototype = Object.create( NGL.GeometryBuffer.prototype );

NGL.CylinderImpostorBuffer.prototype.constructor = NGL.CylinderImpostorBuffer;

NGL.CylinderGeometryBuffer.prototype.setPositionTransform = function( from, to, radius ){

    var r;
    var scale = new THREE.Vector3();
    var eye = new THREE.Vector3();
    var target = new THREE.Vector3();
    var up = new THREE.Vector3( 0, 1, 0 );

    this.applyPositionTransform = function( matrix, i, i3 ){

        eye.fromArray( from, i3 );
        target.fromArray( to, i3 );
        matrix.lookAt( eye, target, up );

        r = radius[ i ];
        scale.set( r, r, eye.distanceTo( target ) );
        matrix.scale( scale );

    }

};

NGL.CylinderGeometryBuffer.prototype.setAttributes = function( data, init ){

    if( !this.meshBuffer && !init ){

        NGL.GeometryBuffer.prototype.setAttributes.call( this, data );
        return;

    }

    var n = this._position.length / 2;
    var m = this._radius.length / 2;
    var geoData = {};

    if( data[ "position1" ] && data[ "position2" ] ){

        NGL.Utils.calculateCenterArray(
            data[ "position1" ], data[ "position2" ], this.__center
        );
        NGL.Utils.calculateCenterArray(
            data[ "position1" ], this.__center, this._position
        );
        NGL.Utils.calculateCenterArray(
            this.__center, data[ "position2" ], this._position, n
        );

        this._from.set( data[ "position1" ] );
        this._from.set( this.__center, n );

        this._to.set( this.__center );
        this._to.set( data[ "position2" ], n );

        geoData[ "position" ] = this._position;

    }

    if( data[ "color" ] && data[ "color2" ] ){

        this._color.set( data[ "color" ] );
        this._color.set( data[ "color2" ], n );

        geoData[ "color" ] = this._color;

    }

    if( data[ "pickingColor" ] && data[ "pickingColor2" ] ){

        this._pickingColor.set( data[ "pickingColor" ] );
        this._pickingColor.set( data[ "pickingColor2" ], n );

        geoData[ "pickingColor" ] = this._pickingColor;

    }

    if( data[ "radius" ] ){

        this._radius.set( data[ "radius" ] );
        this._radius.set( data[ "radius" ], m );

    }

    if( ( data[ "position1" ] && data[ "position2" ] ) || data[ "radius" ] ){

        this.setPositionTransform( this._from, this._to, this._radius );

    }

    if( this.meshBuffer ){

        NGL.GeometryBuffer.prototype.setAttributes.call( this, geoData );

    }

}


//////////////////////
// Pixel Primitives

/**
 * [PointBuffer description]
 * @class
 * @todo  Inherit from NGL.Buffer
 * @param {Float32Array} position
 * @param {Float32Array} color
 */
NGL.PointBuffer = function( position, color, pointSize, sizeAttenuation, sort, transparent, opacity ){

    this.pointSize = pointSize || false;
    this.sizeAttenuation = sizeAttenuation !== undefined ? sizeAttenuation : false;
    this.sort = sort !== undefined ? sort : true;
    this.transparent = transparent !== undefined ? transparent : false;
    this.opacity = opacity !== undefined ? opacity : 1.0;

    this.size = position.length / 3;
    this.attributeSize = this.size;
    // this.vertexShader = 'Point.vert';
    // this.fragmentShader = 'Point.frag';

    this.tex = new THREE.Texture(
        NGL.Resources[ '../img/radial.png' ]
        // NGL.Resources[ '../img/spark1.png' ]
        // NGL.Resources[ '../img/circle.png' ]
    );
    this.tex.needsUpdate = true;
    if( !this.sort ) this.tex.premultiplyAlpha = true;

    NGL.Buffer.call( this, position, color );

};

NGL.PointBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.PointBuffer.prototype.constructor = NGL.PointBuffer;

NGL.PointBuffer.prototype.getMesh = function( type, material ){

    material = material || this.getMaterial( type );

    var points = new THREE.PointCloud(
        this.geometry, material
    );

    if( this.sort ) points.sortParticles = true

    return points;

};

NGL.PointBuffer.prototype.getMaterial = function( type ){

    var material;

    if( this.sort ){

        material = new THREE.PointCloudMaterial({
            map: this.tex,
            blending: THREE.NormalBlending,
            // blending: THREE.AdditiveBlending,
            depthTest:      true,
            transparent:    true,

            vertexColors: true,
            size: this.pointSize,
            sizeAttenuation: this.sizeAttenuation,
            // transparent: this.transparent,
            opacity: this.opacity,
            fog: true
        });

    }else{

        material = new THREE.PointCloudMaterial({
            map: this.tex,
            // blending:       THREE.AdditiveBlending,
            depthTest:      false,
            // alphaTest:      0.001,
            transparent:    true,

            blending: THREE.CustomBlending,
            // blendSrc: THREE.SrcAlphaFactor,
            // blendDst: THREE.OneMinusSrcAlphaFactor,
            blendEquation: THREE.AddEquation,

            // requires premultiplied alpha
            blendSrc: THREE.OneFactor,
            blendDst: THREE.OneMinusSrcAlphaFactor,

            vertexColors: true,
            size: this.pointSize,
            sizeAttenuation: this.sizeAttenuation,
            // transparent: this.transparent,
            opacity: this.opacity,
            fog: true
        });

    }

    return material;

};

NGL.PointBuffer.prototype.dispose = function(){

    NGL.Buffer.prototype.dispose.call( this );

    this.tex.dispose();

};


/**
 * [LineBuffer description]
 * @class
 * @todo  Inherit from NGL.Buffer
 * @param {Float32Array} from
 * @param {Float32Array} to
 * @param {Float32Array} color
 * @param {Float32Array} color2
 */
NGL.LineBuffer = function( from, to, color, color2, lineWidth, transparent, opacity ){

    this.lineWidth = lineWidth || 1;
    this.transparent = transparent !== undefined ? transparent : false;
    this.opacity = opacity !== undefined ? opacity : 1.0;

    this.size = from.length / 3;
    this.vertexShader = 'Line.vert';
    this.fragmentShader = 'Line.frag';

    var n = this.size;
    var n6 = n * 6;
    var nX = n * 2 * 2;

    this.attributes = {
        "position": { type: "v3", value: null },
        "color": { type: "c", value: null },
    };

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute(
        'position', new THREE.BufferAttribute( new Float32Array( nX * 3 ), 3 )
    );
    this.geometry.addAttribute(
        'color', new THREE.BufferAttribute( new Float32Array( nX * 3 ), 3 )
    );

    this.setAttributes({
        from: from,
        to: to,
        color: color,
        color2: color2
    });

    this.uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        {
            "opacity": { type: "f", value: this.opacity },
        }
    ]);

};

NGL.LineBuffer.prototype = {

    constructor: NGL.LineBuffer,

    setAttributes: function( data ){

        var from, to, color, color2;
        var aPosition, aColor;

        var attributes = this.geometry.attributes;

        if( data[ "from" ] && data[ "to" ] ){
            from = data[ "from" ];
            to = data[ "to" ];
            aPosition = attributes[ "position" ].array;
            attributes[ "position" ].needsUpdate = true;
            this.attributes[ "position" ].needsUpdate = true;
        }

        if( data[ "color" ] && data[ "color2" ] ){
            color = data[ "color" ];
            color2 = data[ "color2" ];
            aColor = attributes[ "color" ].array;
            attributes[ "color" ].needsUpdate = true;
            this.attributes[ "color" ].needsUpdate = true;
        }

        var n = this.size;
        var n6 = n * 6;

        var i, j, i2;

        var x, y, z, x1, y1, z1, x2, y2, z2;

        for( var v = 0; v < n; v++ ){

            j = v * 3;
            i = v * 2 * 3;

            if( from && to ){

                x1 = from[ j + 0 ];
                y1 = from[ j + 1 ];
                z1 = from[ j + 2 ];

                x2 = to[ j + 0 ];
                y2 = to[ j + 1 ];
                z2 = to[ j + 2 ];

                x = ( x1 + x2 ) / 2.0;
                y = ( y1 + y2 ) / 2.0;
                z = ( z1 + z2 ) / 2.0;

                aPosition[ i + 0 ] = from[ j + 0 ];
                aPosition[ i + 1 ] = from[ j + 1 ];
                aPosition[ i + 2 ] = from[ j + 2 ];
                aPosition[ i + 3 ] = x;
                aPosition[ i + 4 ] = y;
                aPosition[ i + 5 ] = z;

            }

            if( color && color2 ){

                aColor[ i + 0 ] = color[ j + 0 ];
                aColor[ i + 1 ] = color[ j + 1 ];
                aColor[ i + 2 ] = color[ j + 2 ];
                aColor[ i + 3 ] = color[ j + 0 ];
                aColor[ i + 4 ] = color[ j + 1 ];
                aColor[ i + 5 ] = color[ j + 2 ];

            }

            i2 = i + n6;

            if( from && to ){

                aPosition[ i2 + 0 ] = x;
                aPosition[ i2 + 1 ] = y;
                aPosition[ i2 + 2 ] = z;
                aPosition[ i2 + 3 ] = to[ j + 0 ];
                aPosition[ i2 + 4 ] = to[ j + 1 ];
                aPosition[ i2 + 5 ] = to[ j + 2 ];

            }

            if( color && color2 ){

                aColor[ i2 + 0 ] = color2[ j + 0 ];
                aColor[ i2 + 1 ] = color2[ j + 1 ];
                aColor[ i2 + 2 ] = color2[ j + 2 ];
                aColor[ i2 + 3 ] = color2[ j + 0 ];
                aColor[ i2 + 4 ] = color2[ j + 1 ];
                aColor[ i2 + 5 ] = color2[ j + 2 ];

            }

        }

    },

    getMesh: function( type, material ){

        material = material || this.getMaterial( type );

        return new THREE.Line(
            this.geometry, material, THREE.LinePieces
        );

    },

    getMaterial: function( type ){

        var uniforms = THREE.UniformsUtils.clone( this.uniforms );

        return new THREE.ShaderMaterial( {
            uniforms: uniforms,
            attributes: this.attributes,
            vertexShader: NGL.getShader( this.vertexShader ),
            fragmentShader: NGL.getShader( this.fragmentShader ),
            depthTest: true,
            transparent: this.transparent,
            depthWrite: true,
            lights: false,
            fog: true,
            linewidth: this.lineWidth
        });

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

};


NGL.TraceBuffer = function( position, color, lineWidth, transparent, opacity ){

    this.size = position.length / 3;

    var n = this.size;
    var n1 = n - 1;

    this.from = new Float32Array( n1 * 3 );
    this.to = new Float32Array( n1 * 3 );
    this.lineColor = new Float32Array( n1 * 3 );
    this.lineColor2 = new Float32Array( n1 * 3 );

    this.setAttributes({
        position: position,
        color: color
    });

    this.lineBuffer = new NGL.LineBuffer(
        this.from, this.to, this.lineColor, this.lineColor2,
        lineWidth, transparent, opacity
    );

    this.pickable = this.lineBuffer.pickable;
    this.geometry = this.lineBuffer.geometry;

};

NGL.TraceBuffer.prototype = {

    constructor: NGL.TraceBuffer,

    setAttributes: function( data ){

        var position, color;
        var from, to, lineColor, lineColor2;

        if( data[ "position" ] ){
            position = data[ "position" ];
            from = this.from;
            to = this.to;
        }

        if( data[ "color" ] ){
            color = data[ "color" ];
            lineColor = this.lineColor;
            lineColor2 = this.lineColor2;
        }

        var n = this.size;
        var n1 = n - 1;

        for( var i=0, v; i<n1; ++i ){

            v = 3 * i;

            if( position ){

                from[ v + 0 ] = position[ v + 0 ];
                from[ v + 1 ] = position[ v + 1 ];
                from[ v + 2 ] = position[ v + 2 ];

                to[ v + 0 ] = position[ v + 3 ];
                to[ v + 1 ] = position[ v + 4 ];
                to[ v + 2 ] = position[ v + 5 ];

            }

            if( color ){

                lineColor[ v + 0 ] = color[ v + 0 ];
                lineColor[ v + 1 ] = color[ v + 1 ];
                lineColor[ v + 2 ] = color[ v + 2 ];

                lineColor2[ v + 0 ] = color[ v + 3 ];
                lineColor2[ v + 1 ] = color[ v + 4 ];
                lineColor2[ v + 2 ] = color[ v + 5 ];

            }

        }

        var lineData = {};

        if( position ){
            lineData[ "from" ] = from;
            lineData[ "to" ] = to;
        }

        if( color ){
            lineData[ "color" ] = lineColor;
            lineData[ "color2" ] = lineColor2;
        }

        if( this.lineBuffer ){
            this.lineBuffer.setAttributes( lineData );
        }

    },

    getMesh: function( type, material ){

        return this.lineBuffer.getMesh( type, material );

    },

    getMaterial: function( type ){

        return this.lineBuffer.getMaterial( type );

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

};


//////////////////////
// Sprite Primitives

NGL.ParticleSpriteBuffer = function( position, color, radius ){

    this.size = position.length / 3;
    this.vertexShader = 'ParticleSprite.vert';
    this.fragmentShader = 'ParticleSprite.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        'projectionMatrixInverse': { type: "m4", value: new THREE.Matrix4() },
    });

    this.addAttributes({
        "radius": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "color": color,
        "radius": radius,
    });

    this.finalize();

    this.material.lights = false;

};

NGL.ParticleSpriteBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );

NGL.ParticleSpriteBuffer.prototype.constructor = NGL.ParticleSpriteBuffer;


NGL.RibbonBuffer = function( position, normal, dir, color, size, pickingColor, transparent, side, opacity ){

    this.vertexShader = 'Ribbon.vert';
    this.fragmentShader = 'Ribbon.frag';
    this.size = ( position.length/3 ) - 1;

    this.transparent = transparent !== undefined ? transparent : false;
    this.side = side !== undefined ? side : THREE.DoubleSide;
    this.opacity = opacity !== undefined ? opacity : 1.0;

    var n = this.size;
    var n4 = n * 4;

    this.attributes = {
        "inputDir": { type: 'v3', value: null },
        "inputSize": { type: 'f', value: null },
        "inputNormal": { type: 'v3', value: null },
        "inputColor": { type: 'v3', value: null }
    };
    if( pickingColor ){
        this.attributes[ "pickingColor" ] = { type: 'v3', value: null };
    }

    this.uniforms = THREE.UniformsUtils.merge( [
        NGL.UniformsLib[ "fog" ],
        NGL.UniformsLib[ "lights" ],
        {
            "opacity": { type: "f", value: this.opacity },
            "nearClip": { type: "f", value: 0 },
        }
    ]);

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute(
        'position', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
    );
    this.geometry.addAttribute(
        'inputDir', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
    );
    this.geometry.addAttribute(
        'inputSize', new THREE.BufferAttribute( new Float32Array( n4 ), 1 )
    );
    this.geometry.addAttribute(
        'normal', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
    );
    this.geometry.addAttribute(
        'inputColor', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
    );
    if( pickingColor ){
        this.geometry.addAttribute(
            'pickingColor', new THREE.BufferAttribute( new Float32Array( n4 * 3 ), 3 )
        );
        this.pickable = true;
    }

    this.setAttributes({
        position: position,
        normal: normal,
        dir: dir,
        color: color,
        size: size,
        pickingColor: pickingColor
    });

    NGL.Buffer.prototype.finalize.call( this );

};

NGL.RibbonBuffer.prototype = {

    constructor: NGL.RibbonBuffer,

    setAttributes: function( data ){

        var n = this.size;
        var n4 = n * 4;

        var attributes = this.geometry.attributes;

        var position, normal, size, dir, color, pickingColor;
        var aPosition, inputNormal, inputSize, inputDir, inputColor, inputPickingColor;

        if( data[ "position" ] ){
            position = data[ "position" ];
            aPosition = attributes[ "position" ].array;
            attributes[ "position" ].needsUpdate = true;
        }

        if( data[ "normal" ] ){
            normal = data[ "normal" ];
            inputNormal = attributes[ "normal" ].array;
            attributes[ "normal" ].needsUpdate = true;
        }

        if( data[ "size" ] ){
            size = data[ "size" ];
            inputSize = attributes[ "inputSize" ].array;
            attributes[ "inputSize" ].needsUpdate = true;
        }

        if( data[ "dir" ] ){
            dir = data[ "dir" ];
            inputDir = attributes[ "inputDir" ].array;
            attributes[ "inputDir" ].needsUpdate = true;
        }

        if( data[ "color" ] ){
            color = data[ "color" ];
            inputColor = attributes[ "inputColor" ].array;
            attributes[ "inputColor" ].needsUpdate = true;
        }

        if( data[ "pickingColor" ] ){
            pickingColor = data[ "pickingColor" ];
            inputPickingColor = attributes[ "pickingColor" ].array;
            attributes[ "pickingColor" ].needsUpdate = true;
        }

        var v, i, k, p, l, v3;
        var prevSize = size ? size[0] : null;

        for( v = 0; v < n; ++v ){

            v3 = v * 3;
            k = v * 3 * 4;
            l = v * 4;

            if( position ){

                aPosition[ k + 0 ] = position[ v3 + 0 ];
                aPosition[ k + 1 ] = position[ v3 + 1 ];
                aPosition[ k + 2 ] = position[ v3 + 2 ];

                aPosition[ k + 3 ] = position[ v3 + 0 ];
                aPosition[ k + 4 ] = position[ v3 + 1 ];
                aPosition[ k + 5 ] = position[ v3 + 2 ];

                aPosition[ k + 6 ] = position[ v3 + 3 ];
                aPosition[ k + 7 ] = position[ v3 + 4 ];
                aPosition[ k + 8 ] = position[ v3 + 5 ];

                aPosition[ k + 9 ] = position[ v3 + 3 ];
                aPosition[ k + 10 ] = position[ v3 + 4 ];
                aPosition[ k + 11 ] = position[ v3 + 5 ];

            }

            if( normal ){

                inputNormal[ k + 0 ] = normal[ v3 + 0 ];
                inputNormal[ k + 1 ] = normal[ v3 + 1 ];
                inputNormal[ k + 2 ] = normal[ v3 + 2 ];

                inputNormal[ k + 3 ] = normal[ v3 + 0 ];
                inputNormal[ k + 4 ] = normal[ v3 + 1 ];
                inputNormal[ k + 5 ] = normal[ v3 + 2 ];

                inputNormal[ k + 6 ] = normal[ v3 + 3 ];
                inputNormal[ k + 7 ] = normal[ v3 + 4 ];
                inputNormal[ k + 8 ] = normal[ v3 + 5 ];

                inputNormal[ k + 9 ] = normal[ v3 + 3 ];
                inputNormal[ k + 10 ] = normal[ v3 + 4 ];
                inputNormal[ k + 11 ] = normal[ v3 + 5 ];

            }


            for( i = 0; i<4; ++i ){
                p = k + 3 * i;

                if( color ){

                    inputColor[ p + 0 ] = color[ v3 + 0 ];
                    inputColor[ p + 1 ] = color[ v3 + 1 ];
                    inputColor[ p + 2 ] = color[ v3 + 2 ];

                }

                if( pickingColor ){

                    inputPickingColor[ p + 0 ] = pickingColor[ v3 + 0 ];
                    inputPickingColor[ p + 1 ] = pickingColor[ v3 + 1 ];
                    inputPickingColor[ p + 2 ] = pickingColor[ v3 + 2 ];

                }

            }

            if( size ){

                if( prevSize!=size[ v ] ){
                    inputSize[ l + 0 ] = Math.abs( prevSize );
                    inputSize[ l + 1 ] = Math.abs( prevSize );
                    inputSize[ l + 2 ] = Math.abs( size[ v ] );
                    inputSize[ l + 3 ] = Math.abs( size[ v ] );
                }else{
                    inputSize[ l + 0 ] = Math.abs( size[ v ] );
                    inputSize[ l + 1 ] = Math.abs( size[ v ] );
                    inputSize[ l + 2 ] = Math.abs( size[ v ] );
                    inputSize[ l + 3 ] = Math.abs( size[ v ] );
                }
                prevSize = size[ v ];

            }

            if( dir ){

                inputDir[ k + 0 ] = dir[ v3 + 0 ];
                inputDir[ k + 1 ] = dir[ v3 + 1 ];
                inputDir[ k + 2 ] = dir[ v3 + 2 ];

                inputDir[ k + 3 ] = -dir[ v3 + 0 ];
                inputDir[ k + 4 ] = -dir[ v3 + 1 ];
                inputDir[ k + 5 ] = -dir[ v3 + 2 ];

                inputDir[ k + 6 ] = dir[ v3 + 3 ];
                inputDir[ k + 7 ] = dir[ v3 + 4 ];
                inputDir[ k + 8 ] = dir[ v3 + 5 ];

                inputDir[ k + 9 ] = -dir[ v3 + 3 ];
                inputDir[ k + 10 ] = -dir[ v3 + 4 ];
                inputDir[ k + 11 ] = -dir[ v3 + 5 ];

            }

        }

    },

    makeIndex: function(){

        var n = this.size;
        var n4 = n * 4;

        var quadIndices = new Uint32Array([
            0, 1, 2,
            1, 3, 2
        ]);

        this.geometry.addAttribute(
            'index', new THREE.BufferAttribute(
                new Uint32Array( n4 * 3 ), 1
            )
        );

        var index = this.geometry.attributes[ "index" ].array;

        var s, v, ix, it;

        for( v = 0; v < n; ++v ){

            ix = v * 6;
            it = v * 4;

            index.set( quadIndices, ix );
            for( s = 0; s < 6; ++s ){
                index[ ix + s ] += it;
            }

        }

    },

    getMesh: NGL.Buffer.prototype.getMesh,

    getMaterial: NGL.Buffer.prototype.getMaterial,

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

};


////////////////////
// Mesh Primitives

NGL.TubeMeshBuffer = function( position, normal, binormal, tangent, color, size, radialSegments, pickingColor, rx, ry, capped, wireframe, transparent, side, opacity, nearClip ){

    this.rx = rx || 1.5;
    this.ry = ry || 0.5;

    this.wireframe = wireframe || false;
    this.transparent = transparent !== undefined ? transparent : false;
    this.side = side !== undefined ? side : THREE.DoubleSide;
    this.opacity = opacity !== undefined ? opacity : 1.0;
    this.nearClip = nearClip !== undefined ? nearClip : true;

    this.radialSegments = radialSegments || 4;
    this.capVertices = capped ? this.radialSegments : 0;
    this.capTriangles = capped ? this.radialSegments - 2 : 0;
    this.size = position.length / 3;

    var n = this.size;
    var n1 = n - 1;
    var radialSegments1 = this.radialSegments + 1;

    var x = n * this.radialSegments * 3 + 2 * this.capVertices * 3;

    this.meshPosition = new Float32Array( x );
    this.meshColor = new Float32Array( x );
    this.meshNormal = new Float32Array( x );
    this.meshPickingColor = new Float32Array( x );
    this.meshIndex = new Uint32Array(
        n1 * 2 * radialSegments * 3 + 2 * this.capTriangles * 3
    );

    this.makeIndex();

    this.setAttributes({
        "position": position,
        "normal": normal,
        "binormal": binormal,
        "tangent": tangent,
        "color": color,
        "size": size,
        "pickingColor": pickingColor
    });

    this.meshBuffer = new NGL.MeshBuffer(
        this.meshPosition, this.meshColor, this.meshIndex,
        this.meshNormal, this.meshPickingColor, this.wireframe,
        this.transparent, this.side, this.opacity, this.nearClip
    );

    this.pickable = this.meshBuffer.pickable;
    this.geometry = this.meshBuffer.geometry;

}

NGL.TubeMeshBuffer.prototype = {

    constructor: NGL.TubeMeshBuffer,

    setAttributes: function(){

        var vTangent = new THREE.Vector3();
        var vMeshNormal = new THREE.Vector3();

        return function( data ){

            var rx = this.rx;
            var ry = this.ry;

            var n = this.size;
            var n1 = n - 1;
            var capVertices = this.capVertices;
            var radialSegments = this.radialSegments;

            var position, normal, binormal, tangent, color, size, pickingColor;
            var meshPosition, meshColor, meshNormal, meshPickingColor

            if( data[ "position" ] ){
                position = data[ "position" ];
                normal = data[ "normal" ];
                binormal = data[ "binormal" ];
                tangent = data[ "tangent" ];
                size = data[ "size" ];
                meshPosition = this.meshPosition;
                meshNormal = this.meshNormal;
            }

            if( data[ "color" ] ){
                color = data[ "color" ];
                meshColor = this.meshColor;
            }

            if( data[ "pickingColor" ] ){
                pickingColor = data[ "pickingColor" ];
                meshPickingColor = this.meshPickingColor;
            }

            var i, j, k, l, s, t;
            var v, cx, cy;
            var cx1, cy1, cx2, cy2;
            var radius;
            var irs, irs1;

            var normX, normY, normZ;
            var biX, biY, biZ;
            var posX, posY, posZ;

            var cxArr = [];
            var cyArr = [];
            var cx1Arr = [];
            var cy1Arr = [];
            var cx2Arr = [];
            var cy2Arr = [];

            if( position ){

                for( j = 0; j < radialSegments; ++j ){

                    v = ( j / radialSegments ) * 2 * Math.PI;

                    cxArr[ j ] = rx * Math.cos( v );
                    cyArr[ j ] = ry * Math.sin( v );

                    cx1Arr[ j ] = rx * Math.cos( v - 0.01 );
                    cy1Arr[ j ] = ry * Math.sin( v - 0.01 );
                    cx2Arr[ j ] = rx * Math.cos( v + 0.01 );
                    cy2Arr[ j ] = ry * Math.sin( v + 0.01 );

                }

            }

            for( i = 0; i < n; ++i ){

                k = i * 3;
                l = k * radialSegments;

                if( position ){

                    vTangent.set(
                        tangent[ k + 0 ], tangent[ k + 1 ], tangent[ k + 2 ]
                    );

                    normX = normal[ k + 0 ];
                    normY = normal[ k + 1 ];
                    normZ = normal[ k + 2 ];

                    biX = binormal[ k + 0 ];
                    biY = binormal[ k + 1 ];
                    biZ = binormal[ k + 2 ];

                    posX = position[ k + 0 ];
                    posY = position[ k + 1 ];
                    posZ = position[ k + 2 ];

                    radius = size[ i ];

                }

                for( j = 0; j < radialSegments; ++j ){

                    s = l + j * 3

                    if( position ){

                        cx = -radius * cxArr[ j ]; // TODO: Hack: Negating it so it faces outside.
                        cy = radius * cyArr[ j ];

                        cx1 = -radius * cx1Arr[ j ];
                        cy1 = radius * cy1Arr[ j ];
                        cx2 = -radius * cx2Arr[ j ];
                        cy2 = radius * cy2Arr[ j ];

                        meshPosition[ s + 0 ] = posX + cx * normX + cy * biX;
                        meshPosition[ s + 1 ] = posY + cx * normY + cy * biY;
                        meshPosition[ s + 2 ] = posZ + cx * normZ + cy * biZ;

                        // TODO half of these are symmetric
                        vMeshNormal.set(
                            // ellipse tangent approximated as vector from/to adjacent points
                            ( cx2 * normX + cy2 * biX ) -
                                ( cx1 * normX + cy1 * biX ),
                            ( cx2 * normY + cy2 * biY ) -
                                ( cx1 * normY + cy1 * biY ),
                            ( cx2 * normZ + cy2 * biZ ) -
                                ( cx1 * normZ + cy1 * biZ )
                        ).cross( vTangent );

                        meshNormal[ s + 0 ] = vMeshNormal.x;
                        meshNormal[ s + 1 ] = vMeshNormal.y;
                        meshNormal[ s + 2 ] = vMeshNormal.z;

                    }

                    if( color ){

                        meshColor[ s + 0 ] = color[ k + 0 ];
                        meshColor[ s + 1 ] = color[ k + 1 ];
                        meshColor[ s + 2 ] = color[ k + 2 ];

                    }

                    if( pickingColor ){

                        meshPickingColor[ s + 0 ] = pickingColor[ k + 0 ];
                        meshPickingColor[ s + 1 ] = pickingColor[ k + 1 ];
                        meshPickingColor[ s + 2 ] = pickingColor[ k + 2 ];

                    }

                }

            }

            // front cap

            k = 0;
            l = n * 3 * radialSegments;

            for( j = 0; j < radialSegments; ++j ){

                s = k + j * 3;
                t = l + j * 3;

                if( position ){

                    meshPosition[ t + 0 ] = meshPosition[ s + 0 ];
                    meshPosition[ t + 1 ] = meshPosition[ s + 1 ];
                    meshPosition[ t + 2 ] = meshPosition[ s + 2 ];

                    meshNormal[ t + 0 ] = tangent[ k + 0 ];
                    meshNormal[ t + 1 ] = tangent[ k + 1 ];
                    meshNormal[ t + 2 ] = tangent[ k + 2 ];

                }

                if( color ){

                    meshColor[ t + 0 ] = meshColor[ s + 0 ];
                    meshColor[ t + 1 ] = meshColor[ s + 1 ];
                    meshColor[ t + 2 ] = meshColor[ s + 2 ];

                }

                if( pickingColor ){

                    meshPickingColor[ t + 0 ] = meshPickingColor[ s + 0 ];
                    meshPickingColor[ t + 1 ] = meshPickingColor[ s + 1 ];
                    meshPickingColor[ t + 2 ] = meshPickingColor[ s + 2 ];

                }

            }

            // back cap

            k = ( n - 1 ) * 3 * radialSegments;
            l = ( n + 1 ) * 3 * radialSegments;

            for( j = 0; j < radialSegments; ++j ){

                s = k + j * 3;
                t = l + j * 3;

                if( position ){

                    meshPosition[ t + 0 ] = meshPosition[ s + 0 ];
                    meshPosition[ t + 1 ] = meshPosition[ s + 1 ];
                    meshPosition[ t + 2 ] = meshPosition[ s + 2 ];

                    meshNormal[ t + 0 ] = tangent[ n1 * 3 + 0 ];
                    meshNormal[ t + 1 ] = tangent[ n1 * 3 + 1 ];
                    meshNormal[ t + 2 ] = tangent[ n1 * 3 + 2 ];

                }

                if( color ){

                    meshColor[ t + 0 ] = meshColor[ s + 0 ];
                    meshColor[ t + 1 ] = meshColor[ s + 1 ];
                    meshColor[ t + 2 ] = meshColor[ s + 2 ];

                }

                if( pickingColor ){

                    meshPickingColor[ t + 0 ] = meshPickingColor[ s + 0 ];
                    meshPickingColor[ t + 1 ] = meshPickingColor[ s + 1 ];
                    meshPickingColor[ t + 2 ] = meshPickingColor[ s + 2 ];

                }

            }


            var meshData = {};

            if( position ){
                meshData[ "position" ] = meshPosition;
                meshData[ "normal" ] = meshNormal;
            }

            if( color ){
                meshData[ "color" ] = meshColor;
            }

            if( pickingColor ){
                meshData[ "pickingColor" ] = meshPickingColor;
            }

            if( this.meshBuffer ){
                this.meshBuffer.setAttributes( meshData );
            }

        }

    }(),

    makeIndex: function(){

        var meshIndex = this.meshIndex;

        var n = this.size;
        var n1 = n - 1;
        var capTriangles = this.capTriangles;
        var radialSegments = this.radialSegments;
        var radialSegments1 = this.radialSegments + 1;

        var i, k, irs, irs1, l, j;

        for( i = 0; i < n1; ++i ){

            k = i * radialSegments * 3 * 2

            irs = i * radialSegments;
            irs1 = ( i + 1 ) * radialSegments;

            for( j = 0; j < radialSegments; ++j ){

                l = k + j * 3 * 2;

                // meshIndex[ l + 0 ] = irs + ( ( j + 0 ) % radialSegments );
                meshIndex[ l ] = irs + j;
                meshIndex[ l + 1 ] = irs + ( ( j + 1 ) % radialSegments );
                // meshIndex[ l + 2 ] = irs1 + ( ( j + 0 ) % radialSegments );
                meshIndex[ l + 2 ] = irs1 + j;

                // meshIndex[ l + 3 ] = irs1 + ( ( j + 0 ) % radialSegments );
                meshIndex[ l + 3 ] = irs1 + j;
                meshIndex[ l + 4 ] = irs + ( ( j + 1 ) % radialSegments );
                meshIndex[ l + 5 ] = irs1 + ( ( j + 1 ) % radialSegments );

            }

        }

        // capping

        var strip = [ 0 ];

        for( j = 1; j < radialSegments1 / 2; ++j ){

            strip.push( j );
            if( radialSegments - j !== j ){
                strip.push( radialSegments - j );
            }

        }

        // front cap

        l = n1 * radialSegments * 3 * 2;
        k = n * radialSegments;

        for( j = 0; j < strip.length - 2; ++j ){

            if( j % 2 === 0 ){
                meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 0 ];
                meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ];
                meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 2 ];
            }else{
                meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 2 ];
                meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ];
                meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 0 ];
            }

        }

        // back cap

        l = n1 * radialSegments * 3 * 2 + 3 * capTriangles;
        k = n * radialSegments + radialSegments;

        for( j = 0; j < strip.length - 2; ++j ){

            if( j % 2 === 0 ){
                meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 0 ];
                meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ];
                meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 2 ];
            }else{
                meshIndex[ l + j * 3 + 0 ] = k + strip[ j + 2 ];
                meshIndex[ l + j * 3 + 1 ] = k + strip[ j + 1 ];
                meshIndex[ l + j * 3 + 2 ] = k + strip[ j + 0 ];
            }

        }

    },

    getMesh: function( type, material ){

        return this.meshBuffer.getMesh( type, material );

    },

    getMaterial: function( type ){

        return this.meshBuffer.getMaterial( type );

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

};


NGL.SurfaceBuffer = function(){

    NGL.MeshBuffer.apply( this, arguments );

}

NGL.SurfaceBuffer.prototype = Object.create( NGL.MeshBuffer.prototype );

NGL.SurfaceBuffer.prototype.constructor = NGL.SurfaceBuffer;


///////////////////
// API Primitives

NGL.SphereBuffer = function( position, color, radius, pickingColor, detail, disableImpostor, transparent, side, opacity ){

    if( !NGL.extensionFragDepth || disableImpostor ){

        return new NGL.SphereGeometryBuffer(
            position, color, radius, pickingColor, detail,
            transparent, side, opacity
        );

    }else{

        return new NGL.SphereImpostorBuffer(
            position, color, radius, pickingColor,
            transparent, side, opacity
        );

    }

};


NGL.CylinderBuffer = function( from, to, color, color2, radius, shift, cap, pickingColor, pickingColor2, radiusSegments, disableImpostor, transparent, side, opacity ){

    if( !NGL.extensionFragDepth || disableImpostor ){

        // FIXME cap support missing

        return new NGL.CylinderGeometryBuffer(
            from, to, color, color2, radius,
            pickingColor, pickingColor2, radiusSegments,
            transparent, side, opacity
        );

    }else{

        return new NGL.CylinderImpostorBuffer(
            from, to, color, color2, radius, shift, cap,
            pickingColor, pickingColor2,
            transparent, side, opacity
        );

    }

};


NGL.HyperballStickBuffer = function( from, to, color, color2, radius1, radius2, shrink, pickingColor, pickingColor2, radiusSegments, disableImpostor, transparent, side, opacity ){

    if( !NGL.extensionFragDepth || disableImpostor ){

        return new NGL.CylinderGeometryBuffer(
            from, to, color, color2,
            NGL.Utils.calculateMinArray( radius1, radius2 ),
            pickingColor, pickingColor2, radiusSegments,
            transparent, side, opacity
        );

    }else{

        return new NGL.HyperballStickImpostorBuffer(
            from, to, color, color2, radius1, radius2, shrink,
            pickingColor, pickingColor2,
            transparent, side, opacity
        );

    }

};


////////////////
// Text & Font


NGL.getFont = function( name ){

    var fnt = NGL.Resources[ '../fonts/' + name + '.fnt' ].split('\n');
    var font = {};
    var m, tWidth, tHeight, base, lineHeight;

    fnt.forEach( function( line ){

        if( line.substr( 0, 5 ) === 'char ' ){

            var character = {};
            var ls = line.substr( 5 ).split( /\s+/ );
            ls.forEach( function( field ){
                var fs = field.split( '=' );
                character[ fs[ 0 ] ] = parseInt( fs[ 1 ] );
            });
            var x = character.x;
            var y = character.y;
            var width = character.width;
            var height = character.height;
            character.textureCoords = new Float32Array([
                x/tWidth            ,1 - y/tHeight,                 // top left
                x/tWidth            ,1 - (y+height)/tHeight,        // bottom left
                (x+width)/tWidth    ,1 - y/tHeight,                 // top right
                (x+width)/tWidth    ,1 - (y+height)/tHeight,        // bottom right
            ]);
            character.width2 = (10*width)/tWidth;
            character.height2 = (10*height)/tHeight;
            character.xadvance2 = (10*(character.xadvance))/tWidth;
            character.xoffset2 = (10*(character.xoffset))/tWidth;
            character.yoffset2 = (10*(character.yoffset))/tHeight;
            character.lineHeight = (10*lineHeight)/tHeight;
            font[ character[ 'id' ] ] = character;

        }else if( line.substr( 0, 7 ) === 'common ' ){

            // common lineHeight=38 base=30 scaleW=512 scaleH=512 pages=1 packed=0

            m = line.match( /scaleW=([0-9]+)/ );
            if( m !== null ) tWidth = m[ 1 ];

            m = line.match( /scaleH=([0-9]+)/ );
            if( m !== null ) tHeight = m[ 1 ];

            m = line.match( /base=([0-9]+)/ );
            if( m !== null ) base = m[ 1 ];

            m = line.match( /lineHeight=([0-9]+)/ );
            if( m !== null ) lineHeight = m[ 1 ];

        }else{

            //console.log( i, line );

        }

    })

    return font;

};


NGL.TextBuffer = function( position, size, color, text, font, antialias, opacity ){

    this.antialias = antialias !== undefined ? antialias : true;
    this.opacity = opacity || 1.0;

    var fontName = font || 'Arial';
    this.font = NGL.getFont( fontName );

    this.tex = new THREE.Texture(
        NGL.Resources[ '../fonts/' + fontName + '.png' ]
    );
    this.tex.needsUpdate = true;

    var n = position.length / 3;

    var charCount = 0;
    for( var i = 0; i < n; ++i ){
        charCount += text[ i ].length;
    }

    this.text = text;
    this.size = charCount;
    this.positionCount = n;

    this.vertexShader = 'SDFFont.vert';
    this.fragmentShader = 'SDFFont.frag';

    NGL.QuadBuffer.call( this );

    this.addUniforms({
        "fontTexture"  : { type: "t", value: this.tex },
        "backgroundColor"  : { type: "c", value: new THREE.Color( "black" ) }
    });

    this.addAttributes({
        "inputTexCoord": { type: "v2", value: null },
        "inputSize": { type: "f", value: null },
    });

    this.setAttributes({
        "position": position,
        "size": size,
        "color": color
    });

    this.finalize();

};

NGL.TextBuffer.prototype = Object.create( NGL.QuadBuffer.prototype );

NGL.TextBuffer.prototype.constructor = NGL.TextBuffer;

NGL.TextBuffer.prototype.getMaterial = function(){

    var material = NGL.Buffer.prototype.getMaterial.call( this );

    if( this.antialias ){

        material.transparent = true;
        material.depthWrite = true;
        material.blending = THREE.NormalBlending;
        material.defines[ "ANTIALIAS" ] = 1;

    }

    material.lights = false;
    material.uniforms.fontTexture.value = this.tex;
    material.needsUpdate = true;

    return material;

};

NGL.TextBuffer.prototype.setAttributes = function( data ){

    var position, size, color;
    var aPosition, inputSize, aColor;

    var text = this.text;
    var attributes = this.geometry.attributes;

    if( data[ "position" ] ){
        position = data[ "position" ];
        aPosition = attributes[ "position" ].array;
        attributes[ "position" ].needsUpdate = true;
    }

    if( data[ "size" ] ){
        size = data[ "size" ];
        inputSize = attributes[ "inputSize" ].array;
        attributes[ "inputSize" ].needsUpdate = true;
    }

    if( data[ "color" ] ){
        color = data[ "color" ];
        aColor = attributes[ "color" ].array;
        attributes[ "color" ].needsUpdate = true;
    }

    var n = this.positionCount;

    var i, j, o;
    var iCharAll = 0;
    var txt, iChar, nChar;

    for( var v = 0; v < n; v++ ) {

        o = 3 * v;
        txt = text[ v ];
        nChar = txt.length;

        for( iChar = 0; iChar < nChar; iChar++, iCharAll++ ) {

            i = iCharAll * 2 * 4;

            for( var m = 0; m < 4; m++ ) {

                j = iCharAll * 4 * 3 + (3 * m);

                if( data[ "position" ] ){

                    aPosition[ j + 0 ] = position[ o + 0 ];
                    aPosition[ j + 1 ] = position[ o + 1 ];
                    aPosition[ j + 2 ] = position[ o + 2 ];

                }

                if( data[ "size" ] ){

                    inputSize[ (iCharAll * 4) + m ] = size[ v ];

                }

                if( color ){

                    aColor[ j + 0 ] = color[ o + 0 ];
                    aColor[ j + 1 ] = color[ o + 1 ];
                    aColor[ j + 2 ] = color[ o + 2 ];

                }

            }

        }

    }

};

NGL.TextBuffer.prototype.makeMapping = function(){

    var font = this.font;
    var text = this.text;

    var inputTexCoord = this.geometry.attributes[ "inputTexCoord" ].array;
    var inputMapping = this.geometry.attributes[ "mapping" ].array;

    var n = this.positionCount;

    var c;
    var i, j, o;
    var iCharAll = 0;
    var txt, xadvance, iChar, nChar;

    for( var v = 0; v < n; v++ ) {

        o = 3 * v;
        txt = text[ v ];
        xadvance = 0;
        nChar = txt.length;

        for( iChar = 0; iChar < nChar; iChar++, iCharAll++ ) {

            c = font[ txt.charCodeAt( iChar ) ];
            i = iCharAll * 2 * 4;

            // top left
            inputMapping[ i + 0 ] = xadvance + c.xoffset2;
            inputMapping[ i + 1 ] = c.lineHeight - c.yoffset2;
            // bottom left
            inputMapping[ i + 2 ] = xadvance + c.xoffset2;
            inputMapping[ i + 3 ] = c.lineHeight - c.yoffset2 - c.height2;
            // top right
            inputMapping[ i + 4 ] = xadvance + c.xoffset2 + c.width2;
            inputMapping[ i + 5 ] = c.lineHeight - c.yoffset2;
            // bottom right
            inputMapping[ i + 6 ] = xadvance + c.xoffset2 + c.width2;
            inputMapping[ i + 7 ] = c.lineHeight - c.yoffset2 - c.height2;

            inputTexCoord.set( c.textureCoords, i );

            xadvance += c.xadvance2;

        }

    }

};

NGL.TextBuffer.prototype.dispose = function(){

    NGL.Buffer.prototype.dispose.call( this );

    this.tex.dispose();

};


///////////
// Helper

NGL.BufferVectorHelper = function( position, vector, color, scale ){

    scale = scale || 1;

    var n = position.length/3;
    var n2 = n * 2;

    this.size = n;

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute(
        'position',
        new THREE.BufferAttribute( new Float32Array( n2 * 3 ), 3 )
    );

    this.color = color;
    this.scale = scale;

    this.setAttributes({
        position: position,
        vector: vector
    });

};

NGL.BufferVectorHelper.prototype = {

    constructor: NGL.BufferVectorHelper,

    setAttributes: function( data ){

        var n = this.size;

        var attributes = this.geometry.attributes;

        var position;
        var aPosition;

        if( data[ "position" ] ){
            position = data[ "position" ];
            aPosition = attributes[ "position" ].array;
            attributes[ "position" ].needsUpdate = true;
        }

        if( data[ "vector" ] ){
            this.vector = data[ "vector" ];
        }

        var scale = this.scale;
        var vector = this.vector;

        var i, j;

        if( data[ "position" ] ){

            for( var v = 0; v < n; v++ ){

                i = v * 2 * 3;
                j = v * 3;

                aPosition[ i + 0 ] = position[ j + 0 ];
                aPosition[ i + 1 ] = position[ j + 1 ];
                aPosition[ i + 2 ] = position[ j + 2 ];
                aPosition[ i + 3 ] = position[ j + 0 ] + vector[ j + 0 ] * scale;
                aPosition[ i + 4 ] = position[ j + 1 ] + vector[ j + 1 ] * scale;
                aPosition[ i + 5 ] = position[ j + 2 ] + vector[ j + 2 ] * scale;

            }

        }

    },

    getMesh: function( type, material ){

        material = material || this.getMaterial( type );

        return new THREE.Line( this.geometry, material, THREE.LinePieces );;

    },

    getMaterial: function( type ){

        return new THREE.LineBasicMaterial( {
            color: this.color, fog: true
        } );

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

}


// File:js/ngl/representation.js

/**
 * @file Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


NGL.makeRepresentation = function( type, object, viewer, params ){

    console.time( "NGL.makeRepresentation " + type );

    var ReprClass;

    if( object instanceof NGL.Structure ){

        ReprClass = NGL.representationTypes[ type ];

        if( !ReprClass ){

            console.error(
                "NGL.makeRepresentation: representation type " + type + " unknown"
            );
            return;

        }

    }else if( object instanceof NGL.Surface ){

        ReprClass = NGL.SurfaceRepresentation;

    }else if( object instanceof NGL.Trajectory ){

        ReprClass = NGL.TrajectoryRepresentation;

    }else{

        console.error(
            "NGL.makeRepresentation: object " + object + " unknown"
        );
        return;

    }

    var repr = new ReprClass( object, viewer, params );

    console.timeEnd( "NGL.makeRepresentation " + type );

    return repr;

};


///////////////////
// Representation

NGL.Representation = function( object, viewer, params ){

    this.viewer = viewer;

    this.debugBufferList = [];

    this.init( params );

};

NGL.Representation.prototype = {

    constructor: NGL.Representation,

    type: "",

    parameters: {

        nearClip: {
            type: "boolean", rebuild: true
        }

    },

    init: function( params ){

        var p = params || {};

        this.nearClip = p.nearClip !== undefined ? p.nearClip : true;

        this.visible = p.visible === undefined ? true : p.visible;
        this.quality = p.quality;

    },

    setColor: function( type ){

        if( type && type !== this.color ){

            this.color = type;

            this.update({ "color": true });

        }

        return this;

    },

    create: function(){

        this.bufferList = [];

    },

    update: function(){

        this.rebuild();

    },

    rebuild: function( params ){

        if( params ){
            this.init( params );
        }

        this.dispose();
        this.create();
        if( !this.manualAttach ) this.attach();

    },

    attach: function(){

        this.setVisibility( this.visible );

    },

    setVisibility: function( value ){

        this.visible = value;

        this.bufferList.forEach( function( buffer ){

            buffer.setVisibility( value );

        } );

        this.debugBufferList.forEach( function( debugBuffer ){

            debugBuffer.setVisibility( value );

        } );

        this.viewer.requestRender();

        return this;

    },

    setParameters: function( params, what, rebuild ){

        var p = params;
        var tp = this.parameters;

        rebuild = rebuild || false;

        Object.keys( tp ).forEach( function( name ){

            if( p[ name ] === undefined ) return;
            if( tp[ name ] === undefined ) return;

            this[ name ] = p[ name ];

            // update buffer uniform

            if( tp[ name ].uniform ){

                function update( mesh ){

                    var u = mesh.material.uniforms;

                    if( u && u[ name ] ){

                        u[ name ].value = p[ name ];

                    }else{

                        // happens when the buffers in a repr
                        // do not suppport the same parameters

                        // console.info( name )

                    }

                }

                this.bufferList.forEach( function( buffer ){

                    buffer.group.children.forEach( update );
                    if( buffer.pickingGroup ){
                        buffer.pickingGroup.children.forEach( update );
                    }

                } );

            }

            // mark for rebuild

            if( tp[ name ].rebuild ){

                rebuild = true;

            }

        }, this );

        if( rebuild ){

            this.rebuild();

        }else if( what && Object.keys( what ).length ){

            // update buffer attribute

            this.update( what );

        }

        return this;

    },

    getParameters: function(){

        // TODO
        var params = {

            color: this.color,
            radius: this.radius,
            scale: this.scale,
            visible: this.visible,
            sele: this.selection.string,
            disableImpostor: this.disableImpostor,
            quality: this.quality

        };

        Object.keys( this.parameters ).forEach( function( name ){

            params[ name ] = this[ name ];

        }, this );

        return params;

    },

    dispose: function(){

        this.bufferList.forEach( function( buffer ){

            this.viewer.remove( buffer );
            buffer.dispose();
            buffer = null;  // aid GC

        }, this );

        this.bufferList = [];

        this.debugBufferList.forEach( function( debugBuffer ){

            this.viewer.remove( debugBuffer );
            debugBuffer.dispose();
            debugBuffer = null;  // aid GC

        }, this );

        this.debugBufferList = [];

        this.viewer.requestRender();

    }

};


/////////////////////////////
// Structure representation

NGL.StructureRepresentation = function( structure, viewer, params ){

    this.selection = new NGL.Selection( params.sele );

    this.setStructure( structure );

    NGL.Representation.call( this, structure, viewer, params );

    if( structure.biomolDict ){
        var biomolOptions = { "__AU": "AU" };
        Object.keys( structure.biomolDict ).forEach( function( k ){
            biomolOptions[ k ] = k;
        } );
        this.parameters.assembly = {
            type: "select",
            options: biomolOptions,
            rebuild: true
        };
    }else{
        this.parameters.assembly = null;
    }

    // must come after atomSet to ensure selection change signals
    // have already updated the atomSet
    this.selection.signals.stringChanged.add( function( string ){

        this.rebuild();

    }, this );

    this.create();
    if( !this.manualAttach ) this.attach();

};

NGL.StructureRepresentation.prototype = NGL.createObject(

    NGL.Representation.prototype, {

    constructor: NGL.StructureRepresentation,

    type: "",

    parameters: Object.assign( {

        radiusType: {
            type: "select", options: NGL.RadiusFactory.types
        },
        radius: {
            type: "number", precision: 3, max: 10.0, min: 0.001
        },
        scale: {
            type: "number", precision: 3, max: 10.0, min: 0.001
        },
        transparent: {
            type: "boolean", rebuild: true
        },
        side: {
            type: "select", options: NGL.SideTypes, rebuild: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0,
            uniform: true
        },
        assembly: null

    }, NGL.Representation.prototype.parameters ),

    defaultScale: {
        "vdw": 1.0,
        "covalent": 1.0,
        "bfactor": 0.01,
        "ss": 1.0
    },

    defaultSize: 1.0,

    init: function( params ){

        var p = params || {};

        this.color = p.color === undefined ? "element" : p.color;
        this.radius = p.radius || "vdw";
        this.scale = p.scale || 1.0;
        this.transparent = p.transparent !== undefined ? p.transparent : false;
        this.side = p.side !== undefined ? p.side : THREE.DoubleSide;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;
        this.assembly = p.assembly || "1";

        this.setSelection( p.sele, true );

        NGL.Representation.prototype.init.call( this, p );

    },

    setStructure: function( structure ){

        this.structure = structure;
        this.atomSet = new NGL.AtomSet( this.structure, this.selection );

        return this;

    },

    setSelection: function( string, silent ){

        this.selection.setString( string, silent );

        return this;

    },

    setParameters: function( params, what, rebuild ){

        what = what || {};

        if( params && params[ "radiusType" ]!==undefined ){

            if( params[ "radiusType" ] === "size" ){
                this.radius = this.defaultSize;
            }else{
                this.radius = params[ "radiusType" ];
            }
            what[ "radius" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        if( params && params[ "radius" ]!==undefined ){

            this.radius = params[ "radius" ];
            what[ "radius" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        if( params && params[ "scale" ]!==undefined ){

            this.scale = params[ "scale" ];
            what[ "scale" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        NGL.Representation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    },

    attach: function(){

        var viewer = this.viewer;
        var structure = this.structure;
        var assembly = this.assembly;

        // console.log( structure.biomolDict );

        var matrixList = [];

        if( structure.biomolDict && structure.biomolDict[ assembly ] ){

            matrixList = Object.values(
                structure.biomolDict[ assembly ].matrixDict
            );

        }

        this.bufferList.forEach( function( buffer ){

            if( matrixList.length >= 1 ){
                viewer.add( buffer, matrixList );
            }else{
                viewer.add( buffer );
            }

        } );

        this.debugBufferList.forEach( function( debugBuffer ){

            if( matrixList.length > 1 ){
                viewer.add( debugBuffer, matrixList );
            }else{
                viewer.add( debugBuffer );
            }

        } );

        this.setVisibility( this.visible );

    }

} );


NGL.SpacefillRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.SpacefillRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.SpacefillRepresentation,

    type: "spacefill",

    parameters: Object.assign( {

        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};

        this.disableImpostor = p.disableImpostor || false;

        if( p.quality === "low" ){
            this.sphereDetail = 0;
        }else if( p.quality === "medium" ){
            this.sphereDetail = 1;
        }else if( p.quality === "high" ){
            this.sphereDetail = 2;
        }else{
            this.sphereDetail = p.sphereDetail || 1;
        }

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        var opacity = this.transparent ? this.opacity : 1.0;

        this.sphereBuffer = new NGL.SphereBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.atomSet.atomRadius( null, this.radius, this.scale ),
            this.atomSet.atomColor( null, "picking" ),
            this.sphereDetail,
            this.disableImpostor,
            this.transparent,
            this.side,
            opacity
        );

        this.bufferList = [ this.sphereBuffer ];

    },

    update: function( what ){

        what = what || {};

        var sphereData = {};

        if( what[ "position" ] ){

            sphereData[ "position" ] = this.atomSet.atomPosition();

        }

        if( what[ "color" ] ){

            sphereData[ "color" ] = this.atomSet.atomColor( null, this.color );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            sphereData[ "radius" ] = this.atomSet.atomRadius(
                null, this.radius, this.scale
            );

        }

        this.sphereBuffer.setAttributes( sphereData );

    }

} );


NGL.PointRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.PointRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.PointRepresentation,

    type: "point",

    parameters: Object.assign( {

        pointSize: {
            type: "integer", max: 20, min: 1, rebuild: true
        },
        sizeAttenuation: {
            type: "boolean", rebuild: true
        },
        sort: {
            type: "boolean", rebuild: true
        },
        transparent: {
            type: "boolean", rebuild: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0,
            // FIXME should be uniform but currently incompatible
            // with the underlying PointCloudMaterial
            rebuild: true
        }

    }, NGL.Representation.prototype.parameters ),

    init: function( params ){

        var p = params || {};

        this.pointSize = p.pointSize || 1;
        this.sizeAttenuation = p.sizeAttenuation !== undefined ? p.sizeAttenuation : false;
        this.sort = p.sort !== undefined ? p.sort : true;
        p.transparent = p.transparent !== undefined ? p.transparent : true;
        p.opacity = p.opacity !== undefined ? p.opacity : 0.6;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        var opacity = this.transparent ? this.opacity : 1.0;

        this.pointBuffer = new NGL.PointBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.pointSize,
            this.sizeAttenuation,
            this.sort,
            this.transparent,
            opacity
        );

        this.bufferList = [ this.pointBuffer ];

    },

    update: function( what ){

        what = what || {};

        var pointData = {};

        if( what[ "position" ] ){

            pointData[ "position" ] = this.atomSet.atomPosition();

        }

        if( what[ "color" ] ){

            pointData[ "color" ] = this.atomSet.atomColor( null, this.color );

        }

        this.pointBuffer.setAttributes( pointData );

    }

} );


NGL.LabelRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.LabelRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.LabelRepresentation,

    type: "label",

    parameters: Object.assign( {

        labelType: {
            type: "select", options: NGL.LabelFactory.types, rebuild: true
        },
        font: {
            type: "select", options: {
                "Arial": "Arial",
                "DejaVu": "DejaVu",
                "LatoBlack": "LatoBlack"
            },
            rebuild: true
        },
        antialias: {
            type: "boolean", rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters, { side: null } ),

    init: function( params ){

        var p = params || {};

        p.color = p.color || 0xFFFFFF;

        this.labelType = p.labelType || "res";
        this.labelText = p.labelText || {};
        this.font = p.font || 'Arial';
        this.antialias = p.antialias !== undefined ? p.antialias : true;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        var opacity = this.transparent ? this.opacity : 1.0;

        var text = [];
        var labelFactory = new NGL.LabelFactory(
            this.labelType, this.labelText
        );

        this.atomSet.eachAtom( function( a ){

            text.push( labelFactory.atomLabel( a ) );

        } );

        this.textBuffer = new NGL.TextBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomRadius( null, this.radius, this.scale ),
            this.atomSet.atomColor( null, this.color ),
            text,
            this.font,
            this.antialias,
            opacity
        );

        this.bufferList = [ this.textBuffer ];

    },

    update: function( what ){

        what = what || {};

        var textData = {};

        if( what[ "position" ] ){

            textData[ "position" ] = this.atomSet.atomPosition();

        }

        if( what[ "size" ] || what[ "scale" ] ){

            textData[ "size" ] = this.atomSet.atomRadius(
                null, this.radius, this.scale
            );

        }

        if( what[ "color" ] ){

            textData[ "color" ] = this.atomSet.atomColor(
                null, this.color
            );

        }

        this.textBuffer.setAttributes( textData );

    }

} );


NGL.BallAndStickRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.BallAndStickRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.BallAndStickRepresentation,

    type: "ball+stick",

    defaultSize: 0.15,

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: true
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.radius = params.radius || this.defaultSize;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.sphereDetail = 0;
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.sphereDetail = 1;
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.sphereDetail = 2;
            this.radiusSegments = 20;
        }else{
            this.sphereDetail = params.sphereDetail || 1;
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.aspectRatio = params.aspectRatio || 2.0;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var opacity = this.transparent ? this.opacity : 1.0;

        this.sphereBuffer = new NGL.SphereBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.atomSet.atomRadius(
                null, this.radius, this.scale * this.aspectRatio
            ),
            this.atomSet.atomColor( null, "picking" ),
            this.sphereDetail,
            this.disableImpostor,
            this.transparent,
            this.side,
            opacity
        );

        this.__center = new Float32Array( this.atomSet.bondCount * 3 );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            this.atomSet.bondPosition( null, 0 ),
            this.atomSet.bondPosition( null, 1 ),
            this.atomSet.bondColor( null, 0, this.color ),
            this.atomSet.bondColor( null, 1, this.color ),
            this.atomSet.bondRadius( null, null, this.radius, this.scale ),
            null,
            true,
            this.atomSet.bondColor( null, 0, "picking" ),
            this.atomSet.bondColor( null, 1, "picking" ),
            this.radiusSegments,
            this.disableImpostor,
            this.transparent,
            this.side,
            opacity
        );

        this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

    },

    update: function( what ){

        what = what || {};

        var sphereData = {};
        var cylinderData = {};

        if( what[ "position" ] ){

            sphereData[ "position" ] = this.atomSet.atomPosition();

            var from = this.atomSet.bondPosition( null, 0 );
            var to = this.atomSet.bondPosition( null, 1 );

            cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                from, to, this.__center
            );
            cylinderData[ "position1" ] = from;
            cylinderData[ "position2" ] = to;

        }

        if( what[ "color" ] ){

            sphereData[ "color" ] = this.atomSet.atomColor( null, this.color );

            cylinderData[ "color" ] = this.atomSet.bondColor( null, 0, this.color );
            cylinderData[ "color2" ] = this.atomSet.bondColor( null, 1, this.color );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            sphereData[ "radius" ] = this.atomSet.atomRadius(
                null, this.radius, this.scale * this.aspectRatio
            );

            cylinderData[ "radius" ] = this.atomSet.bondRadius(
                null, null, this.radius, this.scale
            );

        }

        this.sphereBuffer.setAttributes( sphereData );
        this.cylinderBuffer.setAttributes( cylinderData );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "aspectRatio" ] ){

            this.aspectRatio = params[ "aspectRatio" ];
            what[ "radius" ] = true;
            what[ "scale" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.LicoriceRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.LicoriceRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.LicoriceRepresentation,

    type: "licorice",

    defaultSize: 0.15,

    parameters: Object.assign( {

        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: true
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.radius = params.radius || this.defaultSize;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.sphereDetail = 0;
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.sphereDetail = 1;
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.sphereDetail = 2;
            this.radiusSegments = 20;
        }else{
            this.sphereDetail = params.sphereDetail || 1;
            this.radiusSegments = params.radiusSegments || 10;
        }

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var opacity = this.transparent ? this.opacity : 1.0;

        this.sphereBuffer = new NGL.SphereBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.atomSet.atomRadius( null, this.radius, this.scale ),
            this.atomSet.atomColor( null, "picking" ),
            this.sphereDetail,
            this.disableImpostor,
            this.transparent,
            this.side,
            opacity
        );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            this.atomSet.bondPosition( null, 0 ),
            this.atomSet.bondPosition( null, 1 ),
            this.atomSet.bondColor( null, 0, this.color ),
            this.atomSet.bondColor( null, 1, this.color ),
            this.atomSet.bondRadius( null, null, this.radius, this.scale ),
            null,
            true,
            this.atomSet.bondColor( null, 0, "picking" ),
            this.atomSet.bondColor( null, 1, "picking" ),
            this.radiusSegments,
            this.disableImpostor,
            this.transparent,
            this.side,
            opacity
        );

        this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

    },

    update: function( what ){

        this.aspectRatio = 1.0;

        NGL.BallAndStickRepresentation.prototype.update.call( this, what );

    }

} );


NGL.LineRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.LineRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.LineRepresentation,

    type: "line",

    parameters: Object.assign( {

        lineWidth: {
            type: "integer", max: 20, min: 1, rebuild: true
        },
        transparent: {
            type: "boolean", rebuild: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0,
            // FIXME should be uniform but currently incompatible
            // with the underlying Material
            rebuild: true
        }

    }, NGL.Representation.prototype.parameters ),

    init: function( params ){

        var p = params || {};

        this.lineWidth = p.lineWidth || 1;
        this.transparent = p.transparent !== undefined ? p.transparent : false;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        var opacity = this.transparent ? this.opacity : 1.0;

        this.lineBuffer = new NGL.LineBuffer(
            this.atomSet.bondPosition( null, 0 ),
            this.atomSet.bondPosition( null, 1 ),
            this.atomSet.bondColor( null, 0, this.color ),
            this.atomSet.bondColor( null, 1, this.color ),
            this.lineWidth,
            this.transparent,
            opacity
        );

        this.bufferList = [ this.lineBuffer ];

    },

    update: function( what ){

        what = what || {};

        var lineData = {};

        if( what[ "position" ] ){

            lineData[ "from" ] = this.atomSet.bondPosition( null, 0 );
            lineData[ "to" ] = this.atomSet.bondPosition( null, 1 );

        }

        if( what[ "color" ] ){

            lineData[ "color" ] = this.atomSet.bondColor( null, 0, this.color );
            lineData[ "color2" ] = this.atomSet.bondColor( null, 1, this.color );

        }

        this.lineBuffer.setAttributes( lineData );

    }

} );


NGL.HyperballRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

    this.defaultScale[ "vdw" ] = 0.2;

};

NGL.HyperballRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.HyperballRepresentation,

    type: "hyperball",

    parameters: Object.assign( {

        shrink: {
            type: "number", precision: 3, max: 1.0, min: 0.001, uniform: true
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: true
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.scale = params.scale || 0.2;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.sphereDetail = 0;
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.sphereDetail = 1;
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.sphereDetail = 2;
            this.radiusSegments = 20;
        }else{
            this.sphereDetail = params.sphereDetail || 1;
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.shrink = params.shrink || 0.12;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var opacity = this.transparent ? this.opacity : 1.0;

        this.sphereBuffer = new NGL.SphereBuffer(
            this.atomSet.atomPosition(),
            this.atomSet.atomColor( null, this.color ),
            this.atomSet.atomRadius( null, this.radius, this.scale ),
            this.atomSet.atomColor( null, "picking" ),
            this.sphereDetail,
            this.disableImpostor,
            this.transparent,
            this.side,
            opacity
        );

        this.__center = new Float32Array( this.atomSet.bondCount * 3 );

        this.cylinderBuffer = new NGL.HyperballStickBuffer(
            this.atomSet.bondPosition( null, 0 ),
            this.atomSet.bondPosition( null, 1 ),
            this.atomSet.bondColor( null, 0, this.color ),
            this.atomSet.bondColor( null, 1, this.color ),
            this.atomSet.bondRadius( null, 0, this.radius, this.scale ),
            this.atomSet.bondRadius( null, 1, this.radius, this.scale ),
            this.shrink,
            this.atomSet.bondColor( null, 0, "picking" ),
            this.atomSet.bondColor( null, 1, "picking" ),
            this.radiusSegments,
            this.disableImpostor,
            this.transparent,
            this.side,
            opacity
        );

        this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

    },

    update: function( what ){

        what = what || {};

        var sphereData = {};
        var cylinderData = {};

        if( what[ "position" ] ){

            sphereData[ "position" ] = this.atomSet.atomPosition();

            var from = this.atomSet.bondPosition( null, 0 );
            var to = this.atomSet.bondPosition( null, 1 );

            cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                from, to, this.__center
            );

            cylinderData[ "position1" ] = from;
            cylinderData[ "position2" ] = to;

        }

        if( what[ "color" ] ){

            sphereData[ "color" ] = this.atomSet.atomColor( null, this.color );

            cylinderData[ "color" ] = this.atomSet.bondColor( null, 0, this.color );
            cylinderData[ "color2" ] = this.atomSet.bondColor( null, 1, this.color );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            sphereData[ "radius" ] = this.atomSet.atomRadius(
                null, this.radius, this.scale
            );

            cylinderData[ "radius" ] = this.atomSet.bondRadius(
                null, 0, this.radius, this.scale
            );
            cylinderData[ "radius2" ] = this.atomSet.bondRadius(
                null, 1, this.radius, this.scale
            );

        }

        this.sphereBuffer.setAttributes( sphereData );
        this.cylinderBuffer.setAttributes( cylinderData );

    }

} );


NGL.BackboneRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.BackboneRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.BackboneRepresentation,

    type: "backbone",

    defaultSize: 0.25,

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: true
        },
        radiusSegments: {
            type: "integer", max: 50, min: 5, rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.radius = params.radius || this.defaultSize;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.sphereDetail = 0;
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.sphereDetail = 1;
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.sphereDetail = 2;
            this.radiusSegments = 20;
        }else{
            this.sphereDetail = params.sphereDetail || 1;
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.aspectRatio = params.aspectRatio || 1.0;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var opacity = this.transparent ? this.opacity : 1.0;

        var test = this.selection.test;

        this.backboneAtomSet = new NGL.AtomSet();
        this.backboneBondSet = new NGL.BondSet();

        var baSet = this.backboneAtomSet;
        var bbSet = this.backboneBondSet;

        baSet.structure = this.structure;
        bbSet.structure = this.structure;

        var a1, a2;

        this.structure.eachFiber( function( f ){

            if( f.residueCount < 2 ) return;

            f.eachResidueN( 2, function( r1, r2 ){

                a1 = r1.getAtomByName( f.traceAtomname );
                a2 = r2.getAtomByName( f.traceAtomname );

                if( test( a1 ) && test( a2 ) ){

                    baSet.addAtom( a1 );
                    bbSet.addBond( a1, a2, true );

                }

            } );

            if( test( a1 ) && test( a2 ) ){

                baSet.addAtom( a2 );

            }

        } );

        this.sphereBuffer = new NGL.SphereBuffer(
            baSet.atomPosition(),
            baSet.atomColor( null, this.color ),
            baSet.atomRadius(
                null, this.radius, this.scale * this.aspectRatio
            ),
            baSet.atomColor( null, "picking" ),
            this.sphereDetail,
            this.disableImpostor,
            this.transparent,
            this.side,
            opacity
        );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            bbSet.bondPosition( null, 0 ),
            bbSet.bondPosition( null, 1 ),
            bbSet.bondColor( null, 0, this.color ),
            bbSet.bondColor( null, 1, this.color ),
            bbSet.bondRadius( null, 0, this.radius, this.scale ),
            null,
            true,
            bbSet.bondColor( null, 0, "picking" ),
            bbSet.bondColor( null, 1, "picking" ),
            this.radiusSegments,
            this.disableImpostor,
            this.transparent,
            this.side,
            opacity
        );

        this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

    },

    update: function( what ){

        what = what || {};

        var baSet = this.backboneAtomSet;
        var bbSet = this.backboneBondSet;

        var sphereData = {};
        var cylinderData = {};

        if( what[ "position" ] ){

            sphereData[ "position" ] = baSet.atomPosition();

            var from = bbSet.bondPosition( null, 0 );
            var to = bbSet.bondPosition( null, 1 );

            cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                from, to
            );
            cylinderData[ "position1" ] = from;
            cylinderData[ "position2" ] = to;

        }

        if( what[ "color" ] ){

            sphereData[ "color" ] = baSet.atomColor( null, this.color );

            cylinderData[ "color" ] = bbSet.bondColor( null, 0, this.color );
            cylinderData[ "color2" ] = bbSet.bondColor( null, 1, this.color );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            sphereData[ "radius" ] = baSet.atomRadius(
                null, this.radius, this.scale * this.aspectRatio
            );

            cylinderData[ "radius" ] = bbSet.bondRadius(
                null, 0, this.radius, this.scale
            );

        }

        this.sphereBuffer.setAttributes( sphereData );
        this.cylinderBuffer.setAttributes( cylinderData );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "aspectRatio" ] ){

            this.aspectRatio = params[ "aspectRatio" ];
            what[ "radius" ] = true;
            what[ "scale" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.BaseRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.BaseRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.BaseRepresentation,

    type: "base",

    defaultSize: 0.2,

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0, rebuild: true
        },
        radiusSegments: {
            type: "integer", max: 50, min: 5, rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.radius = params.radius || this.defaultSize;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.sphereDetail = 0;
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.sphereDetail = 1;
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.sphereDetail = 2;
            this.radiusSegments = 20;
        }else{
            this.sphereDetail = params.sphereDetail || 1;
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.aspectRatio = params.aspectRatio || 1.0;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var opacity = this.transparent ? this.opacity : 1.0;

        var test = this.selection.test;

        this.baseAtomSet = new NGL.AtomSet();
        this.baseBondSet = new NGL.BondSet();

        var baSet = this.baseAtomSet;
        var bbSet = this.baseBondSet;

        baSet.structure = this.structure;
        bbSet.structure = this.structure;

        var a1, a2;
        var bases = [ "A", "G", "DA", "DG" ];

        this.structure.eachFiber( function( f ){

            if( f.residueCount < 1 || !f.isNucleic() ) return;

            f.eachResidue( function( r ){

                a1 = r.getAtomByName( f.traceAtomname );

                if( bases.indexOf( r.resname ) !== -1 ){
                    a2 = r.getAtomByName( "N1" );
                }else{
                    a2 = r.getAtomByName( "N3" );
                }

                if( test( a1 ) ){

                    baSet.addAtom( a1 );
                    baSet.addAtom( a2 );
                    bbSet.addBond( a1, a2, true );

                }

            } );

        } );

        this.sphereBuffer = new NGL.SphereBuffer(
            baSet.atomPosition(),
            baSet.atomColor( null, this.color ),
            baSet.atomRadius(
                null, this.radius, this.scale * this.aspectRatio ),
            baSet.atomColor( null, "picking" ),
            this.sphereDetail,
            this.disableImpostor,
            this.transparent,
            this.side,
            opacity
        );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            bbSet.bondPosition( null, 0 ),
            bbSet.bondPosition( null, 1 ),
            bbSet.bondColor( null, 0, this.color ),
            bbSet.bondColor( null, 1, this.color ),
            bbSet.bondRadius( null, 0, this.radius, this.scale ),
            null,
            true,
            bbSet.bondColor( null, 0, "picking" ),
            bbSet.bondColor( null, 1, "picking" ),
            this.radiusSegments,
            this.disableImpostor,
            this.transparent,
            this.side,
            opacity
        );

        this.bufferList = [ this.sphereBuffer, this.cylinderBuffer ];

    },

    update: function( what ){

        what = what || {};

        var baSet = this.baseAtomSet;
        var bbSet = this.baseBondSet;

        var sphereData = {};
        var cylinderData = {};

        if( what[ "position" ] ){

            sphereData[ "position" ] = baSet.atomPosition();

            var from = bbSet.bondPosition( null, 0 );
            var to = bbSet.bondPosition( null, 1 );

            cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                from, to
            );
            cylinderData[ "position1" ] = from;
            cylinderData[ "position2" ] = to;

        }

        if( what[ "color" ] ){

            sphereData[ "color" ] = baSet.atomColor( null, this.color );

            cylinderData[ "color" ] = bbSet.bondColor( null, 0, this.color );
            cylinderData[ "color2" ] = bbSet.bondColor( null, 1, this.color );

        }

        if( what[ "radius" ] || what[ "scale" ] ){

            sphereData[ "radius" ] = baSet.atomRadius(
                null, this.radius, this.scale * this.aspectRatio
            );

            cylinderData[ "radius" ] = bbSet.bondRadius(
                null, 0, this.radius, this.scale
            );

        }

        this.sphereBuffer.setAttributes( sphereData );
        this.cylinderBuffer.setAttributes( cylinderData );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "aspectRatio" ] ){

            this.aspectRatio = params[ "aspectRatio" ];
            what[ "radius" ] = true;
            what[ "scale" ] = true;
            if( !NGL.extensionFragDepth || this.disableImpostor ){
                rebuild = true;
            }

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.TubeRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.TubeRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.TubeRepresentation,

    type: "tube",

    defaultSize: 0.25,

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        radialSegments: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean", rebuild: true
        },
        wireframe: {
            type: "boolean", rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.color = p.color || "ss";
        p.radius = p.radius || this.defaultSize;

        if( p.quality === "low" ){
            this.subdiv = 3;
            this.radialSegments = 5;
        }else if( p.quality === "medium" ){
            this.subdiv = 6;
            this.radialSegments = 10;
        }else if( p.quality === "high" ){
            this.subdiv = 12;
            this.radialSegments = 20;
        }else{
            this.subdiv = p.subdiv || 6;
            this.radialSegments = p.radialSegments || 10;
        }

        this.tension = p.tension || NaN;
        this.capped = p.capped || true;
        this.wireframe = p.wireframe || false;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        var opacity = this.transparent ? this.opacity : 1.0;

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subOri = spline.getSubdividedOrientation( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
            var subSize = spline.getSubdividedSize(
                scope.subdiv, scope.radius, scope.scale
            );

            var rx = 1.0;
            var ry = 1.0;

            scope.bufferList.push(

                new NGL.TubeMeshBuffer(
                    subPos.position,
                    subOri.normal,
                    subOri.binormal,
                    subOri.tangent,
                    subCol.color,
                    subSize.size,
                    scope.radialSegments,
                    subCol.pickingColor,
                    rx,
                    ry,
                    scope.capped,
                    scope.wireframe,
                    scope.transparent,
                    parseInt( scope.side ),
                    opacity
                )

            );

            scope.fiberList.push( fiber );

        }, this.selection, true );

    },

    update: function( what ){

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        // console.time( this.name, "update" );

        for( i = 0; i < n; ++i ){

            var fiber = this.fiberList[ i ];

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var spline = new NGL.Spline( fiber );

            if( what[ "position" ] || what[ "radius" ] || what[ "scale" ] ){

                var subPos = spline.getSubdividedPosition(
                    this.subdiv, this.tension
                );
                var subOri = spline.getSubdividedOrientation(
                    this.subdiv, this.tension
                );
                var subSize = spline.getSubdividedSize(
                    this.subdiv, this.radius, this.scale
                );

                bufferData[ "position" ] = subPos.position;
                bufferData[ "normal" ] = subOri.normal;
                bufferData[ "binormal" ] = subOri.binormal;
                bufferData[ "tangent" ] = subOri.tangent;
                bufferData[ "size" ] = subSize.size;

            }

            if( what[ "color" ] ){

                var subCol = spline.getSubdividedColor(
                    this.subdiv, this.color
                );

                bufferData[ "color" ] = subCol.color;
                bufferData[ "pickingColor" ] = subCol.pickingColor;

            }

            this.bufferList[ i ].setAttributes( bufferData );

        };

        // console.timeEnd( this.name, "update" );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "position" ] = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.CartoonRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.CartoonRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.CartoonRepresentation,

    type: "cartoon",

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        subdiv: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        radialSegments: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean", rebuild: true
        },
        wireframe: {
            type: "boolean", rebuild: true
        },
        arrows: {
            type: "boolean", rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.color = p.color || "ss";
        p.radius = p.radius || "ss";

        if( p.quality === "low" ){
            this.subdiv = 3;
            this.radialSegments = 6;
        }else if( p.quality === "medium" ){
            this.subdiv = 6;
            this.radialSegments = 10;
        }else if( p.quality === "high" ){
            this.subdiv = 12;
            this.radialSegments = 20;
        }else{
            this.subdiv = p.subdiv || 6;
            this.radialSegments = p.radialSegments || 10;
        }

        this.aspectRatio = p.aspectRatio || 3.0;
        this.tension = p.tension || NaN;
        this.capped = p.capped || true;
        this.wireframe = p.wireframe || false;
        this.arrows = p.arrows || false;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        var opacity = this.transparent ? this.opacity : 1.0;

        if( NGL.debug ){

            scope.debugBufferList = [];

        }

        /*
            var l = {

                position: [],
                normal: [],
                binormal: [],
                tangent: [],
                color: [],
                size: [],
                pickingColor: []

            };

            var n = 0;
            var length = 0;
        */

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber, scope.arrows );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subOri = spline.getSubdividedOrientation( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
            var subSize = spline.getSubdividedSize(
                scope.subdiv, scope.radius, scope.scale
            );

            var rx = 1.0 * scope.aspectRatio;
            var ry = 1.0;

            if( fiber.isCg() ){
                ry = rx;
            }

            scope.bufferList.push(

                new NGL.TubeMeshBuffer(
                    subPos.position,
                    subOri.normal,
                    subOri.binormal,
                    subOri.tangent,
                    subCol.color,
                    subSize.size,
                    scope.radialSegments,
                    subCol.pickingColor,
                    rx,
                    ry,
                    scope.capped,
                    scope.wireframe,
                    scope.transparent,
                    parseInt( scope.side ),
                    opacity,
                    scope.nearClip
                )

            );

            if( NGL.debug ){

                scope.debugBufferList.push(

                    new NGL.BufferVectorHelper(
                        subPos.position,
                        subOri.normal,
                        "skyblue",
                        1.5
                    )

                );

                scope.debugBufferList.push(

                    new NGL.BufferVectorHelper(
                        subPos.position,
                        subOri.binormal,
                        "lightgreen",
                        1.5
                    )

                );

                scope.debugBufferList.push(

                    new NGL.BufferVectorHelper(
                        subPos.position,
                        subOri.tangent,
                        "orange",
                        1.5
                    )

                );

            }

            /*
                l.position.push( subPos.position );
                l.normal.push( subOri.normal );
                l.binormal.push( subOri.binormal );
                l.tangent.push( subOri.tangent );
                l.color.push( subCol.color );
                l.size.push( subSize.size );
                l.pickingColor.push( subCol.pickingColor );

                n += 1;
                length += subSize.size.length;
            */

            scope.fiberList.push( fiber );

        }, this.selection, true );

        /*
            var rx = 1.0 * this.aspectRatio;
            var ry = 1.0;

            if( this.fiberList[ 0 ].isCg() ){
                ry = rx;
            }

            var position = new Float32Array( 3 * length );
            for( var i = 0, offset = 0; i < n; ++i ){
                position.set( l.position[ i ], offset );
                offset += l.position[ i ].length;
            }

            var normal = new Float32Array( 3 * length );
            for( var i = 0, offset = 0; i < n; ++i ){
                normal.set( l.normal[ i ], offset );
                offset += l.normal[ i ].length;
            }

            var binormal = new Float32Array( 3 * length );
            for( var i = 0, offset = 0; i < n; ++i ){
                binormal.set( l.binormal[ i ], offset );
                offset += l.binormal[ i ].length;
            }

            var tangent = new Float32Array( 3 * length );
            for( var i = 0, offset = 0; i < n; ++i ){
                tangent.set( l.tangent[ i ], offset );
                offset += l.tangent[ i ].length;
            }

            var color = new Float32Array( 3 * length );
            for( var i = 0, offset = 0; i < n; ++i ){
                color.set( l.color[ i ], offset );
                offset += l.color[ i ].length;
            }

            var size = new Float32Array( length );
            for( var i = 0, offset = 0; i < n; ++i ){
                size.set( l.size[ i ], offset );
                offset += l.size[ i ].length;
            }

            var pickingColor = new Float32Array( 3 * length );
            for( var i = 0, offset = 0; i < n; ++i ){
                pickingColor.set( l.pickingColor[ i ], offset );
                offset += l.pickingColor[ i ].length;
            }

            this.bufferList.push(

                new NGL.TubeMeshBuffer(
                    position,
                    normal,
                    binormal,
                    tangent,
                    color,
                    size,
                    this.radialSegments,
                    pickingColor,
                    rx,
                    ry,
                    this.capped,
                    this.wireframe,
                    this.transparent,
                    parseInt( this.side ),
                    opacity,
                    this.nearClip
                )

            );
        */

    },

    update: function( what ){

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        // console.time( this.name, "update" );

        for( i = 0; i < n; ++i ){

            var fiber = this.fiberList[ i ];

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var spline = new NGL.Spline( fiber, this.arrows );

            this.bufferList[ i ].rx = this.aspectRatio;

            if( what[ "position" ] || what[ "radius" ] || what[ "scale" ] ){

                var subPos = spline.getSubdividedPosition( this.subdiv, this.tension );
                var subOri = spline.getSubdividedOrientation( this.subdiv, this.tension );
                var subSize = spline.getSubdividedSize(
                    this.subdiv, this.radius, this.scale
                );

                bufferData[ "position" ] = subPos.position;
                bufferData[ "normal" ] = subOri.normal;
                bufferData[ "binormal" ] = subOri.binormal;
                bufferData[ "tangent" ] = subOri.tangent;
                bufferData[ "size" ] = subSize.size;

            }

            if( what[ "color" ] ){

                var subCol = spline.getSubdividedColor( this.subdiv, this.color );

                bufferData[ "color" ] = subCol.color;
                bufferData[ "pickingColor" ] = subCol.pickingColor;

            }

            this.bufferList[ i ].setAttributes( bufferData );

            if( NGL.debug ){

                this.debugBufferList[ i * 3 + 0 ].setAttributes( bufferData );
                this.debugBufferList[ i * 3 + 1 ].setAttributes( bufferData );
                this.debugBufferList[ i * 3 + 2 ].setAttributes( bufferData );

            }

        };

        // console.timeEnd( this.name, "update" );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "aspectRatio" ] ){

            this.aspectRatio = params[ "aspectRatio" ];
            what[ "radius" ] = true;

        }

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "position" ] = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.RibbonRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

    this.defaultScale[ "ss" ] *= 3.0;

};

NGL.RibbonRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.RibbonRepresentation,

    type: "ribbon",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.color = p.color || "ss";
        p.radius = p.radius || "ss";
        p.scale = p.scale || 3.0;

        if( p.quality === "low" ){
            this.subdiv = 3;
        }else if( p.quality === "medium" ){
            this.subdiv = 6;
        }else if( p.quality === "high" ){
            this.subdiv = 12;
        }else{
            this.subdiv = p.subdiv || 6;
        }

        this.tension = p.tension || NaN;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        var opacity = this.transparent ? this.opacity : 1.0;

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subOri = spline.getSubdividedOrientation( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
            var subSize = spline.getSubdividedSize(
                scope.subdiv, scope.radius, scope.scale
            );

            scope.bufferList.push(

                new NGL.RibbonBuffer(
                    subPos.position,
                    subOri.binormal,
                    subOri.normal,
                    subCol.color,
                    subSize.size,
                    subCol.pickingColor,
                    scope.transparent,
                    parseInt( scope.side ),
                    opacity
                )

            );

            scope.fiberList.push( fiber );

        }, this.selection, true );

    },

    update: function( what ){

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        for( i = 0; i < n; ++i ){

            var fiber = this.fiberList[ i ]

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var spline = new NGL.Spline( fiber );

            if( what[ "position" ] ){

                var subPos = spline.getSubdividedPosition( this.subdiv, this.tension );
                var subOri = spline.getSubdividedOrientation( this.subdiv, this.tension );

                bufferData[ "position" ] = subPos.position;
                bufferData[ "normal" ] = subOri.binormal;
                bufferData[ "dir" ] = subOri.normal;

            }

            if( what[ "radius" ] || what[ "scale" ] ){

                var subSize = spline.getSubdividedSize(
                    this.subdiv, this.radius, this.scale
                );

                bufferData[ "size" ] = subSize.size;

            }

            if( what[ "color" ] ){

                var subCol = spline.getSubdividedColor( this.subdiv, this.color );

                bufferData[ "color" ] = subCol.color;
                bufferData[ "pickingColor" ] = subCol.pickingColor;

            }

            this.bufferList[ i ].setAttributes( bufferData );

        };

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "position" ] = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.TraceRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.TraceRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.TraceRepresentation,

    type: "trace",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        lineWidth: {
            type: "integer", max: 20, min: 1, rebuild: true
        },
        transparent: {
            type: "boolean", rebuild: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0,
            // FIXME should be uniform but currently incompatible
            // with the underlying Material
            rebuild: true
        }

    }, NGL.Representation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.color = p.color || "ss";

        if( p.quality === "low" ){
            this.subdiv = 3;
        }else if( p.quality === "medium" ){
            this.subdiv = 6;
        }else if( p.quality === "high" ){
            this.subdiv = 12;
        }else{
            this.subdiv = p.subdiv || 6;
        }

        this.tension = p.tension || NaN;
        this.lineWidth = p.lineWidth || 1;
        this.transparent = p.transparent !== undefined ? p.transparent : false;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        var opacity = this.transparent ? this.opacity : 1.0;

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );

            scope.bufferList.push(

                new NGL.TraceBuffer(
                    subPos.position,
                    subCol.color,
                    scope.lineWidth,
                    scope.transparent,
                    opacity
                )

            );

            scope.fiberList.push( fiber );

        }, this.selection, true );

    },

    update: function( what ){

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        for( i = 0; i < n; ++i ){

            var fiber = this.fiberList[ i ]

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var spline = new NGL.Spline( fiber );

            if( what[ "position" ] ){

                var subPos = spline.getSubdividedPosition( this.subdiv, this.tension );

                bufferData[ "position" ] = subPos.position;

            }

            if( what[ "color" ] ){

                var subCol = spline.getSubdividedColor( this.subdiv, this.color );

                bufferData[ "color" ] = subCol.color;

            }

            this.bufferList[ i ].setAttributes( bufferData );

        };

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "position" ] = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.HelixorientRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.HelixorientRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.HelixorientRepresentation,

    type: "helixorient",

    parameters: Object.assign( {

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.color = params.color || "ss";
        params.radius = params.radius || 0.15;
        params.scale = params.scale || 1.0;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var opacity = this.transparent ? this.opacity : 1.0;

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        // TODO reduce buffer count as in e.g. rocket repr

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 || fiber.isNucleic() ) return;

            var helixorient = new NGL.Helixorient( fiber );
            var position = helixorient.getPosition();
            var color = helixorient.getColor( scope.color );
            var size = helixorient.getSize( scope.radius, scope.scale );

            scope.bufferList.push(

                new NGL.SphereBuffer(
                    position.center,
                    color.color,
                    size.size,
                    color.pickingColor,
                    scope.sphereDetail,
                    scope.disableImpostor,
                    scope.transparent,
                    scope.side,
                    opacity
                )

            );

            scope.bufferList.push(

                new NGL.BufferVectorHelper(
                    position.center,
                    position.axis,
                    "skyblue",
                    1
                )

            );

            scope.bufferList.push(

                new NGL.BufferVectorHelper(
                    position.center,
                    position.resdir,
                    "lightgreen",
                    1
                )

            );

            scope.fiberList.push( fiber );

        }, this.selection );

    },

    update: function( what ){

        what = what || {};

        var j;
        var i = 0;
        var n = this.fiberList.length;

        for( i = 0; i < n; ++i ){

            j = i * 3;

            var fiber = this.fiberList[ i ]

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var helixorient = new NGL.Helixorient( fiber );

            if( what[ "position" ] ){

                var position = helixorient.getPosition();

                bufferData[ "position" ] = position.center;

                this.bufferList[ j + 1 ].setAttributes( {
                    "position": position.center,
                    "vector": position.axis,
                } );
                this.bufferList[ j + 2 ].setAttributes( {
                    "position": position.center,
                    "vector": position.redir,
                } );

            }

            this.bufferList[ j ].setAttributes( bufferData );

        };

    }

} );


NGL.RocketRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.RocketRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.RocketRepresentation,

    type: "rocket",

    parameters: Object.assign( {

        localAngle: {
            type: "integer", max: 180, min: 0, rebuild: true
        },
        centerDist: {
            type: "number", precision: 1, max: 10, min: 0, rebuild: true
        },
        ssBorder: {
            type: "boolean", rebuild: true
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.color = params.color || "ss";
        params.radius = params.radius || 1.5;
        params.scale = params.scale || 1.0;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.radiusSegments = 20;
        }else{
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.localAngle = params.localAngle || 30;
        this.centerDist = params.centerDist || 2.5;
        this.ssBorder = params.ssBorder === undefined ? false : params.ssBorder;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var opacity = this.transparent ? this.opacity : 1.0;

        var scope = this;

        var length = 0;
        var axisList = [];
        this.helixbundleList = [];

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 || fiber.isNucleic() ) return;

            var helixbundle = new NGL.Helixbundle( fiber );
            var axis = helixbundle.getAxis(
                scope.localAngle, scope.centerDist, scope.ssBorder,
                scope.color, scope.radius, scope.scale
            );

            length += axis.size.length;
            axisList.push( axis );
            scope.helixbundleList.push( helixbundle );

        }, this.selection );

        this.axisData = {
            begin: new Float32Array( length * 3 ),
            end: new Float32Array( length * 3 ),
            size: new Float32Array( length ),
            color: new Float32Array( length * 3 ),
            pickingColor: new Float32Array( length * 3 ),
        };

        var ad = this.axisData;
        var offset = 0;

        axisList.forEach( function( axis ){

            ad.begin.set( axis.begin, offset * 3 );
            ad.end.set( axis.end, offset * 3 );
            ad.size.set( axis.size, offset );
            ad.color.set( axis.color, offset * 3 );
            ad.pickingColor.set( axis.pickingColor, offset * 3 );

            offset += axis.size.length;

        } );

        this.cylinderBuffer = new NGL.CylinderBuffer(
            ad.begin,
            ad.end,
            ad.color,
            ad.color,
            ad.size,
            null,
            true,
            ad.pickingColor,
            ad.pickingColor,
            this.radiusSegments,
            this.disableImpostor,
            this.transparent,
            this.side,
            opacity
        );

        this.bufferList = [ this.cylinderBuffer ];

    },

    update: function( what ){

        what = what || {};

        var scope = this;

        var cylinderData = {};

        if( what[ "position" ] ){

            this.rebuild();
            return;

        }

        if( what[ "color" ] || what[ "radius" ] || what[ "scale" ] ){

            var offset = 0;
            var ad = this.axisData;

            this.helixbundleList.forEach( function( helixbundle ){

                var axis = helixbundle.getAxis(
                    scope.localAngle, scope.centerDist, scope.ssBorder,
                    scope.color, scope.radius, scope.scale
                );

                if( what[ "color" ] ){
                    ad.color.set( axis.color, offset * 3 );
                }

                if( what[ "radius" ] || what[ "scale" ] ){
                    ad.size.set( axis.size, offset );
                }

                offset += axis.size.length;

            } );

            if( what[ "color" ] ){
                cylinderData[ "color" ] = ad.color;
                cylinderData[ "color2" ] = ad.color;
            }

            if( what[ "radius" ] || what[ "scale" ] ){
                cylinderData[ "radius" ] = ad.size;
            }

        }

        this.cylinderBuffer.setAttributes( cylinderData );

    }

} );


NGL.RopeRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.RopeRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.RopeRepresentation,

    type: "rope",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        radialSegments: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean", rebuild: true
        },
        wireframe: {
            type: "boolean", rebuild: true
        },
        smooth: {
            type: "integer", max: 15, min: 0, rebuild: true
        }

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.color = p.color || "ss";
        p.radius = p.radius || this.defaultSize;

        if( p.quality === "low" ){
            this.subdiv = 3;
            this.radialSegments = 5;
        }else if( p.quality === "medium" ){
            this.subdiv = 6;
            this.radialSegments = 10;
        }else if( p.quality === "high" ){
            this.subdiv = 12;
            this.radialSegments = 20;
        }else{
            this.subdiv = p.subdiv || 6;
            this.radialSegments = p.radialSegments || 10;
        }

        this.tension = p.tension || 0.5;
        this.capped = p.capped || true;
        this.wireframe = p.wireframe || false;
        this.smooth = p.smooth === undefined ? 2 : p.smooth;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        var opacity = this.transparent ? this.opacity : 1.0;

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 || fiber.isNucleic() ) return;

            var helixorient = new NGL.Helixorient( fiber );

            var spline = new NGL.Spline( helixorient.getFiber( scope.smooth, true ) );
            var subPos = spline.getSubdividedPosition( scope.subdiv, scope.tension );
            var subOri = spline.getSubdividedOrientation( scope.subdiv, scope.tension );
            var subCol = spline.getSubdividedColor( scope.subdiv, scope.color );
            var subSize = spline.getSubdividedSize(
                scope.subdiv, scope.radius, scope.scale
            );

            var rx = 1.0;
            var ry = 1.0;

            scope.bufferList.push(

                new NGL.TubeMeshBuffer(
                    subPos.position,
                    subOri.normal,
                    subOri.binormal,
                    subOri.tangent,
                    subCol.color,
                    subSize.size,
                    scope.radialSegments,
                    subCol.pickingColor,
                    rx,
                    ry,
                    scope.capped,
                    scope.wireframe,
                    scope.transparent,
                    parseInt( scope.side ),
                    opacity
                )

            );

            scope.fiberList.push( fiber );

        }, this.selection );

    },

    update: function( what ){

        what = what || {};

        var i = 0;
        var n = this.fiberList.length;

        for( i = 0; i < n; ++i ){

            var fiber = this.fiberList[ i ]

            if( fiber.residueCount < 4 ) return;

            var bufferData = {};
            var helixorient = new NGL.Helixorient( fiber );
            var spline = new NGL.Spline( helixorient.getFiber( this.smooth, true ) );

            if( what[ "position" ] || what[ "radius" ] || what[ "scale" ] ){

                var subPos = spline.getSubdividedPosition(
                    this.subdiv, this.tension
                );
                var subOri = spline.getSubdividedOrientation(
                    this.subdiv, this.tension
                );
                var subSize = spline.getSubdividedSize(
                    this.subdiv, this.radius, this.scale
                );

                bufferData[ "position" ] = subPos.position;
                bufferData[ "normal" ] = subOri.normal;
                bufferData[ "binormal" ] = subOri.binormal;
                bufferData[ "tangent" ] = subOri.tangent;
                bufferData[ "size" ] = subSize.size;

            }

            if( what[ "color" ] ){

                var subCol = spline.getSubdividedColor(
                    this.subdiv, this.color
                );

                bufferData[ "color" ] = subCol.color;
                bufferData[ "pickingColor" ] = subCol.pickingColor;

            }

            this.bufferList[ i ].setAttributes( bufferData );

        };

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "radius" ] = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.CrossingRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.CrossingRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.CrossingRepresentation,

    type: "crossing",

    parameters: Object.assign( {

        localAngle: {
            type: "integer", max: 180, min: 0, rebuild: true
        },
        centerDist: {
            type: "number", precision: 1, max: 10, min: 0, rebuild: true
        },
        ssBorder: {
            type: "boolean", rebuild: true
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5, rebuild: true
        },
        helixDist: {
            type: "number", precision: 1, max: 30, min: 0, rebuild: true
        },
        displayLabel: {
            type: "boolean", rebuild: true
        },
        download: {
            type: "button", methodName: "download"
        },

    }, NGL.StructureRepresentation.prototype.parameters ),

    init: function( params ){

        params = params || {};
        params.color = params.color || "ss";
        params.radius = params.radius || 0.7;
        params.scale = params.scale || 1.0;

        this.disableImpostor = params.disableImpostor || false;

        if( params.quality === "low" ){
            this.radiusSegments = 5;
        }else if( params.quality === "medium" ){
            this.radiusSegments = 10;
        }else if( params.quality === "high" ){
            this.radiusSegments = 20;
        }else{
            this.radiusSegments = params.radiusSegments || 10;
        }

        this.localAngle = params.localAngle || 30;
        this.centerDist = params.centerDist || 2.5;
        this.ssBorder = params.ssBorder === undefined ? false : params.ssBorder;
        this.helixDist = params.helixDist || 12;
        this.displayLabel = params.displayLabel === undefined ? true : params.displayLabel;

        NGL.StructureRepresentation.prototype.init.call( this, params );

    },

    create: function(){

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;

        this.bufferList = [];
        this.fiberList = [];
        this.centerList = [];
        this.helixList = [];

        // TODO reduce buffer count as in e.g. rocket repr

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 || fiber.isNucleic() ) return;

            var helixbundle = new NGL.Helixbundle( fiber );
            var axis = helixbundle.getAxis(
                scope.localAngle, scope.centerDist, scope.ssBorder,
                scope.color, scope.radius, scope.scale
            );

            scope.bufferList.push(

                new NGL.CylinderBuffer(
                    axis.begin,
                    axis.end,
                    axis.color,
                    axis.color,
                    axis.size,
                    null,
                    true,
                    axis.pickingColor,
                    axis.pickingColor,
                    scope.radiusSegments,
                    scope.disableImpostor,
                    scope.transparent,
                    scope.side,
                    opacity
                )

            );

            scope.fiberList.push( fiber );

            scope.centerList.push( new Float32Array( axis.begin.length ) );

            for( var i = 0; i < axis.residue.length; ++i ){

                var helix = new NGL.Helix();
                helix.fromHelixbundleAxis( axis, i );
                scope.helixList.push( helix );

            }

        }, this.selection );

        //

        var helixCrossing = new NGL.HelixCrossing( this.helixList );
        var crossing = helixCrossing.getCrossing( this.helixDist );

        this.crossing = crossing;

        var n = crossing.end.length / 3;

        this.bufferList.push(

            new NGL.CylinderBuffer(
                new Float32Array( crossing.begin ),
                new Float32Array( crossing.end ),
                NGL.Utils.uniformArray3( n, 0.2, 0.2, 0.9 ),
                NGL.Utils.uniformArray3( n, 0.2, 0.2, 0.9 ),
                NGL.Utils.uniformArray( n, 0.1 ),
                null,
                true,
                NGL.Utils.uniformArray3( n, 0, 0, 0 ),
                NGL.Utils.uniformArray3( n, 0, 0, 0 ),
                this.radiusSegments,
                this.disableImpostor,
                this.transparent,
                this.side,
                opacity
            )

        );

        if( this.displayLabel ){

            var m = crossing.helixLabel.length;

            this.bufferList.push(

                new NGL.TextBuffer(
                    crossing.helixCenter,
                    NGL.Utils.uniformArray( m, 2.5 ),
                    NGL.Utils.uniformArray3( m, 1.0, 1.0, 1.0 ),
                    crossing.helixLabel
                )

            );

        }

    },

    update: function( what ){

        this.rebuild();

    },

    download: function(){

        var json = JSON.stringify( this.crossing.info, null, '\t' );

        NGL.download(
            new Blob( [ json ], {type : 'text/plain'} ),
            "helixCrossing.json"
        );

    }

} );


//////////////////////////////
// Trajectory representation

NGL.TrajectoryRepresentation = function( trajectory, viewer, params ){

    this.manualAttach = true;

    this.trajectory = trajectory;

    NGL.StructureRepresentation.call(
        this, trajectory.structure, viewer, params
    );

};

NGL.TrajectoryRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    constructor: NGL.TrajectoryRepresentation,

    type: "",

    parameters: Object.assign( {

        drawLine: {
            type: "boolean", rebuild: true
        },
        drawCylinder: {
            type: "boolean", rebuild: true
        },
        drawPoint: {
            type: "boolean", rebuild: true
        },
        drawSphere: {
            type: "boolean", rebuild: true
        },

        lineWidth: {
            type: "integer", max: 20, min: 1, rebuild: true
        },
        pointSize: {
            type: "integer", max: 20, min: 1, rebuild: true
        },
        sizeAttenuation: {
            type: "boolean", rebuild: true
        },
        sort: {
            type: "boolean", rebuild: true
        },
        transparent: {
            type: "boolean", rebuild: true
        },
        side: {
            type: "select", options: NGL.SideTypes, rebuild: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0,
            // FIXME should be uniform but currently incompatible
            // with the underlying Material
            rebuild: true
        },

    }, NGL.Representation.prototype.parameters ),

    init: function( params ){

        var p = params || {};

        p.color = p.color || 0xDDDDDD;

        this.drawLine = p.drawLine || true;
        this.drawCylinder = p.drawCylinder || false;
        this.drawPoint = p.drawPoint || false;
        this.drawSphere = p.drawSphere || false;

        this.lineWidth = p.lineWidth || 1;
        this.pointSize = p.pointSize || 1;
        this.sizeAttenuation = p.sizeAttenuation !== undefined ? p.sizeAttenuation : false;
        this.sort = p.sort !== undefined ? p.sort : true;
        p.transparent = p.transparent !== undefined ? p.transparent : true;
        p.side = p.side !== undefined ? p.side : THREE.DoubleSide;
        p.opacity = p.opacity !== undefined ? p.opacity : 0.6;

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    attach: function(){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );

        }, this );

        this.setVisibility( this.visible );

    },

    create: function(){

        // console.log( this.selection )
        // console.log( this.atomSet )

        this.bufferList = [];

        if( !this.atomSet.atoms.length ) return;

        var scope = this;

        var opacity = this.transparent ? this.opacity : 1.0;
        var index = this.atomSet.atoms[ 0 ].index;

        this.trajectory.getPath( index, function( path ){

            var n = path.length / 3;
            var tc = new THREE.Color( scope.color );

            if( scope.drawSphere ){

                var sphereBuffer = new NGL.SphereBuffer(
                    path,
                    NGL.Utils.uniformArray3( n, tc.r, tc.g, tc.b ),
                    NGL.Utils.uniformArray( n, 0.2 ),
                    NGL.Utils.uniformArray3( n, tc.r, tc.g, tc.b ),
                    scope.sphereDetail,
                    scope.disableImpostor,
                    scope.transparent,
                    scope.side,
                    opacity
                );

                scope.bufferList.push( sphereBuffer );

            }

            if( scope.drawCylinder ){

                var cylinderBuffer = new NGL.CylinderBuffer(
                    path.subarray( 0, -3 ),
                    path.subarray( 3 ),
                    NGL.Utils.uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    NGL.Utils.uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    NGL.Utils.uniformArray( n, 0.05 ),
                    null,
                    true,
                    NGL.Utils.uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    NGL.Utils.uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    scope.radiusSegments,
                    scope.disableImpostor,
                    scope.transparent,
                    scope.side,
                    opacity

                );

                scope.bufferList.push( cylinderBuffer );

            }

            if( scope.drawPoint ){

                var pointBuffer = new NGL.PointBuffer(
                    path,
                    NGL.Utils.uniformArray3( n, tc.r, tc.g, tc.b ),
                    scope.pointSize,
                    scope.sizeAttenuation,
                    scope.sort,
                    scope.transparent,
                    opacity
                );

                scope.bufferList.push( pointBuffer );

            }

            if( scope.drawLine ){

                var lineBuffer = new NGL.LineBuffer(
                    path.subarray( 0, -3 ),
                    path.subarray( 3 ),
                    NGL.Utils.uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    NGL.Utils.uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    scope.lineWidth,
                    scope.transparent,
                    opacity
                );

                scope.bufferList.push( lineBuffer );

            }

            scope.attach();

        } );

    }

} );


///////////////////////////
// Surface representation

NGL.SurfaceRepresentation = function( surface, viewer, params ){

    NGL.Representation.call( this, surface, viewer, params );

    this.surface = surface;

    this.create();
    this.attach();

};

NGL.SurfaceRepresentation.prototype = NGL.createObject(

    NGL.Representation.prototype, {

    constructor: NGL.SurfaceRepresentation,

    type: "",

    parameters: Object.assign( {

        wireframe: {
            type: "boolean", rebuild: true
        },
        background: {
            type: "boolean", rebuild: true
        },
        transparent: {
            type: "boolean", rebuild: true
        },
        side: {
            type: "select", options: NGL.SideTypes, rebuild: true
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0, uniform: true
        }

    }, NGL.Representation.prototype.parameters ),

    init: function( params ){

        var p = params || {};

        this.color = p.color || 0xDDDDDD;
        this.background = p.background || false;
        this.wireframe = p.wireframe || false;
        this.transparent = p.transparent !== undefined ? p.transparent : false;
        this.side = p.side !== undefined ? p.side : THREE.DoubleSide;
        this.opacity = p.opacity !== undefined ? p.opacity : 1.0;

        NGL.Representation.prototype.init.call( this, p );

    },

    attach: function(){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer, undefined, this.background );

        }, this );

        this.setVisibility( this.visible );

    },

    create: function(){

        var geo;

        var object = this.surface.object;

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

        var position, color, index, normal;

        if( geo instanceof THREE.BufferGeometry ){

            var an = geo.attributes.normal.array;

            // assume there are no normals if the first is zero
            if( an[ 0 ] === 0 && an[ 1 ] === 0 && an[ 2 ] === 0 ){
                geo.computeVertexNormals();
            }

            position = geo.attributes.position.array;
            index = null;
            normal = geo.attributes.normal.array;

        }else{

            // FIXME
            console.log( "TODO non BufferGeometry surface" );

            position = NGL.Utils.positionFromGeometry( geo );
            index = NGL.Utils.indexFromGeometry( geo );
            normal = NGL.Utils.normalFromGeometry( geo );

        }

        var n = position.length / 3;
        var tc = new THREE.Color( this.color );
        color = NGL.Utils.uniformArray3(
            n, tc.r, tc.g, tc.b
        );

        var opacity = this.transparent ? this.opacity : 1.0;

        if( this.transparent && parseInt( this.side ) === THREE.DoubleSide ){

            var frontBuffer = new NGL.SurfaceBuffer(
                position, color, index, normal, undefined, this.wireframe,
                this.transparent, THREE.FrontSide, opacity, this.nearClip
            );

            var backBuffer = new NGL.SurfaceBuffer(
                position, color, index, normal, undefined, this.wireframe,
                this.transparent, THREE.BackSide, opacity, this.nearClip
            );

            this.bufferList = [ frontBuffer, backBuffer ];

        }else{

            this.surfaceBuffer = new NGL.SurfaceBuffer(
                position, color, index, normal, undefined, this.wireframe,
                this.transparent, parseInt( this.side ), opacity, this.nearClip
            );

            this.bufferList = [ this.surfaceBuffer ];

        }

    }

} );


/////////////////////////
// Representation types

NGL.representationTypes = {};

for( var key in NGL ){

    if( NGL[ key ].prototype instanceof NGL.StructureRepresentation ){

        NGL.representationTypes[ NGL[ key ].prototype.type ] = NGL[ key ];

    }

}

// File:js/ngl/stage.js

/**
 * @file Stage
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


//////////
// Stage

NGL.Stage = function( eid ){

    var SIGNALS = signals;

    this.signals = {

        themeChanged: new SIGNALS.Signal(),

        componentAdded: new SIGNALS.Signal(),
        componentRemoved: new SIGNALS.Signal(),

        atomPicked: new SIGNALS.Signal(),

        requestTheme: new SIGNALS.Signal(),

        windowResize: new SIGNALS.Signal()

    };

    this.compList = [];

    this.preferences =  new NGL.Preferences( this );

    this.viewer = new NGL.Viewer( eid );

    this.preferences.setTheme();

    this.initFileDragDrop();

    this.viewer.animate();

    this.pickingControls = new NGL.PickingControls( this.viewer, this );

}

NGL.Stage.prototype = {

    constructor: NGL.Stage,

    defaultFileRepresentation: function( object ){

        if( object instanceof NGL.StructureComponent ){

            if( object.structure.atomCount > 100000 ){

                object.addRepresentation( "line" );
                object.centerView( undefined, true );

            }else{

                object.addRepresentation( "cartoon", { sele: "*" } );
                object.addRepresentation( "licorice", { sele: "hetero" } );
                object.centerView( undefined, true );

            }

            // add frames as trajectory
            if( object.structure.frames ) object.addTrajectory();

        }else if( object instanceof NGL.SurfaceComponent ){

            object.addRepresentation();
            object.centerView();

        }else if( object instanceof NGL.ScriptComponent ){

            object.run();

        }

    },

    initFileDragDrop: function(){

        this.viewer.container.addEventListener( 'dragover', function( e ){

            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';

        }, false );

        this.viewer.container.addEventListener( 'drop', function( e ){

            e.stopPropagation();
            e.preventDefault();

            var fileList = e.dataTransfer.files;
            var n = fileList.length;

            for( var i=0; i<n; ++i ){

                this.loadFile( fileList[ i ] );

            }

        }.bind( this ), false );

    },

    loadFile: function( path, onLoad, params, onError, loadParams ){

        var component;
        var scope = this;

        function load( object ){

            // check for placeholder component
            if( component ){

                scope.removeComponent( component );

            }

            if( object instanceof NGL.Structure ){

                component = new NGL.StructureComponent( scope, object, params );

            }else if( object instanceof NGL.Surface ){

                component = new NGL.SurfaceComponent( scope, object, params );

            }else if( object instanceof NGL.Script ){

                component = new NGL.ScriptComponent( scope, object, params );

            }else{

                console.warn( "NGL.Stage.loadFile: object type unknown", object );
                return;

            }

            scope.addComponent( component );

            if( typeof onLoad === "function" ){

                onLoad( component );

            }else{

                scope.defaultFileRepresentation( component );

            }

        }

        var _e;

        function error( e ){

            _e = e;

            if( component ) component.setStatus( e );

            if( typeof onError === "function" ) onError( e );

        }

        NGL.autoLoad( path, load, undefined, error, loadParams );

        // ensure that component isn't ready yet
        if( !component ){

            component = new NGL.Component( this, params );
            var path2 = ( path instanceof File ) ? path.name : path;
            component.name = path2.replace( /^.*[\\\/]/, '' );

            this.addComponent( component );

        }

        // set error status when already known
        if( _e ) component.setStatus( _e );

    },

    addComponent: function( component ){

        if( !component ){

            console.warn( "NGL.Stage.addComponent: no component given" );
            return;

        }

        this.compList.push( component );

        this.signals.componentAdded.dispatch( component );

    },

    removeComponent: function( component ){

        var idx = this.compList.indexOf( component );

        if( idx !== -1 ){

            this.compList.splice( idx, 1 );

        }

        component.dispose();

        this.signals.componentRemoved.dispatch( component );

    },

    centerView: function(){

        this.viewer.centerView( undefined, true );

    },

    setTheme: function( value ){

        var viewerBackground;

        if( value === "light" ){
            viewerBackground = "white";
        }else{
            viewerBackground = "black";
        }

        this.signals.requestTheme.dispatch( value );
        this.viewer.setBackground( viewerBackground );

    },

    eachComponent: function( callback, type ){

        this.compList.forEach( function( o, i ){

            if( !type || o instanceof type ){

                callback( o, i );

            }

        } );

    },

    eachRepresentation: function( callback, componentType ){

        this.eachComponent( function( o ){

            o.reprList.forEach( function( repr ){

                callback( repr, o );

            } );

        }, componentType );

    }

}


////////////
// Picking

NGL.PickingControls = function( viewer, stage ){

    var gl = viewer.renderer.getContext();
    var pixelBuffer = new Uint8Array( 4 );

    var mouse = {

        position: new THREE.Vector2(),
        down: new THREE.Vector2(),
        moving: false,
        distance: function(){
            return mouse.position.distanceTo( mouse.down );
        }

    };

    viewer.renderer.domElement.addEventListener( 'mousemove', function( e ){

        e.preventDefault();
        // e.stopPropagation();

        mouse.moving = true;
        mouse.position.x = e.layerX;
        mouse.position.y = e.layerY;

    } );

    viewer.renderer.domElement.addEventListener( 'mousedown', function( e ){

        e.preventDefault();
        // e.stopPropagation();

        mouse.moving = false;
        mouse.down.x = e.layerX;
        mouse.down.y = e.layerY;

    } );

    viewer.renderer.domElement.addEventListener( 'mouseup', function( e ){

        e.preventDefault();
        // e.stopPropagation();

        if( mouse.distance() > 3 || e.which === NGL.RightMouseButton ) return;

        viewer.render( null, true );

        var box = viewer.renderer.domElement.getBoundingClientRect();

        var offsetX = e.clientX - box.left;
        var offsetY = e.clientY - box.top;

        gl.readPixels(
            offsetX * window.devicePixelRatio,
            (box.height - offsetY) * window.devicePixelRatio,
            1, 1,
            gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer
        );

        var rgba = Array.apply( [], pixelBuffer );

        var id =
            ( pixelBuffer[0] << 16 ) |
            ( pixelBuffer[1] << 8 ) |
            ( pixelBuffer[2] );

        // TODO early exit, binary search
        var pickedAtom = undefined;
        stage.eachComponent( function( o ){

            o.structure.eachAtom( function( a ){

                if( a.globalindex === ( id - 1 ) ){
                    pickedAtom = a;
                }

            } );

        }, NGL.StructureComponent );

        stage.signals.atomPicked.dispatch( pickedAtom );

        if( NGL.debug ){

            console.log(
                "picked color",
                [
                    ( rgba[0]/255 ).toPrecision(2),
                    ( rgba[1]/255 ).toPrecision(2),
                    ( rgba[2]/255 ).toPrecision(2),
                    ( rgba[3]/255 ).toPrecision(2)
                ]
            );
            console.log( "picked id", id );
            console.log(
                "picked position",
                offsetX, box.height - offsetY
            );
            console.log( "devicePixelRatio", window.devicePixelRatio );

        }else{

            viewer.requestRender();

        }

        if( pickedAtom && e.which === NGL.MiddleMouseButton ){

            viewer.centerView( pickedAtom );

        }

    } );

};


////////////////
// Preferences

NGL.Preferences = function( stage, id ){

    this.id = id || "ngl-stage";

    this.stage = stage;

    this.storage = {

        impostor: true,
        quality: "medium",
        theme: "dark",

    };

    if ( window.localStorage[ this.id ] === undefined ) {

        window.localStorage[ this.id ] = JSON.stringify( this.storage );

    } else {

        var data = JSON.parse( window.localStorage[ this.id ] );

        for ( var key in data ) {

            this.storage[ key ] = data[ key ];

        }

    }

};

NGL.Preferences.prototype = {

    constructor: NGL.Preferences,

    setImpostor: function( value ) {

        if( value !== undefined ){
            this.setKey( "impostor", value );
        }else{
            value = this.getKey( "impostor" );
        }

        var types = [
            "spacefill", "ball+stick", "licorice", "hyperball",
            "backbone", "rocket", "crossing"
        ];

        this.stage.eachRepresentation( function( repr ){

            if( types.indexOf( repr.getType() ) === -1 ){
                return;
            }

            var p = repr.getParameters();
            p.disableImpostor = !value;
            repr.rebuild( p );

        }, NGL.StructureComponent );

    },

    setQuality: function( value ) {

        if( value !== undefined ){
            this.setKey( "quality", value );
        }else{
            value = this.getKey( "quality" );
        }

        var types = [
            "tube", "cartoon", "ribbon", "trace", "rope"
        ];

        var impostorTypes = [
            "spacefill", "ball+stick", "licorice", "hyperball",
            "backbone", "rocket", "crossing"
        ];

        this.stage.eachRepresentation( function( repr ){

            var p = repr.getParameters();

            if( types.indexOf( repr.getType() ) === -1 ){

                if( impostorTypes.indexOf( repr.getType() ) === -1 ){
                    return;
                }

                if( NGL.extensionFragDepth && !p.disableImpostor ){
                    repr.repr.quality = value;
                    return;
                }

            }

            p.quality = value;
            repr.rebuild( p );

        }, NGL.StructureComponent );

    },

    setTheme: function( value ) {

        if( value !== undefined ){
            this.setKey( "theme", value );
        }else{
            value = this.getKey( "theme" );
        }

        this.stage.setTheme( value );

    },

    getKey: function( key ){

        return this.storage[ key ];

    },

    setKey: function( key, value ){

        this.storage[ key ] = value;

        window.localStorage[ this.id ] = JSON.stringify( this.storage );

    },

    clear: function(){

        delete window.localStorage[ this.id ];

    }

};


//////////////
// Component

NGL.Component = function( stage, params ){

    params = params || {};

    if( params.name !== undefined ){
        this.name = params.name;
    }
    this.id = params.id;
    this.tags = params.tags || [];
    this.visible = params.visible !== undefined ? params.visible : true;

    this.signals = NGL.makeObjectSignals( this );

    this.stage = stage;
    this.viewer = stage.viewer;

    this.reprList = [];

}

NGL.Component.prototype = {

    constructor: NGL.Component,

    type: "component",

    signals: {

        representationAdded: null,
        representationRemoved: null,
        visibilityChanged: null,
        requestGuiVisibility: null,

        statusChanged: null,
        disposed: null,

    },

    addRepresentation: function( repr ){

        this.reprList.push( repr );

        this.signals.representationAdded.dispatch( repr );

        return this;

    },

    removeRepresentation: function( repr ){

        var idx = this.reprList.indexOf( repr );

        if( idx !== -1 ){

            this.reprList.splice( idx, 1 );

        }

        this.signals.representationRemoved.dispatch( repr );

    },

    updateRepresentations: function( what ){

        this.reprList.forEach( function( repr ){

            repr.update( what );

        } );

        this.stage.viewer.requestRender();

    },

    dispose: function(){

        // copy via .slice because side effects may change reprList
        this.reprList.slice().forEach( function( repr ){

            repr.dispose();

        } );

        delete this.reprList;

        this.signals.disposed.dispatch();

    },

    setVisibility: function( value ){

        this.visible = value;

        this.eachRepresentation( function( repr ){

            repr.updateVisibility();

        } );

        this.signals.visibilityChanged.dispatch( value );

        return this;

    },

    setStatus: function( value ){

        this.status = value;
        this.signals.statusChanged.dispatch( value );

        return this;

    },

    getCenter: function(){

        // console.warn( "not implemented" )

    },

    requestGuiVisibility: function( value ){

        this.signals.requestGuiVisibility.dispatch( value );

        return this;

    },

    eachRepresentation: function( callback ){

        this.reprList.forEach( callback );

    }

};

NGL.ObjectMetadata.prototype.apply( NGL.Component.prototype );


NGL.StructureComponent = function( stage, structure, params ){

    params = params || {};

    this.__structure = structure;
    this.structure = structure;
    this.name = structure.name;  // may get overwritten by params.name

    NGL.Component.call( this, stage, params );

    this.trajList = [];
    this.initSelection( params.sele );

};

NGL.StructureComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    constructor: NGL.StructureComponent,

    type: "structure",

    signals: Object.assign( {

        "trajectoryAdded": null,
        "trajectoryRemoved": null

    }, NGL.Component.prototype.signals ),

    initSelection: function( string ){

        this.selection = new NGL.Selection( string );

        this.selection.signals.stringChanged.add( function( string ){

            this.applySelection();

            this.rebuildRepresentations( true );
            this.rebuildTrajectories();

        }, this );

        this.applySelection();

    },

    applySelection: function(){

        if( this.selection.string ){

            this.structure = new NGL.StructureSubset(
                this.__structure, this.selection.string
            );

        }else{

            this.structure = this.__structure;

        }

    },

    setSelection: function( string ){

        this.selection.setString( string );

        return this;

    },

    rebuildRepresentations: function( setStructure ){

        this.reprList.forEach( function( repr ){

            if( setStructure ){
                repr.setStructure( this.structure );
            }

            repr.rebuild( repr.getParameters() );

        }, this );

    },

    rebuildTrajectories: function(){

        this.trajList.slice( 0 ).forEach( function( trajComp ){

            trajComp.trajectory.setStructure( this.structure );

        }, this );

    },

    addRepresentation: function( type, params, returnRepr ){

        var pref = this.stage.preferences;
        params = params || {};
        params.quality = params.quality || pref.getKey( "quality" );
        params.disableImpostor = params.disableImpostor !== undefined ? params.disableImpostor : !pref.getKey( "impostor" );

        var repr = NGL.makeRepresentation(
            type, this.structure, this.viewer, params
        );

        var reprComp = new NGL.RepresentationComponent(
            this.stage, repr, params, this
        );

        NGL.Component.prototype.addRepresentation.call( this, reprComp );

        return returnRepr ? reprComp : this;

    },

    addTrajectory: function( trajPath, sele, i ){

        var params = { "i": i };

        var traj = NGL.makeTrajectory(
            trajPath, this.structure, sele
        );

        traj.signals.frameChanged.add( function( value ){

            this.updateRepresentations( { "position": true } );

        }, this );

        var trajComp = new NGL.TrajectoryComponent(
            this.stage, traj, params, this
        );

        this.trajList.push( trajComp );

        this.signals.trajectoryAdded.dispatch( trajComp );

        return trajComp;

    },

    removeTrajectory: function( traj ){

        var idx = this.trajList.indexOf( traj );

        if( idx !== -1 ){

            this.trajList.splice( idx, 1 );

        }

        traj.dispose();

        this.signals.trajectoryRemoved.dispatch( traj );

    },

    dispose: function(){

        // copy via .slice because side effects may change trajList
        this.trajList.slice().forEach( function( traj ){

            traj.dispose();

        } );

        this.trajList = [];

        NGL.Component.prototype.dispose.call( this );

    },

    centerView: function( sele, zoom ){

        var center;

        if( sele ){

            var selection = new NGL.Selection( sele );

            center = this.structure.atomCenter( selection );

            if( zoom ){
                var bb = this.structure.getBoundingBox( selection );
                zoom = bb.size().length();
            }

        }else{

            center = this.structure.center;

            if( zoom ){
                zoom = this.structure.boundingBox.size().length();
            }

        }

        this.viewer.centerView( center, zoom );

        return this;

    },

    getCenter: function(){

        return this.structure.center;

    },

    superpose: function( component, align, sele1, sele2, xsele1, xsele2 ){

        NGL.superpose(
            this.structure, component.structure,
            align, sele1, sele2, xsele1, xsele2
        );


        // FIXME there should be a better way
        if( this.structure !== this.__structure ){

            NGL.superpose(
                this.__structure, component.structure,
                align, sele1, sele2, xsele1, xsele2
            );

        }

        this.updateRepresentations( { "position": true } );

        return this;

    },

    setVisibility: function( value ){

        NGL.Component.prototype.setVisibility.call( this, value );

        this.trajList.forEach( function( traj ){

            traj.setVisibility( value );

        } );

        return this;

    },

} );


NGL.SurfaceComponent = function( stage, surface, params ){

    this.surface = surface;
    this.name = surface.name;

    NGL.Component.call( this, stage, params );

};

NGL.SurfaceComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    constructor: NGL.SurfaceComponent,

    type: "surface",

    addRepresentation: function( type, params ){

        var repr = NGL.makeRepresentation(
            type, this.surface, this.viewer, params
        );

        var reprComp = new NGL.RepresentationComponent(
            this.stage, repr, {}, this
        );

        return NGL.Component.prototype.addRepresentation.call( this, reprComp );

    },

    centerView: function(){

        this.viewer.centerView();

    },

} );


NGL.TrajectoryComponent = function( stage, trajectory, params, parent ){

    params = params || {}

    this.trajectory = trajectory;
    this.name = trajectory.name;
    this.parent = parent;

    this.status = "loaded";

    NGL.Component.call( this, stage, params );

    // signals

    trajectory.signals.frameChanged.add( function( i ){

        this.signals.frameChanged.dispatch( i );

    }, this );

    trajectory.signals.playerChanged.add( function( player ){

        this.signals.playerChanged.dispatch( player );

    }, this );

    trajectory.signals.gotNumframes.add( function( n ){

        this.signals.gotNumframes.dispatch( n );

    }, this );

    //

    if( params.i !== undefined ){

        this.setFrame( params.i );

    }

};

NGL.TrajectoryComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    constructor: NGL.TrajectoryComponent,

    type: "trajectory",

    signals: Object.assign( {

        "frameChanged": null,
        "playerChanged": null,
        "gotNumframes": null,
        "parametersChanged": null

    }, NGL.Component.prototype.signals ),

    addRepresentation: function( type, params ){

        params = params || {};

        var repr = NGL.makeRepresentation(
            type, this.trajectory, this.viewer, params
        );

        var reprComp = new NGL.RepresentationComponent(
            this.stage, repr, {}, this
        );

        return NGL.Component.prototype.addRepresentation.call( this, reprComp );

    },

    setFrame: function( i ){

        this.trajectory.setFrame( i );

    },

    setParameters: function( params ){

        this.trajectory.setParameters( params );
        this.signals.parametersChanged.dispatch( params );

        return this;

    },

    dispose: function(){

        this.trajectory.dispose();

        NGL.Component.prototype.dispose.call( this );

    },

    getCenter: function(){}

} );


NGL.ScriptComponent = function( stage, script, params ){

    this.script = script;
    this.name = script.name;

    this.status = "loaded";

    NGL.Component.call( this, stage, params );

    this.script.signals.nameChanged.add( function( value ){

        this.setName( value );

    }, this );

};

NGL.ScriptComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    constructor: NGL.ScriptComponent,

    type: "script",

    addRepresentation: function( type ){},

    removeRepresentation: function( repr ){},

    run: function(){

        var scope = this;

        this.setStatus( "running" );

        this.script.call( this.stage, function(){

            scope.setStatus( "finished" );

        } );

        this.setStatus( "called" );

    },

    dispose: function(){

        this.signals.disposed.dispatch();

    },

    setVisibility: function( value ){},

    getCenter: function(){}

} );


NGL.RepresentationComponent = function( stage, repr, params, parent ){

    this.name = repr.type;
    this.parent = parent;

    NGL.Component.call( this, stage, params );

    this.setRepresentation( repr );

};

NGL.RepresentationComponent.prototype = NGL.createObject(

    NGL.Component.prototype, {

    constructor: NGL.RepresentationComponent,

    type: "representation",

    signals: Object.assign( {

        "visibilityChanged": null,
        "colorChanged": null,
        "parametersChanged": null,

    }, NGL.Component.prototype.signals ),

    getType: function(){

        return this.repr.type;

    },

    setRepresentation: function( repr ){

        if( this.repr ){
            this.repr.dispose();
        }

        this.repr = repr;
        this.name = repr.type;

        this.updateVisibility();

    },

    addRepresentation: function( type ){},

    removeRepresentation: function( repr ){},

    dispose: function(){

        if( this.parent ){

            this.parent.removeRepresentation( this );

        }

        this.repr.dispose();

        this.signals.disposed.dispatch();

    },

    setVisibility: function( value ){

        this.visible = value;
        this.updateVisibility();
        this.signals.visibilityChanged.dispatch( this.visible );

        return this;

    },

    updateVisibility: function(){

        if( this.parent ){

            this.repr.setVisibility( this.parent.visible && this.visible );

        }else{

            this.repr.setVisibility( this.visible );

        }

    },

    update: function( what ){

        this.repr.update( what );

        return this;

    },

    rebuild: function( params ){

        this.repr.rebuild( params );

        return this;

    },

    setStructure: function( structure ){

        this.repr.setStructure( structure );

        return this;

    },

    setSelection: function( string ){

        this.repr.setSelection( string );

        return this;

    },

    setParameters: function( params ){

        this.repr.setParameters( params );
        this.signals.parametersChanged.dispatch();

        return this;

    },

    getParameters: function(){

        return this.repr.getParameters();

    },

    setColor: function( value ){

        this.repr.setColor( value );
        this.signals.colorChanged.dispatch( this.repr.color );

        return this;

    },

    getCenter: function(){}

} );

// File:js/ngl/example.js



NGL.Examples = {

    load: function( name, stage ){

        NGL.Examples.data[ name ]( stage );

    },

    add: function( examples ){

        Object.keys( examples ).forEach( function( name ){

            NGL.Examples.data[ name ] = examples[ name ];

        } );

    },

    data: {

        "trajectory": function( stage ){

            var params = {
                sele: "protein or na or cl",
                // sele: "349-352",
            };

            stage.loadFile( "data://md.gro", function( o ){

                o.addRepresentation( "line", { sele: "not hydrogen and sidechainAttached" } );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                // o.addRepresentation( "spacefill", { sele: "NA or CL" } );
                o.centerView();

                o.addTrajectory( "__example__/md.xtc" );

            }, params );

            stage.loadFile( "data://md.gro", function( o ){

                o.addRepresentation( "backbone", { sele: "protein", color: "ss" } );

            } );

        },

        "trr_trajectory": function( stage ){

            stage.loadFile( "data://md.gro", function( o ){

                o.addRepresentation( "line" );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                o.centerView();

                o.addTrajectory( "__example__/md.trr" );

            } );

        },

        "dcd_trajectory": function( stage ){

            stage.loadFile( "data://ala3.pdb", function( o ){

                o.addRepresentation( "licorice" );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                o.centerView();

                o.addTrajectory( "__example__/ala3.dcd" )
                    .setParameters( {
                        "centerPbc": false,
                        "removePbc": false,
                        "superpose": true
                    } );

            } );

        },

        "netcdf_trajectory": function( stage ){

            stage.loadFile( "data://DPDP.pdb", function( o ){

                o.addRepresentation( "licorice" );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                o.centerView();

                o.addTrajectory( "__example__/DPDP.nc" )
                    .setParameters( {
                        "centerPbc": false,
                        "removePbc": false,
                        "superpose": true
                    } );

            } );

        },

        "anim_trajectory": function( stage ){

            stage.loadFile( "data://md.gro", function( o ){

                o.addRepresentation( "line", { sele: "not hydrogen and protein" } );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                o.centerView();

                var traj = o.addTrajectory( "__example__/md.xtc" );

                var i = 0;
                var foo = setInterval(function(){

                    traj.setFrame( i++ % 51 );
                    if( i >= 102 ) clearInterval( foo );

                }, 100);

            } );

        },

        "3pqr": function( stage ){

            stage.loadFile( "data://3pqr.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "1-320", wireframe: false } );
                o.addRepresentation( "tube", { sele: "*", scale: 0.4 } );
                o.addRepresentation( "rope", { sele: "*" }, true )
                    .setParameters( { subdiv: 2 } );
                o.addRepresentation( "licorice", { sele: ".C or .CA or .O" } );

                // o.addRepresentation( "tube", {
                //     sele: "*", color: "atomindex", radius: "bfactor", scale: 0.01,
                //     subdiv: 50, radialSegments: 50, visible: true
                // } );
                // o.addRepresentation( "ball+stick", { sele: "135:A or 347:B or 223:A" } );
                // o.addRepresentation( "licorice", { sele: "hetero" } );
                // o.addRepresentation( "rope", { smooth: 2 } );

                o.centerView( "320" );

            } );

        },

        "1blu": function( stage ){

            stage.loadFile( "data://1blu.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                o.addRepresentation( "backbone", {
                    sele: "*", scale: 1.0, aspectRatio: 1.5,
                    color: new THREE.Color( "lightgreen" ).getHex()
                } );
                o.addRepresentation( "licorice", { sele: "*", scale: 1.0 } );
                o.centerView();

            } );

        },

        "multi_model": function( stage ){

            stage.loadFile( "data://1LVZ.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                // o.addRepresentation( "licorice", { sele: "*" } );
                o.centerView();

                o.addTrajectory();

            }, null, null, { asTrajectory: true } );
            // }, null, null, { firstModelOnly: true } );

            // stage.loadFile( "data://md_ascii_trj.gro", function( o ){
            stage.loadFile( "data://md_1u19_trj.gro", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                // o.addRepresentation( "licorice", { sele: "*" } );
                o.centerView();

                o.addTrajectory();

            }, null, null, { asTrajectory: true } );

        },

        "multi_struc": function( stage ){

            stage.loadFile( "data://1crn.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                o.addRepresentation( "ball+stick", { sele: "hetero" } );
                o.centerView();

            } );

            stage.loadFile( "data://3pqr.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                o.addRepresentation( "ball+stick", { sele: "hetero" } );
                o.centerView();

            } );

        },

        "superpose": function( stage ){

            stage.loadFile( "data://1u19.pdb", function( o1 ){

                var s = "1-320:A";

                o1.addRepresentation( "cartoon", { sele: s } );
                o1.addRepresentation( "ball+stick", { sele: s } );

                stage.loadFile( "data://3dqb.pdb", function( o2 ){

                    o2.addRepresentation( "cartoon", { sele: s } );
                    o2.addRepresentation( "licorice", { sele: s } );

                    o1.superpose( o2, false, s );
                    o1.centerView( ":A" );

                }, { sele: ":A" } );

            }, { sele: ":A" } );

        },

        "alignment": function( stage ){

            stage.loadFile( "data://3dqb.pdb", function( o1 ){

                o1.addRepresentation( "cartoon" );
                o1.addRepresentation( "ball+stick", { sele: "hetero" } );
                o1.centerView();

                stage.loadFile( "data://3sn6.pdb", function( o2 ){

                    o2.addRepresentation( "cartoon" );
                    o2.addRepresentation( "ball+stick", { sele: "hetero" } );

                    var s1 = o1.structure;
                    var s2 = o2.structure;

                    NGL.superpose( s1, s2, true );

                    o1.updateRepresentations();
                    o1.centerView();

                } );

            } );

        },

        "alignment2": function( stage ){

            stage.loadFile( "data://1gzm.pdb", function( o1 ){

                o1.addRepresentation( "cartoon" );
                o1.centerView();

                stage.loadFile( "data://1u19.pdb", function( o2 ){

                    o2.addRepresentation( "cartoon" );

                    var s1 = o1.structure;
                    var s2 = o2.structure;

                    NGL.superpose( s1, s2, true );

                    o1.updateRepresentations();
                    o1.centerView();

                } );

            } );

        },

        "pbc": function( stage ){

            stage.loadFile( "data://pbc.gro", function( o ){

                // FIXME pbc centering and removal for files other then trajectories

                /*var maxX = o.structure.box[ 0 ];
                var maxY = o.structure.box[ 1 ];
                var maxZ = o.structure.box[ 2 ];

                o.structure.eachAtom( function( a ){

                    a.x = ( a.x + maxX ) % maxX;
                    a.y = ( a.y + maxY ) % maxY;
                    a.z = ( a.z + maxZ ) % maxZ;

                } );*/

                o.addRepresentation( "cartoon", { sele: "backbone" } );
                o.addRepresentation( "spacefill", { sele: "backbone" } );
                o.addRepresentation( "line" );
                o.centerView();

            } );

        },

        "xtc_parts": function( stage ){

            stage.loadFile( "data://md_1u19.gro", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "line", {
                    sele: "not hydrogen and sidechainAttached"
                } );
                // o.addRepresentation( "ball+stick" );
                o.centerView();

                o.addTrajectory( "__example__/@md_1u19.xtc" );

            } );

        },

        "impostor": function( stage ){

            stage.loadFile( "data://1crn.pdb", function( o ){

                var _disableImpostor = NGL.disableImpostor;

                NGL.disableImpostor = true;
                //o.addRepresentation( "spacefill", { sele: ":A" } );
                o.addRepresentation( "ball+stick", { sele: "16" } );
                // NGL.disableImpostor = _disableImpostor;
                // o.addRepresentation( "spacefill", { sele: ":B" } );
                // o.addRepresentation( "ball+stick", { sele: ":B" } );

                stage.centerView();

            } );

        },

        "cg": function( stage ){

            stage.loadFile( "data://BaceCg.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "rope", { sele: "helix" } );
                o.addRepresentation( "ball+stick" );
                o.centerView();

            } );

        },

        "ribosome": function( stage ){

            stage.loadFile( "data://4UPY.pdb", function( o ){

                o.addRepresentation( "cartoon", { quality: "low" } );
                o.addRepresentation( "base" );
                stage.centerView();

            } );

            stage.loadFile( "data://4UPX.pdb", function( o ){

                o.addRepresentation( "cartoon", { quality: "low" } );
                o.addRepresentation( "base" );
                stage.centerView();

            } );

            stage.loadFile( "data://4UQ5.pdb", function( o ){

                o.addRepresentation( "cartoon", { quality: "low" } );
                o.addRepresentation( "base" );
                stage.centerView();

            } );

            stage.loadFile( "data://4UPW.pdb", function( o ){

                o.addRepresentation( "cartoon", { quality: "low" } );
                o.addRepresentation( "base" );
                stage.centerView();

            } );

        },

        "ribosome2": function( stage ){

            stage.loadFile( "data://4UPY.pdb", function( o ){

                o.addRepresentation( "line" );
                stage.centerView();

            } );

            stage.loadFile( "data://4UPX.pdb", function( o ){

                o.addRepresentation( "line" );
                stage.centerView();

            } );

            stage.loadFile( "data://4UQ5.pdb", function( o ){

                o.addRepresentation( "line" );
                stage.centerView();

            } );

            stage.loadFile( "data://4UPW.pdb", function( o ){

                o.addRepresentation( "line" );
                stage.centerView();

            } );

        },

        "ribosome3": function( stage ){

            stage.loadFile( "data://4UPY.pdb", function( o ){

                o.addRepresentation( "trace" );
                stage.centerView();

            } );

            stage.loadFile( "data://4UPX.pdb", function( o ){

                o.addRepresentation( "trace" );
                stage.centerView();

            } );

            stage.loadFile( "data://4UQ5.pdb", function( o ){

                o.addRepresentation( "trace" );
                stage.centerView();

            } );

            stage.loadFile( "data://4UPW.pdb", function( o ){

                o.addRepresentation( "trace" );
                stage.centerView();

            } );

        },

        "selection": function( stage ){

            stage.loadFile( "data://1crn.pdb", function( o ){

                var sele = "not backbone or .CA or (PRO and .N)";

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "licorice", { sele: sele } );
                o.centerView();

            } );

        },

        "spline": function( stage ){

            stage.loadFile( "data://BaceCgProteinAtomistic.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "10-20" } );
                o.addRepresentation( "tube", {
                    sele: "not 11-19", radius: 0.07, subdiv: 25, radialSegments: 25
                } );
                o.addRepresentation( "licorice", { sele: "sidechainAttached" } );
                o.centerView();

            } );

        },

        "autoChainName": function( stage ){

            var params = {
                sele: ":A or :B or DPPC"
            };

            stage.loadFile( "data://Bace1Trimer-inDPPC.gro", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "licorice", { sele: "DPPC" } );
                o.centerView();

            }, params );

        },

        "script": function( stage ){

            stage.loadFile( "data://script.ngl" );

        },

        "bfactor": function( stage ){

            stage.loadFile( "data://1u19.pdb", function( o ){

                o.addRepresentation( "tube", {
                    sele: ":A", visible: false, bfactor: 0.005
                } );

                o.addRepresentation( "hyperball", {
                    sele: ":A", visible: false, shrink: 0.3
                } );

                o.addRepresentation( "ball+stick", {
                    sele: ":A and sidechainAttached",
                    visible: true, aspectRatio: 1.5
                } );

                o.addRepresentation( "cartoon", {
                    sele: ":A", visible: true, scale: 0.3, aspectRatio: 6.0
                } );

                o.centerView( ":A" );

            } );

        },

        "1d66": function( stage ){

            stage.loadFile( "data://1d66.pdb", function( o ){

                o.addRepresentation( "cartoon", {
                    sele: "nucleic", wireframe: false
                } );
                o.addRepresentation( "base", {
                    sele: "*", color: "resname"
                } );
                o.addRepresentation( "licorice", {
                    sele: "nucleic", color: "element", visible: false
                } );

                o.centerView( "nucleic" );

            } );

        },

        "trajReprUpdate": function( stage ){

            stage.loadFile( "data://md_1u19.gro", function( o ){

                var spacefill = o.addRepresentation( "spacefill", {
                    sele: "1-30", color: 0x00CCFF, radius: 2.0, scale: 1.0
                } );
                var ballStick = o.addRepresentation( "ball+stick", { sele: "30-60" } );
                var licorice = o.addRepresentation( "licorice", { sele: "60-90" } );
                var hyperball = o.addRepresentation( "hyperball", {
                    sele: "90-120", color: "resname"
                } );
                var line = o.addRepresentation( "line", { sele: "120-150" } );
                var backbone = o.addRepresentation( "backbone", { sele: "150-180" } );
                var tube = o.addRepresentation( "tube", { sele: "180-210" } );
                var cartoon = o.addRepresentation( "cartoon", { sele: "210-240" } );
                var ribbon = o.addRepresentation( "ribbon", { sele: "240-270" } );
                var trace = o.addRepresentation( "trace", { sele: "270-300" } );

                o.centerView();

                o.addTrajectory( "__example__/@md_1u19.xtc" );

                (function(){
                    var i = 100;
                    var j = 1;

                    setInterval( function(){

                        spacefill.setScale( i / 100 );
                        stage.viewer.render();

                        if( i === 100 ){
                            j = -1;
                        }else if( i === 10 ){
                            j = 1;
                        }
                        i += j;

                    }, 10 );
                })//();

            }, { sele: "not hydrogen" } );

        },

        "timing": function( stage ){

            console.time( "test" );

            stage.loadFile( "data://3l5q.pdb", function( o ){

                o.addRepresentation( "line", { color: "chainindex" } );
                o.addRepresentation( "cartoon", { color: "chainindex" } );
                o.centerView();

                console.timeEnd( "test" );

                console.time( "render" );
                o.viewer.render();
                console.timeEnd( "render" );

            } );

        },

        "capsid": function( stage ){

            stage.loadFile( "data://1RB8.pdb", function( o ){

                o.addRepresentation( "cartoon", { subdiv: 3, radialSegments: 6 } );
                o.addRepresentation( "licorice" );
                // o.addRepresentation( "hyperball" );
                stage.centerView();

            } );

        },

        "surface": function( stage ){

            stage.loadFile( "data://1crn.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "ball+stick" );
                stage.viewer.setClip( 42, 100 );
                stage.centerView();

            } );

            stage.loadFile( "data://1crn.ply", function( o ){

                o.addRepresentation( undefined, {
                    transparent: true, opacity: 0.3, side: THREE.DoubleSide
                } );

            } );

        },

        "largeGro": function( stage ){

            console.time( "test" );

            // stage.loadFile( "data://1crn.gro", function( o ){

            //     o.addRepresentation( "ribbon", { color: "residueindex" } );
            //     stage.centerView();

            // } );

            stage.loadFile( "data://water.gro", function( o ){

                o.addRepresentation( "line", { color: "residueindex" } );
                stage.centerView();

                o.viewer.render();

                console.timeEnd( "test" );

            } );

            /*stage.loadFile( "data://3l5q.gro", function( o ){

                o.addRepresentation( "trace", { color: "residueindex", subdiv: 3 } );
                stage.centerView();

                o.viewer.render();

                console.timeEnd( "test" );

            } );*/

        },

        "helixorient": function( stage ){

            stage.loadFile( "data://3dqb.pdb", function( o ){

                o.addRepresentation( "crossing", {
                    ssBorder: true, radius: 0.6
                } );
                o.addRepresentation( "rope", {
                    radius: 0.2
                } );

                o.centerView();

            } );

        },

        "norovirus": function( stage ){

            stage.loadFile( "data://norovirus.ngl" );

        },

        "label": function( stage ){

            stage.loadFile( "data://1crn.pdb", function( o ){

                o.addRepresentation( "tube", { radius: "ss" } );
                o.addRepresentation( "ball+stick", { sele: "sidechainAttached" } );
                o.addRepresentation( "label", {
                    sele: ".CA", color: "element"
                } );
                stage.centerView();

            } );

            stage.loadFile( "data://1crn.ply", function( o ){

                o.addRepresentation( undefined, {
                    transparent: true, opacity: 0.3, side: THREE.FrontSide
                } );

            } );

        },

        "cif": function( stage ){

            stage.loadFile( "data://3SN6.cif", function( o ){
            // stage.loadFile( "data://1CRN.cif", function( o ){

                o.addRepresentation( "cartoon", { radius: "ss" } );
                // o.addRepresentation( "ball+stick", { sele: "sidechainAttached" } );
                stage.centerView();

            } );

        },

        "1crn": function( stage ){

            stage.loadFile( "data://1crn.pdb", function( o ){

                // o.addRepresentation( "line", {
                //     lineWidth: 5, transparent: true, opacity: 0.5
                // } );
                // o.addRepresentation( "cartoon" );

                o.addRepresentation( "licorice" );
                o.addRepresentation( "point", {
                    sele: "*", sizeAttenuation: true, pointSize: 12, sort: true
                } );
                stage.centerView();

            } );

        },

        "decompress": function( stage ){

            stage.loadFile( "data://1CRN.cif.gz", function( o ){

                o.addRepresentation( "cartoon" );
                stage.centerView();

            } );

            stage.loadFile( "data://1CRN.cif.zip", function( o ){

                o.addRepresentation( "licorice" );
                stage.centerView();

            } );

            stage.loadFile( "data://1CRN.cif.lzma", function( o ){

                o.addRepresentation( "rocket", {
                    transparent: true, opacity: 0.5
                } );
                stage.centerView();

            } );

            stage.loadFile( "data://1CRN.cif.bz2", function( o ){

                o.addRepresentation( "rope", { scale: 0.3 } );
                stage.centerView();

            } );

        },

        "hiv": function( stage ){

            stage.loadFile( "data://3j3y.cif.gz", function( o ){

                o.addRepresentation( "point", {
                    color: "chainindex", pointSize: 7, sizeAttenuation: true,
                    sort: false
                } );
                // o.addRepresentation( "ribbon", {
                //     color: "chainindex"
                // } );
                o.centerView();

            }, null, null, { cAlphaOnly: true } );

        },

    }

};

// File:shader/CylinderImpostor.vert

NGL.Resources[ '../shader/CylinderImpostor.vert'] = "// Open-Source PyMOL is Copyright (C) Schrodinger, LLC.\n\n//  All Rights Reserved\n\n//  Permission to use, copy, modify, distribute, and distribute modified\n//  versions of this software and its built-in documentation for any\n//  purpose and without fee is hereby granted, provided that the above\n//  copyright notice appears in all copies and that both the copyright\n//  notice and this permission notice appear in supporting documentation,\n//  and that the name of Schrodinger, LLC not be used in advertising or\n//  publicity pertaining to distribution of the software without specific,\n//  written prior permission.\n\n//  SCHRODINGER, LLC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,\n//  INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN\n//  NO EVENT SHALL SCHRODINGER, LLC BE LIABLE FOR ANY SPECIAL, INDIRECT OR\n//  CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS\n//  OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE\n//  OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE\n//  USE OR PERFORMANCE OF THIS SOFTWARE.\n\n// Contributions by Alexander Rose\n// - ported to WebGL\n// - dual color\n// - picking color\n// - shift\n\n\nattribute vec3 mapping;\nattribute vec3 position1;\nattribute vec3 position2;\nattribute float radius;\n\n// varying float vRadius;\n\n// varying vec3 point;\nvarying vec3 axis;\nvarying vec4 base_radius;\nvarying vec4 end_b;\nvarying vec3 U;\nvarying vec3 V;\n// varying float b;\nvarying vec4 w;\n\n#ifdef PICKING\n    attribute vec3 pickingColor;\n    attribute vec3 pickingColor2;\n    varying vec3 vPickingColor;\n    varying vec3 vPickingColor2;\n#else\n    attribute vec3 color;\n    attribute vec3 color2;\n    varying vec3 vColor;\n    varying vec3 vColor2;\n#endif\n\nuniform mat4 modelViewMatrixInverse;\nuniform float shift;\n\n\nvoid main()\n{\n\n    #ifdef PICKING\n        vPickingColor = pickingColor;\n        vPickingColor2 = pickingColor2;\n    #else\n        vColor = color;\n        vColor2 = color2;\n    #endif\n\n    // vRadius = radius;\n    base_radius.w = radius;\n\n    vec3 center = position;\n    vec3 dir = normalize( position2 - position1 );\n    float ext = length( position2 - position1 ) / 2.0;\n\n    vec3 cam_dir = normalize(\n        ( modelViewMatrixInverse * vec4( 0, 0, 0, 1 ) ).xyz - center\n    );\n\n    vec3 ldir;\n\n    float b = dot( cam_dir, dir );\n    end_b.w = b;\n    if( b < 0.0 ) // direction vector looks away, so flip\n        ldir = -ext * dir;\n    else // direction vector already looks in my direction\n        ldir = ext * dir;\n\n    vec3 left = normalize( cross( cam_dir, ldir ) );\n    vec3 leftShift = shift * left * radius;\n    if( b < 0.0 )\n        leftShift *= -1.0;\n    left = radius * left;\n    vec3 up = radius * normalize( cross( left, ldir ) );\n\n    // transform to modelview coordinates\n    axis =  normalize( normalMatrix * ldir );\n    U = normalize( normalMatrix * up );\n    V = normalize( normalMatrix * left );\n\n    vec4 base4 = modelViewMatrix * vec4( center - ldir + leftShift, 1.0 );\n    // base = base4.xyz / base4.w;\n    base_radius.xyz = base4.xyz / base4.w;\n\n    vec4 top_position = modelViewMatrix * vec4( center + ldir + leftShift, 1.0 );\n    vec4 end4 = top_position;\n    // end = end4.xyz / end4.w;\n    end_b.xyz = end4.xyz / end4.w;\n\n    w = modelViewMatrix * vec4(\n        center + leftShift + mapping.x*ldir + mapping.y*left + mapping.z*up, 1.0\n    );\n    // point = w.xyz / w.w;\n\n    gl_Position = projectionMatrix * w;\n\n}\n\n\n";

// File:shader/CylinderImpostor.frag

NGL.Resources[ '../shader/CylinderImpostor.frag'] = "// Open-Source PyMOL is Copyright (C) Schrodinger, LLC.\n\n//  All Rights Reserved\n\n//  Permission to use, copy, modify, distribute, and distribute modified\n//  versions of this software and its built-in documentation for any\n//  purpose and without fee is hereby granted, provided that the above\n//  copyright notice appears in all copies and that both the copyright\n//  notice and this permission notice appear in supporting documentation,\n//  and that the name of Schrodinger, LLC not be used in advertising or\n//  publicity pertaining to distribution of the software without specific,\n//  written prior permission.\n\n//  SCHRODINGER, LLC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,\n//  INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN\n//  NO EVENT SHALL SCHRODINGER, LLC BE LIABLE FOR ANY SPECIAL, INDIRECT OR\n//  CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS\n//  OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE\n//  OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE\n//  USE OR PERFORMANCE OF THIS SOFTWARE.\n\n// Contributions by Alexander Rose\n// - ported to WebGL\n// - dual color\n// - picking color\n\n\n#extension GL_EXT_frag_depth : enable\n\nuniform float opacity;\nuniform float nearClip;\n\nuniform mat4 projectionMatrix;\nuniform mat3 normalMatrix;\n\n// varying float vRadius;\n\n// varying vec3 point;\nvarying vec3 axis;\nvarying vec4 base_radius;\nvarying vec4 end_b;\nvarying vec3 U;\nvarying vec3 V;\n// varying float b;\nvarying vec4 w;\n\n#ifdef PICKING\n    varying vec3 vPickingColor;\n    varying vec3 vPickingColor2;\n#else\n    varying vec3 vColor;\n    varying vec3 vColor2;\n#endif\n\n#include light_params\n\n#include fog_params\n\n\n// round caps\n// http://sourceforge.net/p/pymol/code/HEAD/tree/trunk/pymol/data/shaders/cylinder.fs\n\n\n// void main2(void)\n// {\n//     #ifdef PICKING\n//         gl_FragColor = vec4( vPickingColor, 1.0 );\n//     #else\n//         gl_FragColor = vec4( vColor, 1.0 );\n//     #endif\n// }\n\n\nvoid main()\n{\n\n    vec3 point = w.xyz / w.w;\n    vec4 point4 = w;\n\n    if( dot( point4, vec4( 0.0, 0.0, 1.0, nearClip ) ) > 0.0 )\n        discard;\n\n    // unpacking\n    vec3 base = base_radius.xyz;\n    float vRadius = base_radius.w;\n    vec3 end = end_b.xyz;\n    float b = end_b.w;\n\n    vec3 end_cyl = end;\n    vec3 surface_point = point;\n\n    const float ortho=0.0;\n\n    vec3 ray_target = surface_point;\n    vec3 ray_origin = vec3(0.0);\n    vec3 ray_direction = mix(normalize(ray_origin - ray_target), vec3(0.0, 0.0, 1.0), ortho);\n    mat3 basis = mat3( U, V, axis );\n\n    vec3 diff = ray_target - 0.5 * (base + end_cyl);\n    vec3 P = diff * basis;\n\n    // angle (cos) between cylinder cylinder_axis and ray direction\n    float dz = dot( axis, ray_direction );\n\n    float radius2 = vRadius*vRadius;\n\n    // calculate distance to the cylinder from ray origin\n    vec3 D = vec3(dot(U, ray_direction),\n                dot(V, ray_direction),\n                dz);\n    float a0 = P.x*P.x + P.y*P.y - radius2;\n    float a1 = P.x*D.x + P.y*D.y;\n    float a2 = D.x*D.x + D.y*D.y;\n\n    // calculate a dicriminant of the above quadratic equation\n    float d = a1*a1 - a0*a2;\n    if (d < 0.0)\n        // outside of the cylinder\n        discard;\n\n    float dist = (-a1 + sqrt(d)) / a2;\n\n    // point of intersection on cylinder surface\n    vec3 new_point = ray_target + dist * ray_direction;\n\n    vec3 tmp_point = new_point - base;\n    vec3 normal = normalize( tmp_point - axis * dot(tmp_point, axis) );\n\n    ray_origin = mix( ray_origin, surface_point, ortho );\n\n    // test front cap\n    float cap_test = dot( new_point - base, axis );\n\n    // to calculate caps, simply check the angle between\n    // the point of intersection - cylinder end vector\n    // and a cap plane normal (which is the cylinder cylinder_axis)\n    // if the angle < 0, the point is outside of cylinder\n    // test front cap\n\n    #ifndef CAP\n        vec3 new_point2 = ray_target + ( (-a1 - sqrt(d)) / a2 ) * ray_direction;\n        vec3 tmp_point2 = new_point2 - base;\n    #endif\n\n    // flat\n    if (cap_test < 0.0)\n    {\n        // ray-plane intersection\n        float dNV = dot(-axis, ray_direction);\n        if (dNV < 0.0)\n            discard;\n        float near = dot(-axis, (base)) / dNV;\n        new_point = ray_direction * near + ray_origin;\n        // within the cap radius?\n        if (dot(new_point - base, new_point-base) > radius2)\n            discard;\n\n        #ifdef CAP\n            normal = axis;\n        #else\n            normal = -normalize( tmp_point2 - axis * dot(tmp_point2, axis) );\n        #endif\n    }\n\n    // test end cap\n    cap_test = dot((new_point - end_cyl), axis);\n\n    // flat\n    if( cap_test > 0.0 )\n    {\n        // ray-plane intersection\n        float dNV = dot(axis, ray_direction);\n        if (dNV < 0.0)\n            discard;\n        float near = dot(axis, end_cyl) / dNV;\n        new_point = ray_direction * near + ray_origin;\n        // within the cap radius?\n        if( dot(new_point - end_cyl, new_point-base) > radius2 )\n            discard;\n\n        #ifdef CAP\n            normal = axis;\n        #else\n            normal = -normalize( tmp_point2 - axis * dot(tmp_point2, axis) );\n        #endif\n    }\n\n    vec2 clipZW = new_point.z * projectionMatrix[2].zw + projectionMatrix[3].zw;\n    float depth2 = 0.5 + 0.5 * clipZW.x / clipZW.y;\n\n    // this is a workaround necessary for Mac\n    // otherwise the modified fragment won't clip properly\n    if (depth2 <= 0.0)\n        discard;\n    if (depth2 >= 1.0)\n        discard;\n\n    gl_FragDepthEXT = depth2;\n\n\n    vec3 transformedNormal = normal;\n    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );\n\n    #include light\n\n    #ifdef PICKING\n        // TODO compare without sqrt\n        if( distance( new_point, end_cyl) < distance( new_point, base ) ){\n            if( b < 0.0 ){\n                gl_FragColor = vec4( vPickingColor, 1.0 );\n            }else{\n                gl_FragColor = vec4( vPickingColor2, 1.0 );\n            }\n        }else{\n            if( b > 0.0 ){\n                gl_FragColor = vec4( vPickingColor, 1.0 );\n            }else{\n                gl_FragColor = vec4( vPickingColor2, 1.0 );\n            }\n        }\n    #else\n        // TODO compare without sqrt\n        if( distance( new_point, end_cyl) < distance( new_point, base ) ){\n            if( b < 0.0 ){\n                gl_FragColor = vec4( vColor, opacity );\n            }else{\n                gl_FragColor = vec4( vColor2, opacity );\n            }\n        }else{\n            if( b > 0.0 ){\n                gl_FragColor = vec4( vColor, opacity );\n            }else{\n                gl_FragColor = vec4( vColor2, opacity );\n            }\n        }\n        gl_FragColor.xyz *= vLightFront;\n        //gl_FragColor.xyz = transformedNormal;\n    #endif\n\n    #include fog\n}\n\n\n\n\n\n\n\n\n";

// File:shader/HyperballStickImpostor.vert

NGL.Resources[ '../shader/HyperballStickImpostor.vert'] = "// Copyright (C) 2010-2011 by\n// Laboratoire de Biochimie Theorique (CNRS),\n// Laboratoire d'Informatique Fondamentale d'Orleans (Universite d'Orleans), (INRIA) and\n// Departement des Sciences de la Simulation et de l'Information (CEA). \n\n// License: CeCILL-C license (http://www.cecill.info/)\n\n// Contact: Marc Baaden\n// E-mail: baaden@smplinux.de\n// Webpage: http://hyperballs.sourceforge.net\n\n// Contributions by Alexander Rose\n// - ported to WebGL\n// - dual color\n// - picking color\n\n\nattribute vec3 mapping;\nattribute float radius;\nattribute float radius2;\nattribute vec3 position1;\nattribute vec3 position2;\n\nvarying mat4 matrix_near;\n\nvarying vec4 prime1;\nvarying vec4 prime2;\n\n#ifdef PICKING\n    attribute vec3 pickingColor;\n    attribute vec3 pickingColor2;\n    varying vec3 vPickingColor;\n    varying vec3 vPickingColor2;\n#else\n    attribute vec3 color;\n    attribute vec3 color2;\n    varying vec3 vColor;\n    varying vec3 vColor2;\n#endif\n\nuniform float shrink;\nuniform mat4 modelViewProjectionMatrix;\nuniform mat4 modelViewProjectionMatrixInverse;\n\n\nvoid main()\n{\n\n    vec4 spaceposition;\n    vec3 position_atom1;\n    vec3 position_atom2;\n    vec4 vertex_position;\n\n    #ifdef PICKING\n        vPickingColor = pickingColor;\n        vPickingColor2 = pickingColor2;\n    #else\n        vColor = color;\n        vColor2 = color2;\n    #endif\n\n    float radius1 = radius;\n\n    position_atom1 = position1;\n    position_atom2 = position2;\n\n    float distance = distance( position_atom1, position_atom2 );\n\n    spaceposition.z = mapping.z * distance;\n\n    if (radius1 > radius2) {\n        spaceposition.y = mapping.y * 1.5 * radius1;\n        spaceposition.x = mapping.x * 1.5 * radius1;\n    } else {\n        spaceposition.y = mapping.y * 1.5 * radius2;\n        spaceposition.x = mapping.x * 1.5 * radius2;\n    }\n    spaceposition.w = 1.0;\n\n    vec4 e3 = vec4( 1.0 );\n    vec3 e1, e1_temp, e2, e2_temp;\n\n    // Calculation of bond direction: e3\n    e3.xyz = normalize(position_atom1-position_atom2);\n\n    // little hack to avoid some problems of precision due to graphic card limitation using float: To improve soon\n    //if (e3.z == 0.0) { e3.z = 0.0000000000001;}\n    if ( (position_atom1.x - position_atom2.x) == 0.0) { position_atom1.x += 0.001;}\n    if ( (position_atom1.y - position_atom2.y) == 0.0) { position_atom1.y += 0.001;}\n    if ( (position_atom1.z - position_atom2.z) == 0.0) { position_atom1.z += 0.001;}\n\n    // Focus calculation\n    vec4 focus = vec4( 1.0 );\n    focus.x = ( position_atom1.x*position_atom1.x - position_atom2.x*position_atom2.x + \n        ( radius2*radius2 - radius1*radius1 )*e3.x*e3.x/shrink )/(2.0*(position_atom1.x - position_atom2.x));\n    focus.y = ( position_atom1.y*position_atom1.y - position_atom2.y*position_atom2.y + \n        ( radius2*radius2 - radius1*radius1 )*e3.y*e3.y/shrink )/(2.0*(position_atom1.y - position_atom2.y));\n    focus.z = ( position_atom1.z*position_atom1.z - position_atom2.z*position_atom2.z + \n        ( radius2*radius2 - radius1*radius1 )*e3.z*e3.z/shrink )/(2.0*(position_atom1.z - position_atom2.z));\n\n    // e1 calculation\n    e1.x = 1.0;\n    e1.y = 1.0;\n    e1.z = ( (e3.x*focus.x + e3.y*focus.y + e3.z*focus.z) - e1.x*e3.x - e1.y*e3.y)/e3.z;\n    e1_temp = e1 - focus.xyz;\n    e1 = normalize(e1_temp);\n\n    // e2 calculation\n    e2_temp = e1.yzx * e3.zxy - e1.zxy * e3.yzx;\n    e2 = normalize(e2_temp);\n\n    //ROTATION:\n    // final form of change of basis matrix:\n    mat3 R= mat3( e1.xyz, e2.xyz, e3.xyz );\n    // Apply rotation and translation to the bond primitive\n    vertex_position.xyz = R * spaceposition.xyz;\n    vertex_position.w = 1.0;\n\n    // TRANSLATION:\n    vertex_position.x += (position_atom1.x+position_atom2.x) / 2.0;\n    vertex_position.y += (position_atom1.y+position_atom2.y) / 2.0;\n    vertex_position.z += (position_atom1.z+position_atom2.z) / 2.0;\n\n    // New position\n    gl_Position = modelViewProjectionMatrix * vertex_position;\n\n    vec4 i_near, i_far;\n\n    // Calculate near from position\n    vec4 near = gl_Position ;\n    near.z = 0.0 ;\n    near = modelViewProjectionMatrixInverse * near;\n    i_near = near;\n\n    // Calculate far from position\n    vec4 far = gl_Position ;\n    far.z = far.w ;\n    i_far = modelViewProjectionMatrixInverse * far;\n\n    prime1 = vec4( position_atom1 - (position_atom1 - focus.xyz)*shrink, 1.0 );\n    prime2 = vec4( position_atom2 - (position_atom2 - focus.xyz)*shrink, 1.0 );\n\n    float Rsquare = (radius1*radius1/shrink) - (\n                        (position_atom1.x - focus.x)*(position_atom1.x - focus.x) + \n                        (position_atom1.y - focus.y)*(position_atom1.y - focus.y) + \n                        (position_atom1.z - focus.z)*(position_atom1.z - focus.z) \n                    );\n\n    focus.w = Rsquare;\n\n    matrix_near = mat4( i_near, i_far, focus, e3 );\n}\n\n";

// File:shader/HyperballStickImpostor.frag

NGL.Resources[ '../shader/HyperballStickImpostor.frag'] = "// Copyright (C) 2010-2011 by\n// Laboratoire de Biochimie Theorique (CNRS),\n// Laboratoire d'Informatique Fondamentale d'Orleans (Universite d'Orleans), (INRIA) and\n// Departement des Sciences de la Simulation et de l'Information (CEA).\n\n// License: CeCILL-C license (http://www.cecill.info/)\n\n// Contact: Marc Baaden\n// E-mail: baaden@smplinux.de\n// Webpage: http://hyperballs.sourceforge.net\n\n// Contributions by Alexander Rose\n// - ported to WebGL\n// - dual color\n// - picking color\n\n\n#extension GL_EXT_frag_depth : enable\n\n// varying vec3 mapping;\n\nvarying mat4 matrix_near;\n\nvarying vec4 prime1;\nvarying vec4 prime2;\n\nuniform float opacity;\n\nuniform float shrink;\nuniform mat4 modelViewProjectionMatrix;\nuniform mat4 modelViewMatrixInverseTranspose;\n\n#ifdef PICKING\n    varying vec3 vPickingColor;\n    varying vec3 vPickingColor2;\n#else\n    varying vec3 vColor;\n    varying vec3 vColor2;\n#endif\n\n#include light_params\n\n#include fog_params\n\n\nstruct Ray {\n    vec3 origin ;\n    vec3 direction ;\n};\n\n\nbool cutoff_plane (vec3 M, vec3 cutoff, vec3 x3){\n    float a = x3.x;\n    float b = x3.y;\n    float c = x3.z;\n    float d = -x3.x*cutoff.x-x3.y*cutoff.y-x3.z*cutoff.z;\n    float l = a*M.x+b*M.y+c*M.z+d;\n    if (l<0.0) {return true;}\n    else{return false;}\n}\n\n\nvec3 isect_surf(Ray r, mat4 matrix_coef){\n    vec4 direction = vec4(r.direction, 0.0);\n    vec4 origin = vec4(r.origin, 1.0);\n    float a = dot(direction,(matrix_coef*direction));\n    float b = dot(origin,(matrix_coef*direction));\n    float c = dot(origin,(matrix_coef*origin));\n    float delta =b*b-a*c;\n    gl_FragColor.a = 1.0;\n    if (delta<0.0){\n        discard;\n        gl_FragColor.a = 0.5;\n    }\n    float t1 =(-b-sqrt(delta))/a;\n\n    // Second solution not necessary if you don't want\n    // to see inside spheres and cylinders, save some fps\n    //float t2 = (-b+sqrt(delta)) / a  ;\n    //float t =(t1<t2) ? t1 : t2;\n\n    return r.origin+t1*r.direction;\n}\n\n\nRay primary_ray(vec4 near1, vec4 far1){\n    vec3 near=near1.xyz/near1.w;\n    vec3 far=far1.xyz/far1.w;\n    return Ray(near,far-near);\n}\n\n\nfloat update_z_buffer(vec3 M, mat4 ModelViewP){\n    float  depth1;\n    vec4 Ms=(ModelViewP*vec4(M,1.0));\n    return depth1=(1.0+Ms.z/Ms.w)/2.0;\n}\n\n\n// void main2(void)\n// {\n//     gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n// }\n\n// void main(void)\n// {\n//     #ifdef PICKING\n//         gl_FragColor = vec4( vPickingColor, 1.0 );\n//     #else\n//         gl_FragColor = vec4( vColor, 1.0 );\n//     #endif\n// }\n\n\nvoid main()\n{\n\n    vec4 i_near, i_far, focus;\n    vec3 e3, e1, e1_temp, e2;\n\n    i_near = vec4(matrix_near[0][0],matrix_near[0][1],matrix_near[0][2],matrix_near[0][3]);\n    i_far  = vec4(matrix_near[1][0],matrix_near[1][1],matrix_near[1][2],matrix_near[1][3]);\n    focus = vec4(matrix_near[2][0],matrix_near[2][1],matrix_near[2][2],matrix_near[2][3]);\n    e3 = vec3(matrix_near[3][0],matrix_near[3][1],matrix_near[3][2]);\n\n    e1.x = 1.0;\n    e1.y = 1.0;\n    e1.z = ( (e3.x*focus.x + e3.y*focus.y + e3.z*focus.z) - e1.x*e3.x - e1.y*e3.y)/e3.z;\n    e1_temp = e1 - focus.xyz;\n    e1 = normalize(e1_temp);\n\n    e2 = normalize(cross(e1,e3));\n\n\n    vec4 equation = focus;\n\n    float shrinkfactor = shrink;\n    float t1 = -1.0/(1.0-shrinkfactor);\n    float t2 = 1.0/(shrinkfactor);\n    // float t3 = 2.0/(shrinkfactor);\n\n    vec4 colonne1, colonne2, colonne3, colonne4;\n    mat4 mat;\n\n    vec3 equation1 = vec3(t2,t2,t1);\n\n\n    float A1 = - e1.x*equation.x - e1.y*equation.y - e1.z*equation.z;\n    float A2 = - e2.x*equation.x - e2.y*equation.y - e2.z*equation.z;\n    float A3 = - e3.x*equation.x - e3.y*equation.y - e3.z*equation.z;\n\n    float A11 = equation1.x*e1.x*e1.x +  equation1.y*e2.x*e2.x + equation1.z*e3.x*e3.x;\n    float A21 = equation1.x*e1.x*e1.y +  equation1.y*e2.x*e2.y + equation1.z*e3.x*e3.y;\n    float A31 = equation1.x*e1.x*e1.z +  equation1.y*e2.x*e2.z + equation1.z*e3.x*e3.z;\n    float A41 = equation1.x*e1.x*A1   +  equation1.y*e2.x*A2   + equation1.z*e3.x*A3;\n\n    float A22 = equation1.x*e1.y*e1.y +  equation1.y*e2.y*e2.y + equation1.z*e3.y*e3.y;\n    float A32 = equation1.x*e1.y*e1.z +  equation1.y*e2.y*e2.z + equation1.z*e3.y*e3.z;\n    float A42 = equation1.x*e1.y*A1   +  equation1.y*e2.y*A2   + equation1.z*e3.y*A3;\n\n    float A33 = equation1.x*e1.z*e1.z +  equation1.y*e2.z*e2.z + equation1.z*e3.z*e3.z;\n    float A43 = equation1.x*e1.z*A1   +  equation1.y*e2.z*A2   + equation1.z*e3.z*A3;\n\n    float A44 = equation1.x*A1*A1 +  equation1.y*A2*A2 + equation1.z*A3*A3 - equation.w;\n\n    colonne1 = vec4(A11,A21,A31,A41);\n    colonne2 = vec4(A21,A22,A32,A42);\n    colonne3 = vec4(A31,A32,A33,A43);\n    colonne4 = vec4(A41,A42,A43,A44);\n\n    mat = mat4(colonne1,colonne2,colonne3,colonne4);\n\n\n\n    // Ray calculation using near and far\n    Ray ray = primary_ray(i_near,i_far) ;\n\n    // Intersection between ray and surface for each pixel\n    vec3 M;\n    M = isect_surf(ray, mat);\n\n    // Recalculate the depth in function of the new pixel position\n    gl_FragDepthEXT = update_z_buffer(M, modelViewProjectionMatrix) ;\n\n    // cut the extremities of bonds to superimpose bond and spheres surfaces\n    if (cutoff_plane(M, prime1.xyz, -e3) || cutoff_plane(M, prime2.xyz, e3)){ discard; }\n\n\n    // Transform normal to model space to view-space\n    vec4 M1 = vec4(M,1.0);\n    vec4 M2 =  mat*M1;\n    vec3 normal = normalize( ( modelViewMatrixInverseTranspose * M2 ).xyz );\n\n\n    // Give color parameters to the Graphic card\n    //gl_FragColor.rgb = lighting.y * diffusecolor + lighting.z * specularcolor;\n    //gl_FragColor.a = 1.0;\n\n    vec3 transformedNormal = normal;\n    vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );\n\n    #include light\n\n    // Mix the color bond in function of the two atom colors\n    float distance_ratio = ((M.x-prime2.x)*e3.x + (M.y-prime2.y)*e3.y +(M.z-prime2.z)*e3.z) /\n                                distance(prime2.xyz,prime1.xyz);\n\n    #ifdef PICKING\n        // lerp function not in GLSL. Find something else ...\n        vec3 diffusecolor = mix( vPickingColor2, vPickingColor, distance_ratio );\n        if( distance_ratio>0.5 ){\n            diffusecolor = vPickingColor;\n        }else{\n            diffusecolor = vPickingColor2;\n        }\n        gl_FragColor = vec4( diffusecolor, 1.0 );\n    #else\n        // lerp function not in GLSL. Find something else ...\n        vec3 diffusecolor = mix( vColor2, vColor, distance_ratio );\n        if( distance_ratio>0.5 ){\n            diffusecolor = vColor;\n        }else{\n            diffusecolor = vColor2;\n        }\n        gl_FragColor = vec4( diffusecolor, opacity );\n        gl_FragColor.xyz *= vLightFront;\n    #endif\n\n    #include fog\n\n    // ############## Fog effect #####################################################\n    // To use fog comment the two previous lines: ie  gl_FragColor.rgb = E and   gl_FragColor.a = 1.0;\n    // and uncomment the next lines.\n    // Color of the fog: white\n    //float fogDistance  = update_z_buffer(M, gl_ModelViewMatrix) ;\n    //float fogExponent  = fogDistance * fogDistance * 0.007;\n    //vec3 fogColor   = vec3(1.0, 1.0, 1.0);\n    //float fogFactor   = exp2(-abs(fogExponent));\n    //fogFactor = clamp(fogFactor, 0.0, 1.0);\n\n    //vec3 final_color = lighting.y * diffusecolor + lighting.z * specularcolor;\n    //gl_FragColor.rgb = mix(fogColor,final_color,fogFactor);\n    //gl_FragColor.a = 1.0;\n    // ##################################################################################\n\n}\n\n\n\n\n\n";

// File:shader/Line.vert

NGL.Resources[ '../shader/Line.vert'] = "\nattribute vec3 color;\nvarying vec3 vColor;\n\nvoid main()\n{\n\n    vColor = color;\n\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n}\n";

// File:shader/Line.frag

NGL.Resources[ '../shader/Line.frag'] = "\nuniform float opacity;\n\nvarying vec3 vColor;\n\n#include fog_params\n\n\nvoid main()\n{\n\n    gl_FragColor = vec4( vColor, opacity );\n\n    #include fog\n\n}\n";

// File:shader/LineSprite.vert

NGL.Resources[ '../shader/LineSprite.vert'] = "// Open-Source PyMOL is Copyright (C) Schrodinger, LLC.\n\n//  All Rights Reserved\n\n//  Permission to use, copy, modify, distribute, and distribute modified\n//  versions of this software and its built-in documentation for any\n//  purpose and without fee is hereby granted, provided that the above\n//  copyright notice appears in all copies and that both the copyright\n//  notice and this permission notice appear in supporting documentation,\n//  and that the name of Schrodinger, LLC not be used in advertising or\n//  publicity pertaining to distribution of the software without specific,\n//  written prior permission.\n\n//  SCHRODINGER, LLC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,\n//  INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN\n//  NO EVENT SHALL SCHRODINGER, LLC BE LIABLE FOR ANY SPECIAL, INDIRECT OR\n//  CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS\n//  OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE\n//  OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE\n//  USE OR PERFORMANCE OF THIS SOFTWARE.\n\n// Note: here the box screen aligned code from Open-Source PyMOL is used\n\n// Contributions by Alexander Rose\n// - ported to WebGL\n// - dual color\n// - adapted for line sprites\n\n\nattribute lowp vec2 inputMapping;\nattribute lowp vec3 inputColor;\nattribute lowp vec3 inputColor2;\nattribute lowp vec3 inputAxis;\nattribute lowp float inputWidth;\n\nvarying float dist;\nvarying lowp vec3 color;\nvarying lowp vec3 color2;\n\n\n// void main2(void){\n//     colorx = inputColor;\n\n//     vec2 B;\n//     vec3 C;\n//     if (inputAxis.y != 0.0 || inputAxis.z != 0.0){\n//         C = vec3(1.0, 0.0, 0.0);\n//     }else{\n//         C = vec3(0.0, 1.0, 0.0);\n//     }\n//     B = normalize(cross(inputAxis, C).xy);\n\n//     vec4 cameraCornerPos = modelViewMatrix * vec4( position, 1.0 );\n//     cameraCornerPos.xy += inputMapping * (B.xy * inputWidth);\n\n//     gl_Position = projectionMatrix * cameraCornerPos;\n// }\n\n\nvoid main(void){\n    mat4 MVMatrix = modelViewMatrix;\n    mat4 PMatrix = projectionMatrix;\n    vec4 EyePoint = vec4( cameraPosition, 1.0 );\n\n    vec3 center = position.xyz;   \n    vec3 dir = normalize(inputAxis);\n    // float ext = inputCylinderHeight/2.0;\n    vec3 ldir;\n\n    vec3 cam_dir = normalize(EyePoint.xyz - center);\n    float b = dot(cam_dir, dir);\n    if(b<0.0) // direction vector looks away, so flip\n        //ldir = -ext*dir;\n        ldir = -(length(inputAxis)/2.0) * normalize(inputAxis);\n    else // direction vector already looks in my direction\n        //ldir = ext*dir;\n        ldir = (length(inputAxis)/2.0) * normalize(inputAxis);\n\n    vec3 left = cross(cam_dir, ldir);\n    vec3 up = cross(left, ldir);\n    left = inputWidth*normalize(left);\n    up = inputWidth*normalize(up);\n\n    vec4 w = MVMatrix * vec4( \n        center + inputMapping.x*ldir + inputMapping.y*left, 1.0 \n    );\n\n    gl_Position = PMatrix * w;\n\n\n    vec4 base4 = MVMatrix * vec4(center-ldir, 1.0);\n    vec3 base = base4.xyz / base4.w;\n\n    vec4 top_position = MVMatrix*(vec4(center+ldir,1.0));\n    vec4 end4 = top_position;\n    vec3 end = end4.xyz / end4.w;\n\n    vec3 point = w.xyz / w.w;\n\n    color = inputColor;\n    color2 = inputColor2;\n    \n    // TODO compare without sqrt\n    if( distance( point, end ) < distance( point, base ) ){\n        dist = b > 0.0 ? 1.0 : 0.0;\n    }else{\n        dist = b < 0.0 ? 1.0 : 0.0;\n    }\n\n}";

// File:shader/LineSprite.frag

NGL.Resources[ '../shader/LineSprite.frag'] = "\nvarying float dist;\nvarying highp vec3 color;\nvarying highp vec3 color2;\n\n#include fog_params\n\n\nvoid main() {\n\n    if( dist > 0.5 ){\n        gl_FragColor = vec4( color, 1.0 );    \n    }else{\n        gl_FragColor = vec4( color2, 1.0 );\n    }\n\n    #include fog\n}\n";

// File:shader/Mesh.vert

NGL.Resources[ '../shader/Mesh.vert'] = "\nvarying vec3 vNormal;\nvarying vec4 cameraPos;\n\n#ifdef PICKING\n    attribute vec3 pickingColor;\n    varying vec3 vPickingColor;\n#else\n    attribute vec3 color;\n    varying vec3 vColor;\n#endif\n\nvoid main()\n{\n\n    #ifdef PICKING\n        vPickingColor = pickingColor;\n    #else\n        vColor = color;\n    #endif\n\n    vNormal = normalize( normalMatrix * normal );\n\n    cameraPos =  modelViewMatrix * vec4( position, 1.0 );\n\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n}\n";

// File:shader/Mesh.frag

NGL.Resources[ '../shader/Mesh.frag'] = "\nuniform float opacity;\nuniform float nearClip;\n\nvarying vec3 vNormal;\nvarying vec4 cameraPos;\n\n#ifdef PICKING\n    varying vec3 vPickingColor;\n#else\n    varying vec3 vColor;\n#endif\n\n#include light_params\n\n#include fog_params\n\n\nvoid main()\n{\n\n    #ifdef NEAR_CLIP\n        if( dot( cameraPos, vec4( 0.0, 0.0, 1.0, nearClip ) ) > 0.0 )\n            discard;\n    #endif\n\n    vec3 transformedNormal = normalize( vNormal );\n    #ifdef DOUBLE_SIDED\n        transformedNormal = transformedNormal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );\n    #endif\n\n    #ifdef FLIP_SIDED\n        transformedNormal = -transformedNormal;\n    #endif\n\n    #ifdef PICKING\n\n        gl_FragColor.xyz = vPickingColor;\n\n    #else\n\n        vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );\n\n        #ifndef NOLIGHT\n            #include light\n        #endif\n\n        gl_FragColor = vec4( vColor, opacity );\n\n        #ifndef NOLIGHT\n            gl_FragColor.xyz *= vLightFront;\n        #endif\n\n    #endif\n\n    #include fog\n\n}\n";

// File:shader/ParticleSprite.vert

NGL.Resources[ '../shader/ParticleSprite.vert'] = "\nattribute vec2 mapping;\nattribute vec3 color;\nattribute float radius;\n\nvarying vec3 point;\nvarying vec3 vColor;\nvarying vec3 cameraSpherePos;\nvarying float sphereRadius;\n\nuniform mat4 projectionMatrixInverse;\n\nconst mat4 D = mat4(\n    1.0, 0.0, 0.0, 0.0,\n    0.0, 1.0, 0.0, 0.0,\n    0.0, 0.0, 1.0, 0.0,\n    0.0, 0.0, 0.0, -1.0\n);\n\nmat4 transpose( in mat4 inMatrix ) {\n    vec4 i0 = inMatrix[0];\n    vec4 i1 = inMatrix[1];\n    vec4 i2 = inMatrix[2];\n    vec4 i3 = inMatrix[3];\n\n    mat4 outMatrix = mat4(\n        vec4(i0.x, i1.x, i2.x, i3.x),\n        vec4(i0.y, i1.y, i2.y, i3.y),\n        vec4(i0.z, i1.z, i2.z, i3.z),\n        vec4(i0.w, i1.w, i2.w, i3.w)\n    );\n    return outMatrix;\n}\n\n\n//------------------------------------------------------------------------------\n// Compute point size and center using the technique described in:\n// \"GPU-Based Ray-Casting of Quadratic Surfaces\"\n// by Christian Sigg, Tim Weyrich, Mario Botsch, Markus Gross.\n//\n// Code based on\n/*=========================================================================\n\n Program:   Visualization Toolkit\n Module:    Quadrics_fs.glsl and Quadrics_vs.glsl\n\n Copyright (c) Ken Martin, Will Schroeder, Bill Lorensen\n All rights reserved.\n See Copyright.txt or http://www.kitware.com/Copyright.htm for details.\n\n This software is distributed WITHOUT ANY WARRANTY; without even\n the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR\n PURPOSE.  See the above copyright notice for more information.\n\n =========================================================================*/\n\n// .NAME Quadrics_fs.glsl and Quadrics_vs.glsl\n// .SECTION Thanks\n// <verbatim>\n//\n//  This file is part of the PointSprites plugin developed and contributed by\n//\n//  Copyright (c) CSCS - Swiss National Supercomputing Centre\n//                EDF - Electricite de France\n//\n//  John Biddiscombe, Ugo Varetto (CSCS)\n//  Stephane Ploix (EDF)\n//\n// </verbatim>\n// \n// Contributions by Alexander Rose\n// - ported to WebGL\n// - adapted to work with quads\nvoid ComputePointSizeAndPositionInClipCoordSphere(){\n    \n    vec2 xbc;\n    vec2 ybc;\n\n    mat4 T = mat4(\n        sphereRadius, 0.0, 0.0, 0.0,\n        0.0, sphereRadius, 0.0, 0.0,\n        0.0, 0.0, sphereRadius, 0.0,\n        position.x, position.y, position.z, 1.0\n    );\n\n    mat4 R = transpose( projectionMatrix * modelViewMatrix * T );\n    float A = dot( R[ 3 ], D * R[ 3 ] );\n    float B = -2.0 * dot( R[ 0 ], D * R[ 3 ] );\n    float C = dot( R[ 0 ], D * R[ 0 ] );\n    xbc[ 0 ] = ( -B - sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );\n    xbc[ 1 ] = ( -B + sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );\n    float sx = abs( xbc[ 0 ] - xbc[ 1 ] ) * 0.5;\n\n    A = dot( R[ 3 ], D * R[ 3 ] );\n    B = -2.0 * dot( R[ 1 ], D * R[ 3 ] );\n    C = dot( R[ 1 ], D * R[ 1 ] );\n    ybc[ 0 ] = ( -B - sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );\n    ybc[ 1 ] = ( -B + sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );\n    float sy = abs( ybc[ 0 ] - ybc[ 1 ]  ) * 0.5;\n\n    gl_Position.xy = vec2( 0.5 * ( xbc.x + xbc.y ), 0.5 * ( ybc.x + ybc.y ) );\n    gl_Position.xy -= mapping * vec2( sx, sy );\n    gl_Position.xy *= gl_Position.w;\n}\n\n\nvoid main(void){\n\n    vColor = color;\n    cameraSpherePos = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;\n    sphereRadius = radius;\n\n    gl_Position = projectionMatrix * vec4( cameraSpherePos, 1.0 );\n    ComputePointSizeAndPositionInClipCoordSphere();\n\n    point = ( projectionMatrixInverse * gl_Position ).xyz;\n\n    // move out of viewing frustum to avoid clipping artifacts\n    if( gl_Position.z-sphereRadius<=1.0 )\n        gl_Position.z = -10.0;\n}\n\n\n\n\n";

// File:shader/ParticleSprite.frag

NGL.Resources[ '../shader/ParticleSprite.frag'] = "\nvarying vec3 point;\nvarying vec3 vColor;\nvarying vec3 cameraSpherePos;\nvarying float sphereRadius;\n\n#include fog_params\n\n\nvoid main() {\n\n    vec3 rayDirection = normalize( point );\n    \n    float B = -2.0 * dot(rayDirection, cameraSpherePos);\n    float C = dot(cameraSpherePos, cameraSpherePos) - (sphereRadius*sphereRadius);\n    float det = (B * B) - (4.0 * C);\n    if(det < 0.0)\n        discard;\n\n	gl_FragColor = vec4( vColor, 1.0 );\n\n    #include fog\n\n}\n";

// File:shader/Quad.vert

NGL.Resources[ '../shader/Quad.vert'] = "attribute vec2 position;\nattribute vec2 texture;\nvarying vec2 texCoord;\nvoid main(void) {\n    texCoord = texture;\n    gl_Position = vec4(position, 0.0, 1.0);\n}";

// File:shader/Quad.frag

NGL.Resources[ '../shader/Quad.frag'] = "precision mediump float;\nuniform sampler2D diffuse;\nvarying vec2 texCoord;\nvoid main(void) {\n    vec4 color = texture2D(diffuse, texCoord);\n    gl_FragColor = vec4(color.rgb, color.a);\n}";

// File:shader/Ribbon.vert

NGL.Resources[ '../shader/Ribbon.vert'] = "\nattribute vec3 inputDir;\nattribute float inputSize;\n//attribute vec3 inputNormal;\n\nvarying vec4 cameraPos;\n\n#ifdef PICKING\n    attribute vec3 pickingColor;\n    varying vec3 vPickingColor;\n#else\n    attribute vec3 inputColor;\n    varying vec3 color;\n    varying vec3 vNormal;\n#endif\n\nvoid main(void){\n\n    #ifdef PICKING\n        vPickingColor = pickingColor;\n    #else\n        color = inputColor;\n        vNormal = normalize( normalMatrix * normal * -1.0 );;\n    #endif\n\n    cameraPos = modelViewMatrix * vec4( position + ( normalize(inputDir)*inputSize ), 1.0 );\n\n    gl_Position = projectionMatrix * vec4( cameraPos.xyz, 1.0 );\n\n}\n";

// File:shader/Ribbon.frag

NGL.Resources[ '../shader/Ribbon.frag'] = "\nuniform float opacity;\nuniform float nearClip;\n\nvarying vec4 cameraPos;\n\n#ifdef PICKING\n    varying vec3 vPickingColor;\n#else\n    varying vec3 color;\n    varying vec3 vNormal;\n#endif\n\n#include light_params\n\n#include fog_params\n\n\nvoid main() {\n\n    if( dot( cameraPos, vec4( 0.0, 0.0, 1.0, nearClip ) ) > 0.0 )\n        discard;\n\n    #ifdef PICKING\n        gl_FragColor.xyz = vPickingColor;\n        //gl_FragColor.xyz = vec3( 1.0, 0.0, 0.0 );\n    #else\n        vec3 transformedNormal = normalize( vNormal );\n        #ifdef DOUBLE_SIDED\n            transformedNormal = transformedNormal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );\n        #endif\n\n        vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );\n\n        #include light\n\n        gl_FragColor = vec4( color, opacity );\n        // gl_FragColor.xyz = vec3( 1.0, 0.0, 0.0 );\n        gl_FragColor.xyz *= vLightFront;\n        // gl_FragColor.xyz = normalx;\n        //gl_FragColor.xyz = color;\n    #endif\n\n    #include fog\n}\n";

// File:shader/SDFFont.vert

NGL.Resources[ '../shader/SDFFont.vert'] = "\nattribute vec2 mapping;\nattribute vec2 inputTexCoord;\nattribute float inputSize;\nattribute vec3 color;\n\nvarying vec3 vColor;\nvarying vec2 texCoord;\n\n\nvoid main(void){\n\n    vColor = color;\n    texCoord = inputTexCoord;\n\n    vec3 cameraPos = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;\n    vec4 cameraCornerPos = vec4( cameraPos, 1.0 );\n    cameraCornerPos.xy += mapping * inputSize;\n\n    cameraCornerPos.z += 0.5;\n\n    gl_Position = projectionMatrix * cameraCornerPos;\n\n}\n";

// File:shader/SDFFont.frag

NGL.Resources[ '../shader/SDFFont.frag'] = "\n#extension GL_OES_standard_derivatives : enable\n\nuniform vec3 backgroundColor;\nuniform sampler2D fontTexture;\n\nuniform float opacity;\n\nvarying vec3 vColor;\nvarying vec2 texCoord;\n\n#include fog_params\n\nconst float smoothness = 16.0;\nconst float gamma = 2.2;\n\nvoid main() {\n\n    // retrieve signed distance\n    float sdf = texture2D( fontTexture, texCoord ).a;\n\n    // perform adaptive anti-aliasing of the edges\n    float w = clamp(\n        smoothness * ( abs( dFdx( texCoord.x ) ) + abs( dFdy( texCoord.y ) ) ),\n        0.0,\n        0.5\n    );\n    float a = smoothstep( 0.5 - w, 0.5 + w, sdf );\n\n    // gamma correction for linear attenuation\n    a = pow( a, 1.0 / gamma );\n\n    if( a < 0.2 ) discard;\n\n    a *= opacity;\n\n    #ifndef ANTIALIAS\n        gl_FragColor = vec4( mix( backgroundColor, vColor, a ), 1.0 );\n    #else\n        gl_FragColor = vec4( vColor, a );\n    #endif\n\n    #include fog\n\n}\n\n";

// File:shader/SphereHalo.vert

NGL.Resources[ '../shader/SphereHalo.vert'] = "\nattribute vec2 mapping;\nattribute float radius;\n\nvarying vec3 point;\nvarying vec3 cameraSpherePos;\nvarying float sphereRadius;\n\nuniform mat4 projectionMatrixInverse;\n\nconst mat4 D = mat4(\n    1.0, 0.0, 0.0, 0.0,\n    0.0, 1.0, 0.0, 0.0,\n    0.0, 0.0, 1.0, 0.0,\n    0.0, 0.0, 0.0, -1.0\n);\n\nmat4 transpose( in mat4 inMatrix ) {\n    vec4 i0 = inMatrix[0];\n    vec4 i1 = inMatrix[1];\n    vec4 i2 = inMatrix[2];\n    vec4 i3 = inMatrix[3];\n\n    mat4 outMatrix = mat4(\n        vec4(i0.x, i1.x, i2.x, i3.x),\n        vec4(i0.y, i1.y, i2.y, i3.y),\n        vec4(i0.z, i1.z, i2.z, i3.z),\n        vec4(i0.w, i1.w, i2.w, i3.w)\n    );\n    return outMatrix;\n}\n\n\n//------------------------------------------------------------------------------\n// Compute point size and center using the technique described in:\n// \"GPU-Based Ray-Casting of Quadratic Surfaces\"\n// by Christian Sigg, Tim Weyrich, Mario Botsch, Markus Gross.\n//\n// Code based on\n/*=========================================================================\n\n Program:   Visualization Toolkit\n Module:    Quadrics_fs.glsl and Quadrics_vs.glsl\n\n Copyright (c) Ken Martin, Will Schroeder, Bill Lorensen\n All rights reserved.\n See Copyright.txt or http://www.kitware.com/Copyright.htm for details.\n\n This software is distributed WITHOUT ANY WARRANTY; without even\n the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR\n PURPOSE.  See the above copyright notice for more information.\n\n =========================================================================*/\n\n// .NAME Quadrics_fs.glsl and Quadrics_vs.glsl\n// .SECTION Thanks\n// <verbatim>\n//\n//  This file is part of the PointSprites plugin developed and contributed by\n//\n//  Copyright (c) CSCS - Swiss National Supercomputing Centre\n//                EDF - Electricite de France\n//\n//  John Biddiscombe, Ugo Varetto (CSCS)\n//  Stephane Ploix (EDF)\n//\n// </verbatim>\n// \n// Contributions by Alexander Rose\n// - ported to WebGL\n// - adapted to work with quads\nvoid ComputePointSizeAndPositionInClipCoordSphere(){\n    \n    vec2 xbc;\n    vec2 ybc;\n\n    mat4 T = mat4(\n        sphereRadius, 0.0, 0.0, 0.0,\n        0.0, sphereRadius, 0.0, 0.0,\n        0.0, 0.0, sphereRadius, 0.0,\n        position.x, position.y, position.z, 1.0\n    );\n\n    mat4 R = transpose( projectionMatrix * modelViewMatrix * T );\n    float A = dot( R[ 3 ], D * R[ 3 ] );\n    float B = -2.0 * dot( R[ 0 ], D * R[ 3 ] );\n    float C = dot( R[ 0 ], D * R[ 0 ] );\n    xbc[ 0 ] = ( -B - sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );\n    xbc[ 1 ] = ( -B + sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );\n    float sx = abs( xbc[ 0 ] - xbc[ 1 ] ) * 0.5;\n\n    A = dot( R[ 3 ], D * R[ 3 ] );\n    B = -2.0 * dot( R[ 1 ], D * R[ 3 ] );\n    C = dot( R[ 1 ], D * R[ 1 ] );\n    ybc[ 0 ] = ( -B - sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );\n    ybc[ 1 ] = ( -B + sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );\n    float sy = abs( ybc[ 0 ] - ybc[ 1 ]  ) * 0.5;\n\n    gl_Position.xy = vec2( 0.5 * ( xbc.x + xbc.y ), 0.5 * ( ybc.x + ybc.y ) );\n    gl_Position.xy -= mapping * vec2( sx, sy );\n    gl_Position.xy *= gl_Position.w;\n}\n\n\nvoid main(void){\n\n    cameraSpherePos = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;\n    sphereRadius = radius * 1.3;\n\n    gl_Position = projectionMatrix * vec4( cameraSpherePos, 1.0 );\n    ComputePointSizeAndPositionInClipCoordSphere();\n\n    point = ( projectionMatrixInverse * gl_Position ).xyz;\n\n    // move out of viewing frustum to avoid clipping artifacts\n    if( gl_Position.z-sphereRadius<=1.0 )\n        gl_Position.z = -10.0;\n}\n\n\n\n\n\n";

// File:shader/SphereHalo.frag

NGL.Resources[ '../shader/SphereHalo.frag'] = "\nvarying vec3 point;\nvarying vec3 cameraSpherePos;\nvarying float sphereRadius;\n\nuniform vec3 color;\n\n#include fog_params\n\n\nvoid main(void)\n{   \n    vec3 rayDirection = normalize( point );\n    \n    float B = -2.0 * dot(rayDirection, cameraSpherePos);\n    float C = dot(cameraSpherePos, cameraSpherePos) - (sphereRadius*sphereRadius);\n    float det = (B * B) - (4.0 * C);\n    if(det < 0.0)\n        discard;\n\n    float r2 = sphereRadius*0.97;\n    B = -2.0 * dot(rayDirection, cameraSpherePos);\n    C = dot(cameraSpherePos, cameraSpherePos) - (r2*r2);\n    det = (B * B) - (4.0 * C);\n\n    if(det < 0.0){\n        gl_FragColor = vec4( color, 1.0 );\n\n    }else{\n    	gl_FragColor = vec4( color, 0.5 );\n    }\n    \n    #include fog\n}\n\n\n";

// File:shader/SphereImpostor.vert

NGL.Resources[ '../shader/SphereImpostor.vert'] = "\nattribute vec2 mapping;\nattribute float radius;\n\nvarying vec3 point;\nvarying vec4 cameraSpherePos;\nvarying float sphereRadius;\n\n#ifdef PICKING\n    attribute vec3 pickingColor;\n    varying vec3 vPickingColor;\n#else\n    attribute vec3 color;\n    varying vec3 vColor;\n#endif\n\nuniform mat4 projectionMatrixInverse;\n\nconst mat4 D = mat4(\n    1.0, 0.0, 0.0, 0.0,\n    0.0, 1.0, 0.0, 0.0,\n    0.0, 0.0, 1.0, 0.0,\n    0.0, 0.0, 0.0, -1.0\n);\n\nmat4 transpose( in mat4 inMatrix ) {\n    vec4 i0 = inMatrix[0];\n    vec4 i1 = inMatrix[1];\n    vec4 i2 = inMatrix[2];\n    vec4 i3 = inMatrix[3];\n\n    mat4 outMatrix = mat4(\n        vec4(i0.x, i1.x, i2.x, i3.x),\n        vec4(i0.y, i1.y, i2.y, i3.y),\n        vec4(i0.z, i1.z, i2.z, i3.z),\n        vec4(i0.w, i1.w, i2.w, i3.w)\n    );\n    return outMatrix;\n}\n\n\n//------------------------------------------------------------------------------\n// Compute point size and center using the technique described in:\n// \"GPU-Based Ray-Casting of Quadratic Surfaces\"\n// by Christian Sigg, Tim Weyrich, Mario Botsch, Markus Gross.\n//\n// Code based on\n/*=========================================================================\n\n Program:   Visualization Toolkit\n Module:    Quadrics_fs.glsl and Quadrics_vs.glsl\n\n Copyright (c) Ken Martin, Will Schroeder, Bill Lorensen\n All rights reserved.\n See Copyright.txt or http://www.kitware.com/Copyright.htm for details.\n\n This software is distributed WITHOUT ANY WARRANTY; without even\n the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR\n PURPOSE.  See the above copyright notice for more information.\n\n =========================================================================*/\n\n// .NAME Quadrics_fs.glsl and Quadrics_vs.glsl\n// .SECTION Thanks\n// <verbatim>\n//\n//  This file is part of the PointSprites plugin developed and contributed by\n//\n//  Copyright (c) CSCS - Swiss National Supercomputing Centre\n//                EDF - Electricite de France\n//\n//  John Biddiscombe, Ugo Varetto (CSCS)\n//  Stephane Ploix (EDF)\n//\n// </verbatim>\n//\n// Contributions by Alexander Rose\n// - ported to WebGL\n// - adapted to work with quads\nvoid ComputePointSizeAndPositionInClipCoordSphere(){\n\n    vec2 xbc;\n    vec2 ybc;\n\n    mat4 T = mat4(\n        sphereRadius, 0.0, 0.0, 0.0,\n        0.0, sphereRadius, 0.0, 0.0,\n        0.0, 0.0, sphereRadius, 0.0,\n        position.x, position.y, position.z, 1.0\n    );\n\n    mat4 R = transpose( projectionMatrix * modelViewMatrix * T );\n    float A = dot( R[ 3 ], D * R[ 3 ] );\n    float B = -2.0 * dot( R[ 0 ], D * R[ 3 ] );\n    float C = dot( R[ 0 ], D * R[ 0 ] );\n    xbc[ 0 ] = ( -B - sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );\n    xbc[ 1 ] = ( -B + sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );\n    float sx = abs( xbc[ 0 ] - xbc[ 1 ] ) * 0.5;\n\n    A = dot( R[ 3 ], D * R[ 3 ] );\n    B = -2.0 * dot( R[ 1 ], D * R[ 3 ] );\n    C = dot( R[ 1 ], D * R[ 1 ] );\n    ybc[ 0 ] = ( -B - sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );\n    ybc[ 1 ] = ( -B + sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );\n    float sy = abs( ybc[ 0 ] - ybc[ 1 ]  ) * 0.5;\n\n    gl_Position.xy = vec2( 0.5 * ( xbc.x + xbc.y ), 0.5 * ( ybc.x + ybc.y ) );\n    gl_Position.xy -= mapping * vec2( sx, sy );\n    gl_Position.xy *= gl_Position.w;\n\n}\n\n\nvoid main(void){\n\n    #ifdef PICKING\n        vPickingColor = pickingColor;\n    #else\n        vColor = color;\n    #endif\n\n    cameraSpherePos = ( modelViewMatrix * vec4( position, 1.0 ) ).xyzw;\n    sphereRadius = radius;\n\n    cameraSpherePos.z -= radius;\n\n    gl_Position = projectionMatrix * vec4( cameraSpherePos.xyz, 1.0 );\n    ComputePointSizeAndPositionInClipCoordSphere();\n\n    point = ( projectionMatrixInverse * gl_Position ).xyz;\n\n    // move out of viewing frustum to avoid clipping artifacts\n    // if( gl_Position.z-sphereRadius<=1.0 ){\n    //     gl_Position.z = -10.0;\n    // }\n\n}\n\n\n\n\n\n";

// File:shader/SphereImpostor.frag

NGL.Resources[ '../shader/SphereImpostor.frag'] = "\n#extension GL_EXT_frag_depth : enable\n\n// not available in WebGL\n// #extension GL_ARB_conservative_depth : enable\n// layout(depth_less) out float gl_FragDepthEXT;\n\nuniform float opacity;\nuniform float nearClip;\n\nuniform mat4 projectionMatrix;\n\nvarying vec3 point;\nvarying vec4 cameraSpherePos;\nvarying float sphereRadius;\n\n#ifdef PICKING\n    varying vec3 vPickingColor;\n#else\n    varying vec3 vColor;\n#endif\n\n#include light_params\n\n#include fog_params\n\n\nvec3 cameraPos;\nvec3 cameraNormal;\n\n\n// vec4 poly_color = gl_Color;\n\n//   if(uf_use_border_hinting == 1.0)\n//   {\n//     vec3 wc_eye_dir = normalize(wc_sp_pt);\n//     float n_dot_e   = abs(dot(wc_sp_nrml,wc_eye_dir));\n//     float alpha     = max(uf_border_color_start_cosine - n_dot_e,0.0)/uf_border_color_start_cosine;\n//     poly_color      = mix(gl_Color,uf_border_color,0.75*alpha);\n//   }\n\n//   color += (diff + amb)*poly_color + spec*gl_FrontMaterial.specular;\n\n\n// Calculate depth based on the given camera position.\nfloat calcDepth( in vec3 camPos )\n{\n    vec2 clipZW = camPos.z * projectionMatrix[2].zw + projectionMatrix[3].zw;\n    return 0.5 + 0.5 * clipZW.x / clipZW.y;\n}\n\n\nbool Impostor(out vec3 cameraPos, out vec3 cameraNormal)\n{\n\n    vec3 cameraSpherePos2 = cameraSpherePos.xyz;\n    cameraSpherePos2.z += sphereRadius;\n\n    vec3 rayDirection = normalize( point );\n\n    float B = -2.0 * dot(rayDirection, cameraSpherePos2);\n    float C = dot(cameraSpherePos2, cameraSpherePos2) - (sphereRadius*sphereRadius);\n\n    float det = (B * B) - (4.0 * C);\n    if(det < 0.0){\n        discard;\n        return false;\n    }else{\n        float sqrtDet = sqrt(det);\n        float posT = (-B + sqrtDet)/2.0;\n        float negT = (-B - sqrtDet)/2.0;\n\n        float intersectT = min(posT, negT);\n        cameraPos = rayDirection * intersectT;\n        if( calcDepth( cameraPos ) <= 0.0 ){\n            cameraPos = rayDirection * max(posT, negT);\n            cameraNormal = vec3( 0.0, 0.0, 0.4 );\n            return false;\n        }else{\n            cameraNormal = normalize(cameraPos - cameraSpherePos2);\n        }\n\n        return true;\n    }\n\n    return false; // ensure that each control flow has a return\n\n}\n\n\nvoid main(void)\n{\n\n    bool flag = Impostor( cameraPos, cameraNormal );\n\n    if( dot( cameraSpherePos, vec4( 0.0, 0.0, 1.0, nearClip ) ) > 0.0 )\n        discard;\n\n    //Set the depth based on the new cameraPos.\n    gl_FragDepthEXT = calcDepth( cameraPos );\n    if( !flag ){\n\n        if( gl_FragDepthEXT >= 0.0 ){\n            // clamp to near clipping plane and add a tiny value to\n            // make spheres with a greater radius occlude smaller ones\n            gl_FragDepthEXT = 0.0 + ( 0.000001 / sphereRadius );\n        }\n\n    }\n\n    // bugfix (mac only?)\n    if (gl_FragDepthEXT < 0.0)\n        discard;\n    if (gl_FragDepthEXT > 1.0)\n        discard;\n\n    #ifdef PICKING\n        gl_FragColor = vec4( vPickingColor, 1.0 );\n        //gl_FragColor.xyz = vec3( 1.0, 0.0, 0.0 );\n    #else\n        vec3 transformedNormal = cameraNormal;\n        vec3 vLightFront = vec3( 0.0, 0.0, 0.0 );\n\n        #include light\n\n        gl_FragColor = vec4( vColor, opacity );\n        gl_FragColor.xyz *= vLightFront;\n\n        // gl_FragColor.a = 0.5;\n        // gl_FragColor.xyz = transformedNormal;\n        // gl_FragColor.xyz = point;\n    #endif\n\n    #include fog\n\n}\n\n\n// void main2(void)\n// {\n//     gl_FragColor = vec4( vColor, 1.0 );\n// }\n\n\n\n";

// File:shader/chunk/fog.glsl

NGL.Resources[ '../shader/chunk/fog.glsl'] = "#ifdef USE_FOG\n	float depth = gl_FragCoord.z / gl_FragCoord.w;\n	#ifdef FOG_EXP2\n		const float LOG2 = 1.442695;\n		float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );\n		fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );\n	#else\n		float fogFactor = smoothstep( fogNear, fogFar, depth );\n	#endif\n	gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );\n#endif";

// File:shader/chunk/fog_params.glsl

NGL.Resources[ '../shader/chunk/fog_params.glsl'] = "#ifdef USE_FOG\n	uniform vec3 fogColor;\n	#ifdef FOG_EXP2\n		uniform float fogDensity;\n	#else\n		uniform float fogNear;\n		uniform float fogFar;\n	#endif\n#endif";

// File:shader/chunk/light.glsl

NGL.Resources[ '../shader/chunk/light.glsl'] = "\n// LIGHT\n// IN: transformedNormal, vLightFront\n// OUT: vLightFront\n\n// #if MAX_DIR_LIGHTS > 0\n//     for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\n//         vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );\n//         vec3 dirVector = normalize( lDirection.xyz );\n//         float dotProduct = dot( transformedNormal, dirVector );\n//         vec3 directionalLightWeighting = vec3( max( dotProduct, 0.0 ) );\n//         vLightFront += directionalLightColor[ i ] * directionalLightWeighting;\n//     }\n// #endif\n// #if MAX_HEMI_LIGHTS > 0\n//     for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {\n//         vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );\n//         vec3 lVector = normalize( lDirection.xyz );\n//         float dotProduct = dot( transformedNormal, lVector );\n//         float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;\n//         float hemiDiffuseWeightBack = -0.5 * dotProduct + 0.5;\n//         vLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );\n//     }\n// #endif\n// // vLightFront = vLightFront * diffuse + ambient * ambientLightColor + emissive;\n// vLightFront = vLightFront + ambient * ambientLightColor + emissive;\n\n\n// Give light vector position perpendicular to the screen\nvec3 lightvec = normalize(vec3(0.0,0.0,1.2));\nvec3 eyepos = vec3(0.0,0.0,1.0);\n\n// calculate half-angle vector\nvec3 halfvec = normalize(lightvec + eyepos);\n\n// Parameters used to calculate per pixel lighting\n// see http://http.developer.nvidia.com/CgTutorial/cg_tutorial_chapter05.html\nfloat diffuse = dot(transformedNormal,lightvec);\nfloat specular = dot(transformedNormal, halfvec);\nvec4 lighting = lit(diffuse, specular, 512.0);\n\nvec3 specularcolor = vec3(1.0,1.0,1.0);\n\nvLightFront = ( vLightFront + lighting.y * vec3(1.0, 1.0, 1.0) + lighting.z * specularcolor ).xyz;\n\n\n";

// File:shader/chunk/light_params.glsl

NGL.Resources[ '../shader/chunk/light_params.glsl'] = "uniform vec3 ambient;\nuniform vec3 diffuse;\nuniform vec3 emissive;\n\nuniform vec3 ambientLightColor;\n\n#if MAX_DIR_LIGHTS > 0\n    uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\n    uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n    uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];\n    uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];\n    uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];\n#endif\n\n\n\nvec4 lit(float NdotL, float NdotH, float m) {\n    float ambient = 1.0;\n    float diffuse = max(NdotL, 0.0);\n    float specular = pow(abs(NdotH),m);\n    if(NdotL < 0.0 || NdotH < 0.0)\n        specular = 0.0;\n    return vec4(ambient, diffuse, specular, 1.0);\n}\n\n";

// File:fonts/LatoBlack.fnt

NGL.Resources[ '../fonts/LatoBlack.fnt'] = "info face=\"Lato Black\" size=32 bold=0 italic=0 charset=\"\" unicode=0 stretchH=100 smooth=1 aa=1 padding=4,4,4,4 spacing=-8,-8\ncommon lineHeight=39 base=32 scaleW=512 scaleH=512 pages=1 packed=0\npage id=0 file=\"LatoBlack-sdf.png\"\nchars count=95\nchar id=32   x=0     y=0     width=0     height=0     xoffset=0     yoffset=32    xadvance=6     page=0  chnl=0\nchar id=41   x=0     y=0     width=17     height=41     xoffset=-3     yoffset=2    xadvance=10     page=0  chnl=0\nchar id=40   x=17     y=0     width=17     height=41     xoffset=-3     yoffset=2    xadvance=10     page=0  chnl=0\nchar id=36   x=34     y=0     width=27     height=40     xoffset=-4     yoffset=0    xadvance=19     page=0  chnl=0\nchar id=124   x=61     y=0     width=14     height=40     xoffset=-2     yoffset=2    xadvance=10     page=0  chnl=0\nchar id=125   x=75     y=0     width=19     height=40     xoffset=-4     yoffset=2    xadvance=10     page=0  chnl=0\nchar id=123   x=94     y=0     width=18     height=40     xoffset=-4     yoffset=2    xadvance=10     page=0  chnl=0\nchar id=93   x=112     y=0     width=18     height=40     xoffset=-4     yoffset=2    xadvance=10     page=0  chnl=0\nchar id=91   x=130     y=0     width=17     height=40     xoffset=-3     yoffset=2    xadvance=10     page=0  chnl=0\nchar id=106   x=147     y=0     width=18     height=38     xoffset=-5     yoffset=4    xadvance=9     page=0  chnl=0\nchar id=81   x=165     y=0     width=36     height=38     xoffset=-4     yoffset=3    xadvance=26     page=0  chnl=0\nchar id=92   x=201     y=0     width=24     height=36     xoffset=-5     yoffset=3    xadvance=13     page=0  chnl=0\nchar id=64   x=225     y=0     width=35     height=36     xoffset=-4     yoffset=5    xadvance=26     page=0  chnl=0\nchar id=47   x=260     y=0     width=24     height=36     xoffset=-5     yoffset=3    xadvance=13     page=0  chnl=0\nchar id=127   x=284     y=0     width=27     height=34     xoffset=-4     yoffset=3    xadvance=18     page=0  chnl=0\nchar id=38   x=311     y=0     width=33     height=34     xoffset=-4     yoffset=3    xadvance=23     page=0  chnl=0\nchar id=35   x=344     y=0     width=28     height=34     xoffset=-4     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=37   x=372     y=0     width=35     height=34     xoffset=-4     yoffset=3    xadvance=26     page=0  chnl=0\nchar id=63   x=407     y=0     width=23     height=34     xoffset=-4     yoffset=3    xadvance=14     page=0  chnl=0\nchar id=33   x=430     y=0     width=15     height=34     xoffset=-1     yoffset=3    xadvance=12     page=0  chnl=0\nchar id=48   x=445     y=0     width=27     height=34     xoffset=-4     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=56   x=472     y=0     width=27     height=34     xoffset=-4     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=55   x=0     y=41     width=26     height=34     xoffset=-3     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=54   x=26     y=41     width=26     height=34     xoffset=-3     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=53   x=52     y=41     width=26     height=34     xoffset=-4     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=52   x=78     y=41     width=28     height=34     xoffset=-4     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=51   x=106     y=41     width=26     height=34     xoffset=-3     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=50   x=132     y=41     width=26     height=34     xoffset=-3     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=49   x=158     y=41     width=25     height=34     xoffset=-2     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=108   x=183     y=41     width=15     height=34     xoffset=-2     yoffset=3    xadvance=9     page=0  chnl=0\nchar id=107   x=198     y=41     width=27     height=34     xoffset=-3     yoffset=3    xadvance=18     page=0  chnl=0\nchar id=104   x=225     y=41     width=25     height=34     xoffset=-3     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=100   x=250     y=41     width=26     height=34     xoffset=-4     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=98   x=276     y=41     width=26     height=34     xoffset=-3     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=90   x=302     y=41     width=28     height=34     xoffset=-4     yoffset=3    xadvance=20     page=0  chnl=0\nchar id=89   x=330     y=41     width=32     height=34     xoffset=-5     yoffset=3    xadvance=22     page=0  chnl=0\nchar id=88   x=362     y=41     width=32     height=34     xoffset=-4     yoffset=3    xadvance=23     page=0  chnl=0\nchar id=87   x=394     y=41     width=44     height=34     xoffset=-4     yoffset=3    xadvance=34     page=0  chnl=0\nchar id=86   x=438     y=41     width=33     height=34     xoffset=-4     yoffset=3    xadvance=24     page=0  chnl=0\nchar id=85   x=471     y=41     width=30     height=34     xoffset=-3     yoffset=3    xadvance=23     page=0  chnl=0\nchar id=84   x=0     y=75     width=28     height=34     xoffset=-4     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=83   x=28     y=75     width=26     height=34     xoffset=-4     yoffset=3    xadvance=17     page=0  chnl=0\nchar id=82   x=54     y=75     width=29     height=34     xoffset=-3     yoffset=3    xadvance=21     page=0  chnl=0\nchar id=80   x=83     y=75     width=28     height=34     xoffset=-3     yoffset=3    xadvance=20     page=0  chnl=0\nchar id=79   x=111     y=75     width=34     height=34     xoffset=-4     yoffset=3    xadvance=26     page=0  chnl=0\nchar id=78   x=145     y=75     width=31     height=34     xoffset=-3     yoffset=3    xadvance=24     page=0  chnl=0\nchar id=77   x=176     y=75     width=37     height=34     xoffset=-3     yoffset=3    xadvance=30     page=0  chnl=0\nchar id=76   x=213     y=75     width=24     height=34     xoffset=-3     yoffset=3    xadvance=17     page=0  chnl=0\nchar id=75   x=237     y=75     width=31     height=34     xoffset=-3     yoffset=3    xadvance=23     page=0  chnl=0\nchar id=74   x=268     y=75     width=21     height=34     xoffset=-4     yoffset=3    xadvance=14     page=0  chnl=0\nchar id=73   x=289     y=75     width=15     height=34     xoffset=-2     yoffset=3    xadvance=10     page=0  chnl=0\nchar id=72   x=304     y=75     width=31     height=34     xoffset=-3     yoffset=3    xadvance=24     page=0  chnl=0\nchar id=71   x=335     y=75     width=31     height=34     xoffset=-4     yoffset=3    xadvance=23     page=0  chnl=0\nchar id=70   x=366     y=75     width=25     height=34     xoffset=-3     yoffset=3    xadvance=18     page=0  chnl=0\nchar id=69   x=391     y=75     width=25     height=34     xoffset=-3     yoffset=3    xadvance=18     page=0  chnl=0\nchar id=68   x=416     y=75     width=32     height=34     xoffset=-3     yoffset=3    xadvance=24     page=0  chnl=0\nchar id=67   x=448     y=75     width=30     height=34     xoffset=-4     yoffset=3    xadvance=21     page=0  chnl=0\nchar id=66   x=478     y=75     width=28     height=34     xoffset=-3     yoffset=3    xadvance=21     page=0  chnl=0\nchar id=65   x=0     y=109     width=33     height=34     xoffset=-4     yoffset=3    xadvance=24     page=0  chnl=0\nchar id=57   x=33     y=109     width=27     height=33     xoffset=-3     yoffset=4    xadvance=19     page=0  chnl=0\nchar id=105   x=60     y=109     width=16     height=33     xoffset=-3     yoffset=4    xadvance=9     page=0  chnl=0\nchar id=102   x=76     y=109     width=21     height=33     xoffset=-4     yoffset=4    xadvance=12     page=0  chnl=0\nchar id=121   x=97     y=109     width=27     height=32     xoffset=-4     yoffset=10    xadvance=18     page=0  chnl=0\nchar id=116   x=124     y=109     width=22     height=32     xoffset=-4     yoffset=5    xadvance=13     page=0  chnl=0\nchar id=113   x=146     y=109     width=26     height=32     xoffset=-4     yoffset=10    xadvance=19     page=0  chnl=0\nchar id=112   x=172     y=109     width=26     height=32     xoffset=-3     yoffset=10    xadvance=19     page=0  chnl=0\nchar id=103   x=198     y=109     width=26     height=32     xoffset=-4     yoffset=10    xadvance=17     page=0  chnl=0\nchar id=59   x=224     y=109     width=16     height=31     xoffset=-3     yoffset=11    xadvance=9     page=0  chnl=0\nchar id=122   x=240     y=109     width=23     height=27     xoffset=-3     yoffset=10    xadvance=15     page=0  chnl=0\nchar id=120   x=263     y=109     width=27     height=27     xoffset=-4     yoffset=10    xadvance=18     page=0  chnl=0\nchar id=119   x=290     y=109     width=35     height=27     xoffset=-4     yoffset=10    xadvance=26     page=0  chnl=0\nchar id=118   x=325     y=109     width=27     height=27     xoffset=-4     yoffset=10    xadvance=18     page=0  chnl=0\nchar id=117   x=352     y=109     width=25     height=27     xoffset=-3     yoffset=10    xadvance=19     page=0  chnl=0\nchar id=115   x=377     y=109     width=23     height=27     xoffset=-4     yoffset=10    xadvance=14     page=0  chnl=0\nchar id=114   x=400     y=109     width=21     height=27     xoffset=-3     yoffset=10    xadvance=13     page=0  chnl=0\nchar id=110   x=421     y=109     width=25     height=27     xoffset=-3     yoffset=10    xadvance=19     page=0  chnl=0\nchar id=109   x=446     y=109     width=34     height=27     xoffset=-3     yoffset=10    xadvance=28     page=0  chnl=0\nchar id=101   x=480     y=109     width=26     height=27     xoffset=-4     yoffset=10    xadvance=17     page=0  chnl=0\nchar id=99   x=0     y=143     width=25     height=27     xoffset=-4     yoffset=10    xadvance=16     page=0  chnl=0\nchar id=97   x=25     y=143     width=24     height=27     xoffset=-3     yoffset=10    xadvance=17     page=0  chnl=0\nchar id=43   x=49     y=143     width=26     height=26     xoffset=-3     yoffset=8    xadvance=19     page=0  chnl=0\nchar id=58   x=75     y=143     width=16     height=26     xoffset=-3     yoffset=11    xadvance=9     page=0  chnl=0\nchar id=111   x=91     y=143     width=27     height=26     xoffset=-4     yoffset=11    xadvance=19     page=0  chnl=0\nchar id=62   x=118     y=143     width=23     height=25     xoffset=-1     yoffset=9    xadvance=19     page=0  chnl=0\nchar id=60   x=141     y=143     width=23     height=25     xoffset=-2     yoffset=9    xadvance=19     page=0  chnl=0\nchar id=42   x=164     y=143     width=21     height=21     xoffset=-4     yoffset=3    xadvance=13     page=0  chnl=0\nchar id=94   x=185     y=143     width=25     height=21     xoffset=-3     yoffset=3    xadvance=19     page=0  chnl=0\nchar id=44   x=210     y=143     width=15     height=20     xoffset=-3     yoffset=22    xadvance=8     page=0  chnl=0\nchar id=61   x=225     y=143     width=25     height=19     xoffset=-3     yoffset=12    xadvance=19     page=0  chnl=0\nchar id=39   x=250     y=143     width=15     height=19     xoffset=-3     yoffset=3    xadvance=8     page=0  chnl=0\nchar id=34   x=265     y=143     width=21     height=19     xoffset=-3     yoffset=3    xadvance=14     page=0  chnl=0\nchar id=126   x=286     y=143     width=26     height=17     xoffset=-3     yoffset=14    xadvance=19     page=0  chnl=0\nchar id=46   x=312     y=143     width=16     height=16     xoffset=-4     yoffset=21    xadvance=8     page=0  chnl=0\nchar id=96   x=328     y=143     width=18     height=15     xoffset=-5     yoffset=3    xadvance=11     page=0  chnl=0\nchar id=95   x=346     y=143     width=22     height=13     xoffset=-4     yoffset=29    xadvance=13     page=0  chnl=0\nchar id=45   x=368     y=143     width=19     height=13     xoffset=-3     yoffset=16    xadvance=12     page=0  chnl=0\n";

// File:fonts/LatoBlack.png

NGL.Resources[ '../fonts/LatoBlack.png'] = NGL.dataURItoImage("data:image/png;base64,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\n+9Thmi1iSv0S6qkyke+NUMwNsga0pXgsLNOiP7ijAd4ZBZ0JIYS4JYZABRRPAxSRKaSGzFqrFHld\n264XKrp6NktFGdZGIVqpqVYRQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGE\nEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBC\nCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQggh\nhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQ\nQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEII\nIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGE\nEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBC\nCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQggh\nhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQ\nQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEII\nIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGE\nEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBC\nCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQggh\nhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQ\nQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEII\nIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGE\nEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBC\nCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQggh\nhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQ\nQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEII\nIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGE\nEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBC\nCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQggh\nhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQ\nQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEII\nIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGE\nEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBC\nCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQggh\nhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQ\nQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEII\nIYQQQgghhBBCCCGEEKJM+X8Bl4tInGh6U68AAAAASUVORK5CYII=\n");

// File:img/radial.png

NGL.Resources[ '../img/radial.png'] = NGL.dataURItoImage("data:image/png;base64,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\n");

