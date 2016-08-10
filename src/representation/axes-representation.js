/**
 * @file Axes Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Color, Vector3 } from "../../lib/three.es6.js";

import { RepresentationRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import { uniformArray, uniformArray3 } from "../math/array-utils.js";
import Representation from "./representation.js";
import StructureRepresentation from "./structure-representation.js";
import SphereBuffer from "../buffer/sphere-buffer.js";
import CylinderBuffer from "../buffer/cylinder-buffer.js";


function AxesRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

}

AxesRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: AxesRepresentation,

    type: "axes",

    parameters: Object.assign( {

        radius: {
            type: "number", precision: 3, max: 10.0, min: 0.001
        },
        sphereDetail: true,
        radialSegments: true,
        disableImpostor: true,
        align: {
            type: "button"
        }

    }, Representation.prototype.parameters, {
        assembly: null
    } ),

    init: function( params ){

        var p = params || {};

        p.radius = defaults( p.radius, 0.5 );
        p.colorValue = defaults( p.colorValue, "lightgreen" );

        StructureRepresentation.prototype.init.call( this, p );

    },

    getPrincipalAxes: function( sview ){

        var selection;
        var assembly = this.getAssembly();

        if( assembly ){
            selection = assembly.partList[ 0 ].getSelection();
        }

        // return this.structureView.getPrincipalAxes( selection );  // FIXME
        return this.structureView.getView( selection ).getPrincipalAxes();

    },

    align: function(){

        var pa = this.getPrincipalAxes( this.structureView );

        var v1 = new Vector3().copy( pa[0][1] ).sub( pa[0][0] ).normalize();
        var v2 = new Vector3().copy( pa[1][1] ).sub( pa[1][0] ).normalize();
        var v3 = new Vector3().copy( pa[2][1] ).sub( pa[2][0] ).normalize();

        this.viewer.alignView( v3, v1, pa[ 3 ], true );

    },

    getAxesData: function( sview ){

        var pa = this.getPrincipalAxes( sview );
        var c = new Color( this.colorValue );

        var vertexPosition = new Float32Array( 3 * 6 );
        var vertexColor = uniformArray3( 6, c.r, c.g, c.b );
        var vertexRadius = uniformArray( 6, this.radius );

        var edgePosition1 = new Float32Array( 3 * 3 );
        var edgePosition2 = new Float32Array( 3 * 3 );
        var edgeColor = uniformArray3( 3, c.r, c.g, c.b );
        var edgeRadius = uniformArray( 3, this.radius );

        var offset = 0;
        function addAxis( v1, v2 ){
            v1.toArray( vertexPosition, offset * 2 );
            v2.toArray( vertexPosition, offset * 2 + 3 );
            v1.toArray( edgePosition1, offset );
            v2.toArray( edgePosition2, offset );
            offset += 3;
        }

        addAxis( pa[ 0 ][ 0 ], pa[ 0 ][ 1 ] );
        addAxis( pa[ 1 ][ 0 ], pa[ 1 ][ 1 ] );
        addAxis( pa[ 2 ][ 0 ], pa[ 2 ][ 1 ] );

        return {
            vertexPosition: vertexPosition,
            vertexColor: vertexColor,
            vertexRadius: vertexRadius,
            edgePosition1: edgePosition1,
            edgePosition2: edgePosition2,
            edgeColor: edgeColor,
            edgeRadius: edgeRadius
        };

    },

    create: function(){

        var axesData = this.getAxesData( this.structureView );

        this.sphereBuffer = new SphereBuffer(
            axesData.vertexPosition,
            axesData.vertexColor,
            axesData.vertexRadius,
            undefined,
            this.getBufferParams( {
                sphereDetail: this.sphereDetail,
                disableImpostor: this.disableImpostor,
                dullInterior: true
            } )
        );

        this.cylinderBuffer = new CylinderBuffer(
            axesData.edgePosition1,
            axesData.edgePosition2,
            axesData.edgeColor,
            axesData.edgeColor,
            axesData.edgeRadius,
            undefined,
            undefined,
            this.getBufferParams( {
                openEnded: true,
                radialSegments: this.radialSegments,
                disableImpostor: this.disableImpostor,
                dullInterior: true
            } )
        );

        this.dataList.push( {
            sview: this.structureView,
            bufferList: [ this.sphereBuffer, this.cylinderBuffer ]
        } );

    },

    updateData: function( what, data ){

        var axesData = this.getAxesData( data.sview );
        var sphereData = {};
        var cylinderData = {};

        if( !what || what.position ){
            sphereData.position = axesData.vertexPosition;
            cylinderData.position1 = axesData.edgePosition1;
            cylinderData.position2 = axesData.edgePosition2;
        }

        if( !what || what.color ){
            sphereData.color = axesData.vertexColor;
            cylinderData.color = axesData.edgeColor;
            cylinderData.color2 = axesData.edgeColor;
        }

        if( !what || what.radius ){
            sphereData.radius = axesData.vertexRadius;
            cylinderData.radius = axesData.edgeRadius;
        }

        this.sphereBuffer.setAttributes( sphereData );
        this.cylinderBuffer.setAttributes( cylinderData );

    }

} );


RepresentationRegistry.add( "axes", AxesRepresentation );


export default AxesRepresentation;
