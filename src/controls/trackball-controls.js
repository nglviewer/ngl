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
        this.panSpeed = defaults( p.panSpeed, 0.8 );

        this.viewer = stage.viewer;
        this.viewerControls = stage.viewerControls;

    }

    zoom( delta ){

        this.viewerControls.zoom( this.zoomSpeed * delta * 0.02 );

    }

    pan( x, y ){

        tmpPanVector.set( x, y, 0 ).multiplyScalar( this.panSpeed * 0.2 );
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
