/**
 * @file AV Surface
 * @author Fred Ludlow <fred.ludlow@gmail.com>
 * @private
 */

import { getRadiusDict } from "./surface-utils.js";
import { computeBoundingBox } from "../math/vector-utils.js";
import { defaults } from "../utils.js";

function AVSurface( coordList, radiusList, indexList ){

    // Sort of analogous to EDTSurface
    // Field generation method adapted from AstexViewer (Mike Hartshorn) 
    // by Fred Ludlow. 
    // Other parts based heavily on NGL (Alexander Rose) EDT Surface class
    // constructor, getSurface and getVolume should be equivalent methods (though
    // with slightly different signatures).
    // Written using prototype methods for possible future combination of EDT/AV

    this.coordList = coordList;
    this.radiusList = radiusList;
    this.indexList = indexList;

    this.radiusDict = getRadiusDict( radiusList );
    this.bbox = computeBoundingBox( coordList );

    this.probeRadius = 1.4;
    this.scaleFactor = 2.0
    this.setAtomID = true;

    this.maxRadius = 0;    

};

AVSurface.prototype = {

    constructor: AVSurface,

    getVolume: function( probeRadius, scaleFactor, setAtomID ) {

        console.time( "AVSurface.getVolume" );

        this.init( probeRadius, scaleFactor, setAtomID );

        

    },

    init: function( probeRadius, scaleFactor, setAtomID ) {

        this.probeRadius = defaults( probeRadius, 1.4 );
        this.scaleFactor = defaults( scaleFactor, 2.0 );
        this.setAtomID = defaults( setAtomID, true );

        this.maxRadius = 0;
        for( var radius in radiusDict) {
            this.maxRadius = Math.max( this.maxRadius, radius );
        }

        var grid = getSurfaceGrid(
            this.bbox.min, this.bbox.max, this.maxRadius, scaleFactor
        );
        

    }

}

