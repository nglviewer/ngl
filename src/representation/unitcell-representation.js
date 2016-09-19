/**
 * @file Unitcell Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Color } from "../../lib/three.es6.js";

import { RepresentationRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import { uniformArray, uniformArray3 } from "../math/array-utils.js";
import Representation from "./representation.js";
import StructureRepresentation from "./structure-representation.js";
import SphereBuffer from "../buffer/sphere-buffer.js";
import CylinderBuffer from "../buffer/cylinder-buffer.js";


function UnitcellRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

}

UnitcellRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: UnitcellRepresentation,

    type: "unitcell",

    parameters: Object.assign( {

        radius: {
            type: "number", precision: 3, max: 10.0, min: 0.001
        },
        sphereDetail: true,
        radialSegments: true,
        disableImpostor: true

    }, Representation.prototype.parameters, {
        assembly: null
    } ),

    init: function( params ){

        var p = params || {};

        var defaultRadius = 0.5;
        if( this.structure.unitcell ){
            defaultRadius = Math.cbrt( this.structure.unitcell.volume ) / 200;
        }

        p.radius = defaults( p.radius, defaultRadius );
        p.colorValue = defaults( p.colorValue, "orange" );

        StructureRepresentation.prototype.init.call( this, p );

    },

    getUnitcellData: function( structure ){

        var c = new Color( this.colorValue );

        var vertexPosition = new Float32Array( 3 * 8 );
        var vertexColor = uniformArray3( 8, c.r, c.g, c.b );
        var vertexRadius = uniformArray( 8, this.radius );

        var edgePosition1 = new Float32Array( 3 * 12 );
        var edgePosition2 = new Float32Array( 3 * 12 );
        var edgeColor = uniformArray3( 12, c.r, c.g, c.b );
        var edgeRadius = uniformArray( 12, this.radius );

        var uc = structure.unitcell;
        var centerFrac = structure.center.clone()
            .applyMatrix4( uc.cartToFrac )
            .floor().multiplyScalar( 2 ).addScalar( 1 );
        var v = new Vector3();

        var cornerOffset = 0;
        function addCorner( x, y, z ){
            v.set( x, y, z )
                .multiply( centerFrac )
                .applyMatrix4( uc.fracToCart )
                .toArray( vertexPosition, cornerOffset );
            cornerOffset += 3;
        }
        addCorner( 0, 0, 0 );
        addCorner( 1, 0, 0 );
        addCorner( 0, 1, 0 );
        addCorner( 0, 0, 1 );
        addCorner( 1, 1, 0 );
        addCorner( 1, 0, 1 );
        addCorner( 0, 1, 1 );
        addCorner( 1, 1, 1 );

        var edgeOffset = 0;
        function addEdge( a, b ){
            v.fromArray( vertexPosition, a * 3 )
                .toArray( edgePosition1, edgeOffset );
            v.fromArray( vertexPosition, b * 3 )
                .toArray( edgePosition2, edgeOffset );
            edgeOffset += 3;
        }
        addEdge( 0, 1 );
        addEdge( 0, 2 );
        addEdge( 0, 3 );
        addEdge( 1, 4 );
        addEdge( 1, 5 );
        addEdge( 2, 6 );
        addEdge( 3, 5 );
        addEdge( 4, 7 );
        addEdge( 5, 7 );
        addEdge( 2, 4 );
        addEdge( 7, 6 );
        addEdge( 3, 6 );

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

        var structure = this.structureView.getStructure();
        if( !structure.unitcell ) return;
        var unitcellData = this.getUnitcellData( structure );

        this.sphereBuffer = new SphereBuffer(
            unitcellData.vertexPosition,
            unitcellData.vertexColor,
            unitcellData.vertexRadius,
            undefined,
            this.getBufferParams( {
                sphereDetail: this.sphereDetail,
                disableImpostor: this.disableImpostor,
                dullInterior: true
            } )
        );

        this.cylinderBuffer = new CylinderBuffer(
            unitcellData.edgePosition1,
            unitcellData.edgePosition2,
            unitcellData.edgeColor,
            unitcellData.edgeColor,
            unitcellData.edgeRadius,
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

        var structure = data.sview.getStructure();
        var unitcellData = this.getUnitcellData( structure );
        var sphereData = {};
        var cylinderData = {};

        if( !what || what.position ){
            sphereData.position = unitcellData.vertexPosition;
            cylinderData.position1 = unitcellData.edgePosition1;
            cylinderData.position2 = unitcellData.edgePosition2;
        }

        if( !what || what.color ){
            sphereData.color = unitcellData.vertexColor;
            cylinderData.color = unitcellData.edgeColor;
            cylinderData.color2 = unitcellData.edgeColor;
        }

        if( !what || what.radius ){
            sphereData.radius = unitcellData.vertexRadius;
            cylinderData.radius = unitcellData.edgeRadius;
        }

        this.sphereBuffer.setAttributes( sphereData );
        this.cylinderBuffer.setAttributes( cylinderData );

    }

} );


RepresentationRegistry.add( "unitcell", UnitcellRepresentation );


export default UnitcellRepresentation;
