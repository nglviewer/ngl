/**
 * @file Viewer Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4 } from "../../lib/three.es6.js";

import { degToRad } from "../math/math-utils.js";


class ViewerControls{

    constructor( stage ){

        this.stage = stage;
        this.viewer = stage.viewer;

    }

    get position(){

        return this.viewer.translationGroup.position;

    }

    get rotation(){

        return this.viewer.rotationGroup.quaternion;

    }

    setOrientation( orientation ){

        this.viewer.setOrientation( orientation );

    }

    getOrientation(){

        return this.viewer.getOrientation();

    }

    translate( v ){

        this.viewer.translationGroup.position.add( v );
        this.viewer.requestRender();

    }

    center( v ){

        this.viewer.translationGroup.position.copy( v ).negate();
        this.viewer.requestRender();

    }

    zoom( delta ){

        this.viewer.camera.position.z *= 1 - delta;
        this.viewer.requestRender();

    }

    rotate( axis, angle ){

        var m = new Matrix4().getInverse( this.viewer.rotationGroup.matrix );
        var axis2 = axis.clone().applyMatrix4( m );

        this.viewer.rotationGroup.rotateOnAxis( axis2, angle );
        this.viewer.requestRender();

    }

    applyMatrix( matrix ){

        this.viewer.rotationGroup.applyMatrix( matrix );
        this.viewer.requestRender();

    }

    centerScene(){

        if( !this.viewer.boundingBox.isEmpty() ){
            this.center( this.viewer.boundingBox.center() );
        }

    }

    zoomScene(){

        var bbSize = this.viewer.boundingBox.size();
        var maxSize = Math.max( bbSize.x, bbSize.y, bbSize.z );
        var minSize = Math.min( bbSize.x, bbSize.y, bbSize.z );
        var distance = maxSize + Math.sqrt( minSize );

        var fov = degToRad( this.viewer.perspectiveCamera.fov );
        var width = this.viewer.width;
        var height = this.viewer.height;
        var aspect = width / height;
        var aspectFactor = ( height < width ? 1 : aspect );

        distance = Math.abs(
            ( ( distance * 0.5 ) / aspectFactor ) / Math.sin( fov / 2 )
        );

        distance += this.stage.parameters.clipDist.value;

        this.viewer.camera.position.z = -distance;
        this.viewer.requestRender();

    }

    centerView( zoom, position ){

        if( position === undefined ){
            this.centerScene();
        }else{
            this.center( position );
        }
        if( zoom ){
            this.zoomScene();
        }

    }

}


export default ViewerControls;
