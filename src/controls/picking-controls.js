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
        this.mouseObserver = stage.mouseObserver;

    }

    /**
     * get picking data
     * @param {Number} x - canvas x coordinate
     * @param {Number} y - canvas y coordinate
     * @return {PickingData} picking data
     */
    pick( x, y ){
        const mouse = this.mouseObserver;
        const pickingData = this.viewer.pick( x, y );
        const instance = pickingData.instance;

        let pickedAtom, pickedBond, pickedVolume;
        if( pickingData.picker ){
            const p = pickingData.picker;
            const o = p.object;
            const idx = p[ pickingData.pid ];
            if( p.type === "atom" ){
                pickedAtom = o.getAtomProxy( idx );
            }else if( p.type === "bond" ){
                pickedBond = o.getBondProxy( idx );
            }else if( p.type === "volume" ){
                pickedVolume = {
                    volume: o,
                    index: idx,
                    value: o.data[ idx ],
                    x: o.dataPosition[ idx * 3 ],
                    y: o.dataPosition[ idx * 3 + 1 ],
                    z: o.dataPosition[ idx * 3 + 2 ],
                };
            }
        }

        let object, component;
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
            "geom_id": pickingData.geom_id, // mjg
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
