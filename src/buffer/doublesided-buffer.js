/**
 * @file Double Sided Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Group } from "../../lib/three.es6.js";

import Buffer from "./buffer.js";


function DoubleSidedBuffer( buffer ){

    this.size = buffer.size;
    this.side = buffer.side;
    this.wireframe = buffer.wireframe;
    this.visible = buffer.visible;
    this.geometry = buffer.geometry;
    this.pickable = buffer.pickable;
    this.background = buffer.background;

    this.group = new Group();
    this.wireframeGroup = new Group();
    this.pickingGroup = new Group();

    var frontMeshes = [];
    var backMeshes = [];

    var frontBuffer = buffer;
    var backBuffer = new buffer.constructor();

    frontBuffer.makeMaterial();
    backBuffer.makeMaterial();

    backBuffer.geometry = buffer.geometry;
    backBuffer.wireframeGeometry = buffer.wireframeGeometry;
    backBuffer.size = buffer.size;
    backBuffer.attributeSize = buffer.attributeSize;
    backBuffer.pickable = buffer.pickable;
    backBuffer.setParameters( buffer.getParameters() );
    backBuffer.updateShader();

    frontBuffer.setParameters( {
        side: "front"
    } );
    backBuffer.setParameters( {
        side: "back",
        opacity: backBuffer.opacity
    } );

    this.getMesh = function( picking ){

        var front, back;

        if( picking ){
            back = backBuffer.getPickingMesh();
            front = frontBuffer.getPickingMesh();
        }else{
            back = backBuffer.getMesh();
            front = frontBuffer.getMesh();
        }

        frontMeshes.push( front );
        backMeshes.push( back );

        this.setParameters( { side: this.side } );

        return new Group().add( back, front );

    };

    this.getWireframeMesh = function(){

        return buffer.getWireframeMesh();

    };

    this.getPickingMesh = function(){

        return this.getMesh( true );

    };

    this.setAttributes = function( data ){

        buffer.setAttributes( data );

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

DoubleSidedBuffer.prototype.constructor = DoubleSidedBuffer;


export default DoubleSidedBuffer;
