/**
 * @file Remote Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log, DatasourceRegistry } from "../globals.js";
import Trajectory from "./trajectory.js";


function RemoteTrajectory( trajPath, structure, params ){

    Trajectory.call( this, trajPath, structure, params );

}

RemoteTrajectory.prototype = Object.assign( Object.create(

    Trajectory.prototype ), {

    constructor: RemoteTrajectory,

    type: "remote",

    makeAtomIndices: function(){

        var atomIndices = [];

        if( this.structure.type === "StructureView" ){

            var indices = this.structure.getAtomIndices();

            var i, r;
            var p = indices[ 0 ];
            var q = indices[ 0 ];
            var n = indices.length;

            for( i = 1; i < n; ++i ){

                r = indices[ i ];

                if( q + 1 < r ){

                    atomIndices.push( [ p, q + 1 ] );
                    p = r;

                }

                q = r;

            }

            atomIndices.push( [ p, q + 1 ] );

        }else{

            atomIndices.push( [ 0, this.atomCount ] );

        }

        this.atomIndices = atomIndices;

    },

    _loadFrame: function( i, callback ){

        // TODO implement max frameCache size, re-use arrays

        var request = new XMLHttpRequest();

        var ds = DatasourceRegistry.trajectory;
        var url = ds.getFrameUrl( this.trajPath, i );
        var params = ds.getFrameParams( this.trajPath, this.atomIndices );

        request.open( "POST", url, true );
        request.responseType = "arraybuffer";
        request.setRequestHeader(
            "Content-type", "application/x-www-form-urlencoded"
        );

        request.addEventListener( 'load', function(){

            var arrayBuffer = request.response;
            if( !arrayBuffer ){
                Log.error( "empty arrayBuffer for '" + url + "'" );
                return;
            }

            var numframes = new Int32Array( arrayBuffer, 0, 1 )[ 0 ];
            // var time = new Float32Array( arrayBuffer, 1 * 4, 1 )[ 0 ];
            var box = new Float32Array( arrayBuffer, 2 * 4, 9 );
            var coords = new Float32Array( arrayBuffer, 11 * 4 );

            this.process( i, box, coords, numframes );
            if( typeof callback === "function" ){
                callback();
            }

        }.bind( this ), false );

        request.send( params );

    },

    getNumframes: function(){

        var request = new XMLHttpRequest();

        var ds = DatasourceRegistry.trajectory;
        var url = ds.getNumframesUrl( this.trajPath );

        request.open( "GET", url, true );
        request.addEventListener( 'load', function(){
            this.setNumframes( parseInt( request.response ) );
        }.bind( this ), false );
        request.send( null );

    },

    getPath: function( index, callback ){

        if( this.pathCache[ index ] ){
            callback( this.pathCache[ index ] );
            return;
        }

        Log.time( "loadPath" );

        var request = new XMLHttpRequest();

        var ds = DatasourceRegistry.trajectory;
        var url = ds.getPathUrl( this.trajPath, index );
        var params = "";

        request.open( "POST", url, true );
        request.responseType = "arraybuffer";
        request.setRequestHeader(
            "Content-type", "application/x-www-form-urlencoded"
        );

        request.addEventListener( 'load', function(){

            Log.timeEnd( "loadPath" );

            var arrayBuffer = request.response;
            if( !arrayBuffer ){
                Log.error( "empty arrayBuffer for '" + url + "'" );
                return;
            }

            var path = new Float32Array( arrayBuffer );
            // Log.log( path )
            this.pathCache[ index ] = path;
            callback( path );

        }.bind( this ), false );

        request.send( params );

    }

} );


export default RemoteTrajectory;
