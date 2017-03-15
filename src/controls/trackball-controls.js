/**
 * @file Trackball Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Matrix4 } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";


const tmpRotateXMatrix = new Matrix4();
const tmpRotateYMatrix = new Matrix4();
const tmpPanMatrix = new Matrix4();
const tmpPanVector = new Vector3();


class TrackballControls{

    constructor( stage, params ){

        var p = params || {};

        this.rotateSpeed = defaults( p.rotateSpeed, 2.0 );
        this.zoomSpeed = defaults( p.zoomSpeed, 1.2 );
        this.panSpeed = defaults( p.panSpeed, 1.0 );

        this.viewer = stage.viewer;
        this.viewerControls = stage.viewerControls;

    }

    zoom( delta ){

        this.viewerControls.zoom( this.zoomSpeed * delta * 0.02 );

    }

    pan( x, y ){

        tmpPanVector.set( x, y, 0 );
        const camera = this.viewer.camera;
        if( camera.fov === undefined ){
            tmpPanVector.multiplyScalar( 1 / camera.zoom );
        } else {
            var unitHeight = -2.0 * camera.position.z *
                        Math.tan( camera.fov * Math.PI / 360 );
            tmpPanVector.multiplyScalar( unitHeight / this.viewer.height );
        }
        tmpPanVector.multiplyScalar( this.panSpeed );
        tmpPanMatrix.getInverse( this.viewer.rotationGroup.matrix );
        tmpPanVector.applyMatrix4( tmpPanMatrix );

        this.viewerControls.translate( tmpPanVector );

    }

    rotate( x, y ){

        tmpRotateXMatrix.makeRotationX( this.rotateSpeed * y * 0.01 );
        tmpRotateYMatrix.makeRotationY( this.rotateSpeed * -x * 0.01 );
        tmpRotateXMatrix.multiply( tmpRotateYMatrix );

        this.viewerControls.applyMatrix( tmpRotateXMatrix );

    }

}


export default TrackballControls;
