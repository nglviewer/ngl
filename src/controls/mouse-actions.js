/**
 * @file Mouse Actions
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { almostIdentity } from "../math/math-utils.js";


/**
 * Mouse actions provided as static methods
 */
class MouseActions{

    /**
     * Zoom scene based on scroll-delta
     * @param {Stage} stage - the stage
     * @param {Number} delta - amount to zoom
     * @return {undefined}
     */
    static zoomScroll( stage, delta ){
        stage.trackballControls.zoom( delta );
    }

    /**
     * Move near clipping plane based on scroll-delta
     * @param {Stage} stage - the stage
     * @param {Number} delta - amount to move clipping plane
     * @return {undefined}
     */
    static clipNearScroll( stage, delta ){
        const sp = stage.getParameters();
        stage.setParameters( { clipNear: sp.clipNear + delta / 10 } );
    }

    /**
     * Move focus planes based on scroll-delta
     * @param {Stage} stage - the stage
     * @param {Number} delta - amount to move focus planes
     * @return {undefined}
     */
    static focusScroll( stage, delta ){
        const sp = stage.getParameters();
        const focus = sp.clipNear * 2;
        const sign = Math.sign( delta );
        const step = sign * almostIdentity( ( 100 - focus ) / 10, 5, 0.2 );
        stage.setFocus( focus + step );
    }

    /**
     * Pan scene based on mouse coordinate changes
     * @param {Stage} stage - the stage
     * @param {Number} dx - amount to pan in x direction
     * @param {Number} dy - amount to pan in y direction
     * @return {undefined}
     */
    static panDrag( stage, dx, dy ){
        stage.trackballControls.pan( dx, dy );
    }

    /**
     * Rotate scene based on mouse coordinate changes
     * @param {Stage} stage - the stage
     * @param {Number} dx - amount to rotate in x direction
     * @param {Number} dy - amount to rotate in y direction
     * @return {undefined}
     */
    static rotateDrag( stage, dx, dy ){
        stage.trackballControls.rotate( dx, dy );
    }

    /**
     * Zoom scene based on mouse coordinate changes
     * @param {Stage} stage - the stage
     * @param {Number} dx - ignored
     * @param {Number} dy - amount to zoom
     * @return {undefined}
     */
    static zoomDrag( stage, dx, dy ){
        stage.trackballControls.zoom( dy );
    }

    /**
     * Pan picked component based on mouse coordinate changes
     * @param {Stage} stage - the stage
     * @param {Number} dx - amount to pan in x direction
     * @param {Number} dy - amount to pan in y direction
     * @return {undefined}
     */
    static panComponentDrag( stage, dx, dy ){
        stage.trackballControls.panComponent( dx, dy );
    }

    /**
     * Rotate picked component based on mouse coordinate changes
     * @param {Stage} stage - the stage
     * @param {Number} dx - amount to rotate in x direction
     * @param {Number} dy - amount to rotate in y direction
     * @return {undefined}
     */
    static rotateComponentDrag( stage, dx, dy ){
        stage.trackballControls.rotateComponent( dx, dy );
    }

    /**
     * Move picked element to the center of the screen
     * @param {Stage} stage - the stage
     * @param {PickingProxy} pickingProxy - the picking data object
     * @return {undefined}
     */
    static movePick( stage, pickingProxy ){
        if( pickingProxy ){
            stage.animationControls.move( pickingProxy.position.clone() );
        }
    }

    /**
     * Show tooltip with information of picked element
     * @param {Stage} stage - the stage
     * @param {PickingProxy} pickingProxy - the picking data object
     * @return {undefined}
     */
    static tooltipPick( stage, pickingProxy ){
        const tt = stage.tooltip;
        const sp = stage.getParameters();
        if( sp.tooltip && pickingProxy ){
            const cp = pickingProxy.canvasPosition;
            tt.innerText = pickingProxy.getLabel();
            tt.style.bottom = cp.y + 3 + "px";
            tt.style.left = cp.x + 3 + "px";
            tt.style.display = "block";
        }else{
            tt.style.display = "none";
        }
    }

}


const ActionPresets = {
    default: [
        [ "scroll", MouseActions.zoomScroll ],
        [ "scroll-ctrl", MouseActions.clipNearScroll ],
        [ "scroll-shift", MouseActions.focusScroll ],

        [ "drag-right", MouseActions.panDrag ],
        [ "drag-left", MouseActions.rotateDrag ],
        [ "drag-middle", MouseActions.zoomDrag ],
        [ "drag-left+right", MouseActions.zoomDrag ],
        [ "drag-ctrl-right", MouseActions.panComponentDrag ],
        [ "drag-ctrl-left", MouseActions.rotateComponentDrag ],

        [ "clickPick-middle", MouseActions.movePick ],
        [ "hoverPick", MouseActions.tooltipPick ],
    ],
    pymol: [
        [ "drag-left", MouseActions.rotateDrag ],
        [ "drag-middle", MouseActions.panDrag ],
        [ "drag-right", MouseActions.zoomDrag ],
        [ "drag-shift-right", MouseActions.focusScroll ],

        [ "clickPick-ctrl+shift-middle", MouseActions.movePick ],
    ]
};


export default MouseActions;

export {
    ActionPresets
};
