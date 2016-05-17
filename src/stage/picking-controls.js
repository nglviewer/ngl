/**
 * @file Picking Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { RightMouseButton, MiddleMouseButton } from "../constants.js";
import { GidPool, Debug, Log } from "../globals.js";


var PickingControls = function( viewer, stage ){

    var position = new THREE.Vector3();

    var mouse = {

        position: new THREE.Vector2(),
        down: new THREE.Vector2(),
        moving: false,
        distance: function(){
            return mouse.position.distanceTo( mouse.down );
        }

    };

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

        var box = viewer.renderer.domElement.getBoundingClientRect();

        var offsetX = e.clientX - box.left;
        var offsetY = e.clientY - box.top;

        var pickingData = viewer.pick(
            offsetX,
            box.height - offsetY
        );
        var gid = pickingData.gid;
        var instance = pickingData.instance;

        var pickedAtom = undefined;
        var pickedBond = undefined;
        var pickedVolume = undefined;

        var picked = GidPool.getByGid( gid );

        if( picked && picked.type === "AtomProxy" ){

            pickedAtom = picked;

        }else if( picked && picked.type === "BondProxy" ){

            pickedBond = picked;

        }else if( picked && picked && picked.volume.type === "Volume" ){

            pickedVolume = picked;

        }

        //

        if( ( pickedAtom || pickedBond || pickedVolume ) &&
                e.which === MiddleMouseButton
        ){

            if( pickedAtom ){

                position.copy( pickedAtom );

            }else if( pickedBond ){

                position.set( 0, 0, 0 )
                    .addVectors( pickedBond.atom1, pickedBond.atom2 )
                    .multiplyScalar( 0.5 );

            }else if( pickedVolume ){

                position.copy( pickedVolume );

            }

            if( instance ){

                position.applyProjection( instance.matrix );

            }

            viewer.centerView( false, position );

        }

        //

        if( pickedAtom ){

            stage.signals.atomPicked.dispatch( pickedAtom );

        }else if( pickedBond ){

            stage.signals.bondPicked.dispatch( pickedBond );

        }else if( pickedVolume ){

            stage.signals.volumePicked.dispatch( pickedVolume );

        }else{

            stage.signals.nothingPicked.dispatch();

        }

        stage.signals.onPicking.dispatch( {

            "atom": pickedAtom,
            "bond": pickedBond,
            "volume": pickedVolume,
            "instance": instance

        } );

        //

        if( Debug ){

            Log.log( "picked atom", pickedAtom );
            Log.log( "picked bond", pickedBond );
            Log.log( "picked volume", pickedVolume );

        }

    } );

};


export default PickingControls;
