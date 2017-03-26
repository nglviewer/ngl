/**
 * @file Viewer Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Matrix4, Quaternion } from "../../lib/three.es6.js";
import Signal from "../../lib/signals.es6.js";

import { ensureVector3, ensureMatrix4, ensureQuaternion } from "../utils.js";


/**
 * Scene orientation matrix, a 4x4 transformation matrix with rotation part
 * used for scene rotation, scale part for scene camera distance and
 * position part for scene translation
 * @typedef {Matrix4} OrientationMatrix - orientation matrix
 */


/**
 * {@link Signal}, dispatched when viewer controls change
 * @example
 * viewerControls.signals.changed.add( function(){ ... } );
 * @event ViewerControls#changed
 */


const tmpQ = new Quaternion();
const tmpP = new Vector3();
const tmpS = new Vector3();

const tmpScaleVector = new Vector3();
const tmpRotateMatrix = new Matrix4();
const tmpRotateVector = new Vector3();
const tmpAlignMatrix = new Matrix4();


class ViewerControls{

    /**
     * create viewer controls
     * @param  {Stage} stage - the stage object
     */
    constructor( stage ){

        this.stage = stage;
        this.viewer = stage.viewer;

        this.signals = {
            changed: new Signal()
        };

    }

    /**
     * scene center position
     * @member
     * @readOnly
     * @type {Vector3}
     */
    get position(){

        return this.viewer.translationGroup.position;

    }

    /**
     * scene rotation
     * @member
     * @readOnly
     * @type {Quaternion}
     */
    get rotation(){

        return this.viewer.rotationGroup.quaternion;

    }

    /**
     * Trigger render and emit changed event
     * @fires ViewerControls#changed
     * @return {undefined}
     */
    changed(){

        this.viewer.requestRender();
        this.signals.changed.dispatch();

    }

    /**
     * get scene orientation
     * @param {Matrix4} optionalTarget - pre-allocated target matrix
     * @return {OrientationMatrix} scene orientation
     */
    getOrientation( optionalTarget ){

        const m = optionalTarget || new Matrix4();

        m.copy( this.viewer.rotationGroup.matrix );
        const z = -this.viewer.camera.position.z;
        m.scale( tmpScaleVector.set( z, z, z ) );
        m.setPosition( this.viewer.translationGroup.position );

        return m;

    }

    /**
     * set scene orientation
     * @param {OrientationMatrix|Array} orientation - scene orientation
     * @return {undefined}
     */
    orient( orientation ){

        ensureMatrix4( orientation ).decompose( tmpP, tmpQ, tmpS )

        this.viewer.rotationGroup.setRotationFromQuaternion( tmpQ );
        this.viewer.translationGroup.position.copy( tmpP );
        this.viewer.camera.position.z = -tmpS.z;
        this.viewer.updateZoom();
        this.changed();

    }

    /**
     * translate scene
     * @param  {Vector3|Array} vector - translation vector
     * @return {undefined}
     */
    translate( vector ){

        this.viewer.translationGroup.position
            .add( ensureVector3( vector ) );
        this.changed();

    }

    /**
     * center scene
     * @param  {Vector3|Array} position - center position
     * @return {undefined}
     */
    center( position ){

        this.viewer.translationGroup.position
            .copy( ensureVector3( position ) ).negate();
        this.changed();

    }

    /**
     * zoom scene
     * @param  {Number} delta - zoom change
     * @return {undefined}
     */
    zoom( delta ){

        this.distance( this.viewer.camera.position.z * ( 1 - delta ) );

    }

    /**
     * camera distance
     * @param  {Number} z - distance
     * @return {undefined}
     */
    distance( z ){

        this.viewer.camera.position.z = z;
        this.viewer.updateZoom();
        this.changed();

    }

    /**
     * spin scene on axis
     * @param  {Vector3|Array} axis - rotation axis
     * @param  {Number} angle - amount to spin
     * @return {undefined}
     */
    spin( axis, angle ){

        tmpRotateMatrix.getInverse( this.viewer.rotationGroup.matrix );
        tmpRotateVector
            .copy( ensureVector3( axis ) ).applyMatrix4( tmpRotateMatrix );

        this.viewer.rotationGroup.rotateOnAxis( tmpRotateVector, angle );
        this.changed();

    }

    /**
     * rotate scene
     * @param  {Quaternion|Array} quaternion - rotation quaternion
     * @return {undefined}
     */
    rotate( quaternion ){

        this.viewer.rotationGroup
            .setRotationFromQuaternion( ensureQuaternion( quaternion ) );
        this.changed();

    }

    /**
     * align scene to basis matrix
     * @param  {Matrix4|Array} basis - basis matrix
     * @return {undefined}
     */
    align( basis ){

        tmpAlignMatrix.getInverse( ensureMatrix4( basis ) );

        this.viewer.rotationGroup.setRotationFromMatrix( tmpAlignMatrix );
        this.changed();

    }

    /**
     * apply rotation matrix to scene
     * @param  {Matrix4|Array} matrix - rotation matrix
     * @return {undefined}
     */
    applyMatrix( matrix ){

        this.viewer.rotationGroup.applyMatrix( ensureMatrix4( matrix ) );
        this.changed();

    }

}


export default ViewerControls;
