/**
 * @file AV Surface
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */

import { getSurfaceGrid } from "./surface-utils.js";
import { VolumeSurface } from "./volume.js";
import { computeBoundingBox,
         v3multiplyScalar,
         v3cross, v3normalize } from "../math/vector-utils.js";
import SpatialHash from "../geometry/spatial-hash.js";
import { defaults } from "../utils.js";

function AVSurface( coordList, radiusList, indexList ){

    // Sort of analogous to EDTSurface
    // Field generation method adapted from AstexViewer (Mike Hartshorn) 
    // by Fred Ludlow. 
    // Other parts based heavily on NGL (Alexander Rose) EDT Surface class
    // 
    // Constructor and getSurface should behave the same (though not all 
    // arguments have a meaning in this version)

    this.coordList = coordList;
    this.radiusList = radiusList;
    this.indexList = indexList;

    this.nAtoms = this.radiusList.length;

    /* Setup constant attributes */
    this.initializePositions();
    var bbox = computeBoundingBox( coordList );
    this.min = bbox[0];
    this.max = bbox[1];

}

AVSurface.prototype = {

    constructor: AVSurface,

    initializePositions: function() {

        this.x = new Float32Array( this.nAtoms );
        this.y = new Float32Array( this.nAtoms );
        this.z = new Float32Array( this.nAtoms );



        for( var i = 0; i < this.nAtoms; i++ ) {

            var ci = 3 * i;

            this.x[ i ] = this.coordList[ ci ];
            this.y[ i ] = this.coordList[ ci + 1 ];
            this.z[ i ] = this.coordList[ ci + 2 ];
            
        }
    },

    init: function( probeRadius, scaleFactor, setAtomID, probePositions ) {

        this.probeRadius = defaults( probeRadius, 1.4 );
        this.scaleFactor = defaults( scaleFactor, 2.0 );
        this.setAtomID = defaults( setAtomID, true );
        this.probePositions = defaults( probePositions, 40 );
        
        this.r = new Float32Array( this.nAtoms );
        this.r2 = new Float32Array( this.nAtoms );
        

        for( var i = 0; i < this.r.length; i++ ){
            var r = this.radiusList[ i ] + this.probeRadius;
            this.r[ i ] = r;
            this.r2[ i ] = r * r;
        }

        this.maxRadius = Math.max.apply( null, this.r );

        this.initializeGrid();
        this.initializeAngleTables();
        this.initializeHash();

        this.lastClip = -1; 

    },

    initializeGrid: function() {

        var surfGrid = getSurfaceGrid(
            this.min, this.max, this.maxRadius, this.scaleFactor, 0.0
        );

        this.scaleFactor = surfGrid.scaleFactor;
        this.dim = surfGrid.dim;
        this.matrix = surfGrid.matrix;
        this.tran = surfGrid.tran;
        
        this.grid = new Float32Array( this.dim[0] * this.dim[1] * this.dim[2] );
        this.grid.fill(-1001.0);

        this.atomIndex = new Int32Array( this.grid.length );

        this.gridx = new Float32Array( this.dim[0] );
        this.gridy = new Float32Array( this.dim[1] );
        this.gridz = new Float32Array( this.dim[2] );

        this._fillGridDim( this.gridx, this.min[0], 1/this.scaleFactor );
        this._fillGridDim( this.gridy, this.min[1], 1/this.scaleFactor );
        this._fillGridDim( this.gridz, this.min[2], 1/this.scaleFactor );

    },

    initializeAngleTables: function() {

        var theta = 0.0;
        var step = 2 * Math.PI / this.probePositions;

        this.cosTable = new Float32Array( this.probePositions );
        this.sinTable = new Float32Array( this.probePositions );
        for( var i = 0; i < this.probePositions; i++ ){

            this.cosTable[ i ] = Math.cos( theta );
            this.sinTable[ i ] = Math.sin( theta );

            theta += step;

        }
    },

    _fillGridDim: function( a, start, step ){

        for( var i = 0; i < a.length; i ++ ) {
            a[i] = start + (step * i);
        }

    },

    initializeHash: function() {

        var fakeStore = { x: this.x,
                          y: this.y,
                          z: this.z,
                          count: this.nAtoms
                        };

        this.hash = new SpatialHash( fakeStore, { min: this.min,
                                                  max: this.max } );

    },

    obscured: function( neighbours, x, y, z, a, b ) {

        // Is the point at x,y,z obscured by any of the atoms
        // specifeid by indices in neighbours. Ignore indices 
        // a and b (these are the relevant atoms in projectPoints/Torii)

        // Cache the last clipped atom (as very often the same one in 
        // subsequent calls)
        var i;

        if( this.lastClip != -1 ){
            i = this.lastClip;
            if( this.singleAtomObscures( i, x, y, z ) && i != a && i != b ){
                return i;
            } else {
                this.lastClip = -1;
            }
        }

        for( var ia = 0; ia < neighbours.length; ia++ ){

            i = neighbours[ ia ];

            if( this.singleAtomObscures( i, x, y, z ) && i != a && i != b ){
                this.lastClip = i;
                return i;

            }
        }

        this.lastClip = -1;
        return -1;
    },

    singleAtomObscures: function( ai, x, y, z ) {

        var ci = 3 * ai;
        var r2 = this.r2[ ai ];
        var dx = this.coordList[ ci ] - x;
        var dy = this.coordList[ ci + 1 ] - y;
        var dz = this.coordList[ ci + 2 ] - z;
        var d2 = dx * dx + dy * dy + dz * dz;

        return ( d2 < r2 );

    },

    projectPoints: function() {
        // For each atom:
        //     Iterate over a subsection of the grid, for each point:
        //         If current value < 0.0, unvisited, set positive
        //         
        //         In any case: Project this point onto surface of the atomic sphere
        //         If this projected point is not obscured by any other atom
        //             Calcualte delta distance and set grid value to minimum of
        //             itself and delta

        for( var i = 0; i < this.nAtoms; i++ ) {

            var x = this.x[ i ];
            var y = this.y[ i ];
            var z = this.z[ i ];
            var ra = this.r[ i ];
            var r2 = this.r2[ i ];

            var neighbours = this.hash.within( x, y, z, this.maxRadius + ra );

            // Number of grid points, round this up...
            var ng = Math.ceil(ra * this.scaleFactor );

            // Center of the atom, mapped to grid points (take floor) 

            var iax = Math.floor( this.scaleFactor * ( x - this.min[ 0 ] ));
            var iay = Math.floor( this.scaleFactor * ( y - this.min[ 1 ] ));
            var iaz = Math.floor( this.scaleFactor * ( z - this.min[ 2 ] ));

            // Extents of grid to consider for this atom
  
            var minx = Math.max( 0, iax - ng );
            var miny = Math.max( 0, iay - ng );
            var minz = Math.max( 0, iaz - ng );

            // Add two to these points:
            // - iax are floor'd values so this ensures coverage
            // - these are loop limits (exclusive)
            var maxx = Math.min( this.dim[ 0 ], iax + ng + 2 );
            var maxy = Math.min( this.dim[ 1 ], iay + ng + 2 );
            var maxz = Math.min( this.dim[ 2 ], iaz + ng + 2 );

            /*for( var iz = minx; iz < maxz; iz++ ) {

                var dz = this.gridz[ iz ] - z;
                var zoffset = this.dim[ 0 ] * this.dim[ 1 ] * iz;

                for( var iy = miny; iy < maxy; iy++ ){

                    var dy = this.gridy[ iy ] - y;
                    var dzy2 = dz * dz + dy * dy;
                    var yzoffset = zoffset + this.dim[ 0 ] * iy;

                    for( var ix = minx; ix < maxx; ix++ ){
                        var dx = this.gridx[ix] - x;
                        var d2 = dzy2 + dx * dx;
                        var idx = ix + yzoffset;

            */
            for( var ix = minx; ix < maxx; ix++ ){

                var dx = this.gridx[ ix ] - x;
                var xoffset = this.dim[ 1 ] * this.dim[ 2 ] * ix;

                for( var iy = miny; iy < maxy; iy++ ){

                    var dy = this.gridy[ iy ] - y;
                    var dxy2 = dx * dx + dy * dy;
                    var xyoffset = xoffset + this.dim[ 2 ] * iy; 

                    for( var iz = minz; iz < maxz; iz++ ){

                        var dz = this.gridz[ iz ] - z;
                        var d2 = dxy2 + dz * dz;
                        var idx = iz + xyoffset;

             
                        if( d2 < r2 ){

                            
                            if( this.grid[idx] < 0.0 ){
                                // Unvisited, make positive
                                this.grid[ idx ] = -this.grid[ idx ];
                            }
                            // Project on to the surface of the sphere
                            // sp is the projected point (dx,dy,dz)*(ra/d)
                            var d = Math.sqrt(d2);
                            var ap = ra / d;
                            var spx = dx * ap;
                            var spy = dy * ap;
                            var spz = dz * ap;

                            spx += x;
                            spy += y;
                            spz += z;

                            if( this.obscured( neighbours, spx, spy, spz, i, -1 ) == -1 ) {
                                var dd = ra - d;
                                if( dd < this.grid[ idx ] ) {
                                    this.grid[ idx ] = dd;
                                    this.atomIndex[ idx ] = i;
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    projectTorii: function() {

        for( var i = 0; i < this.nAtoms; i++ ){

            var neighbours = this.hash.within(
                this.x[ i ], this.y[ i ] , this.z[ i ],
                this.maxRadius + this.r[ i ]
            );

            for( var ia = 0; ia < neighbours.length; ia ++ ) {

                if( i < neighbours[ ia ] ){

                    this.projectTorus(i, neighbours[ ia ], neighbours );

                }
            }
        }
    },

    projectTorus: function( a, b, neighbours ) {

        var r1 = this.r[ a ];
        var r2 = this.r[ b ];
        var dx = this.x[ b ] - this.x[ a ];
        var dy = this.y[ b ] - this.y[ a ];
        var dz = this.z[ b ] - this.z[ a ];
        var d2 = dx * dx + dy * dy + dz * dz;
        var d = Math.sqrt( d2 );

        // Find angle between a->b vector and the circle 
        // of their intersection by cosine rule
        var cosA = ( r1 * r1 + d * d - r2 * r2 ) / ( 2.0 * r1 * d );

        // distance along a->b at intersection
        var dmp = r1 * cosA;

        var mid = new Float32Array( [ dx, dy, dz ] );
        v3normalize( mid, mid );

        // Create normal to line
        var n1 = new Float32Array( 3 );
        this._normalToLine(n1, mid);
        v3normalize( n1, n1 );

        // Cross together for second normal vector
        var n2 = new Float32Array( 3 );
        v3cross( n2, mid, n1 );
        v3normalize( n2, n2 );

        // r is radius of circle of intersection
        var r = Math.sqrt( r1 * r1 - dmp * dmp );

        v3multiplyScalar( n1, n1, r );
        v3multiplyScalar( n2, n2, r );
        v3multiplyScalar( mid, mid, dmp );
        
        mid[ 0 ] += this.x[ a ];
        mid[ 1 ] += this.y[ a ];
        mid[ 2 ] += this.z[ a ];

        this.lastClip = -1;

        for( var i = 0; i < this.probePositions; i++ ){

            var cost = this.cosTable[ i ];
            var sint = this.sinTable[ i ];

            var px = mid[ 0 ] + cost * n1[ 0 ] + sint * n2[ 0 ];
            var py = mid[ 1 ] + cost * n1[ 1 ] + sint * n2[ 1 ];
            var pz = mid[ 2 ] + cost * n1[ 2 ] + sint * n2[ 2 ];

            if( this.obscured( neighbours, px, py, pz, a, b ) == -1 ) {

                var ng = 4 + Math.floor( this.probeRadius * this.scaleFactor );

                // As above, iterate over our grid... 
                // px, py, pz in grid coords
                var iax = Math.floor( this.scaleFactor * ( px - this.min[ 0 ] ));
                var iay = Math.floor( this.scaleFactor * ( py - this.min[ 1 ] ));
                var iaz = Math.floor( this.scaleFactor * ( pz - this.min[ 2 ] ));

                var minx = Math.max( 0, iax - ng );
                var miny = Math.max( 0, iay - ng );
                var minz = Math.max( 0, iaz - ng );
                
                var maxx = Math.min( this.dim[ 0 ], iax + ng + 2 );
                var maxy = Math.min( this.dim[ 1 ], iay + ng + 2 );
                var maxz = Math.min( this.dim[ 2 ], iaz + ng + 2 );

                for( var ix = minx; ix < maxx; ix++ ){

                    dx = px - this.gridx[ ix ];
                    var xoffset = this.dim[ 1 ] * this.dim[ 2 ] * ix;

                    for( var iy = miny; iy < maxy; iy++ ){

                        dy = py - this.gridy[ iy ];
                        var dxy2 = dx * dx + dy * dy;
                        var xyoffset = xoffset + this.dim[ 2 ] * iy; 

                        for( var iz = minz; iz < maxz; iz++ ){

                            dz = pz - this.gridz[ iz ];
                            d2 = dxy2 + dz * dz;
                            var idx = iz + xyoffset;
                /*
                for( var iz = minz; iz < maxz; iz++ ){

                    dz = pz - this.gridz[ iz ];
                    var zoffset = this.dim[ 0 ] * this.dim[ 1 ] * iz;

                    for( var iy = miny; iy < maxy; iy ++ ){

                        dy = py - this.gridy[ iy ];
                        var dzy2 = dz * dz + dy * dy;
                        var yzoffset = zoffset + this.dim[ 0 ] * iy;


                        for( var ix = minx; ix < maxx; ix++ ) {

                            dx = px - this.gridx[ ix ];
                            d2 = dzy2 + dx * dx;

                            var idx = ix + yzoffset;
                 */
                            var current = this.grid[ idx ];

                            if( current > 0.0 && d2 < ( current * current)){
                                this.grid[ idx ] = Math.sqrt( d2 );
                                this.atomIndex[ idx ] = a;
                            }
                        }
                    }
                }
            }
        }
    },

    _normalToLine: function( out, p ) {

        out.fill( 1.0 );
        if( p[ 0 ] != 0 ) {
            out[ 0 ] = ( p[ 1 ] + p[ 2 ] ) / -p[ 0 ];
        }
        else if( p[ 1 ] != 0 ) {
            out[ 1 ] = ( p[ 0 ] + p[ 2 ] ) / -p[ 1 ];
        }
        else if( p[ 2 ] != 0 ) {
            out[ 2 ] = ( p[ 0 ] + p[ 1 ] ) / -p[ 2 ];
        }

    },

    fixNegatives: function() {

        for( var i = 0; i < this.grid.length; i++ ){
            if( this.grid[ i ] < 0 ) { this.grid[ i ] = 0 }
        }

    },

    /* Atom IDs are assigned to indices into coordlist- translate to indexlist */
    fixAtomIDs: function() {

        for( var i = 0; i < this.atomIndex.length; i++ ){
            this.atomIndex[ i ] = this.indexList[ this.atomIndex[ i ] ];
        }

    },


    getVolume: function( probeRadius, scaleFactor, setAtomID ) {

        // Basic steps are:
        // 1) Initialize
        // 2) Project points
        // 3) Project torii 


        console.time( "AVSurface.getVolume" );

        this.init( probeRadius, scaleFactor, setAtomID );

        this.projectPoints();
        this.projectTorii();
        //this.fixNegatives();
        //this.fixAtomIDs();

    },

    getSurface: function( type, probeRadius, scaleFactor, cutoff, setAtomID ) {

        // type and cutoff left in for compatibility with EDTSurface.getSurface
        // function signature

        this.getVolume( probeRadius, scaleFactor, setAtomID );
        
        this.volsurf = new VolumeSurface(
            this.grid, this.dim[ 2 ], this.dim[ 1 ], this.dim[ 0 ], this.atomIndex 
            //this.grid, this.dim[ 0 ], this.dim[ 1 ], this.dim[ 2 ], this.atomIndex 
        );

        return this.volsurf.getSurface( this.probeRadius, false, undefined, this.matrix );

    }


}

export default AVSurface;