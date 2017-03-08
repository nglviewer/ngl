/**
 * @file Arrow Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Group } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import Buffer from "./buffer.js";
import CylinderBuffer from "./cylinder-buffer.js";
import ConeBuffer from "./cone-buffer.js";


/**
 * Arrow buffer
 * @class
 * @augments {Buffer}
 * @param {Object} data - buffer data
 * @param {Float32Array} data.position1 - from positions
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} data.position2 - to positions
 *                                  [x1,y1,z1, x2,y2,z2, ..., xN,yN,zN]
 * @param {Float32Array} data.color - colors
 *                               [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {Float32Array} data.radius - radii
 *                               [r1, r2, ..., rN]
 * @param {Float32Array} [data.pickingColor] - picking colors
 *                                      [r1,g1,b1, r2,g2,b2, ..., rN,gN,bN]
 * @param {BufferParams} [params] - parameters object
 */
function ArrowBuffer( data, params ){

    var d = data || {};
    var p = params || {};

    var aspectRatio = defaults( p.aspectRatio, 1.5 );
    var radialSegments = defaults( p.radialSegments, 50 );
    var openEnded = defaults( p.openEnded, false );
    var disableImpostor = defaults( p.disableImpostor, false );

    var splitPosition = new Float32Array( d.position1.length );
    var cylinderRadius = new Float32Array( d.radius.length );

    var attr = makeAttributes( d );

    var cylinderBuffer = new CylinderBuffer(
        attr.cylinder,
        {
            radialSegments: radialSegments,
            openEnded: openEnded,
            disableImpostor: disableImpostor
        }
    );

    var coneBuffer = new ConeBuffer(
        attr.cone,
        {
            radialSegments: radialSegments,
            openEnded: openEnded,
            disableImpostor: disableImpostor
        }
    );

    function makeAttributes( data ){

        var i, il;
        var cylinder = {};
        var cone = {};

        if( data.radius ){
            for( i = 0, il = cylinderRadius.length; i < il; ++i ){
                cylinderRadius[ i ] = data.radius[ i ] / aspectRatio;
            }
            cylinder.radius = cylinderRadius;
            cone.radius = data.radius;
        }

        if( data.position1 && data.position2 ){
            var vFrom = new Vector3();
            var vTo = new Vector3();
            var vDir = new Vector3();
            var vSplit = new Vector3();
            for( i = 0, il = splitPosition.length; i < il; i += 3 ){
                vFrom.fromArray( data.position1, i );
                vTo.fromArray( data.position2, i );
                vDir.subVectors( vFrom, vTo );
                var fullLength = vDir.length();
                var coneLength = cylinderRadius[ i / 3 ] * aspectRatio * 2;
                var length = Math.min( fullLength, coneLength );
                vDir.setLength( length );
                vSplit.copy( vTo ).add( vDir );
                vSplit.toArray( splitPosition, i );
            }
            cylinder.position1 = data.position1;
            cylinder.position2 = splitPosition;
            cone.position1 = splitPosition;
            cone.position2 = data.position2;
        }

        if( data.color ){
            cylinder.color = data.color;
            cylinder.color2 = data.color;
            cone.color = data.color;
        }

        if( data.pickingColor ){
            cylinder.pickingColor = data.pickingColor;
            cylinder.pickingColor2 = data.pickingColor;
            cone.pickingColor = data.pickingColor;
        }

        return {
            cylinder: cylinder,
            cone: cone
        };

    }

    this.geometry = [
        cylinderBuffer.geometry,
        coneBuffer.geometry
    ];

    this.wireframe = defaults( p.wireframe, false );

    this.group = new Group();
    this.wireframeGroup = new Group();
    this.pickingGroup = new Group();

    this.getMesh = function( picking ){

        return new Group().add(
            cylinderBuffer.getMesh( picking ),
            coneBuffer.getMesh( picking )
        );

    };

    this.getWireframeMesh = function(){

        return new Group().add(
            cylinderBuffer.getWireframeMesh(),
            coneBuffer.getWireframeMesh()
        );

    };

    this.getPickingMesh = function(){

        return new Group().add(
            cylinderBuffer.getPickingMesh(),
            coneBuffer.getPickingMesh()
        );

    };

    this.setAttributes = function( data ){

        var attr = makeAttributes( data );

        cylinderBuffer.setAttributes( {
            position1: attr.cylinderFrom,
            position2: attr.cylinderTo,
            color: attr.cylinderColor,
            color2: attr.cylinderColor2,
            radius: attr.radius,
            pickingColor: attr.cylinderPickingColor,
            pickingColor2: attr.cylinderPickingColor2,
        } );

        coneBuffer.setAttributes( {
            position1: attr.coneFrom,
            position2: attr.coneTo,
            color: attr.coneColor,
            radius: attr.coneRadius.radius,
            pickingColor: attr.conePickingColor
        } );

    };

    /**
     * Set buffer parameters
     * @param {BufferParameters} params - buffer parameters object
     * @return {undefined}
     */
    this.setParameters = function( params ){

        cylinderBuffer.setParameters( params );
        coneBuffer.setParameters( params );

        if( params && params.wireframe !== undefined ){
            this.wireframe = params.wireframe;
            this.setVisibility( this.visible );
        }

    };

    this.setVisibility = Buffer.prototype.setVisibility;

    this.dispose = function(){

        cylinderBuffer.dispose();
        coneBuffer.dispose();

    };

}


export default ArrowBuffer;
