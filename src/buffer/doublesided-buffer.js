/**
 * @file Double Sided Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Group } from "../../lib/three.es6.js";

import Buffer from "./buffer.js";


function setVisibilityTrue( m ){ m.visible = true; }
function setVisibilityFalse( m ){ m.visible = false; }


/**
 * A double-sided mesh buffer
 * @implements {Buffer}
 */
class DoubleSidedBuffer{

    /**
     * make a double sided buffer
     * @param  {Buffer} buffer - the buffer to render double-sided
     */
    constructor( buffer ){

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

        this.frontMeshes = [];
        this.backMeshes = [];

        var frontBuffer = buffer;
        var backBuffer = new buffer.constructor();

        frontBuffer.makeMaterial();
        backBuffer.makeMaterial();

        backBuffer.geometry = buffer.geometry;
        backBuffer.wireframeGeometry = buffer.wireframeGeometry;
        backBuffer.setParameters( buffer.getParameters() );
        backBuffer.updateShader();

        frontBuffer.setParameters( {
            side: "front"
        } );
        backBuffer.setParameters( {
            side: "back",
            opacity: backBuffer.opacity
        } );

        this.buffer = buffer;
        this.frontBuffer = frontBuffer;
        this.backBuffer = backBuffer;

    }

    getMesh( picking ){

        var front, back;

        if( picking ){
            back = this.backBuffer.getPickingMesh();
            front = this.frontBuffer.getPickingMesh();
        }else{
            back = this.backBuffer.getMesh();
            front = this.frontBuffer.getMesh();
        }

        this.frontMeshes.push( front );
        this.backMeshes.push( back );

        this.setParameters( { side: this.side } );

        return new Group().add( back, front );

    }

    getWireframeMesh(){

        return this.buffer.getWireframeMesh();

    }

    getPickingMesh(){

        return this.getMesh( true );

    }

    setAttributes( data ){

        this.buffer.setAttributes( data );

    }

    setParameters( data ){

        data = Object.assign( {}, data );

        if( data.side === "front" ){

            this.frontMeshes.forEach( setVisibilityTrue );
            this.backMeshes.forEach( setVisibilityFalse );

        }else if( data.side === "back" ){

            this.frontMeshes.forEach( setVisibilityFalse );
            this.backMeshes.forEach( setVisibilityTrue );

        }else if( data.side === "double" ){

            this.frontMeshes.forEach( setVisibilityTrue );
            this.backMeshes.forEach( setVisibilityTrue );

        }

        if( data.side !== undefined ){
            this.side = data.side;
        }
        delete data.side;

        this.frontBuffer.setParameters( data );

        if( data.wireframe !== undefined ){
            this.wireframe = data.wireframe;
            this.setVisibility( this.visible );
        }
        delete data.wireframe;

        this.backBuffer.setParameters( data );

    }

    dispose(){

        this.frontBuffer.dispose();
        this.backBuffer.dispose();

    }

}

DoubleSidedBuffer.prototype.setVisibility = Buffer.prototype.setVisibility;


export default DoubleSidedBuffer;
