/**
 * @file Picking Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector2, Vector3 } from "../../lib/three.es6.js";

import { RightMouseButton, MiddleMouseButton } from "../constants.js";
import { Debug, Log } from "../globals.js";
import { defaults } from "../utils.js";


/**
 * Picking data object.
 * @typedef {Object} PickingData - picking data
 * @property {Vector2} canvasPosition - mouse x and y position in pixels relative to the canvas
 * @property {Boolean} [altKey] - whether the alt key was pressed
 * @property {Boolean} [ctrlKey] - whether the control key was pressed
 * @property {Boolean} [metaKey] - whether the meta key was pressed
 * @property {Boolean} [shiftKey] - whether the shift key was pressed
 * @property {AtomProxy} [atom] - picked atom
 * @property {BondProxy} [bond] - picked bond
 * @property {Volume} [volume] - picked volume
 * @property {Object} [instance] - instance data
 * @property {Integer} instance.id - instance id
 * @property {String|Integer} instance.name - instance name
 * @property {Matrix4} instance.matrix - transformation matrix of the instance
 */


class MouseData{

    constructor( domElement ){
        this.domElement = domElement;
        this.position = new Vector2();
        this.down = new Vector2();
        this.canvasPosition = new Vector2();
        this.moving = false;
        this.hovering = true;
        this.scrolled = false;
        this.lastMoved = Infinity;
        this.which = undefined;
        this.altKey = undefined;
        this.ctrlKey = undefined;
        this.metaKey = undefined;
        this.shiftKey = undefined;
    }

    distance(){
        return this.position.distanceTo( this.down );
    }

    setCanvasPosition( e ){
        var box = this.domElement.getBoundingClientRect();
        var offsetX = e.clientX - box.left;
        var offsetY = e.clientY - box.top;
        this.canvasPosition.set( offsetX, box.height - offsetY );
    }

    setKeys( e ){
        this.altKey = e.altKey;
        this.ctrlKey = e.ctrlKey;
        this.metaKey = e.metaKey;
        this.shiftKey = e.shiftKey;
    }

}


class PickingBehavior{

    constructor( stage, params ){

        var p = Object.assign( {}, params );
        var domElement = stage.viewer.renderer.domElement;

        this.hoverTimeout = defaults( p.hoverTimeout, 50 );

        this.position = new Vector3();
        this.mouse = new MouseData( domElement );

        this.stage = stage;
        this.gidPool = stage.gidPool;

        //

        this.listen = this.listen.bind( this );
        this.onMousewheel = this.onMousewheel.bind( this );
        this.onMousemove = this.onMousemove.bind( this );
        this.onMousedown = this.onMousedown.bind( this );
        this.onMouseup = this.onMouseup.bind( this );

        this.listen();

        domElement.addEventListener( 'mousewheel', this.onMousewheel );
        domElement.addEventListener( 'wheel', this.onMousewheel );
        domElement.addEventListener( 'MozMousePixelScroll', this.onMousewheel );
        domElement.addEventListener( 'mousemove', this.onMousemove );
        domElement.addEventListener( 'mousedown', this.onMousedown );
        domElement.addEventListener( 'mouseup', this.onMouseup );

    }

    setParameters( params ){
        var p = Object.assign( {}, params );
        this.hoverTimeout = defaults( p.hoverTimeout, this.hoverTimeout );
    }

    /**
     * get picking data
     * @param  {Boolean} [clicked] - flag indication if there was a mouse click
     * @return {PickingData} picking data
     */
    getPickingData( clicked ){
        var pickingData = this.stage.viewer.pick(
            this.mouse.canvasPosition.x, this.mouse.canvasPosition.y
        );
        var instance = pickingData.instance;
        var picked = this.gidPool.getByGid( pickingData.gid );

        var pickedAtom, pickedBond, pickedVolume;
        if( picked && picked.type === "AtomProxy" ){
            pickedAtom = picked;
        }else if( picked && picked.type === "BondProxy" ){
            pickedBond = picked;
        }else if( picked && picked.volume.type === "Volume" ){
            pickedVolume = picked;
        }

        if( ( pickedAtom || pickedBond || pickedVolume ) &&
                this.mouse.which === MiddleMouseButton && clicked
        ){
            if( pickedAtom ){
                position.copy( pickedAtom );
            }else if( pickedBond ){
                position.copy( pickedBond.atom1 )
                    .add( pickedBond.atom2 )
                    .multiplyScalar( 0.5 );
            }else if( pickedVolume ){
                position.copy( pickedVolume );
            }

            if( instance ){
                position.applyProjection( instance.matrix );
            }
            this.stage.viewer.centerView( false, position );
        }

        return {
            "atom": pickedAtom,
            "bond": pickedBond,
            "volume": pickedVolume,
            "instance": instance,
            "canvasPosition": this.mouse.canvasPosition.clone(),
            "altKey": this.mouse.altKey,
            "ctrlKey": this.mouse.ctrlKey,
            "metaKey": this.mouse.metaKey,
            "shiftKey": this.mouse.shiftKey
        };
    }

    listen(){
        if( performance.now() - this.mouse.lastMoved > this.hoverTimeout ){
            this.mouse.moving = false;
        }
        if( this.mouse.scrolled || ( !this.mouse.moving && !this.mouse.hovering ) ){
            this.mouse.scrolled = false;
            if( this.hoverTimeout !== -1 ){
                this.mouse.hovering = true;
                this.stage.signals.hovered.dispatch( this.getPickingData() );
            }
        }
        requestAnimationFrame( this.listen );
    }

    onMousewheel(){
        setTimeout( () => {
            this.mouse.scrolled = true;
        }, this.hoverTimeout );
    }

    onMousemove( e ){
        e.preventDefault();
        // e.stopPropagation();
        this.mouse.setKeys( e );
        this.mouse.moving = true;
        this.mouse.hovering = false;
        this.mouse.lastMoved = performance.now();
        this.mouse.position.set( e.layerX, e.layerY );
        this.mouse.setCanvasPosition( e );
    }

    onMousedown( e ){
        e.preventDefault();
        // e.stopPropagation();
        this.mouse.setKeys( e );
        this.mouse.moving = false;
        this.mouse.hovering = false;
        this.mouse.down.set( e.layerX, e.layerY );
        this.mouse.which = e.which;
        this.mouse.setCanvasPosition( e );
    }

    onMouseup( e ){
        e.preventDefault();
        // e.stopPropagation();
        this.mouse.setKeys( e );
        if( this.mouse.distance() > 3 || e.which === RightMouseButton ) return;
        var pd = this.getPickingData( true );
        this.mouse.which = undefined;
        stage.signals.clicked.dispatch( pd );
        if( Debug ) Log.log( "clicked", pd );
    }

    dispose(){
        var domElement = this.stage.viewer.renderer.domElement;
        domElement.removeEventListener( 'mousewheel', this.onMousewheel );
        domElement.removeEventListener( 'wheel', this.onMousewheel );
        domElement.removeEventListener( 'MozMousePixelScroll', this.onMousewheel );
        domElement.removeEventListener( 'mousemove', this.onMousemove );
        domElement.removeEventListener( 'mousedown', this.onMousedown );
        domElement.removeEventListener( 'mouseup', this.onMouseup );
    }

};


export default PickingBehavior;
