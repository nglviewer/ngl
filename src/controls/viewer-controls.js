/**
 * @file Viewer Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Matrix4, Quaternion } from "../../lib/three.es6.js";

import { degToRad } from "../math/math-utils.js";


/**
 * Scene orientation matrix, a 4x4 transformation matrix with rotation part
 * used for scene rotation, scale part for scene camera position and
 * position part for scene translation
 * @typedef {Matrix4} OrientationMatrix - orientation matrix
 */


const tmpQ = new Quaternion();
const tmpP = new Vector3();
const tmpS = new Vector3();

const tmpScaleVector = new Vector3();
const tmpRotateMatrix = new Matrix4();
const tmpRotateVector = new Vector3();
const tmpZoomVector = new Vector3();
const tmpCenterVector = new Vector3();
const tmpAlignMatrix = new Matrix4();

const negateVector = new Vector3( -1, -1, -1 );


class ViewerControls{

    /**
     * create viewer controls
     * @param  {Stage} stage - the stage object
     */
    constructor( stage ){

        this.stage = stage;
        this.viewer = stage.viewer;

    }

    /**
     * scene center position
     * @member
     * @type {Vector3}
     */
    get position(){

        return this.viewer.translationGroup.position;

    }

    /**
     * scene rotation
     * @member
     * @type {Quaternion}
     */
    get rotation(){

        return this.viewer.rotationGroup.quaternion;

    }

    /**
     * set scene orientation
     * @param {OrientationMatrix} orientation - scene orientation
     * @return {undefined}
     */
    setOrientation( orientation ){

        orientation.decompose( tmpP, tmpQ, tmpS )

        this.viewer.rotationGroup.setRotationFromQuaternion( tmpQ );
        this.viewer.translationGroup.position.copy( tmpP );
        this.viewer.camera.position.z = -tmpS.z;

        this.viewer.requestRender();

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
     * translate scene
     * @param  {Vector3} v - translation vector
     * @return {undefined}
     */
    translate( v ){

        this.viewer.translationGroup.position.add( v );
        this.viewer.requestRender();

    }

    /**
     * center scene
     * @param  {Vector3} v - center position
     * @return {undefined}
     */
    center( v ){

        this.viewer.translationGroup.position.copy( v ).negate();
        this.viewer.requestRender();

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
        this.viewer.requestRender();

    }

    /**
     * rotate scene on axis
     * @param  {Vector3} axis - rotation axis
     * @param  {Number} angle - amount to rotate
     * @return {undefined}
     */
    rotate( axis, angle ){

        tmpRotateMatrix.getInverse( this.viewer.rotationGroup.matrix );
        tmpRotateVector.copy( axis ).applyMatrix4( tmpRotateMatrix );

        this.viewer.rotationGroup.rotateOnAxis( tmpRotateVector, angle );
        this.viewer.requestRender();

    }

    /**
     * align scene to basis matrix
     * @param  {Matrix4} basis - basis matrix
     * @return {undefined}
     */
    align( basis ){

        tmpAlignMatrix.getInverse( basis );
        if( tmpAlignMatrix.determinant() < 0 ){
            tmpAlignMatrix.scale( negateVector );
        }

        this.viewer.rotationGroup.setRotationFromMatrix( tmpAlignMatrix );
        this.viewer.requestRender();

    }

    /**
     * apply rotation matrix to scene
     * @param  {Matrix4} matrix - rotation matrix
     * @return {undefined}
     */
    applyMatrix( matrix ){

        this.viewer.rotationGroup.applyMatrix( matrix );
        this.viewer.requestRender();

    }

    /**
     * auto-center scene
     * @return {undefined}
     */
    centerScene(){

        if( !this.viewer.boundingBox.isEmpty() ){
            this.center( this.viewer.boundingBox.center( tmpCenterVector ) );
        }

    }

    /**
     * auto-zoom scene
     * @return {undefined}
     */
    zoomScene(){

        const bbSize = this.viewer.boundingBox.size( tmpZoomVector );
        const maxSize = Math.max( bbSize.x, bbSize.y, bbSize.z );
        const minSize = Math.min( bbSize.x, bbSize.y, bbSize.z );
        let distance = maxSize + Math.sqrt( minSize );

        const fov = degToRad( this.viewer.perspectiveCamera.fov );
        const width = this.viewer.width;
        const height = this.viewer.height;
        const aspect = width / height;
        const aspectFactor = ( height < width ? 1 : aspect );

        distance = Math.abs(
            ( ( distance * 0.5 ) / aspectFactor ) / Math.sin( fov / 2 )
        );

        distance += this.stage.parameters.clipDist.value;

        this.viewer.camera.position.z = -distance;
        this.viewer.requestRender();

    }

    /**
     * apply scene center-view
     * @param  {Boolean} zoom - flag to indicate auto-zoom
     * @param  {Vector3} position - center position
     * @return {undefined}
     */
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

    /**
     * apply scene align-view
     * @param  {Matrix4} basis - basis matrix
     * @param  {Vector3} position - center position
     * @param  {Boolean} zoom - flag to indicate auto-zoom
     * @return {undefined}
     */
    alignView( basis, position, zoom ){

        this.align( basis );
        this.centerView( zoom, position );

    }

}


export default ViewerControls;
