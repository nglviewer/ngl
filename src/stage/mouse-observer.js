/**
 * @file Mouse Observer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector2 } from "../../lib/three.es6.js";
import Signal from "../../lib/signals.es6.js";

import { defaults } from "../utils.js";


/**
 * @example
 * mouseObserver.signals.scroll.add( function( delta ){ ... } );
 *
 * @typedef {Object} MouseSignals
 * @property {Signal<Integer, Integer>} moved - on move: deltaX, deltaY
 * @property {Signal<Number>} scrolled - on scroll: delta
 * @property {Signal<Integer, Integer>} dragged - on drag: deltaX, deltaY
 * @property {Signal} dropped - on drop
 * @property {Signal} clicked - on click
 * @property {Signal} hovered - on hover
 */


/**
 * Mouse observer
 */
class MouseObserver{

    /**
     * @param  {Element} domElement - the dom element to observe mouse events in
     * @param  {Object} params - parameters object
     * @param  {Integer} params.hoverTimeout - timeout until the {@link MouseSignals.hovered}
     *                                         signal is fired, set to -1 to ignore hovering
     */
    constructor( domElement, params ){

        /**
         * Events emitted by the mouse observer
         * @type {MouseSignals}
         */
        this.signals = {
            moved: new Signal(),
            scrolled: new Signal(),
            dragged: new Signal(),
            dropped: new Signal(),
            clicked: new Signal(),
            hovered: new Signal()
        };

        var p = Object.assign( {}, params );

        this.hoverTimeout = defaults( p.hoverTimeout, 50 );

        this.domElement = domElement;

        /**
         * Position on page
         * @type {Vector2}
         */
        this.position = new Vector2();
        /**
         * Previous position on page
         * @type {Vector2}
         */
        this.prevPosition = new Vector2();
        /**
         * Position on page when clicked
         * @type {Vector2}
         */
        this.down = new Vector2();
        /**
         * Position on dom element
         * @type {Vector2}
         */
        this.canvasPosition = new Vector2();
        /**
         * Flag indicating if the mouse is moving
         * @type {Boolean}
         */
        this.moving = false;
        /**
         * Flag indicating if the mouse is hovering
         * @type {Boolean}
         */
        this.hovering = true;
        /**
         * Flag indicating if there was a scolling event
         * since the last mouse move
         * @type {Boolean}
         */
        this.scrolled = false;
        /**
         * Timestamp of last mouse move
         * @type {Number}
         */
        this.lastMoved = Infinity;
        /**
         * Indicates which mouse button was pressed:
         * 0: No button; 1: Left button; 2: Middle button; 3: Right button
         * @type {Integer}
         */
        this.which = undefined;
        /**
         * Flag indicating if the mouse is pressed down
         * @type {Boolean}
         */
        this.pressed = undefined;
        /**
         * Flag indicating if the alt key is pressed
         * @type {Boolean}
         */
        this.altKey = undefined;
        /**
         * Flag indicating if the ctrl key is pressed
         * @type {Boolean}
         */
        this.ctrlKey = undefined;
        /**
         * Flag indicating if the meta key is pressed
         * @type {Boolean}
         */
        this.metaKey = undefined;
        /**
         * Flag indicating if the shift key is pressed
         * @type {Boolean}
         */
        this.shiftKey = undefined;

        this._listen = this._listen.bind( this );
        this._onMousewheel = this._onMousewheel.bind( this );
        this._onMousemove = this._onMousemove.bind( this );
        this._onMousedown = this._onMousedown.bind( this );
        this._onMouseup = this._onMouseup.bind( this );

        this.listen();

        domElement.addEventListener( 'mousewheel', this._onMousewheel );
        domElement.addEventListener( 'wheel', this._onMousewheel );
        domElement.addEventListener( 'MozMousePixelScroll', this._onMousewheel );
        domElement.addEventListener( 'mousemove', this._onMousemove );
        domElement.addEventListener( 'mousedown', this._onMousedown );
        domElement.addEventListener( 'mouseup', this._onMouseup );
        domElement.addEventListener( 'contextmenu', this._onContextmenu );

    }

    setParameters( params ){
        var p = Object.assign( {}, params );
        this.hoverTimeout = defaults( p.hoverTimeout, this.hoverTimeout );
    }

    /**
     * listen to mouse actions
     * @emits {MouseSignals.hovered} when hovered
     * @return {undefined}
     */
    _listen(){
        if( performance.now() - this.lastMoved > this.hoverTimeout ){
            this.moving = false;
        }
        if( this.scrolled || ( !this.moving && !this.hovering ) ){
            this.scrolled = false;
            if( this.hoverTimeout !== -1 ){
                this.hovering = true;
                this.signals.hovered.dispatch();
            }
        }
        requestAnimationFrame( this.listen );
    }

    /**
     * handle mouse scroll
     * @emits {MouseSignals.scrolled} when scrolled
     * @param  {Event} event - mouse event
     * @return {undefined}
     */
    _onMousewheel( event ){
        event.preventDefault();
        this._setKeys( event );

        var delta = 0;
        if( event.wheelDelta ){
            // WebKit / Opera / Explorer 9
            delta = event.wheelDelta / 40;
        }else if( event.detail ){
            // Firefox
            delta = - event.detail / 3;
        }else{
            // Firefox or IE 11
            delta = - event.deltaY / ( event.deltaMode ? 0.33 : 30 );
        }

        this.signals.scrolled.dispatch( delta );

        setTimeout( () => {
            this.scrolled = true;
        }, this.hoverTimeout );
    }

    /**
     * handle mouse move
     * @emits {MouseSignals.moved} when moved
     * @emits {MouseSignals.dragged} when dragged
     * @param  {Event} event - mouse event
     * @return {undefined}
     */
    _onMousemove( event ){
        event.preventDefault();
        this._setKeys( event );
        this.moving = true;
        this.hovering = false;
        this.lastMoved = performance.now();
        this.prevPosition.copy( this.position );
        this.position.set( event.layerX, event.layerY );
        this._setCanvasPosition( event );
        var x = this.prevPosition.x - this.position.x;
        var y = this.prevPosition.y - this.position.y;
        this.signals.moved.dispatch( x, y );
        if( this.pressed ){
            this.signals.dragged.dispatch( x, y );
        }
    }

    _onMousedown( event ){
        event.preventDefault();
        this._setKeys( event );
        this.moving = false;
        this.hovering = false;
        this.down.set( event.layerX, event.layerY );
        this.which = event.which;
        this.pressed = true;
        this.setCanvasPosition( event );
    }

    /**
     * handle mouse up
     * @emits {MouseSignals.clicked} when clicked
     * @emits {MouseSignals.dropped} when dropped
     * @param  {Event} event - mouse event
     * @return {undefined}
     */
    _onMouseup( event ){
        event.preventDefault();
        this._setKeys( event );
        this.signals.clicked.dispatch();
        // if( this.distance() > 3 || event.which === RightMouseButton ){
        //     this.signals.dropped.dispatch();
        // }
        this.which = undefined;
        this.pressed = undefined;
    }

    _onContextmenu( event ){
        event.preventDefault();
    }

    _distance(){
        return this.position.distanceTo( this.down );
    }

    _setCanvasPosition( event ){
        var box = this.domElement.getBoundingClientRect();
        var offsetX = event.clientX - box.left;
        var offsetY = event.clientY - box.top;
        this.canvasPosition.set( offsetX, box.height - offsetY );
    }

    _setKeys( event ){
        this.altKey = event.altKey;
        this.ctrlKey = event.ctrlKey;
        this.metaKey = event.metaKey;
        this.shiftKey = event.shiftKey;
    }

    dispose(){
        var domElement = this.domElement;
        domElement.removeEventListener( 'mousewheel', this._onMousewheel );
        domElement.removeEventListener( 'wheel', this._onMousewheel );
        domElement.removeEventListener( 'MozMousePixelScroll', this._onMousewheel );
        domElement.removeEventListener( 'mousemove', this._onMousemove );
        domElement.removeEventListener( 'mousedown', this._onMousedown );
        domElement.removeEventListener( 'mouseup', this._onMouseup );
        domElement.removeEventListener( 'contextmenu', this._onContextmenu );
    }

}


export default MouseObserver;
