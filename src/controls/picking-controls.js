/**
 * @file Picking Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import PickingProxy from "./picking-proxy.js";


/**
 * Picking controls
 */
class PickingControls{

    constructor( stage/*, params*/ ){

        this.stage = stage;
        this.viewer = stage.viewer;

    }

    /**
     * get picking data
     * @param {Number} x - canvas x coordinate
     * @param {Number} y - canvas y coordinate
     * @return {PickingProxy|undefined} picking proxy
     */
    pick( x, y ){

        const pickingData = this.viewer.pick( x, y );

        if( pickingData.picker &&
            pickingData.picker.type !== "ignore" &&
            pickingData.pid !== undefined
        ){
            const pickerArray = pickingData.picker.array
            if( pickerArray && pickingData.pid >= pickerArray.length ){
                console.error( "pid >= picker.array.length" );
            }else{
                var pp = new PickingProxy( pickingData, this.stage );
                pp.geom_id = pickingData.geom_id;   // mjg
                return pp;
            }
        }

        /*
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
        */
    }

}


export default PickingControls;
