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

    var path = ( file instanceof File ) ? file.name : file;

    return {
        "path": path,
        "name": path.replace( /^.*[\\\/]/, '' ),
        "ext": path.split('.').pop().toLowerCase()
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

NGL.Spline = function( fiber ){

    this.fiber = fiber;
    this.size = fiber.residueCount - 2;
    this.traceAtomname = fiber.traceAtomname;
    this.directionAtomname1 = fiber.directionAtomname1;
    this.directionAtomname2 = fiber.directionAtomname2;

    this.isNucleic = this.fiber.residues[ 0 ].isNucleic();
    this.tension = this.isNucleic ? 0.5 : 0.9;

};

NGL.Spline.prototype = {

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

        var size = new Float32Array( n1 * m + 1 );

        var radiusFactory = new NGL.RadiusFactory( type, scale );

        var k = 0;
        var j, l, a2, a3, s2, s3, t;

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            a2 = r2.getAtomByName( traceAtomname );
            a3 = r3.getAtomByName( traceAtomname );

            s2 = radiusFactory.atomRadius( a2 );
            s3 = radiusFactory.atomRadius( a3 );

            for( j = 0; j < m; ++j ){

                // linear interpolation
                t = j / m;
                size[ k + j ] = ( 1 - t ) * s2 + t * s3;

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

            r.addAtom( a );
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

        // project first traceAtom onto first axis to get first center pos
        _axis.fromArray( axis, 0 );
        _center.copy( res[ 0 ].getAtomByName( traceAtomname ) );
        v1.fromArray( center, 3 );
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
        v1.toArray( center, 3 * n - 3 )

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

        object.getBoundingBox = NGL.AtomSet.prototype.getBoundingBox;

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

        this.autoBond();

        if( this._doAutoSS ){
            this.autoSS();
        }

        if( this._doAutoChainName ){
            this.autoChainName();
        }

        this.center = this.atomCenter();
        this.boundingBox = this.getBoundingBox();

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

            this.eachFiber( function( f ){

                if( f.isProtein() ){

                    proteinFiber( f );

                }else if( f.isCg() ){

                    cgFiber( f );

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

    addAtom: function( a ){

        if( !a ){
            a = new NGL.Atom( this );
            a.index = this.nextAtomIndex();
        }else{
            this.atomCount += 1;
            a.residue = this;
        }
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

    connectedTo: function( atom ){

        if( this.hetero && atom.hetero &&
            this.residue.chain.model.structure.hasConnect ) return false;

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

    }

}


NGL.AtomArray = function( sizeOrObject ){

    this.useBuffer = true;

    if( Number.isInteger( sizeOrObject ) ){

        this.init( sizeOrObject );

    }else{

        this.fromObject( sizeOrObject );

    }

};

NGL.AtomArray.prototype = {

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
            this.chainname = new Uint8Array( size );
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
        this.chainnameSize = size;

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

    }

};


NGL.ProxyAtom = function( atomArray, index ){

    this.atomArray = atomArray;
    this.index = index;

    this.globalindex = NGL.nextGlobalAtomindex++;

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

    // connectedTo: function( atom ){

    //     if( this.hetero && atom.hetero ) return false;

    //     var x = this.x - atom.x;
    //     var y = this.y - atom.y;
    //     var z = this.z - atom.z;

    //     var distSquared = x * x + y * y + z * z;

    //     // console.log( distSquared );
    //     if( this.residue.isCg() && distSquared < 28.0 ) return true;

    //     if( isNaN( distSquared ) ) return false;
    //     if( distSquared < 0.5 ) return false; // duplicate or altloc

    //     var d = this.covalent + atom.covalent + 0.3;
    //     return distSquared < ( d * d );

    // },

    connectedTo: function( atom ){

        var taa = this.atomArray;
        var aaa = atom.atomArray;
        var ti = this.index;
        var ai = atom.index;

        if( taa.hetero[ ti ] && aaa.hetero[ ai ] ) return false;

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

    }

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

    this.trajPath = trajPath;

    this.setStructure( structure );

    this.numframes = undefined;
    this.getNumframes();

    this.selection = new NGL.Selection(
        selectionString || "backbone and not hydrogen"
    );

    this.selection.signals.stringChanged.add( function( string ){

        scope.makeIndices();
        scope.resetCache();

    } );

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

NGL.RemoteTrajectory.prototype = Object.create( NGL.Trajectory.prototype );

NGL.RemoteTrajectory.prototype.loadFrame = function( i, callback ){

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

};

NGL.RemoteTrajectory.prototype.getNumframes = function(){

    var scope = this;

    var loader = new THREE.XHRLoader();
    var url = "../traj/numframes/" + this.trajPath;

    loader.load( url, function( n ){

        n = parseInt( n );
        // console.log( "numframes", n );

        scope.numframes = n;
        scope.signals.gotNumframes.dispatch( n );

    });

};

NGL.RemoteTrajectory.prototype.getPath = function( index, callback ){

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

};


NGL.StructureTrajectory = function( trajPath, structure, selectionString ){

    // if( !trajPath ) trajPath = structure.path;
    trajPath = "";

    NGL.Trajectory.call( this, trajPath, structure, selectionString );

}

NGL.StructureTrajectory.prototype = Object.create( NGL.Trajectory.prototype );

NGL.StructureTrajectory.prototype.loadFrame = function( i, callback ){

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

};

NGL.StructureTrajectory.prototype.getNumframes = function(){

    this.numframes = this.structure.frames.length;
    this.signals.gotNumframes.dispatch( this.numframes );

};

NGL.StructureTrajectory.prototype.getPath = function( index, callback ){

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

};


// NGL.BinaryTrajectory = function( trajPath, structure, selectionString ){

//     if( !trajPath ) trajPath = structure.path;

//     NGL.Trajectory.call( this, trajPath, structure, selectionString );

// }

// NGL.BinaryTrajectory.prototype = Object.create( NGL.Trajectory.prototype );

// NGL.BinaryTrajectory.prototype.loadFrame = function( i, callback ){

//     var coords = new Float32Array( this.structure.frames[ i ] );
//     var box = this.structure.boxes[ i ];

//     if( box ){

//         if( this.backboneIndices.length > 0 && this.params.centerPbc ){
//             var box2 = [ box[ 0 ], box[ 4 ], box[ 8 ] ];
//             var mean = this.getCircularMean(
//                 this.backboneIndices, coords, box2
//             );
//             this.centerPbc( coords, mean, box2 );
//         }

//         if( this.params.removePbc ){
//             this.removePbc( coords, box );
//         }

//     }

//     if( this.indices.length > 0 && this.params.superpose ){
//         this.superpose( coords );
//     }

//     if( !this.frameCache[ i ] ){
//         this.frameCache[ i ] = coords;
//         this.boxCache[ i ] = box;
//         this.frameCacheSize += 1;
//     }

//     this.updateStructure( i, callback );

// };

// NGL.BinaryTrajectory.prototype.getNumframes = function(){

//     this.numframes = this.structure.frames.length;
//     this.signals.gotNumframes.dispatch( this.numframes );

// };


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

            if( this.mode === "once" ){

                var i = this.traj.currentFrame;

                if( i >= this.end || i <= this.start ){

                    if( this.direction === "forward" ){
                        i = this.start;
                    }else{
                        i = this.end;
                    }

                    this.traj.setFrame( i );

                }

            }

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


if( typeof importScripts === 'function' ){

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

    // safeguard
    if( lines.length > 1000000 ) cAlphaOnly = true;

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

    var title = s.title;
    var sheet = s.sheet;
    var helix = s.helix;

    s.hasConnect = false;

    var a, currentChainname, currentResno, currentBiomol;

    //

    var reWhitespace = /\s+/;
    var reQuotedWhitespace = /\s+(?=(?:[^']*'[^']*')*[^']*$)/;

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

                    var ls = line.split( reQuotedWhitespace );
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

                        var ls = line.split( reWhitespace );
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

                        var ls = line.split( reQuotedWhitespace );
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
        var p = ssr.id.length;

        if( ssr ){

            for( var j = 0; j < p; ++j ){

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


NGL.decompress = function( data, file ){

    var decompressedData;
    var ext = NGL.getFileInfo( file ).ext;

    console.time( "decompress " + ext );

    if( data instanceof ArrayBuffer ){
        data = new Uint8Array( data );
    }

    if( ext === "gz" ){

        var gz = pako.ungzip( data, { "to": "string" } );
        decompressedData = gz;

    }else if( ext === "zip" ){

        var zip = new JSZip( data );
        var name = Object.keys( zip.files )[ 0 ];
        decompressedData = zip.files[ name ].asText();

    }else if( ext === "lzma" ){

        var inStream = {
            data: data,
            offset: 0,
            readByte: function(){
                return this.data[this.offset ++];
            }
        };

        var outStream = {
            data: [ /* Uncompressed data will be putted here */ ],
            offset: 0,
            writeByte: function(value){
                this.data[this.offset ++] = value;
            }
        };

        LZMA.decompressFile( inStream, outStream );
        // console.log( outStream );
        var bytes = new Uint8Array( outStream.data );
        decompressedData = NGL.Uint8ToString( bytes );

    }else if( ext === "bz2" ){

        var bitstream = bzip2.array( data );
        decompressedData = bzip2.simple( bitstream )

    }else{

        console.warn( "no decompression method available for '" + ext + "'" );
        decompressedData = data;

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

            console.log( "moin" )
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

        var path = fileInfo.path;
        var name = fileInfo.name;
        var ext = fileInfo.ext;

        var compressed = false;

        // FIXME can lead to false positives
        // maybe use a fake protocoll like rcsb://
        if( name.length === 4 && name == path && name.toLowerCase() === ext ){

            ext = "pdb";
            file = "http://www.rcsb.org/pdb/files/" + name + ".pdb";

            rcsb = true;

        }

        if( ext === "gz" ){
            fileInfo = NGL.getFileInfo( path.substr( 0, path.length - 3 ) );
            ext = fileInfo.ext;
            compressed = true;
        }else if( ext === "zip" ){
            fileInfo = NGL.getFileInfo( path.substr( 0, path.length - 4 ) );
            ext = fileInfo.ext;
            compressed = true;
        }else if( ext === "lzma" ){
            fileInfo = NGL.getFileInfo( path.substr( 0, path.length - 5 ) );
            ext = fileInfo.ext;
            compressed = true;
        }else if( ext === "bz2" ){
            fileInfo = NGL.getFileInfo( path.substr( 0, path.length - 4 ) );
            ext = fileInfo.ext;
            compressed = true;
        }

        if( ext in loaders ){

            loader = new loaders[ ext ];

        }else{

            error( "NGL.autoLoading: ext '" + ext + "' unknown" );

            return null;

        }

        function init( data ){

            if( data ){

                object = loader.init( data, name, path, ext, function( _object ){

                    if( typeof onLoad === "function" ) onLoad( _object );

                }, params );

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

            name = file.name;

            var fileLoader = new NGL.FileLoader();
            if( compressed ) fileLoader.setResponseType( "arraybuffer" );
            fileLoader.load( file, init, onProgress, error );

        }else if( rcsb ){

            if( compressed ) loader.setResponseType( "arraybuffer" );
            loader.load( file, init, onProgress, error );

        }else{

            if( compressed ) loader.setResponseType( "arraybuffer" );
            loader.load( "../data/" + file, init, onProgress, error );

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
    '../fonts/Arial.fnt': '',
    '../fonts/Arial.png': 'image',
    '../fonts/DejaVu.fnt': '',
    '../fonts/DejaVu.png': 'image',
    '../fonts/LatoBlack.fnt': '',
    '../fonts/LatoBlack.png': 'image',

    // sprites
    '../img/circle.png': 'image',
    '../img/spark1.png': 'image',

    // shaders
    '../shader/CylinderImpostor.vert': '',
    '../shader/CylinderImpostor.frag': '',
    '../shader/HyperballStickImpostor.vert': '',
    '../shader/HyperballStickImpostor.frag': '',
    '../shader/Line.vert': '',
    '../shader/Line.frag': '',
    '../shader/LineSprite.vert': '',
    '../shader/LineSprite.frag': '',
    '../shader/Mesh.vert': '',
    '../shader/Mesh.frag': '',
    '../shader/ParticleSprite.vert': '',
    '../shader/ParticleSprite.frag': '',
    '../shader/Quad.vert': '',
    '../shader/Quad.frag': '',
    '../shader/Ribbon.vert': '',
    '../shader/Ribbon.frag': '',
    '../shader/SDFFont.vert': '',
    '../shader/SDFFont.frag': '',
    '../shader/SphereHalo.vert': '',
    '../shader/SphereHalo.frag': '',
    '../shader/SphereImpostor.vert': '',
    '../shader/SphereImpostor.frag': '',

    // shader chunks
    '../shader/chunk/fog.glsl': '',
    '../shader/chunk/fog_params.glsl': '',
    '../shader/chunk/light.glsl': '',
    '../shader/chunk/light_params.glsl': '',

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


NGL.init = function( onload ){

    this.textures = [];

    NGL.initResources( onload );

    return this;

};


NGL.initResources = function( onLoad ){

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

        if( v=="image" ){

            imageLoader.load( url, function( image ){

                NGL.Resources[ url ] = image;

            });

        }else{

            xhrLoader.load( url, function( data ){

                NGL.Resources[ url ] = data;

            });

        }

    });

};


NGL.getShader = function( name ){

    var shader = NGL.Resources[ '../shader/' + name ];
    var re = /^(?!\/\/)\s*#include\s+(\S+)/gmi;

    return shader.replace( re, function( match, p1 ){

        var path = '../shader/chunk/' + p1 + '.glsl';
        var chunk = NGL.Resources[ path ] || THREE.ShaderChunk[ p1 ];

        return chunk ? chunk : "";

    });

};


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

    window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

    // fog & background
    this.setBackground();
    this.setFog();

    this.boundingBox = new THREE.Box3();

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
            antialias: true,
            devicePixelRatio: window.devicePixelRatio
        });
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

        this.controls.addEventListener( 'change', this.render.bind( this ) );

    },

    add: function( buffer, matrixList, background ){

        var group, pickingGroup;

        group = new THREE.Group();
        if( buffer.pickable ){
            pickingGroup = new THREE.Group();
        }

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

        buffer.group = group;
        if( buffer.pickable ){
            buffer.pickingGroup = pickingGroup;
        }

        this.rotationGroup.updateMatrixWorld();
        this.requestRender();

    },

    addBuffer: function( buffer, group, pickingGroup, background, matrix ){

        var mesh = buffer.getMesh( background ? "background" : undefined );
        mesh.frustumCulled = false;
        if( matrix ){
            mesh.applyMatrix( matrix );
            mesh.userData[ "matrix" ] = matrix;
        }
        group.add( mesh );

        if( buffer.pickable ){
            var pickingMesh = buffer.getMesh( "picking" );
            pickingMesh.frustumCulled = false;
            if( matrix ){
                pickingMesh.applyMatrix( matrix );
                pickingMesh.userData[ "matrix" ] = matrix;
            }
            pickingGroup.add( pickingMesh );
        }

        this.updateBoundingBox( buffer.geometry, matrix );

    },

    remove: function( buffer ){

        this.rotationGroup.children.forEach( function( group ){
            group.remove( buffer.group );
        } );

        if( buffer.pickable ){
            this.pickingGroup.remove( buffer.pickingGroup );
        }

        this.updateBoundingBox();

        this.requestRender();

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

        if( NGL.GET( "debug" ) ){

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

        this.renderer.devicePixelRatio = window.devicePixelRatio;

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

    animate: function(){

        requestAnimationFrame( this.animate.bind( this ) );

        this.controls.update();

    },

    screenshot: function( factor, type, quality, antialias, transparent, trim, progressCallback ){

        // FIXME don't show rendered parts
        // FIXME controls need to be disabled

        var scope = this;

        if( antialias ) factor *= 2;

        var i;
        var n = factor * factor;

        if( transparent ){

            this.renderer.setClearColor( this.params.backgroundColor, 0 );

        }

        var canvas = document.createElement( 'canvas' );
        canvas.style.display = "hidden";
        document.body.appendChild( canvas );

        if( antialias ){

            canvas.width = this.width * factor / 2;
            canvas.height = this.height * factor / 2;

        }else{

            canvas.width = this.width * factor;
            canvas.height = this.height * factor;

        }

        var ctx = canvas.getContext( '2d' );

        var shearMatrix = new THREE.Matrix4();
        var scaleMatrix = new THREE.Matrix4();

        var near = this.camera.near;
        var top = Math.tan( THREE.Math.degToRad( this.camera.fov * 0.5 ) ) * near;
        var bottom = - top;
        var left = this.camera.aspect * bottom;
        var right = this.camera.aspect * top;
        var width = Math.abs( right - left );
        var height = Math.abs( top - bottom );

        function makeAsymmetricFrustum( projectionMatrix, i ){

            var x = i % factor;
            var y = Math.floor( i / factor );

            shearMatrix.set(
                1, 0, ( x - ( factor - 1 ) * 0.5 ) * width / near, 0,
                0, 1, -( y - ( factor - 1 ) * 0.5 ) * height / near, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );

            scaleMatrix.set(
                factor, 0, 0, 0,
                0, factor, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );

            return projectionMatrix.multiply( shearMatrix ).multiply( scaleMatrix );

        }

        function render( i, n ){

            makeAsymmetricFrustum( scope.camera.projectionMatrix, i );

            scope.render( null, null, true );

            var x = ( i % factor ) * scope.width;
            var y = Math.floor( i / factor ) * scope.height;

            if( antialias ){

                ctx.drawImage(
                    scope.renderer.domElement,
                    Math.round( x / 2 ),
                    Math.round( y / 2 ),
                    Math.round( scope.width / 2 ),
                    Math.round( scope.height / 2 )
                );

            }else{

                ctx.drawImage( scope.renderer.domElement, x, y );

            }

            scope.camera.updateProjectionMatrix();

            if( typeof progressCallback === "function" ){

                progressCallback( i + 1, n, false );

            }

        }

        for( i = 0; i <= n; ++i ){

            setTimeout( (function( i, n ){

                return function(){

                    if( i === n ){

                        save( n );

                        if( transparent ){

                            scope.renderer.setClearColor(
                                scope.params.backgroundColor, 1
                            );

                        }

                    }else{

                        render( i, n );

                    }

                }

            })( i, n ) );

        }

        function save( n ){

            var ext = type.split( "/" )[ 1 ];

            if( trim ){

                var bg = new THREE.Color( scope.params.backgroundColor );
                var r = ( bg.r * 255 ) | 0;
                var g = ( bg.g * 255 ) | 0;
                var b = ( bg.b * 255 ) | 0;
                var a = transparent ? 0 : 255;

                canvas = NGL.trimCanvas( canvas, r, g, b, a );

            }

            canvas.toBlob(
                function( blob ){
                    NGL.download( blob, "screenshot." + ext );
                    document.body.removeChild( canvas );
                    if( typeof progressCallback === "function" ){
                        progressCallback( n, n, true );
                    }
                },
                type, quality
            );

            scope.requestRender();

        }

    },

    requestRender: function(){

        requestAnimationFrame( this.render.bind( this ) );

    },

    render: function( e, picking, tileing ){

        if( this._rendering ){
            console.warn( "tried to call 'render' from within 'render'" );
            return;
        }

        this._rendering = true;

        // clipping

        var bRadius = this.boundingBox.size().length() * 0.5;
        var cDist = this.camera.position.length();
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

        if( NGL.GET( "disableClipping" ) ){
            this.camera.near = 0.1;
            this.camera.far = 10000;
            this.scene.fog = null;
        }

        //

        this.camera.updateMatrix();
        this.camera.updateMatrixWorld( true );
        this.camera.matrixWorldInverse.getInverse( this.camera.matrixWorld );
        if( !tileing ) this.camera.updateProjectionMatrix();

        this.updateDynamicUniforms( this.scene, nearClip );

        this.sortProjectedPosition( this.scene, this.camera );

        // render

        this.renderer.clear();

        if( picking ){

            this.renderer.render( this.pickingGroup, this.camera );

        }else{

            this.renderer.render( this.backgroundGroup, this.camera );
            this.renderer.clearDepth();

            this.renderer.render( this.modelGroup, this.camera );
            this.renderer.render( this.textGroup, this.camera );
            this.renderer.render( this.transparentGroup, this.camera );
            this.renderer.render( this.surfaceGroup, this.camera );

        }

        this._rendering = false;

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

    this.uniforms = THREE.UniformsUtils.merge( [
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

    getMesh: function( type ){

        var material = this.getMaterial( type );

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

        if( this.nearClip ){

            material.defines[ "NEAR_CLIP" ] = 1;

        }

        return material;

    },

    addUniforms: function( uniforms ){

        this.uniforms = THREE.UniformsUtils.merge([ this.uniforms, uniforms ]);

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

    getMesh: function( type ){

        return this.meshBuffer.getMesh( type );

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
        NGL.Resources[ '../img/spark1.png' ]
        // NGL.Resources[ '../img/circle.png' ]
    );
    this.tex.needsUpdate = true;
    if( !this.sort ) this.tex.premultiplyAlpha = true;

    NGL.Buffer.call( this, position, color );

};

NGL.PointBuffer.prototype = Object.create( NGL.Buffer.prototype );

NGL.PointBuffer.prototype.getMesh = function( type ){

    var points = new THREE.PointCloud(
        this.geometry, this.getMaterial( type )
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

    getMesh: function( type ){

        return new THREE.Line(
            this.geometry, this.getMaterial( type ), THREE.LinePieces
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

    getMesh: function( type ){

        return this.lineBuffer.getMesh( type );

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

    getMesh: function( type ){

        return this.meshBuffer.getMesh( type );

    },

    setVisibility: NGL.Buffer.prototype.setVisibility,

    dispose: NGL.Buffer.prototype.dispose

};


NGL.SurfaceBuffer = function(){

    NGL.MeshBuffer.apply( this, arguments );

}

NGL.SurfaceBuffer.prototype = Object.create( NGL.MeshBuffer.prototype );


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

    getMesh: function(){

        var material = new THREE.LineBasicMaterial( {
            color: this.color, fog: true
        } );

        return new THREE.Line( this.geometry, material, THREE.LinePieces );;

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

    type: "",

    parameters: {

        nearClip: {
            type: "boolean"
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

        if( params && params[ "nearClip" ] !== undefined ){

            this.nearClip = params[ "nearClip" ];
            rebuild = true;

        }

        if( rebuild ){

            this.rebuild();

        }else if( what && Object.keys( what ).length ){

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

    }

};


/////////////////////////////
// Structure representation

NGL.StructureRepresentation = function( structure, viewer, params ){

    this.selection = new NGL.Selection( params.sele );

    this.setStructure( structure );

    NGL.Representation.call( this, structure, viewer, params );

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
            type: "boolean"
        },
        side: {
            type: "select", options: NGL.SideTypes
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0
        }

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

        if( params && params[ "transparent" ] !== undefined ){

            this.transparent = params[ "transparent" ];
            rebuild = true;

        }

        if( params && params[ "side" ] !== undefined ){

            this.side = params[ "side" ];
            rebuild = true;

        }

        if( params && params[ "opacity" ] !== undefined ){

            this.opacity = params[ "opacity" ];
            // FIXME uniforms are cloned and not accessible at the moment
            // this.meshBuffer.uniforms[ "opacity" ].value = this.opacity;
            rebuild = true;

        }

        NGL.Representation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    },

    attach: function(){

        var viewer = this.viewer;
        var structure = this.structure;

        // console.log( structure.biomolDict )
        // console.log( Object.values( structure.biomolDict[ 1 ].matrixDict ) );

        var matrixList;

        // TODO
        if( structure.biomolDict && structure.biomolDict[ 1 ] ){
            matrixList = Object.values( structure.biomolDict[ 1 ].matrixDict )//.slice(0,5);
        }else{
            matrixList = [];
        }

        this.bufferList.forEach( function( buffer ){

            if( matrixList.length > 1 ){
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

    type: "spacefill",

    parameters: Object.assign( {

        sphereDetail: {
            type: "integer", max: 3, min: 0
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

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "sphereDetail" ]!==undefined ){

            this.sphereDetail = params[ "sphereDetail" ];
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.PointRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.PointRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "point",

    parameters: Object.assign( {

        pointSize: {
            type: "integer", max: 20, min: 1
        },
        sizeAttenuation: {
            type: "boolean"
        },
        sort: {
            type: "boolean"
        },
        transparent: {
            type: "boolean"
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0
        }

    }, NGL.Representation.prototype.parameters ),

    init: function( params ){

        var p = params || {};

        this.pointSize = p.pointSize || 1;
        this.sizeAttenuation = p.sizeAttenuation !== undefined ? p.sizeAttenuation : false;
        this.sort = p.sort || true;
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

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "pointSize" ] !== undefined ){

            this.pointSize = params[ "pointSize" ];
            rebuild = true;

        }

        if( params && params[ "sizeAttenuation" ] !== undefined ){

            this.sizeAttenuation = params[ "sizeAttenuation" ];
            rebuild = true;

        }

        if( params && params[ "sort" ] !== undefined ){

            this.sort = params[ "sort" ];
            rebuild = true;

        }

        if( params && params[ "transparent" ] !== undefined ){

            this.transparent = params[ "transparent" ];
            rebuild = true;

        }

        if( params && params[ "opacity" ] !== undefined ){

            this.opacity = params[ "opacity" ];
            // FIXME uniforms are cloned and not accessible at the moment
            // this.meshBuffer.uniforms[ "opacity" ].value = this.opacity;
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.LabelRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.LabelRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "label",

    parameters: Object.assign( {

        labelType: {
            type: "select", options: NGL.LabelFactory.types
        },
        font: {
            type: "select", options: {
                "Arial": "Arial",
                "DejaVu": "DejaVu",
                "LatoBlack": "LatoBlack"
            }
        },
        antialias: {
            type: "boolean"
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

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "labelType" ] ){

            this.labelType = params[ "labelType" ];
            rebuild = true;

        }

        if( params && params[ "font" ] !== undefined ){

            this.font = params[ "font" ];
            rebuild = true;

        }

        if( params && params[ "antialias" ] !== undefined ){

            this.antialias = params[ "antialias" ];
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.BallAndStickRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.BallAndStickRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "ball+stick",

    defaultSize: 0.15,

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5
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

        if( params && params[ "sphereDetail" ]!==undefined ){

            this.sphereDetail = params[ "sphereDetail" ];
            rebuild = true;

        }

        if( params && params[ "radiusSegments" ] ){

            this.radiusSegments = params[ "radiusSegments" ];
            rebuild = true;

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

    type: "licorice",

    defaultSize: 0.15,

    parameters: Object.assign( {

        sphereDetail: {
            type: "integer", max: 3, min: 0
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5
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

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "sphereDetail" ]!==undefined ){

            this.sphereDetail = params[ "sphereDetail" ];
            rebuild = true;

        }

        if( params && params[ "radiusSegments" ] ){

            this.radiusSegments = params[ "radiusSegments" ];
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.LineRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.LineRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "line",

    parameters: Object.assign( {

        lineWidth: {
            type: "integer", max: 20, min: 1
        },
        transparent: {
            type: "boolean"
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0
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

    },

    setParameters: function( params, what, rebuild ){

        what = what || {};

        if( params && params[ "lineWidth" ] !== undefined ){

            this.lineWidth = params[ "lineWidth" ];
            rebuild = true;

        }

        if( params && params[ "transparent" ] !== undefined ){

            this.transparent = params[ "transparent" ];
            rebuild = true;

        }

        if( params && params[ "opacity" ] !== undefined ){

            this.opacity = params[ "opacity" ];
            // FIXME uniforms are cloned and not accessible at the moment
            // this.meshBuffer.uniforms[ "opacity" ].value = this.opacity;
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.HyperballRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

    this.defaultScale[ "vdw" ] = 0.2;

};

NGL.HyperballRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "hyperball",

    parameters: Object.assign( {

        shrink: {
            type: "number", precision: 3, max: 1.0, min: 0.001
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5
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

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "shrink" ] ){

            this.shrink = params[ "shrink" ];
            // FIXME uniforms are cloned and not accessible at the moment
            // this.cylinderBuffer.uniforms[ "shrink" ].value = this.shrink;
            rebuild = true;

        }

        if( params && params[ "sphereDetail" ]!==undefined ){

            this.sphereDetail = params[ "sphereDetail" ];
            rebuild = true;

        }

        if( params && params[ "radiusSegments" ] ){

            this.radiusSegments = params[ "radiusSegments" ];
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.BackboneRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.BackboneRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "backbone",

    defaultSize: 0.25,

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5
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

        var backboneAtomSet, backboneBondSet;
        var sphereBuffer, cylinderBuffer;

        var bufferList = [];
        var atomSetList = [];
        var bondSetList = [];

        var color = this.color;
        var radius = this.radius;
        var scale = this.scale;
        var aspectRatio = this.aspectRatio;
        var sphereDetail = this.sphereDetail;
        var radiusSegments = this.radiusSegments;
        var test = this.selection.test;
        var disableImpostor = this.disableImpostor;
        var transparent = this.transparent;
        var side = this.side;

        this.structure.eachFiber( function( f ){

            if( f.residueCount < 2 ) return;

            backboneAtomSet = new NGL.AtomSet();
            backboneBondSet = new NGL.BondSet();

            backboneAtomSet.structure = f.structure;
            backboneBondSet.structure = f.structure;

            atomSetList.push( backboneAtomSet );
            bondSetList.push( backboneBondSet );

            var a1, a2;

            f.eachResidueN( 2, function( r1, r2 ){

                a1 = r1.getAtomByName( f.traceAtomname );
                a2 = r2.getAtomByName( f.traceAtomname );

                if( test( a1 ) && test( a2 ) ){

                    backboneAtomSet.addAtom( a1 );
                    backboneBondSet.addBond( a1, a2, true );

                }

            } );

            if( test( a1 ) && test( a2 ) ){

                backboneAtomSet.addAtom( a2 );

            }

            sphereBuffer = new NGL.SphereBuffer(
                backboneAtomSet.atomPosition(),
                backboneAtomSet.atomColor( null, color ),
                backboneAtomSet.atomRadius( null, radius, scale * aspectRatio ),
                backboneAtomSet.atomColor( null, "picking" ),
                sphereDetail,
                disableImpostor,
                transparent,
                side,
                opacity
            );

            cylinderBuffer = new NGL.CylinderBuffer(
                backboneBondSet.bondPosition( null, 0 ),
                backboneBondSet.bondPosition( null, 1 ),
                backboneBondSet.bondColor( null, 0, color ),
                backboneBondSet.bondColor( null, 1, color ),
                backboneBondSet.bondRadius( null, 0, radius, scale ),
                null,
                true,
                backboneBondSet.bondColor( null, 0, "picking" ),
                backboneBondSet.bondColor( null, 1, "picking" ),
                radiusSegments,
                disableImpostor,
                transparent,
                side,
                opacity
            );

            bufferList.push( sphereBuffer )
            bufferList.push( cylinderBuffer );

        } );

        this.bufferList = bufferList;
        this.atomSetList = atomSetList;
        this.bondSetList = bondSetList;

    },

    update: function( what ){

        what = what || {};

        var backboneAtomSet, backboneBondSet;
        var sphereBuffer, cylinderBuffer;
        var sphereData, cylinderData;

        var i;
        var color = this.color;
        var n = this.atomSetList.length;

        for( i = 0; i < n; ++i ){

            backboneAtomSet = this.atomSetList[ i ];
            backboneBondSet = this.bondSetList[ i ];

            sphereBuffer = this.bufferList[ i * 2 ];
            cylinderBuffer = this.bufferList[ i * 2 + 1 ];

            sphereData = {};
            cylinderData = {};

            if( what[ "position" ] ){

                sphereData[ "position" ] = backboneAtomSet.atomPosition();

                var from = backboneBondSet.bondPosition( null, 0 );
                var to = backboneBondSet.bondPosition( null, 1 );

                cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                    from, to
                );
                cylinderData[ "position1" ] = from;
                cylinderData[ "position2" ] = to;

            }

            if( what[ "color" ] ){

                sphereData[ "color" ] = backboneAtomSet.atomColor( null, this.color );

                cylinderData[ "color" ] = backboneBondSet.bondColor( null, 0, this.color );
                cylinderData[ "color2" ] = backboneBondSet.bondColor( null, 1, this.color );

            }

            if( what[ "radius" ] || what[ "scale" ] ){

                sphereData[ "radius" ] = backboneAtomSet.atomRadius(
                    null, this.radius, this.scale * this.aspectRatio
                );

                cylinderData[ "radius" ] = backboneBondSet.bondRadius(
                    null, 0, this.radius, this.scale
                );

            }

            sphereBuffer.setAttributes( sphereData );
            cylinderBuffer.setAttributes( cylinderData );

        }

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

        if( params && params[ "sphereDetail" ]!==undefined ){

            this.sphereDetail = params[ "sphereDetail" ];
            rebuild = true;

        }

        if( params && params[ "radiusSegments" ] ){

            this.radiusSegments = params[ "radiusSegments" ];
            rebuild = true;

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

    type: "base",

    defaultSize: 0.2,

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        sphereDetail: {
            type: "integer", max: 3, min: 0
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5
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

        var baseAtomSet, baseBondSet;
        var sphereBuffer, cylinderBuffer;

        var bufferList = [];
        var atomSetList = [];
        var bondSetList = [];

        var color = this.color;
        var radius = this.radius;
        var scale = this.scale;
        var aspectRatio = this.aspectRatio;
        var sphereDetail = this.sphereDetail;
        var radiusSegments = this.radiusSegments;
        var test = this.selection.test;
        var disableImpostor = this.disableImpostor;
        var transparent = this.transparent;
        var side = this.side;

        this.structure.eachFiber( function( f ){

            if( f.residueCount < 1 || !f.isNucleic() ) return;

            baseAtomSet = new NGL.AtomSet();
            baseBondSet = new NGL.BondSet();

            baseAtomSet.structure = f.structure;
            baseBondSet.structure = f.structure;

            atomSetList.push( baseAtomSet );
            bondSetList.push( baseBondSet );

            var a1, a2;
            var bases = [ "A", "G", "DA", "DG" ];

            f.eachResidue( function( r ){

                a1 = r.getAtomByName( f.traceAtomname );
                // a1 = r.getAtomByName( "P" );

                if( bases.indexOf( r.resname ) !== -1 ){
                    a2 = r.getAtomByName( "N1" );
                }else{
                    a2 = r.getAtomByName( "N3" );
                }

                if( test( a1 ) ){

                    baseAtomSet.addAtom( a1 );
                    baseAtomSet.addAtom( a2 );
                    baseBondSet.addBond( a1, a2, true );

                }

            } );

            sphereBuffer = new NGL.SphereBuffer(
                baseAtomSet.atomPosition(),
                baseAtomSet.atomColor( null, color ),
                baseAtomSet.atomRadius( null, radius, scale * aspectRatio ),
                baseAtomSet.atomColor( null, "picking" ),
                sphereDetail,
                disableImpostor,
                transparent,
                side,
                opacity
            );

            cylinderBuffer = new NGL.CylinderBuffer(
                baseBondSet.bondPosition( null, 0 ),
                baseBondSet.bondPosition( null, 1 ),
                baseBondSet.bondColor( null, 0, color ),
                baseBondSet.bondColor( null, 1, color ),
                baseBondSet.bondRadius( null, 0, radius, scale ),
                null,
                true,
                baseBondSet.bondColor( null, 0, "picking" ),
                baseBondSet.bondColor( null, 1, "picking" ),
                radiusSegments,
                disableImpostor,
                transparent,
                side,
                opacity
            );

            bufferList.push( sphereBuffer )
            bufferList.push( cylinderBuffer );

        } );

        this.bufferList = bufferList;
        this.atomSetList = atomSetList;
        this.bondSetList = bondSetList;

    },

    update: function( what ){

        what = what || {};

        var backboneAtomSet, backboneBondSet;
        var sphereBuffer, cylinderBuffer;
        var sphereData, cylinderData;

        var i;
        var color = this.color;
        var n = this.atomSetList.length;

        for( i = 0; i < n; ++i ){

            backboneAtomSet = this.atomSetList[ i ];
            backboneBondSet = this.bondSetList[ i ];

            sphereBuffer = this.bufferList[ i * 2 ];
            cylinderBuffer = this.bufferList[ i * 2 + 1 ];

            sphereData = {};
            cylinderData = {};

            if( what[ "position" ] ){

                sphereData[ "position" ] = backboneAtomSet.atomPosition();

                var from = backboneBondSet.bondPosition( null, 0 );
                var to = backboneBondSet.bondPosition( null, 1 );

                cylinderData[ "position" ] = NGL.Utils.calculateCenterArray(
                    from, to
                );
                cylinderData[ "position1" ] = from;
                cylinderData[ "position2" ] = to;

            }

            if( what[ "color" ] ){

                sphereData[ "color" ] = backboneAtomSet.atomColor( null, this.color );

                cylinderData[ "color" ] = backboneBondSet.bondColor( null, 0, this.color );
                cylinderData[ "color2" ] = backboneBondSet.bondColor( null, 1, this.color );

            }

            if( what[ "radius" ] || what[ "scale" ] ){

                sphereData[ "radius" ] = backboneAtomSet.atomRadius(
                    null, this.radius, this.scale * this.aspectRatio
                );

                cylinderData[ "radius" ] = backboneBondSet.bondRadius(
                    null, 0, this.radius, this.scale
                );

            }

            sphereBuffer.setAttributes( sphereData );
            cylinderBuffer.setAttributes( cylinderData );

        }

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

        if( params && params[ "sphereDetail" ]!==undefined ){

            this.sphereDetail = params[ "sphereDetail" ];
            rebuild = true;

        }

        if( params && params[ "radiusSegments" ] ){

            this.radiusSegments = params[ "radiusSegments" ];
            rebuild = true;

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

    type: "tube",

    defaultSize: 0.25,

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1
        },
        radialSegments: {
            type: "integer", max: 50, min: 1
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean"
        },
        wireframe: {
            type: "boolean"
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

        if( params && params[ "subdiv" ] ){

            this.subdiv = params[ "subdiv" ];
            rebuild = true;

        }

        if( params && params[ "radialSegments" ] ){

            this.radialSegments = params[ "radialSegments" ];
            rebuild = true;

        }

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "radius" ] = true;

        }

        if( params && params[ "capped" ] !== undefined ){
            this.capped = params[ "capped" ];
            rebuild = true;

        }

        if( params && params[ "wireframe" ] !== undefined ){

            this.wireframe = params[ "wireframe" ];
            rebuild = true;

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

    type: "cartoon",

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        subdiv: {
            type: "integer", max: 50, min: 1
        },
        radialSegments: {
            type: "integer", max: 50, min: 1
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean"
        },
        wireframe: {
            type: "boolean"
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

        NGL.StructureRepresentation.prototype.init.call( this, p );

    },

    create: function(){

        var scope = this;

        this.bufferList = [];
        this.fiberList = [];

        var opacity = this.transparent ? this.opacity : 1.0;

        if( NGL.GET( "debug" ) ){

            scope.debugBufferList = [];

        }

        this.structure.eachFiber( function( fiber ){

            if( fiber.residueCount < 4 ) return;

            var spline = new NGL.Spline( fiber );
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

            if( NGL.GET( "debug" ) ){

                scope.debugBufferList.push(

                    new NGL.BufferVectorHelper(
                        subPos.position,
                        subPos.normal,
                        "skyblue",
                        1.5
                    )

                );

                scope.debugBufferList.push(

                    new NGL.BufferVectorHelper(
                        subPos.position,
                        subPos.binormal,
                        "lightgreen",
                        1.5
                    )

                );

                scope.debugBufferList.push(

                    new NGL.BufferVectorHelper(
                        subPos.position,
                        subPos.tangent,
                        "orange",
                        1.5
                    )

                );

            }

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

            if( NGL.GET( "debug" ) ){

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

        if( params && params[ "subdiv" ] ){

            this.subdiv = params[ "subdiv" ];
            rebuild = true;

        }

        if( params && params[ "radialSegments" ] ){

            this.radialSegments = params[ "radialSegments" ];
            rebuild = true;

        }

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "position" ] = true;

        }

        if( params && params[ "capped" ] !== undefined ){

            this.capped = params[ "capped" ];
            rebuild = true;

        }

        if( params && params[ "wireframe" ] !== undefined ){

            this.wireframe = params[ "wireframe" ];
            rebuild = true;

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

    type: "ribbon",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1
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

        if( params && params[ "subdiv" ] ){

            this.subdiv = params[ "subdiv" ];
            rebuild = true;

        }

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            this.update({ "position": true });

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

    type: "trace",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        lineWidth: {
            type: "integer", max: 20, min: 1
        },
        transparent: {
            type: "boolean"
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0
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

        if( params && params[ "subdiv" ] ){

            this.subdiv = params[ "subdiv" ];
            rebuild = true;

        }

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "position" ] = true;

        }

        if( params && params[ "lineWidth" ] !== undefined ){

            this.lineWidth = params[ "lineWidth" ];
            rebuild = true;

        }

        if( params && params[ "transparent" ] !== undefined ){

            this.transparent = params[ "transparent" ];
            rebuild = true;

        }

        if( params && params[ "opacity" ] !== undefined ){

            this.opacity = params[ "opacity" ];
            // FIXME uniforms are cloned and not accessible at the moment
            // this.meshBuffer.uniforms[ "opacity" ].value = this.opacity;
            rebuild = true;

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

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.RocketRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.RocketRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "rocket",

    parameters: Object.assign( {

        localAngle: {
            type: "integer", max: 180, min: 0
        },
        centerDist: {
            type: "number", precision: 1, max: 10, min: 0
        },
        ssBorder: {
            type: "boolean"
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5
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

        this.bufferList = [];
        this.fiberList = [];
        this.centerList = [];

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

        }, this.selection );

    },

    update: function( what ){

        this.rebuild();

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "localAngle" ] !== undefined ){

            this.localAngle = params[ "localAngle" ];
            rebuild = true;

        }

        if( params && params[ "centerDist" ] !== undefined ){

            this.centerDist = params[ "centerDist" ];
            rebuild = true;

        }

        if( params && params[ "ssBorder" ] !== undefined ){

            this.ssBorder = params[ "ssBorder" ];
            rebuild = true;

        }

        if( params && params[ "radiusSegments" ] ){

            this.radiusSegments = params[ "radiusSegments" ];
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


NGL.RopeRepresentation = function( structure, viewer, params ){

    NGL.StructureRepresentation.call( this, structure, viewer, params );

};

NGL.RopeRepresentation.prototype = NGL.createObject(

    NGL.StructureRepresentation.prototype, {

    type: "rope",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1
        },
        radialSegments: {
            type: "integer", max: 50, min: 1
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean"
        },
        wireframe: {
            type: "boolean"
        },
        smooth: {
            type: "integer", max: 15, min: 0
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

        if( params && params[ "subdiv" ] ){

            this.subdiv = params[ "subdiv" ];
            rebuild = true;

        }

        if( params && params[ "radialSegments" ] ){

            this.radialSegments = params[ "radialSegments" ];
            rebuild = true;

        }

        if( params && params[ "tension" ] ){

            this.tension = params[ "tension" ];
            what[ "radius" ] = true;

        }

        if( params && params[ "capped" ] !== undefined ){

            this.capped = params[ "capped" ];
            rebuild = true;

        }

        if( params && params[ "wireframe" ] !== undefined ){

            this.wireframe = params[ "wireframe" ];
            rebuild = true;

        }

        if( params && params[ "smooth" ] !== undefined ){

            this.smooth = params[ "smooth" ];
            rebuild = true;

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

    type: "crossing",

    parameters: Object.assign( {

        localAngle: {
            type: "integer", max: 180, min: 0
        },
        centerDist: {
            type: "number", precision: 1, max: 10, min: 0
        },
        ssBorder: {
            type: "boolean"
        },
        radiusSegments: {
            type: "integer", max: 25, min: 5
        },
        helixDist: {
            type: "number", precision: 1, max: 30, min: 0
        },
        displayLabel: {
            type: "boolean"
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

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "localAngle" ] !== undefined ){

            this.localAngle = params[ "localAngle" ];
            rebuild = true;

        }

        if( params && params[ "centerDist" ] !== undefined ){

            this.centerDist = params[ "centerDist" ];
            rebuild = true;

        }

        if( params && params[ "helixDist" ] !== undefined ){

            this.helixDist = params[ "helixDist" ];
            rebuild = true;

        }

        if( params && params[ "ssBorder" ] !== undefined ){

            this.ssBorder = params[ "ssBorder" ];
            rebuild = true;

        }

        if( params && params[ "displayLabel" ] !== undefined ){

            this.displayLabel = params[ "displayLabel" ];
            rebuild = true;

        }

        if( params && params[ "radiusSegments" ] ){

            this.radiusSegments = params[ "radiusSegments" ];
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

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

    type: "",

    parameters: Object.assign( {

        drawLine: { type: "boolean" },
        drawCylinder: { type: "boolean" },
        drawPoint: { type: "boolean" },
        drawSphere: { type: "boolean" },

        lineWidth: {
            type: "integer", max: 20, min: 1
        },
        pointSize: {
            type: "integer", max: 20, min: 1
        },
        sizeAttenuation: {
            type: "boolean"
        },
        sort: {
            type: "boolean"
        },
        transparent: {
            type: "boolean"
        },
        side: {
            type: "select", options: NGL.SideTypes
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0
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
        this.sort = p.sort || true;
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

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "drawLine" ] !== undefined ){

            this.drawLine = params[ "drawLine" ];
            rebuild = true;

        }

        if( params && params[ "drawCylinder" ] !== undefined ){

            this.drawCylinder = params[ "drawCylinder" ];
            rebuild = true;

        }

        if( params && params[ "drawPoint" ] !== undefined ){

            this.drawPoint = params[ "drawPoint" ];
            rebuild = true;

        }

        if( params && params[ "drawSphere" ] !== undefined ){

            this.drawSphere = params[ "drawSphere" ];
            rebuild = true;

        }

        //

        if( params && params[ "lineWidth" ] !== undefined ){

            this.lineWidth = params[ "lineWidth" ];
            rebuild = true;

        }

        if( params && params[ "pointSize" ] !== undefined ){

            this.pointSize = params[ "pointSize" ];
            rebuild = true;

        }

        if( params && params[ "sizeAttenuation" ] !== undefined ){

            this.sizeAttenuation = params[ "sizeAttenuation" ];
            rebuild = true;

        }

        if( params && params[ "sort" ] !== undefined ){

            this.sort = params[ "sort" ];
            rebuild = true;

        }

        if( params && params[ "transparent" ] !== undefined ){

            this.transparent = params[ "transparent" ];
            rebuild = true;

        }

        if( params && params[ "side" ] !== undefined ){

            this.side = params[ "side" ];
            rebuild = true;

        }

        if( params && params[ "opacity" ] !== undefined ){

            this.opacity = params[ "opacity" ];
            // FIXME uniforms are cloned and not accessible at the moment
            // this.surfaceBuffer.uniforms[ "opacity" ].value = this.opacity;
            rebuild = true;

        }

        NGL.StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

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

    type: "",

    parameters: Object.assign( {

        wireframe: {
            type: "boolean"
        },
        background: {
            type: "boolean"
        },
        transparent: {
            type: "boolean"
        },
        side: {
            type: "select", options: NGL.SideTypes
        },
        opacity: {
            type: "number", precision: 1, max: 1, min: 0
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

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params[ "wireframe" ] !== undefined ){

            this.wireframe = params[ "wireframe" ];
            rebuild = true;

        }

        if( params && params[ "background" ] !== undefined ){

            this.background = params[ "background" ];
            rebuild = true;

        }

        if( params && params[ "transparent" ] !== undefined ){

            this.transparent = params[ "transparent" ];
            rebuild = true;

        }

        if( params && params[ "side" ] !== undefined ){

            this.side = params[ "side" ];
            rebuild = true;

        }

        if( params && params[ "opacity" ] !== undefined ){

            this.opacity = params[ "opacity" ];
            // FIXME uniforms are cloned and not accessible at the moment
            // this.surfaceBuffer.uniforms[ "opacity" ].value = this.opacity;
            rebuild = true;

        }

        NGL.Representation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

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

    defaultFileRepresentation: function( object ){

        if( object instanceof NGL.StructureComponent ){

            // safeguard
            if( object.structure.atomCount > 100000 ) return;

            object.addRepresentation( "cartoon", { sele: "*" } );
            object.addRepresentation( "licorice", { sele: "hetero" } );
            object.centerView( undefined, true );

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

        var cssPath, viewerBackground;

        if( value === "light" ){
            cssPath = "../css/light.css";
            viewerBackground = "white";
        }else{
            cssPath = "../css/dark.css";
            viewerBackground = "black";
        }

        document.getElementById( 'theme' ).href = cssPath;
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

        mouse.moving = true;
        mouse.position.x = e.layerX;
        mouse.position.y = e.layerY;

    } );

    viewer.renderer.domElement.addEventListener( 'mousedown', function( e ){

        mouse.moving = false;
        mouse.down.x = e.layerX;
        mouse.down.y = e.layerY;

    } );

    viewer.renderer.domElement.addEventListener( 'mouseup', function( e ){

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

        if( NGL.GET( "debug" ) ){

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

            stage.loadFile( "__example__/md.gro", function( o ){

                o.addRepresentation( "line", { sele: "not hydrogen and sidechainAttached" } );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                // o.addRepresentation( "spacefill", { sele: "NA or CL" } );
                o.centerView();

                o.addTrajectory( "__example__/md.xtc" );

            }, params );

            stage.loadFile( "__example__/md.gro", function( o ){

                o.addRepresentation( "backbone", { sele: "protein", color: "ss" } );

            } );

        },

        "trr_trajectory": function( stage ){

            stage.loadFile( "__example__/md.gro", function( o ){

                o.addRepresentation( "line" );
                o.addRepresentation( "cartoon", { sele: "protein" } );
                o.centerView();

                o.addTrajectory( "__example__/md.trr" );

            } );

        },

        "dcd_trajectory": function( stage ){

            stage.loadFile( "__example__/ala3.pdb", function( o ){

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

            stage.loadFile( "__example__/DPDP.pdb", function( o ){

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

            stage.loadFile( "__example__/md.gro", function( o ){

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

            stage.loadFile( "__example__/3pqr.pdb", function( o ){

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

            stage.loadFile( "__example__/1blu.pdb", function( o ){

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

            // stage.loadFile( "__example__/1LVZ.pdb", function( o ){

            //     o.addRepresentation( "cartoon", { sele: "*" } );
            //     // o.addRepresentation( "licorice", { sele: "*" } );
            //     o.centerView();

            //     o.addTrajectory();

            // }, null, null, { asTrajectory: true } );

            // stage.loadFile( "__example__/md_ascii_trj.gro", function( o ){
            stage.loadFile( "__example__/md_1u19_trj.gro", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                // o.addRepresentation( "licorice", { sele: "*" } );
                o.centerView();

                o.addTrajectory();

            }, null, null, { asTrajectory: true } );

        },

        "multi_struc": function( stage ){

            stage.loadFile( "__example__/1crn.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                o.addRepresentation( "ball+stick", { sele: "hetero" } );
                o.centerView();

            } );

            stage.loadFile( "__example__/3pqr.pdb", function( o ){

                o.addRepresentation( "cartoon", { sele: "*" } );
                o.addRepresentation( "ball+stick", { sele: "hetero" } );
                o.centerView();

            } );

        },

        "superpose": function( stage ){

            stage.loadFile( "__example__/1u19.pdb", function( o1 ){

                var s = "1-320:A";

                o1.addRepresentation( "cartoon", { sele: s } );
                o1.addRepresentation( "ball+stick", { sele: s } );

                stage.loadFile( "__example__/3dqb.pdb", function( o2 ){

                    o2.addRepresentation( "cartoon", { sele: s } );
                    o2.addRepresentation( "licorice", { sele: s } );

                    o1.superpose( o2, false, s );
                    o1.centerView( ":A" );

                }, { sele: ":A" } );

            }, { sele: ":A" } );

        },

        "alignment": function( stage ){

            stage.loadFile( "__example__/3dqb.pdb", function( o1 ){

                o1.addRepresentation( "cartoon" );
                o1.addRepresentation( "ball+stick", { sele: "hetero" } );
                o1.centerView();

                stage.loadFile( "__example__/3sn6.pdb", function( o2 ){

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

            stage.loadFile( "__example__/1gzm.pdb", function( o1 ){

                o1.addRepresentation( "cartoon" );
                o1.centerView();

                stage.loadFile( "__example__/1u19.pdb", function( o2 ){

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

            stage.loadFile( "__example__/pbc.gro", function( o ){

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

            stage.loadFile( "__example__/md_1u19.gro", function( o ){

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

            stage.loadFile( "__example__/1crn.pdb", function( o ){

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

            stage.loadFile( "__example__/BaceCg.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "rope", { sele: "helix" } );
                o.addRepresentation( "ball+stick" );
                o.centerView();

            } );

        },

        "ribosome": function( stage ){

            stage.loadFile( "__example__/4UPY.pdb", function( o ){

                o.addRepresentation( "cartoon", { quality: "low" } );
                o.addRepresentation( "base" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UPX.pdb", function( o ){

                o.addRepresentation( "cartoon", { quality: "low" } );
                o.addRepresentation( "base" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UQ5.pdb", function( o ){

                o.addRepresentation( "cartoon", { quality: "low" } );
                o.addRepresentation( "base" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UPW.pdb", function( o ){

                o.addRepresentation( "cartoon", { quality: "low" } );
                o.addRepresentation( "base" );
                stage.centerView();

            } );

        },

        "ribosome2": function( stage ){

            stage.loadFile( "__example__/4UPY.pdb", function( o ){

                o.addRepresentation( "line" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UPX.pdb", function( o ){

                o.addRepresentation( "line" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UQ5.pdb", function( o ){

                o.addRepresentation( "line" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UPW.pdb", function( o ){

                o.addRepresentation( "line" );
                stage.centerView();

            } );

        },

        "ribosome3": function( stage ){

            stage.loadFile( "__example__/4UPY.pdb", function( o ){

                o.addRepresentation( "trace" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UPX.pdb", function( o ){

                o.addRepresentation( "trace" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UQ5.pdb", function( o ){

                o.addRepresentation( "trace" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/4UPW.pdb", function( o ){

                o.addRepresentation( "trace" );
                stage.centerView();

            } );

        },

        "selection": function( stage ){

            stage.loadFile( "__example__/1crn.pdb", function( o ){

                var sele = "not backbone or .CA or (PRO and .N)";

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "licorice", { sele: sele } );
                o.centerView();

            } );

        },

        "spline": function( stage ){

            stage.loadFile( "__example__/BaceCgProteinAtomistic.pdb", function( o ){

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

            stage.loadFile( "__example__/Bace1Trimer-inDPPC.gro", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "licorice", { sele: "DPPC" } );
                o.centerView();

            }, params );

        },

        "script": function( stage ){

            stage.loadFile( "__example__/script.ngl" );

        },

        "bfactor": function( stage ){

            stage.loadFile( "__example__/1u19.pdb", function( o ){

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

            stage.loadFile( "__example__/1d66.pdb", function( o ){

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

            stage.loadFile( "__example__/md_1u19.gro", function( o ){

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

            stage.loadFile( "__example__/3l5q.pdb", function( o ){

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

            console.time( "test" );

            stage.loadFile( "__example__/1RB8.pdb", function( o ){

                o.addRepresentation( "cartoon", { subdiv: 3, radialSegments: 6 } );
                o.addRepresentation( "licorice" );
                // o.addRepresentation( "hyperball" );
                stage.centerView();

            } );

        },

        "surface": function( stage ){

            stage.loadFile( "__example__/1crn.pdb", function( o ){

                o.addRepresentation( "cartoon" );
                o.addRepresentation( "ball+stick" );
                stage.viewer.setClip( 42, 100 );
                stage.centerView();

            } );

            stage.loadFile( "__example__/1crn.ply", function( o ){

                o.addRepresentation( undefined, {
                    transparent: true, opacity: 0.3, side: THREE.DoubleSide
                } );

            } );

        },

        "largeGro": function( stage ){

            console.time( "test" );

            // stage.loadFile( "__example__/1crn.gro", function( o ){

            //     o.addRepresentation( "ribbon", { color: "residueindex" } );
            //     stage.centerView();

            // } );

            stage.loadFile( "__example__/water.gro", function( o ){

                o.addRepresentation( "line", { color: "residueindex" } );
                stage.centerView();

                o.viewer.render();

                console.timeEnd( "test" );

            } );

            /*stage.loadFile( "__example__/3l5q.gro", function( o ){

                o.addRepresentation( "trace", { color: "residueindex", subdiv: 3 } );
                stage.centerView();

                o.viewer.render();

                console.timeEnd( "test" );

            } );*/

        },

        "helixorient": function( stage ){

            stage.loadFile( "__example__/3dqb.pdb", function( o ){

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

            stage.loadFile( "__example__/norovirus.ngl" );

        },

        "label": function( stage ){

            stage.loadFile( "__example__/1crn.pdb", function( o ){

                o.addRepresentation( "tube", { radius: "ss" } );
                o.addRepresentation( "ball+stick", { sele: "sidechainAttached" } );
                o.addRepresentation( "label", {
                    sele: ".CA", color: "element"
                } );
                stage.centerView();

            } );

            stage.loadFile( "__example__/1crn.ply", function( o ){

                o.addRepresentation( undefined, {
                    transparent: true, opacity: 0.3, side: THREE.FrontSide
                } );

            } );

        },

        "cif": function( stage ){

            stage.loadFile( "__example__/3SN6.cif", function( o ){
            // stage.loadFile( "__example__/1CRN.cif", function( o ){

                o.addRepresentation( "cartoon", { radius: "ss" } );
                // o.addRepresentation( "ball+stick", { sele: "sidechainAttached" } );
                stage.centerView();

            } );

        },

        "1crn": function( stage ){

            stage.loadFile( "__example__/1crn.pdb", function( o ){

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

            stage.loadFile( "__example__/1CRN.cif.gz", function( o ){

                o.addRepresentation( "cartoon" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/1CRN.cif.zip", function( o ){

                o.addRepresentation( "licorice" );
                stage.centerView();

            } );

            stage.loadFile( "__example__/1CRN.cif.lzma", function( o ){

                o.addRepresentation( "rocket", {
                    transparent: true, opacity: 0.5
                } );
                stage.centerView();

            } );

            stage.loadFile( "__example__/1CRN.cif.bz2", function( o ){

                o.addRepresentation( "rope", { scale: 0.3 } );
                stage.centerView();

            } );

        },

        "hiv": function( stage ){

            stage.loadFile( "__example__/3j3y.cif.gz", function( o ){

                o.addRepresentation( "point", {
                    color: "chainindex", pointSize: 7, sizeAttenuation: true
                } );
                o.centerView();

            } );

        },

    }

};

