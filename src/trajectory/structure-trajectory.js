/**
 * @file Structure Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import Trajectory from "./trajectory.js";


function StructureTrajectory( trajPath, structure, selectionString ){

    // if( !trajPath ) trajPath = structure.path;
    trajPath = "";

    Trajectory.call( this, trajPath, structure, selectionString );

}

StructureTrajectory.prototype = Object.assign( Object.create(

    Trajectory.prototype ), {

    constructor: StructureTrajectory,

    type: "structure",

    makeAtomIndices: function(){

        var structure = this.structure;
        var atomSet = structure.atomSet;
        var count = atomSet.size();

        if( count < structure.atomStore.count ){
            var atomIndices = new Int32Array( count );
            atomSet.forEach( function( index, i ){
                atomIndices[ i ] = index;
            } );
            this.atomIndices = atomIndices;
        }else{
            this.atomIndices = null;
        }

    },

    _loadFrame: function( i, callback ){

        var coords;
        var structure = this.structure;
        var frame = this.structure.frames[ i ];

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

        var box = this.structure.boxes[ i ];
        var numframes = this.structure.frames.length;

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
