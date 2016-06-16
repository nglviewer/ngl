/**
 * @file Picking Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector2, Vector3 } from "../../lib/three.es6.js";
import Signal from "../../lib/signals.es6.js";

import { RightMouseButton, MiddleMouseButton } from "../constants.js";
import { GidPool, Debug, Log } from "../globals.js";


var PickingControls = function( viewer ){

    var signals = {
        onClick: new Signal()
    };

    var position = new Vector3();

    var mouse = {
        position: new Vector2(),
        down: new Vector2(),
        moving: false,
        distance: function(){
            return mouse.position.distanceTo( mouse.down );
        }
    };

    function pick( e ){
        var box = viewer.renderer.domElement.getBoundingClientRect();
        var offsetX = e.clientX - box.left;
        var offsetY = e.clientY - box.top;
        var pickingData = viewer.pick(
            offsetX, box.height - offsetY
        );

        var instance = pickingData.instance;
        var picked = GidPool.getByGid( pickingData.gid );

        var pickedAtom, pickedBond, pickedVolume;
        if( picked && picked.type === "AtomProxy" ){
            pickedAtom = picked;
        }else if( picked && picked.type === "BondProxy" ){
            pickedBond = picked;
        }else if( picked && picked && picked.volume.type === "Volume" ){
            pickedVolume = picked;
        }

        if( ( pickedAtom || pickedBond || pickedVolume ) &&
                e.which === MiddleMouseButton
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
            "instance": instance
        }
    }

    viewer.renderer.domElement.addEventListener( 'mousemove', function( e ){
        e.preventDefault();
        // e.stopPropagation();
        mouse.moving = true;
        mouse.position.x = e.layerX;
        mouse.position.y = e.layerY;
    } );

    viewer.renderer.domElement.addEventListener( 'mousedown', function( e ){
        e.preventDefault();
        // e.stopPropagation();
        mouse.moving = false;
        mouse.down.x = e.layerX;
        mouse.down.y = e.layerY;
    } );

    viewer.renderer.domElement.addEventListener( 'mouseup', function( e ){
        e.preventDefault();
        // e.stopPropagation();

        if( mouse.distance() > 3 || e.which === RightMouseButton ) return;

        var pd = pick( e );
        signals.onClick.dispatch( pd );

        if( Debug ){
            Log.log( "clicked atom", pd.pickedAtom );
            Log.log( "clicked bond", pd.pickedBond );
            Log.log( "clicked volume", pd.pickedVolume );
        }
    } );

    // API

    this.signals = signals;

};


export default PickingControls;
