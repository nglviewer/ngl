/**
 * @file Trackball Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Matrix4 } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";


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

        var v = new Vector3( x, y, 0 ).multiplyScalar( this.panSpeed * 0.2 );
        var m = new Matrix4().getInverse( this.viewer.rotationGroup.matrix );
        v.applyMatrix4( m );

        this.viewerControls.translate( v );

    }

    rotate( x, y ){

        var mRotX = new Matrix4().makeRotationX( this.rotateSpeed * y * 0.01 );
        var mRotY = new Matrix4().makeRotationY( this.rotateSpeed * -x * 0.01 );
        mRotX.multiply( mRotY );

        this.viewerControls.applyMatrix( mRotX );

    }

}


export default TrackballControls;
