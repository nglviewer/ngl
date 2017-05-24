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

function panDragAction( stage, x, y ){
    stage.trackballControls.pan( x, y );
}

function rotateDragAction( stage, x, y ){
    stage.trackballControls.rotate( x, y );
}

function zoomDragAction( stage, x, y ){
    stage.trackballControls.zoom( y );
}

function panComponentDragAction( stage, x, y ){
    stage.trackballControls.panComponent( x, y );
}

function rotateComponentDragAction( stage, x, y ){
    stage.trackballControls.rotateComponent( x, y );
}


function triggerFromString( str ){
    const tokens = str.split( /[-+]/ );

    let type = "";
    if( tokens.includes( "scroll" ) ) type = "scroll";
    if( tokens.includes( "drag" ) ) type = "drag";
    if( tokens.includes( "click" ) ) type = "click";
    if( tokens.includes( "hover" ) ) type = "hover";

    let key = 0;
    if( tokens.includes( "alt" ) ) key += 1;
    if( tokens.includes( "ctrl" ) ) key += 2;
    if( tokens.includes( "meta" ) ) key += 4;
    if( tokens.includes( "shift" ) ) key += 8;

    let button = 0;
    if( tokens.includes( "left" ) ) button = 1;
    if( tokens.includes( "middle" ) ) button = 2;
    if( tokens.includes( "right" ) ) button = 3;

    return [ type, key, button ];
}


const DefaultActionList = [
    [ "scroll", zoomScrollAction ],
    [ "scroll-ctrl", clipNearScrollAction ],
    [ "scroll-shift", focusScrollAction ],

    [ "drag-right", panDragAction ],
    [ "drag-left", rotateDragAction ],
    [ "drag-shift-right", zoomDragAction ],
    [ "drag-ctrl-right", panComponentDragAction ],
    [ "drag-ctrl-left", rotateComponentDragAction ],
];


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
        const button = this.mouse.which || 0;

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

        let list = [];

        if( name === "default" ){
            list = DefaultActionList;
        }

        list.forEach( action => {
            this.add( ...action );
        } );

    }

    clear(){

        this.actionList.length = 0;

    }

}


export default MouseControls;
