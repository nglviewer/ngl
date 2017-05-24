/**
 * @file Mouse Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { almostIdentity } from "../math/math-utils.js";


function zoomScrollAction( stage, delta ){
    stage.trackballControls.zoom( delta );
}

function clipNearScrollAction( stage, delta ){
    const sp = stage.getParameters();
    stage.setParameters( { clipNear: sp.clipNear + delta / 10 } );
}

function focusScrollAction( stage, delta ){
    const sp = stage.getParameters();
    const focus = sp.clipNear * 2;
    const sign = Math.sign( delta );
    const step = sign * almostIdentity( ( 100 - focus ) / 10, 5, 0.2 );
    stage.setFocus( focus + step );
}

function panDragAction( stage, dx, dy ){
    stage.trackballControls.pan( dx, dy );
}

function rotateDragAction( stage, dx, dy ){
    stage.trackballControls.rotate( dx, dy );
}

function zoomDragAction( stage, dx, dy ){
    stage.trackballControls.zoom( dy );
}

function panComponentDragAction( stage, dx, dy ){
    stage.trackballControls.panComponent( dx, dy );
}

function rotateComponentDragAction( stage, dx, dy ){
    stage.trackballControls.rotateComponent( dx, dy );
}

function movePickAction( stage, pickingProxy ){
    if( pickingProxy ){
        stage.animationControls.move( pickingProxy.position.clone() );
    }
}

function tooltipPickAction( stage, pickingProxy ){
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


function triggerFromString( str ){
    const tokens = str.split( /[-+]/ );

    let type = "";
    if( tokens.includes( "scroll" ) ) type = "scroll";
    if( tokens.includes( "drag" ) ) type = "drag";
    if( tokens.includes( "click" ) ) type = "click";
    if( tokens.includes( "hover" ) ) type = "hover";
    if( tokens.includes( "clickPick" ) ) type = "clickPick";
    if( tokens.includes( "hoverPick" ) ) type = "hoverPick";

    let key = 0;
    if( tokens.includes( "alt" ) ) key += 1;
    if( tokens.includes( "ctrl" ) ) key += 2;
    if( tokens.includes( "meta" ) ) key += 4;
    if( tokens.includes( "shift" ) ) key += 8;

    let button = 0;
    if( tokens.includes( "left" ) ) button += 1;
    if( tokens.includes( "right" ) ) button += 2;
    if( tokens.includes( "middle" ) ) button += 4;

    return [ type, key, button ];
}


const ActionPresets = {
    default: [
        [ "scroll", zoomScrollAction ],
        [ "scroll-ctrl", clipNearScrollAction ],
        [ "scroll-shift", focusScrollAction ],

        [ "drag-right", panDragAction ],
        [ "drag-left", rotateDragAction ],
        [ "drag-middle", zoomDragAction ],
        [ "drag-left+right", zoomDragAction ],
        [ "drag-ctrl-right", panComponentDragAction ],
        [ "drag-ctrl-left", rotateComponentDragAction ],

        [ "clickPick-middle", movePickAction ],
        [ "hoverPick", tooltipPickAction ],
    ],
    pymol: [
        [ "drag-left", rotateDragAction ],
        [ "drag-middle", panDragAction ],
        [ "drag-right", zoomDragAction ],
        [ "drag-shift-right", focusScrollAction ],

        [ "clickPick-ctrl+shift-middle", movePickAction ],
    ]
};


class MouseControls{

    /**
     * create mouse controls
     * @param  {Stage} stage - the stage object
     */
    constructor( stage ){

        this.stage = stage;
        this.mouse = stage.mouseObserver;

        this.actionList = [];

        this.preset( "default" );

    }

    run( type, ...args ){

        const key = this.mouse.key || 0;
        const button = this.mouse.buttons || 0;

        this.actionList.forEach( a => {
            if( a.type === type && a.key === key && a.button === button ){
                a.callback( this.stage, ...args );
            }
        } );

    }

    add( triggerStr, callback ){

        const [ type, key, button ] = triggerFromString( triggerStr );

        this.actionList.push( { type, key, button, callback } );

    }

    remove( triggerStr, callback ){

        const wildcard = triggerStr.includes( "*" );
        const [ type, key, button ] = triggerFromString( triggerStr );

        const actionList = this.actionList.filter( function( a ){
            return !(
                ( a.type === type || ( wildcard && type === "" ) ) &&
                ( a.key === key || ( wildcard && key === 0 ) ) &&
                ( a.button === button || ( wildcard && button === 0 ) ) &&
                ( a.callback === callback || callback === undefined )
            );
        } );

        this.actionList = actionList;

    }

    preset( name ){

        const list = ActionPresets[ name ] || [];

        list.forEach( action => {
            this.add( ...action );
        } );

    }

    clear(){

        this.actionList.length = 0;

    }

}


export default MouseControls;
