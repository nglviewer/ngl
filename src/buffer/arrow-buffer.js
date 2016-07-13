/**
 * @file Arrow Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Vector3, CylinderGeometry, CylinderBufferGeometry } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import { calculateCenterArray } from "../math/array-utils.js";
import CylinderBuffer from "./cylinder-buffer.js";
import ConeBuffer from "./cone-buffer.js";


function ArrowBuffer( from, to, color, radius, pickingColor, params ){

    var p = params || {};

    var radialSegments = defaults( p.radialSegments, 10 );
    var openEnded = defaults( p.openEnded, true );
    var disableImpostor = defaults( p.disableImpostor, false );

    var attr = makeAttributes( {
        from: from,
        to: to,
        color: color,
        radius: radius,
        pickingColor: pickingColor
    } );

    var split = new Float32Array( from.length );

    var cylinderBuffer = new CylinderBuffer(
        attr.cylinderFrom,
        attr.cylinderTo,
        attr.cylinderColor,
        attr.cylinderColor2,
        attr.cylinderRadius,
        attr.cylinderPickingColor,
        attr.cylinderPickingColor2,
        {
            radialSegments: radialSegments,
            openEnded: openEnded,
            disableImpostor: disableImpostor
        }
    );

    var coneBuffer = new ConeBuffer(
        attr.coneFrom,
        attr.coneTo,
        attr.coneColor,
        attr.coneRadius,
        attr.conePickingColor,
        {
            radialSegments: radialSegments,
            openEnded: openEnded,
            disableImpostor: disableImpostor
        }
    );

    function makeAttributes( data ){

        var attr = {};

        calculateCenterArray( data.from, data.to, split );

        return {
            cylinderFrom: data.from,
            cylinderTo: split,
            cylinderColor: data.color,
            cylinderColor2: data.color,
            cylinderRadius: data.radius,
            cylinderPickingColor: data.pickingColor,
            cylinderPickingColor2: data.pickingColor,

            coneFrom: split,
            coneTo: data.to,
            coneColor: data.color,
            coneRadius: data.radius,
            conePickingColor: data.pickingColor
        };

    }

    this.getMesh = function( picking ){

        return new Group().add(
            cylinderBuffer.getMesh(),
            coneBuffer.getMesh()
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
            cylinderFrom: attr.cylinderFrom,
            cylinderTo: attr.cylinderTo,
            cylinderColor: attr.cylinderColor,
            cylinderColor2: attr.cylinderColor2,
            cylinderRadius: attr.radius,
            cylinderPickingColor: attr.cylinderPickingColor,
            cylinderPickingColor2: attr.cylinderPickingColor2,
        } );

        coneBuffer.setAttributes( {
            coneFrom: attr.coneFrom,
            coneTo: attr.coneTo,
            coneColor: attr.coneColor,
            coneRadius: attr.coneRadius.radius,
            conePickingColor: attr.conePickingColor
        } );

    };

    this.setParameters = function( data ){

        data = Object.assign( {}, data );

        if( data.side === "front" ){

            frontMeshes.forEach( function( m ){ m.visible = true; } );
            backMeshes.forEach( function( m ){ m.visible = false; } );

        }else if( data.side === "back" ){

            frontMeshes.forEach( function( m ){ m.visible = false; } );
            backMeshes.forEach( function( m ){ m.visible = true; } );

        }else if( data.side === "double" ){

            frontMeshes.forEach( function( m ){ m.visible = true; } );
            backMeshes.forEach( function( m ){ m.visible = true; } );

        }

        if( data.side !== undefined ){
            this.side = data.side;
        }
        delete data.side;

        frontBuffer.setParameters( data );

        if( data.wireframe !== undefined ){
            this.wireframe = data.wireframe;
            this.setVisibility( this.visible );
        }
        delete data.wireframe;

        backBuffer.setParameters( data );

    };

    this.setVisibility = Buffer.prototype.setVisibility;

    this.dispose = function(){

        frontBuffer.dispose();
        backBuffer.dispose();

    };

}


export default ArrowBuffer;
