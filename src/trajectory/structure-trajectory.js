/**
 * @file Structure Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Trajectory from "./trajectory.js";


function StructureTrajectory( trajPath, structure, params ){

    // if( !trajPath ) trajPath = structure.path;
    trajPath = "";

    Trajectory.call( this, trajPath, structure, params );

}

StructureTrajectory.prototype = Object.assign( Object.create(

    Trajectory.prototype ), {

    constructor: StructureTrajectory,

    type: "structure",

    makeAtomIndices: function(){

        if( this.structure.atomSet.size() < this.structure.atomStore.count ){
            this.atomIndices = this.structure.getAtomIndices();
        }else{
            this.atomIndices = null;
        }

    },

    _loadFrame: function( i, callback ){

        var coords;
        var structure = this.structure;
        var frame = structure.frames[ i ];

        if( this.atomIndices ){

            var indices = this.atomIndices;
            var m = indices.length;

            coords = new Float32Array( m * 3 );

            for( var j = 0; j < m; ++j ){

                var j3 = j * 3;
                var idx3 = indices[ j ] * 3;

                coords[ j3 + 0 ] = frame[ idx3 + 0 ];
                coords[ j3 + 1 ] = frame[ idx3 + 1 ];
                coords[ j3 + 2 ] = frame[ idx3 + 2 ];

            }

        }else{

            coords = new Float32Array( frame );

        }

        var box = structure.boxes[ i ];
        var numframes = structure.frames.length;

        this.process( i, box, coords, numframes );

        if( typeof callback === "function" ){
            callback();
        }

    },

    getNumframes: function(){

        this.setNumframes( this.structure.frames.length );

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


export default StructureTrajectory;
