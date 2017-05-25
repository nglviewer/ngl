/**
 * @file Mouse Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ActionPresets } from "./mouse-actions.js";


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


/**
 * Mouse controls
 */
class MouseControls{

    /**
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

    /**
     * Add a new mouse action
     * @param {String} triggerStr - the trigger for the action
     * @param {Function} callback - the callback function for the action
     * @return {undefined}
     */
    add( triggerStr, callback ){

        const [ type, key, button ] = triggerFromString( triggerStr );

        this.actionList.push( { type, key, button, callback } );

    }

    /**
     * Remove a mouse action
     * @param {String} triggerStr - the trigger for the action
     * @param {Function} [callback] - the callback function for the action
     * @return {undefined}
     */
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

    /**
     * Set mouse action preset
     * @param  {String} name - one of "default", "pymol", "coot"
     * @return {undefined}
     */
    preset( name ){

        this.clear();

        const list = ActionPresets[ name ] || [];

        list.forEach( action => {
            this.add( ...action );
        } );

    }

    /**
     * Remove all mouse actions
     * @return {undefined}
     */
    clear(){

        this.actionList.length = 0;

    }

}


export default MouseControls;
