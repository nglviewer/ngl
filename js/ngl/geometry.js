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

    this.type = this.fiber.getType();
    this.tension = this.type === NGL.NucleicType ? 0.5 : 0.9;

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

    getSubdividedColor: function( m, params ){

        var n = this.size;
        var n1 = n - 1;

        var col = new Float32Array( n1 * m * 3 + 3 );
        var pcol = new Float32Array( n1 * m * 3 + 3 );

        var p = params || {};
        p.structure = this.fiber.structure;

        var colorMaker = NGL.ColorMakerRegistry.getScheme( p );
        var pickingColorMaker = NGL.ColorMakerRegistry.getPickingScheme( p );

        var k = 0;
        var j, l, mh, a2, c2, pc2, a3, c3, pc3;

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            mh = Math.ceil( m / 2 );

            a2 = r2.getTraceAtom();

            for( j = 0; j < mh; ++j ){

                l = k + j * 3;

                colorMaker.atomColorToArray( a2, col, l );
                pickingColorMaker.atomColorToArray( a2, pcol, l );

            }

            a3 = r3.getTraceAtom();

            for( j = mh; j < m; ++j ){

                l = k + j * 3;

                colorMaker.atomColorToArray( a3, col, l );
                pickingColorMaker.atomColorToArray( a3, pcol, l );

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
        var arrows = this.arrows;

        var size = new Float32Array( n1 * m + 1 );

        var radiusFactory = new NGL.RadiusFactory( type, scale );

        var k = 0;
        var j, l, a2, a3, s2, s3, t;

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            a2 = r2.getTraceAtom();
            a3 = r3.getTraceAtom();

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

        var interpolate = this.interpolate;

        var n = this.size;
        var n1 = n - 1;

        var pos = new Float32Array( n1 * m * 3 + 3 );

        var k = 0;
        var dt = 1.0 / m;

        var j, l, d;
        var a1, a2, a3, a4;

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            if( atomname ){

                a1 = r1.getAtomByName( atomname );
                a2 = r2.getAtomByName( atomname );
                a3 = r3.getAtomByName( atomname );
                a4 = r4.getAtomByName( atomname );

            }else{

                a1 = r1.getTraceAtom();
                a2 = r2.getTraceAtom();
                a3 = r3.getTraceAtom();
                a4 = r4.getTraceAtom();

            }

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

            if( atomname ){

                a1 = r1.getAtomByName( atomname );
                a2 = r2.getAtomByName( atomname );
                a3 = r3.getAtomByName( atomname );
                a4 = r4.getAtomByName( atomname );

            }else{

                a1 = r1.getTraceAtom();
                a2 = r2.getTraceAtom();
                a3 = r3.getTraceAtom();
                a4 = r4.getTraceAtom();

            }

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
        var type = this.type;

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
        var vNorm = new THREE.Vector3().set( 0, 0, 1 );
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

            if( type !== NGL.CgType ){

                if( first ){

                    first = false;

                    d1a1.copy( r1.getDirectionAtom1() );
                    d1a2.copy( r2.getDirectionAtom1() );
                    d1a3.copy( r3.getDirectionAtom1() );

                    d2a1.copy( r1.getDirectionAtom2() );
                    d2a2.copy( r2.getDirectionAtom2() );
                    d2a3.copy( r3.getDirectionAtom2() );

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

                d1a4.copy( r4.getDirectionAtom1() );
                d2a4.copy( r4.getDirectionAtom2() );

                vSub4.subVectors( d2a4, d1a4 );
                if( vSub3.dot( vSub4 ) < 0 ){
                    vSub4.multiplyScalar( -1 );
                    d2a4.addVectors( d1a4, vSub4 );
                }

            }

            for( j = 0; j < m; ++j ){

                l = k + j * 3;

                if( type === NGL.CgType ){

                    vDir.copy( vNorm );

                }else{

                    if( type === NGL.ProteinType ){
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

        if( type === NGL.ProteinType ){

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
            fa = fr.getTraceAtom();

            r = new NGL.Residue();
            a = new NGL.Atom( r, fa.globalindex );  // FIXME get rid of globalindex

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

            if( padded && ( i === 0 || i === n - 1 ) ){
                residues.push( r );
            }

        }

        var f = new NGL.Fiber( residues, this.fiber.structure );

        return f;

    },

    getColor: function( params ){

        var n = this.size;

        var col = new Float32Array( n * 3 );
        var pcol = new Float32Array( n * 3 );

        var p = params || {};
        p.structure = this.fiber.structure;

        var colorMaker = NGL.ColorMakerRegistry.getScheme( p );
        var pickingColorMaker = NGL.ColorMakerRegistry.getPickingScheme( p );

        var i = 0;
        var a, c, pc;

        this.fiber.eachResidue( function( r ){

            a = r.getTraceAtom();

            colorMaker.atomColorToArray( a, col, i );
            pickingColorMaker.atomColorToArray( a, pcol, i );

            i += 3;

        } );

        return {
            "color": col,
            "pickingColor": pcol
        };

    },

    getSize: function( type, scale ){

        var n = this.size;

        var size = new Float32Array( n );

        var radiusFactory = new NGL.RadiusFactory( type, scale );

        var i = 0;
        var a;

        this.fiber.eachResidue( function( r ){

            a = r.getTraceAtom();

            size[ i ] = radiusFactory.atomRadius( a );

            i += 1;

        } );

        return {
            "size": size
        };

    },

    getPosition: function(){

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

            a1 = r1.getTraceAtom();
            a2 = r2.getTraceAtom();
            a3 = r3.getTraceAtom();
            a4 = r4.getTraceAtom();

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
                // clamp, to avoid instabilities for when
                // angle between diff13 and diff24 is near 0
                Math.max( 2.0, 2.0 * ( 1.0 - tmp ) )
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
        _center.copy( res[ 0 ].getTraceAtom() );
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
        _center.copy( res[ n - 1 ].getTraceAtom() );
        v1 = NGL.Utils.pointVectorIntersection( _center, v1, _axis );
        v1.toArray( center, 3 * n - 3 );

        // calc last three resdir
        for( i = n - 3; i < n; ++i ){

            v1.fromArray( center, 3 * i );
            _center.copy( res[ i ].getTraceAtom() );

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

    getAxis: function( localAngle, centerDist, ssBorder, colorParams, radius, scale ){

        localAngle = localAngle || 30;
        centerDist = centerDist || 2.5;
        ssBorder = ssBorder === undefined ? false : ssBorder;

        var pos = this.position;

        var cp = colorParams || {};
        cp.structure = this.fiber.structure;

        var colorMaker = NGL.ColorMakerRegistry.getScheme( cp );
        var pickingColorMaker = NGL.ColorMakerRegistry.getPickingScheme( cp );

        var radiusFactory = new NGL.RadiusFactory( radius, scale );

        var i, r, r2, a;
        var j = 0;
        var k = 0;
        var n = this.size;

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

                a = r.getTraceAtom();

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

                colorMaker.atomColorToArray( a, col, k );
                pickingColorMaker.atomColorToArray( a, pcol, k );

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


///////////
// Kdtree

NGL.Kdtree = function( atoms, useSquaredDist ){

    // NGL.time( "NGL.Kdtree build" );

    if( useSquaredDist ){

        var metric = function( a, b ){

            var dx = a[0] - b[0];
            var dy = a[1] - b[1];
            var dz = a[2] - b[2];

            return dx*dx + dy*dy + dz*dz;

        };

    }else{

        var metric = function( a, b ){

            var dx = a[0] - b[0];
            var dy = a[1] - b[1];
            var dz = a[2] - b[2];

            return Math.sqrt( dx*dx + dy*dy + dz*dz );

        };

    }

    if( atoms instanceof NGL.AtomSet ||
        atoms instanceof NGL.Structure ||
        atoms instanceof NGL.StructureSubset
    ){

        var atomSet = atoms;
        atoms = atomSet.atoms;

    }

    var n = atoms.length;
    var points = new Float32Array( n * 4 );

    for( var i = 0; i < n; ++i ){

        var a = atoms[ i ];
        var i3 = i * 3;
        var i4 = i * 4;

        points[ i4 + 0 ] = a.x;
        points[ i4 + 1 ] = a.y;
        points[ i4 + 2 ] = a.z;
        points[ i4 + 3 ] = i;

    }

    this.points = points;
    this.atoms = atoms;
    this.kdtree = new THREE.TypedArrayUtils.Kdtree( points, metric, 4, 3 );

    // NGL.timeEnd( "NGL.Kdtree build" );

};

NGL.Kdtree.prototype = {

    nearest: function(){

        var pointArray = new Float32Array( 3 );

        return function( point, maxNodes, maxDistance ){

            // NGL.time( "NGL.Kdtree nearest" );

            if( point instanceof THREE.Vector3 ){

                point.toArray( pointArray );

            }else if( point instanceof NGL.Atom || point instanceof NGL.ProxyAtom ){

                point.positionToArray( pointArray );

            }

            var nodeList = this.kdtree.nearest(
                pointArray, maxNodes, maxDistance
            );

            var atoms = this.atoms;
            var atomList = [];

            for( var i = 0, n = nodeList.length; i < n; ++i ){

                var d = nodeList[ i ];
                var node = d[ 0 ];
                var dist = d[ 1 ];

                atomList.push( {
                    atom: atoms[ this.points[ node.pos + 3 ] ],
                    distance: dist
                } );

            }

            // NGL.timeEnd( "NGL.Kdtree nearest" );

            return atomList;

        };

    }()

};


////////////
// Contact

NGL.Contact = function( atomSet1, atomSet2 ){

    this.atomSet1 = atomSet1;
    this.atomSet2 = atomSet2;

    this.kdtree1 = new NGL.Kdtree( atomSet1 );
    this.kdtree2 = new NGL.Kdtree( atomSet2 );

}

NGL.Contact.prototype = {

    within: function( maxDistance, minDistance ){

        NGL.time( "NGL.Contact within" );

        var atomSet = new NGL.AtomSet();
        var bondSet = new NGL.BondSet();

        var kdtree1 = this.kdtree1;
        var kdtree2 = this.kdtree2;

        var atoms = this.atomSet1.atoms;

        for( var i = 0, n = atoms.length; i < n; ++i ){

            var atom1 = atoms[ i ];
            var found = false;
            var contacts = kdtree2.nearest(
                atom1, Infinity, maxDistance
            );

            for( var j = 0, m = contacts.length; j < m; ++j ){

                var d = contacts[ j ];
                var atom2 = d.atom;
                var dist = d.distance;

                if( atom1.residue !== atom2.residue &&
                    ( !minDistance || dist > minDistance ) ){
                    found = true;
                    atomSet.addAtom( atom2 );
                    bondSet.addBond( atom1, atom2, true );
                }

            }

            if( found ){
                atomSet.addAtom( atom1 );
            }

        }

        NGL.timeEnd( "NGL.Contact within" );

        return {
            atomSet: atomSet,
            bondSet: bondSet
        };

    }

}


NGL.polarContacts = function( structure, maxDistance, maxAngle ){

    maxDistance = maxDistance || 3.5;
    maxAngle = maxAngle || 40;

    var donorSelection = new NGL.Selection(
        "( ARG and ( .NE or .NH1 or .NH2 ) ) or " +
        "( ASP and .ND2 ) or " +
        "( GLN and .NE2 ) or " +
        "( HIS and ( .ND1 or .NE2 ) ) or " +
        "( LYS and .NZ ) or " +
        "( SER and .OG ) or " +
        "( THR and .OG1 ) or " +
        "( TRP and .NE1 ) or " +
        "( TYR and .OH ) or " +
        "( PROTEIN and .N )"
    );

    var acceptorSelection = new NGL.Selection(
        "( ASN and .OD1 ) or " +
        "( ASP and ( OD1 or .OD2 ) ) or " +
        "( GLN and .OE1 ) or " +
        "( GLU and ( .OE1 or .OE2 ) ) or " +
        "( HIS and ( .ND1 or .NE2 ) ) or " +
        "( SER and .OG ) or " +
        "( THR and .OG1 ) or " +
        "( TYR and .OH ) or " +
        "( PROTEIN and .O )"
    );

    var donAtomSet = new NGL.AtomSet( structure, donorSelection );
    var accAtomSet = new NGL.AtomSet( structure, acceptorSelection );

    var contact = new NGL.Contact( donAtomSet, accAtomSet );
    var data = contact.within( maxDistance );

    data.atomSet.structure = structure;
    data.bondSet.structure = structure;

    var bondSet = new NGL.BondSet();
    var v1 = new THREE.Vector3();
    var v2 = new THREE.Vector3();

    var checkAngle = function( atom1, atom2, oName, cName ){

        var atomO, atomN;

        if( atom1.atomname === oName ){
            atomO = atom1;
            atomN = atom2;
        }else{
            atomO = atom2;
            atomN = atom1;
        }

        var atomC = atomO.residue.getAtomByName( cName );

        v1.subVectors( atomC, atomO );
        v2.subVectors( atomC, atomN );

        return THREE.Math.radToDeg( v1.angleTo( v2 ) ) < maxAngle;

    }

    data.bondSet.eachBond( function( b ){

        var a1 = b.atom1;
        var a2 = b.atom2;

        if( ( a1.atomname === "O" && a2.atomname === "N" ) ||
            ( a1.atomname === "N" && a2.atomname === "O" )
        ){

            // ignore backbone to backbone contacts
            return;

        }else if( a1.atomname === "N" || a2.atomname === "N" ){

            var atomN, atomX;

            if( a1.atomname === "N" ){
                atomN = a1;
                atomX = a2;
            }else{
                atomN = a2;
                atomX = a1;
            }

            var atomCA = atomN.residue.getAtomByName( "CA" );
            if( !atomCA ) return;

            var prevRes = atomN.residue.getPreviousConnectedResidue();
            if( !prevRes ) return;

            var atomC = prevRes.getAtomByName( "C" );
            if( !atomC ) return;

            v1.subVectors( atomN, atomC );
            v2.subVectors( atomN, atomCA );
            v1.add( v2 ).multiplyScalar( 0.5 );
            v2.subVectors( atomX, atomN );

            if( THREE.Math.radToDeg( v1.angleTo( v2 ) ) < maxAngle ){
                bondSet.addBond( a1, a2, true );
            }

        }else if(
            ( a1.atomname === "OH" && a1.resname === "TYR" ) ||
            ( a2.atomname === "OH" && a2.resname === "TYR" )
        ){

            if( checkAngle( a1, a2, "OH", "CZ" ) ){
                bondSet.addBond( a1, a2, true );
            }

        }else{

            bondSet.addBond( a1, a2, true );

        }

    } );

    bondSet.structure = structure;

    data.bondSet.dispose();
    donAtomSet.dispose();
    accAtomSet.dispose();

    return {
        atomSet: data.atomSet,
        bondSet: bondSet
    };

}


NGL.polarBackboneContacts = function( structure, maxDistance, maxAngle ){

    maxDistance = maxDistance || 3.5;
    maxAngle = maxAngle || 40;

    var donorSelection = new NGL.Selection(
        "( PROTEIN and .N )"
    );

    var acceptorSelection = new NGL.Selection(
        "( PROTEIN and .O )"
    );

    var donAtomSet = new NGL.AtomSet( structure, donorSelection );
    var accAtomSet = new NGL.AtomSet( structure, acceptorSelection );

    var contact = new NGL.Contact( donAtomSet, accAtomSet );
    var data = contact.within( maxDistance );

    data.atomSet.structure = structure;
    data.bondSet.structure = structure;

    var bondSet = new NGL.BondSet();
    var v1 = new THREE.Vector3();
    var v2 = new THREE.Vector3();

    data.bondSet.eachBond( function( b ){

        var a1 = b.atom1;
        var a2 = b.atom2;

        var atomN, atomO;

        if( a1.atomname === "N" ){
            atomN = a1;
            atomO = a2;
        }else{
            atomN = a2;
            atomO = a1;
        }

        var atomCA = atomN.residue.getAtomByName( "CA" );
        if( !atomCA ) return;

        var prevRes = atomN.residue.getPreviousConnectedResidue();
        if( !prevRes ) return;

        var atomC = prevRes.getAtomByName( "C" );
        if( !atomC ) return;

        v1.subVectors( atomN, atomC );
        v2.subVectors( atomN, atomCA );
        v1.add( v2 ).multiplyScalar( 0.5 );
        v2.subVectors( atomO, atomN );

        // NGL.log( THREE.Math.radToDeg( v1.angleTo( v2 ) ) );

        if( THREE.Math.radToDeg( v1.angleTo( v2 ) ) < maxAngle ){
            bondSet.addBond( a1, a2, true );
        }

    } );

    bondSet.structure = structure;

    data.bondSet.dispose();
    donAtomSet.dispose();
    accAtomSet.dispose();

    return {
        atomSet: data.atomSet,
        bondSet: bondSet
    };

}
