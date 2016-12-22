/**
 * @file Picking Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector2, Vector3 } from "../../lib/three.es6.js";
import Signal from "../../lib/signals.es6.js";

import { RightMouseButton, MiddleMouseButton } from "../constants.js";
import { Debug, Log } from "../globals.js";
import { defaults } from "../utils.js";


/**
 * Picking data object.
 * @typedef {Object} PickingData - picking data
 * @property {Vector2} canvasPosition - mouse x and y position in pixels relative to the canvas
 * @property {AtomProxy} [pickedAtom] - picked atom
 * @property {BondProxy} [pickedBond] - picked bond
 * @property {Volume} [pickedVolume] - picked volume
 * @property {Object} [instance] - instance data
 * @property {Integer} instance.id - instance id
 * @property {String|Integer} instance.name - instance name
 * @property {Matrix4} instance.matrix - transformation matrix of the instance
 */


var PickingControls = function( stage, params ){

    var viewer = stage.viewer;
    var gidPool = stage.gidPool;

    var hoverTimeout = 50;
    setParameters( params );

    var signals = {
        clicked: new Signal(),
        hovered: new Signal()
    };

    var position = new Vector3();

    var mouse = {
        position: new Vector2(),
        down: new Vector2(),
        canvasPosition: new Vector2(),
        moving: false,
        hovering: true,
        scrolled: false,
        lastMoved: Infinity,
        which: undefined,
        distance: function(){
            return mouse.position.distanceTo( mouse.down );
        },
        setCanvasPosition: function( e ){
            var box = viewer.renderer.domElement.getBoundingClientRect();
            var offsetX = e.clientX - box.left;
            var offsetY = e.clientY - box.top;
            mouse.canvasPosition.set( offsetX, box.height - offsetY );
        }
    };

    function setParameters( params ){
        var p = Object.assign( {}, params );
        hoverTimeout = defaults( p.hoverTimeout, hoverTimeout );
    }

    /**
     * pick helper function
     * @param  {Object} mouse - mouse data
     * @param  {Boolean} [clicked] - flag indication if there was a mouse click
     * @return {PickingData} picking data
     */
    function pick( mouse, clicked ){
        var pickingData = viewer.pick(
            mouse.canvasPosition.x, mouse.canvasPosition.y
        );
        var instance = pickingData.instance;
        var picked = gidPool.getByGid( pickingData.gid );

        var pickedAtom, pickedBond, pickedVolume;
        if( picked && picked.type === "AtomProxy" ){
            pickedAtom = picked;
        }else if( picked && picked.type === "BondProxy" ){
            pickedBond = picked;
        }else if( picked && picked.volume.type === "Volume" ){
            pickedVolume = picked;
        }

        if( ( pickedAtom || pickedBond || pickedVolume ) &&
                mouse.which === MiddleMouseButton && clicked
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
            viewer.centerView( false, position );
        }

        return {
            "atom": pickedAtom,
            "bond": pickedBond,
            "volume": pickedVolume,
            "instance": instance,
            "canvasPosition": mouse.canvasPosition.clone()
        };
    }

    function listen(){
        if( performance.now() - mouse.lastMoved > hoverTimeout ){
            mouse.moving = false;
        }
        if( mouse.scrolled || ( !mouse.moving && !mouse.hovering ) ){
            mouse.scrolled = false;
            if( hoverTimeout !== -1 ){
                mouse.hovering = true;
                signals.hovered.dispatch( pick( mouse ) );
            }
        }
        requestAnimationFrame( listen );
    }
    listen();

    viewer.renderer.domElement.addEventListener( 'mousemove', function( e ){
        e.preventDefault();
        // e.stopPropagation();
        mouse.moving = true;
        mouse.hovering = false;
        mouse.lastMoved = performance.now();
        mouse.position.set( e.layerX, e.layerY );
        mouse.setCanvasPosition( e );
    } );

    viewer.renderer.domElement.addEventListener( 'mousedown', function( e ){
        e.preventDefault();
        // e.stopPropagation();
        mouse.moving = false;
        mouse.hovering = false;
        mouse.down.set( e.layerX, e.layerY );
        mouse.which = e.which;
        mouse.setCanvasPosition( e );
    } );

    viewer.renderer.domElement.addEventListener( 'mouseup', function( e ){
        e.preventDefault();
        // e.stopPropagation();
        if( mouse.distance() > 3 || e.which === RightMouseButton ) return;
        var pd = pick( mouse, true );
        mouse.which = undefined;
        signals.clicked.dispatch( pd );
        if( Debug ) Log.log( "clicked", pd );
    } );

    function scrolled(){
        setTimeout( function(){
            mouse.scrolled = true;
        }, hoverTimeout );
    }
    viewer.renderer.domElement.addEventListener( 'mousewheel', scrolled );
    viewer.renderer.domElement.addEventListener( 'wheel', scrolled );
    viewer.renderer.domElement.addEventListener( 'MozMousePixelScroll', scrolled );

    // API

    this.signals = signals;
    this.setParameters = setParameters;

};


export default PickingControls;
