/**
 * @file AV Surface
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */

import { getRadiusDict, getSurfaceGrid } from "./surface-utils.js";
import { VolumeSurface } from "./volume.js";
import { SpatialHash } from "../geometry/spatial-hash.js";
import { computeBoundingBox,
         v3sub,
         v3addScalar, v3MultiplyScalar,
         v3round,
         v3fromArray } from "../math/vector-utils.js";
import { defaults } from "../utils.js";

function AVSurface( coordList, radiusList, indexList ){

    // Sort of analogous to EDTSurface
    // Field generation method adapted from AstexViewer (Mike Hartshorn) 
    // by Fred Ludlow. 
    // Other parts based heavily on NGL (Alexander Rose) EDT Surface class
    // 
    // Constructor, getSurface and getVolume should be equivalent methods (though
    // with slightly different signatures).

    this.coordList = coordList;
    this.radiusList = radiusList;
    this.indexList = indexList;

    this.radiusDict = getRadiusDict( radiusList );
    this.bbox = computeBoundingBox( coordList );

    this.probeRadius = 1.4;
    this.scaleFactor = 2.0
    this.setAtomID = true;

    this.maxRadius = 0;    

}

AVSurface.prototype = {

    constructor: AVSurface,

    init: function( probeRadius, scaleFactor, setAtomID ) {

        this.probeRadius = defaults( probeRadius, 1.4 );
        this.scaleFactor = defaults( scaleFactor, 2.0 );
        this.setAtomID = defaults( setAtomID, true );

        this.maxRadius = 0;
        for( var radius in this.radiusDict) {
            this.maxRadius = Math.max( this.maxRadius, radius );
        }

        this.initializeGrid();

        this.initializeHash();
        this.lastClip = -1; 

    },

    initializeGrid: function() {

        var surfGrid = getSurfaceGrid(
            this.bbox.min, this.bbox.max, this.maxRadius, this.scaleFactor
        );

        this.scaleFactor = surfGrid.scaleFactor;
        this.dim = surfGrid.dim;
        this.matrix = surfGrid.matrix;
        this.tran = surfGrid.tran;
        
        this.grid = new Float32Array( this.dim[0] * this.dim[1] * this.dim[2] );
        this.grid.fill(-1001.0);

        this.gridx = new Float32Array( this.dim[0] );
        this.gridy = new Float32Array( this.dim[1] );
        this.gridz = new Float32Array( this.dim[2] );

        this._fillGridDim( this.gridx, this.bbox.min[0], 1/this.scaleFactor );
        this._fillGridDim( this.gridy, this.bbox.min[1], 1/this.scaleFactor );
        this._fillGridDim( this.gridz, this.bbox.min[2], 1/this.scaleFactor );
    },

    _fillGridDim: function( a, start, step ){

        for( var i = 0; i < a.length; i ++ ) {
            a[i] = start + (step * i);
        }

    },

    /** 
     * Uses spatial hash to find neighbours
     * TODO: Adaptaion of spatial hash to avoid duplication of work
     */
    initializeHash: function() {

        var coords = this.coordList;
        var nCoords = coords.length / 3;
        var x = new Float32Array( nCoords );
        var y = new Float32Array( nCoords );
        var z = new Float32Array( nCoords );

        var i = 0;
        var ci = 0;

        while ( i < nCoords ) {

            ci = 3 * i;

            x[ i ] = coords[ ci ];
            y[ i ] = coords[ ci + 1 ];
            z[ i ] = coords[ ci + 2 ];
            
        }

        var fakeStore = { x: x,
                          y: y,
                          z: z,
                          count: nCoords
                        };

        this.hash = new SpatialHash( fakeStore, this.bbox );

    },

    obscured: function( neighbours, x, y, z, a, b ) {

        // Is the point at x,y,z obscured by any of the atoms
        // specifeid by indices in neighbours. Ignore indices 
        // a and b (these are the relevant atoms in projectPoints/Torii)

        // Cache the last clipped atom (as very often the same one in 
        // subsequent calls)
        var i, ci;
        var dx, dy, dz, d2, r;
        var coords = this.coordList;
        var radii = this.radiusList;

        if( this.lastClip != -1 ){
            i = this.lastClip;
            ci = 3 * i;
            
            dx = coords[ ci ] - x;
            dy = coords[ ci + 1 ] - y;
            dz = coords[ ci + 2 ] - z;
            d2 = dx * dx + dy * dy + dz * dz;

            r = radii[ i ];
            if( d2 < ( r * r ) && i != a && i != b ){
                return i;
            } else {
                this.lastClip = -1;
            }
        }

        for( var ia = 0; ia < neighbours.length; ia++ ){
            i = neighbours[ ia ];
            ci = 3 * i;
            r = radii[ i ];
            dx = coords[ ci ] - x;
            dy = coords[ ci + 1 ] - y;
            dz = coords[ ci + 2 ] - z;
            d2 = dx * dx + dy * dy + dz * dz;

            if( d2 < ( r * r ) && i != a && i != b ){
                this.lastClip = i;
                return i;
            }
        }
        this.lastClip = -1;
        return -1;
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

        var coords = this.coordList;
        var radii = this.radiusList;
        var nCoords = coords.length / 3;


        for( var i = 0; i < nCoords; i++ ) {

            var ci = i * 3;
            var ra = radii[i];
            var r2 = ra * ra;

            var neighbours = this.hash.within( coords[ ci ], coords[ ci + 1 ],
                coords[ ci + 2 ], this.maxRadius + ra );

            // Number of grid points, round this up...
            var ng = Math.ceil(radii[i] * this.scaleFactor );

            // Center of the atom, mapped to grid points (take floor) 

            var iax = Math.floor( this.scaleFactor * ( coords[ ci ] - this.bbox.min[ 0 ] ) );
            var iay = Math.floor( this.scaleFactor * ( coords[ ci + 1 ] - this.bbox.min[ 1 ] ));
            var iaz = Math.floor( this.scaleFactor * ( coords[ ci + 2 ] - this.bbox.min[ 2 ] ));

            // Extents of grid to consider for this atom
  
            var minx = Math.max( 0, iax - ng );
            var miny = Math.max( 0, iay - ng );
            var minz = Math.max( 0, iaz - ng );

            // Add two to these points - huh?
            // - iax are floor'd values
            // - these are loop limits (exclusive)
            var maxx = Math.min( this.dim[ 0 ], iax + ng + 2 );
            var maxy = Math.min( this.dim[ 1 ], iay + ng + 2 );
            var maxz = Math.min( this.dim[ 2 ], iaz + ng + 2 );

            for( var iz = minz; iz < maxz; iz++ ){

                var dz = this.gridz[ iz ] - coords[ ci + 2 ];
                var zoffset = this.dim[ 0 ] * this.dim[ 1 ] * iz;

                for( var iy = miny; iy < maxy; iy++ ){

                    var dy = this.gridy[ iy ] - coords[ ci + 1 ];
                    var dzy2 = dz * dz + dy * dy;
                    var yzoffset = zoffset + this.dim[ 0 ] * iy;

                    for( var ix = minx; ix < maxx; ix++ ){

                        var dx = this.gridx[ix] - coords[ ci ];
                        var d2 = dzy2 + dx * dx;

                        if( d2 < r2 ){

                            var idx = ix + yzoffset;
                            if( this.grid[idx] < 0.0 ){
                                // Unvisited, make positive
                                this.grid[idx] = -this.grid[idx];
                            }
                            // Project on to the surface of the sphere
                            // sp is the projected point (dx,dy,dz)*(ra/d)
                            var d = Math.sqrt(d2);
                            var ap = ra / d;
                            var spx = dx * ap;
                            var spy = dy * ap;
                            var spz = dz * ap;

                            spx += coords[ ci ];
                            spy += coords[ ci + 1 ];
                            spz += coords[ ci + 2 ];

                            if( this.obscured( neighbours, spx, spy, spz, i, -1 ) == -1 ) {
                                var dd = ra - d;
                                if( dd < this.grid[ idx ] ) {
                                    this.grid[ idx ] = dd;
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    projectTorus: function(a, b) {

        

    },

    projectTorii: function() {

        var coords = this.coordList;
        var radii = this.radiusList;
        var nCoords = coords.length / 3;

        for( var i = 0; i < nCoords; i++ ){

            var ci = i * 3;
            var ra = radii[ i ];
            var r2 = ra * ra;

            var neighbours = this.hash.within( coords[ ci ], coords[ ci + 1 ],
                coords[ ci + 2 ], this.maxRadius + ra );

            for( var ia = 0; ia < neighbours.length; ia ++ ) {

                if( i < neighbours[ ia ] ){

                    this.projectTorus(i, neighbours[ ia ]);

                }
            }
        }
    },

    getVolume: function( probeRadius, scaleFactor, setAtomID ) {

        // Basic steps are:
        // 1) Initialize
        // 2) Project points
        // 3) Project torii 


        console.time( "AVSurface.getVolume" );

        this.init( probeRadius, scaleFactor, setAtomID );



    },

    getSurface: function( probeRadius, scaleFactor, setAtomID ) {

        this.getVolume( probeRadius, scaleFactor, setAtomID );
        
        this.volsurf = new VolumeSurface(
            this.vd.data, this.vd.nx, this.vd.ny, this.vd.nz, this.vd.atomindex 
        );

        return this.volsurf.getSurface( /*TODO*/ );

    }


}

