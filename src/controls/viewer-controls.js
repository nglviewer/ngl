/**
 * @file Viewer Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Matrix4 } from "../../lib/three.es6.js";

import { degToRad } from "../math/math-utils.js";


const tmpRotateMatrix = new Matrix4();
const tmpRotateVector = new Vector3();
const tmpZoomVector = new Vector3();
const tmpCenterVector = new Vector3();
const tmpAlignMatrix = new Matrix4();

const negateVector = new Vector3( -1, -1, -1 );


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

        const camera = this.viewer.camera;
        if( camera.fov === undefined ){
            camera.zoom /= 1 - delta;
        } else {
            camera.position.z *= 1 - delta;
        }
        this.viewer.requestRender();

    }

    rotate( axis, angle ){

        tmpRotateMatrix.getInverse( this.viewer.rotationGroup.matrix );
        tmpRotateVector.copy( axis ).applyMatrix4( tmpRotateMatrix );

        this.viewer.rotationGroup.rotateOnAxis( tmpRotateVector, angle );
        this.viewer.requestRender();

    }

    align( basis ){

        tmpAlignMatrix.getInverse( basis );
        if( tmpAlignMatrix.determinant() < 0 ){
            tmpAlignMatrix.scale( negateVector );
        }

        this.viewer.rotationGroup.setRotationFromMatrix( tmpAlignMatrix );
        this.viewer.requestRender();

    }

    applyMatrix( matrix ){

        this.viewer.rotationGroup.applyMatrix( matrix );
        this.viewer.requestRender();

    }

    centerScene(){

        if( !this.viewer.boundingBox.isEmpty() ){
            this.center( this.viewer.boundingBox.center( tmpCenterVector ) );
        }

    }

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

    alignView( basis, position, zoom ){

        this.align( basis );
        this.centerView( zoom, position );

    }

}


export default ViewerControls;
