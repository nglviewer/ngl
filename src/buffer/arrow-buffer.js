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


class ArrowBuffer{

    /**
     * Create arrow buffer
     * @param {Object} data - buffer data
     * @param {Float32Array} data.position1 - from positions
     * @param {Float32Array} data.position2 - to positions
     * @param {Float32Array} data.color - colors
     * @param {Float32Array} data.radius - radii
     * @param {Float32Array} [data.pickingColor] - picking colors
     * @param {BufferParams} [params] - parameters object
     */
    constructor( data, params ){

        const d = data || {};
        const p = params || {};

        this.aspectRatio = defaults( p.aspectRatio, 1.5 );
        this.wireframe = defaults( p.wireframe, false );

        const radialSegments = defaults( p.radialSegments, 50 );
        const openEnded = defaults( p.openEnded, false );
        const disableImpostor = defaults( p.disableImpostor, false );

        this.splitPosition = new Float32Array( d.position1.length );
        this.cylinderRadius = new Float32Array( d.radius.length );

        var attr = this.makeAttributes( d );

        this.cylinderBuffer = new CylinderBuffer(
            attr.cylinder,
            {
                radialSegments: radialSegments,
                openEnded: openEnded,
                disableImpostor: disableImpostor
            }
        );

        this.coneBuffer = new ConeBuffer(
            attr.cone,
            {
                radialSegments: radialSegments,
                openEnded: openEnded,
                disableImpostor: disableImpostor
            }
        );

        this.geometry = [
            this.cylinderBuffer.geometry,
            this.coneBuffer.geometry
        ];

        this.group = new Group();
        this.wireframeGroup = new Group();
        this.pickingGroup = new Group();

    }

    makeAttributes( data ){

        const splitPosition = this.splitPosition;
        const cylinderRadius = this.cylinderRadius;

        const aspectRatio = this.aspectRatio;

        let i, il;
        const cylinder = {};
        const cone = {};

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

    getMesh( picking ){

        return new Group().add(
            this.cylinderBuffer.getMesh( picking ),
            this.coneBuffer.getMesh( picking )
        );

    }

    getWireframeMesh(){

        return new Group().add(
            this.cylinderBuffer.getWireframeMesh(),
            this.coneBuffer.getWireframeMesh()
        );

    }

    getPickingMesh(){

        return new Group().add(
            this.cylinderBuffer.getPickingMesh(),
            this.coneBuffer.getPickingMesh()
        );

    }

    setAttributes( data ){

        var attr = this.makeAttributes( data );

        this.cylinderBuffer.setAttributes( {
            position1: attr.cylinderFrom,
            position2: attr.cylinderTo,
            color: attr.cylinderColor,
            color2: attr.cylinderColor2,
            radius: attr.radius,
            pickingColor: attr.cylinderPickingColor,
            pickingColor2: attr.cylinderPickingColor2,
        } );

        this.coneBuffer.setAttributes( {
            position1: attr.coneFrom,
            position2: attr.coneTo,
            color: attr.coneColor,
            radius: attr.coneRadius.radius,
            pickingColor: attr.conePickingColor
        } );

    }

    /**
     * Set buffer parameters
     * @param {BufferParameters} params - buffer parameters object
     * @return {undefined}
     */
    setParameters( params ){

        this.cylinderBuffer.setParameters( params );
        this.coneBuffer.setParameters( params );

        if( params && params.wireframe !== undefined ){
            this.wireframe = params.wireframe;
            this.setVisibility( this.visible );
        }

    }

    setVisibility(){

        Buffer.prototype.setVisibility.apply( this, arguments );

    }

    dispose(){

        this.cylinderBuffer.dispose();
        this.coneBuffer.dispose();

    }

}


export default ArrowBuffer;
