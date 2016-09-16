/**
 * @file AV Surface
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */

import { getRadiusDict, getSurfaceGrid } from "./surface-utils.js";
import { VolumeSurface } from "./volume.js";
import { computeBoundingBox } from "../math/vector-utils.js";
import { defaults } from "../utils.js";

function AVSurface( coordList, radiusList, indexList ){

    // Sort of analogous to EDTSurface
    // Field generation method adapted from AstexViewer (Mike Hartshorn) 
    // by Fred Ludlow. 
    // Other parts based heavily on NGL (Alexander Rose) EDT Surface class
    // constructor, getSurface and getVolume should be equivalent methods (though
    // with slightly different signatures).
    // Written using prototype methods for possible future inheritance of 

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
        this.grid.fill(

    },

    projectPoints: function() {
        // For each atom:
        // 

    },

    projectTorii: function() {

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

