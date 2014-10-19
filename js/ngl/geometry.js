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
               ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 +
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

        if( isNaN( tension ) ){
            tension = this.fiber.residues[ 0 ].isNucleic() ? 0.6 : 0.9;
        }

        var traceAtomname = this.traceAtomname;
        var directionAtomname1 = this.directionAtomname1;
        var directionAtomname2 = this.directionAtomname2;
        var n = this.size;
        var n1 = n - 1;

        var pos = new Float32Array( n1 * m * 3 + 3 );
        var tan = new Float32Array( n1 * m * 3 + 3 );
        var norm = new Float32Array( n1 * m * 3 + 3 );
        var bin = new Float32Array( n1 * m * 3 + 3 );

        var subdivideData = this._makeSubdivideData( m, tension );

        this.fiber.eachResidueN( 4, function( r1, r2, r3, r4 ){

            subdivideData( r1, r2, r3, r4, pos, tan, norm, bin );

        } );

        var rn = this.fiber.residues[ n ];
        var can = rn.getAtomByName( traceAtomname );

        var o = n1 * m * 3;

        can.positionToArray( pos, n1 * m * 3 );

        NGL.Utils.copyArray( bin, bin, o - 3, o, 3 );
        NGL.Utils.copyArray( tan, tan, o - 3, o, 3 );
        NGL.Utils.copyArray( norm, norm, o - 3, o, 3 );

        //

        var nx = n * m - 6;
        var i, j;

        var vBin1 = new THREE.Vector3();
        var vBin2 = new THREE.Vector3();
        var vBin3 = new THREE.Vector3();

        var vNorm1 = new THREE.Vector3();
        var vNorm2 = new THREE.Vector3();
        var vNorm3 = new THREE.Vector3();

        var vTan2 = new THREE.Vector3();

        for( i = 0; i < nx; ++i ){

            j = i * 3;

            vBin1.fromArray( bin, j + 0 );
            vBin2.fromArray( bin, j + 3 );
            vBin3.fromArray( bin, j + 6 );

            vNorm1.fromArray( norm, j + 0 );
            vNorm2.fromArray( norm, j + 3 );
            vNorm3.fromArray( norm, j + 6 );

            if( Math.abs( vNorm1.dot( vNorm2 ) ) + Math.abs( vBin1.dot( vBin2 ) ) <
                    Math.abs( vNorm1.dot( vNorm3 ) ) + Math.abs( vBin1.dot( vBin3 ) ) ){

                // console.log( i / m, "foo", vNorm1.dot( vNorm2 ), vNorm1.dot( vNorm3 ) )

                if( vBin1.dot( vBin3 ) < 0 ) vBin1.multiplyScalar( -1 );

                vBin2.set(
                    0.5 * vBin1.x + 0.5 * vBin3.x,
                    0.5 * vBin1.y + 0.5 * vBin3.y,
                    0.5 * vBin1.z + 0.5 * vBin3.z
                ).normalize();
                vBin2.toArray( bin, j + 3 );

                vTan2.fromArray( tan, j + 3 );
                vNorm2.copy( vTan2 ).cross( vBin2 ).normalize();
                vNorm2.toArray( norm, j + 3 );

                // FIXME what was this for?
                // ++i

            }

        }

        //

        return {

            "position": pos,
            "tangent": tan,
            "normal": norm,
            "binormal": bin

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

        size[ n1 * m + 0 ] = size[ n1 * m - 1 ];

        return {
            "size": size
        };

    },

    _makeSubdivideData: function( m, tension ){

        m = m || 10;
        tension = tension || 0.9;

        var elemColors = NGL.ElementColors;
        var traceAtomname = this.traceAtomname;
        var directionAtomname1 = this.directionAtomname1;
        var directionAtomname2 = this.directionAtomname2;
        var interpolate = this.interpolate;
        var getTangent = this._makeGetTangent( tension );

        var dt = 1.0 / m;
        var a1, a2, a3, a4;
        var j, l, d;
        var k = 0;

        var vTmp = new THREE.Vector3();

        var vPos2 = new THREE.Vector3();
        var vDir2 = new THREE.Vector3();
        var vNorm2 = new THREE.Vector3();

        var vPos3 = new THREE.Vector3();
        var vDir3 = new THREE.Vector3();
        var vNorm3 = new THREE.Vector3();

        var vDir = new THREE.Vector3();
        var vNorm = new THREE.Vector3();

        var vTang = new THREE.Vector3();
        var vBin = new THREE.Vector3();

        var vBinPrev = new THREE.Vector3();

        var first = true;

        return function( r1, r2, r3, r4, pos, tan, norm, bin ){

            a1 = r1.getAtomByName( traceAtomname );
            a2 = r2.getAtomByName( traceAtomname );
            a3 = r3.getAtomByName( traceAtomname );
            a4 = r4.getAtomByName( traceAtomname );

            if( traceAtomname === directionAtomname1 ){

                if( first ){
                    vDir2.set( 0, 0, 1 );
                    vNorm2.copy( a1 ).sub( a3 ).cross( vDir2 ).normalize();
                    first = false;
                }

                vDir3.set( 0, 0, 1 );

            }else{

                if( first ){
                    cAtom = r2.getAtomByName( directionAtomname1 );
                    oAtom = r2.getAtomByName( directionAtomname2 );
                    vDir2.copy( oAtom ).sub( cAtom ).normalize();
                    vNorm2.copy( a1 ).sub( a3 ).cross( vDir2 ).normalize();
                    first = false;
                }

                cAtom = r3.getAtomByName( directionAtomname1 );
                oAtom = r3.getAtomByName( directionAtomname2 );
                vPos3.copy( a3 );
                vDir3.copy( oAtom ).sub( cAtom ).normalize();

            }


            // ensure the direction vector does not flip
            if( vDir2.dot( vDir3 ) < 0 ) vDir3.multiplyScalar( -1 );

            for( j = 0; j < m; ++j ){

                d = dt * j
                d1 = 1 - d;
                l = k + j * 3;

                pos[ l + 0 ] = interpolate( a1.x, a2.x, a3.x, a4.x, d, tension );
                pos[ l + 1 ] = interpolate( a1.y, a2.y, a3.y, a4.y, d, tension );
                pos[ l + 2 ] = interpolate( a1.z, a2.z, a3.z, a4.z, d, tension );

                vNorm.set(
                    d1 * vDir2.x + d * vDir3.x,
                    d1 * vDir2.y + d * vDir3.y,
                    d1 * vDir2.z + d * vDir3.z
                ).normalize();
                vNorm.toArray( norm, l );

                getTangent( a1, a2, a3, a4, d, vTang );
                vTang.toArray( tan, l );

                //

                vBin.copy( vNorm ).cross( vTang ).normalize();

                // ensure binormal vector does not flip
                if( vBinPrev.dot( vBin ) < 0 ) vBin.multiplyScalar( -1 );

                vBin.toArray( bin, l );
                vBinPrev.copy( vBin );

                //

                vNorm.copy( vTang ).cross( vBin ).normalize();
                vNorm.toArray( norm, l );

            }

            k += 3 * m;

            vDir2.copy( vDir3 );

        };

    },

    getPoint: function( a1, a2, a3, a4, t, v, tension ){

        v.x = NGL.Spline.prototype.interpolate( a1.x, a2.x, a3.x, a4.x, t, tension );
        v.y = NGL.Spline.prototype.interpolate( a1.y, a2.y, a3.y, a4.y, t, tension );
        v.z = NGL.Spline.prototype.interpolate( a1.z, a2.z, a3.z, a4.z, t, tension );

        return v;

    },

    _makeGetTangent: function( tension ){

        var getPoint = this.getPoint;

        var p1 = new THREE.Vector3();
        var p2 = new THREE.Vector3();

        return function( a1, a2, a3, a4, t, v ){

            var delta = 0.0001;
            var t1 = t - delta;
            var t2 = t + delta;

            // Capping in case of danger

            if ( t1 < 0 ) t1 = 0;
            if ( t2 > 1 ) t2 = 1;

            getPoint( a1, a2, a3, a4, t1, p1, tension );
            getPoint( a1, a2, a3, a4, t2, p2, tension );

            return v.copy( p2 ).sub( p1 ).normalize();

        };

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

        var i, j, a, r;
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

        // console.log( f );

        return f;

    },

    getColor: function( type ){

        var n = this.size;
        var traceAtomname = this.traceAtomname;

        var col = new Float32Array( n * 3 );
        var pcol = new Float32Array( n * 3 );

        var colorFactory = new NGL.ColorFactory( type );

        var i = 0;
        var a;

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

        var tmp;
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

    angleTo: function( helix ){

        return this.axis.angleTo( helix.axis );

    },

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

        if( !lineContact ){

            // maxAngleDeviation
            var mad = 25;

            var candidates = [];

            var i1 = NGL.Utils.pointVectorIntersection(
                this.begin, helix.begin, helix.axis
            );
            var c1 = NGL.Utils.isPointOnSegment(
                i1, helix.begin, helix.end
            );
            candidates.push( {
                "distance": this.begin.distanceTo( i1 ),
                "contact": c1 && ( angle > 180 - mad || angle < mad ),
                "p1": this.begin,
                "p2": i1
            } );

            var i2 = NGL.Utils.pointVectorIntersection(
                this.end, helix.begin, helix.axis
            );
            var c2 = NGL.Utils.isPointOnSegment(
                i2, helix.begin, helix.end
            );
            candidates.push( {
                "distance": this.end.distanceTo( i2 ),
                "contact": c2 && ( angle > 180 - mad || angle < mad ),
                "p1": this.end,
                "p2": i2
            } );

            var i3 = NGL.Utils.pointVectorIntersection(
                helix.begin, this.begin, this.axis
            );
            var c3 = NGL.Utils.isPointOnSegment(
                i3, this.begin, this.end
            );
            candidates.push( {
                "distance": helix.begin.distanceTo( i3 ),
                "contact": c3 && ( angle > 180 - mad || angle < mad ),
                "p1": helix.begin,
                "p2": i3
            } );

            var i4 = NGL.Utils.pointVectorIntersection(
                helix.end, this.begin, this.axis
            );
            var c4 = NGL.Utils.isPointOnSegment(
                i4, this.begin, this.end
            );
            candidates.push( {
                "distance": helix.end.distanceTo( i4 ),
                "contact": c4 && ( angle > 180 - mad || angle < mad ),
                "p1": helix.end,
                "p2": i4
            } );

            //

            candidates.push( {
                "distance": this.begin.distanceTo( helix.begin ),
                "contact": ( angle > 180 - mad ),
                "p1": this.begin,
                "p2": helix.begin
            } );

            candidates.push( {
                "distance": this.begin.distanceTo( helix.end ),
                "contact": ( angle > 180 - mad ),
                "p1": this.begin,
                "p2": helix.end
            } );

            candidates.push( {
                "distance": this.end.distanceTo( helix.begin ),
                "contact": ( angle > 180 - mad ),
                "p1": this.end,
                "p2": helix.begin
            } );

            candidates.push( {
                "distance": this.end.distanceTo( helix.end ),
                "contact": ( angle > 180 - mad ),
                "p1": this.end,
                "p2": helix.end
            } );

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

                // console.log( r.ss, r2.ss, c.distanceTo( c2 ), pos.bending[ i ] )

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
