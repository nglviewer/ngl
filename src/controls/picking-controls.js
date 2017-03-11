/**
 * @file Picking Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector2, Vector3 } from "../../lib/three.es6.js";


const tmpObjectPosition = new Vector3();
const tmpCanvasPosition = new Vector2();


class PickingControls{

    constructor( stage/*, params*/ ){

        this.stage = stage;
        this.viewer = stage.viewer;
        this.gidPool = stage.gidPool;
        this.mouseObserver = stage.mouseObserver;

    }

    /**
     * get picking data
     * @param {Number} x - canvas x coordinate
     * @param {Number} y - canvas y coordinate
     * @return {PickingData} picking data
     */
    pick( x, y ){
        var mouse = this.mouseObserver;
        var pickingData = this.viewer.pick( x, y );
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

        var object, component;
        if( pickedAtom || pickedBond || pickedVolume ){
            if( pickedAtom ){
                tmpObjectPosition.copy( pickedAtom );
                object = pickedAtom.structure;
            }else if( pickedBond ){
                tmpObjectPosition.copy( pickedBond.atom1 )
                    .add( pickedBond.atom2 )
                    .multiplyScalar( 0.5 );
                object = pickedBond.structure;
            }else if( pickedVolume ){
                tmpObjectPosition.copy( pickedVolume );
                object = pickedVolume.volume;
            }
            if( instance ){
                tmpObjectPosition.applyProjection( instance.matrix );
            }
            if( object ){
                component = this.stage.getComponentsByObject( object ).list[ 0 ];
            }
        }

        tmpCanvasPosition.copy( mouse.canvasPosition );

        return {
            "atom": pickedAtom,
            "bond": pickedBond,
            "volume": pickedVolume,
            "instance": instance,
            "position": tmpObjectPosition,
            "component": component,
            "canvasPosition": tmpCanvasPosition,
            "altKey": mouse.altKey,
            "ctrlKey": mouse.ctrlKey,
            "metaKey":  mouse.metaKey,
            "shiftKey":  mouse.shiftKey
        };
    }

}


export default PickingControls;
