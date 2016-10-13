/**
 * @file Trajectory Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Color } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import { uniformArray, uniformArray3 } from "../math/array-utils.js";

import Representation from "./representation.js";
import StructureRepresentation from "./structure-representation.js";

import SphereBuffer from "../buffer/sphere-buffer.js";
import CylinderBuffer from "../buffer/cylinder-buffer.js";
import PointBuffer from "../buffer/point-buffer.js";
import LineBuffer from "../buffer/line-buffer.js";


function TrajectoryRepresentation( trajectory, viewer, params ){

    this.manualAttach = true;

    this.trajectory = trajectory;

    StructureRepresentation.call(
        this, trajectory.structure, viewer, params
    );

}

TrajectoryRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: TrajectoryRepresentation,

    type: "",

    parameters: Object.assign( {

        drawLine: {
            type: "boolean", rebuild: true
        },
        drawCylinder: {
            type: "boolean", rebuild: true
        },
        drawPoint: {
            type: "boolean", rebuild: true
        },
        drawSphere: {
            type: "boolean", rebuild: true
        },

        linewidth: {
            type: "integer", max: 20, min: 1, rebuild: true
        },
        pointSize: {
            type: "integer", max: 20, min: 1, rebuild: true
        },
        sizeAttenuation: {
            type: "boolean", rebuild: true
        },
        sort: {
            type: "boolean", rebuild: true
        },

    }, Representation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.colorScheme = defaults( p.colorScheme, "uniform" );
        p.colorValue = defaults( p.colorValue, 0xDDDDDD );

        this.drawLine = defaults( p.drawLine, true );
        this.drawCylinder = defaults( p.drawCylinder, false );
        this.drawPoint = defaults( p.drawPoint, false );
        this.drawSphere = defaults( p.drawSphere, false );

        this.pointSize = defaults( p.pointSize, 1 );
        this.sizeAttenuation = defaults( p.sizeAttenuation, false );
        this.sort = defaults( p.sort, true );

        StructureRepresentation.prototype.init.call( this, p );

    },

    attach: function( callback ){

        this.bufferList.forEach( function( buffer ){

            this.viewer.add( buffer );

        }, this );

        this.setVisibility( this.visible );

        callback();

    },

    prepare: function( callback ){

        // TODO

        callback();

    },

    create: function(){

        // Log.log( this.selection )
        // Log.log( this.atomSet )

        if( this.atomSet.atomCount === 0 ) return;

        var scope = this;

        var index = this.atomSet.atoms[ 0 ].index;

        this.trajectory.getPath( index, function( path ){

            var n = path.length / 3;
            var tc = new Color( scope.colorValue );

            if( scope.drawSphere ){

                var sphereBuffer = new SphereBuffer(
                    path,
                    uniformArray3( n, tc.r, tc.g, tc.b ),
                    uniformArray( n, 0.2 ),
                    uniformArray3( n, tc.r, tc.g, tc.b ),
                    scope.getBufferParams( {
                        sphereDetail: scope.sphereDetail,
                        dullInterior: true,
                        disableImpostor: scope.disableImpostor
                    } )
                );

                scope.bufferList.push( sphereBuffer );

            }

            if( scope.drawCylinder ){

                var cylinderBuffer = new CylinderBuffer(
                    path.subarray( 0, -3 ),
                    path.subarray( 3 ),
                    uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    uniformArray( n, 0.05 ),
                    uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    scope.getBufferParams( {
                        openEnded: false,
                        radialSegments: scope.radialSegments,
                        disableImpostor: scope.disableImpostor,
                        dullInterior: true
                    } )

                );

                scope.bufferList.push( cylinderBuffer );

            }

            if( scope.drawPoint ){

                var pointBuffer = new PointBuffer(
                    path,
                    uniformArray3( n, tc.r, tc.g, tc.b ),
                    scope.getBufferParams( {
                        pointSize: scope.pointSize,
                        sizeAttenuation: scope.sizeAttenuation,
                        sort: scope.sort,
                    } )
                );

                scope.bufferList.push( pointBuffer );

            }

            if( scope.drawLine ){

                var lineBuffer = new LineBuffer(
                    path.subarray( 0, -3 ),
                    path.subarray( 3 ),
                    uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    uniformArray3( n - 1, tc.r, tc.g, tc.b ),
                    scope.getBufferParams()
                );

                scope.bufferList.push( lineBuffer );

            }

            scope.attach();

        } );

    }

} );


export default TrajectoryRepresentation;
