/**
 * @file Mouse Observer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector2 } from "../../lib/three.es6.js";
import Signal from "../../lib/signals.es6.js";

import { defaults } from "../utils.js";


/**
 * {@link Signal}, dispatched on mouse move
 * @event MouseObserver#moved
 */

/**
 * {@link Signal}, dispatched on mouse scroll
 * @event MouseObserver#scrolled
 */

/**
 * {@link Signal}, dispatched on mouse drag
 * @event MouseObserver#dragged
 */

/**
 * {@link Signal}, dispatched on mouse drop
 * @event MouseObserver#dropped
 */

/**
 * {@link Signal}, dispatched on mouse click
 * @event MouseObserver#clicked
 */

/**
 * {@link Signal}, dispatched on mouse hover
 * @event MouseObserver#hovered
 */


/**
 * Observer mouse event
 */
class MouseObserver{

    /**
     * mouse observer constructor
     * @param  {Element} domElement - the dom element to observe mouse events in
     * @param  {Object} params - parameters object
     * @param  {Integer} params.hoverTimeout - timeout until the {@link MouseObserver#event:hovered|hovered}
     *                                         signal is fired, set to -1 to ignore hovering
     */
    constructor( domElement, params ){

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

        this.position = new Vector2();
        this.prevPosition = new Vector2();
        this.down = new Vector2();
        this.canvasPosition = new Vector2();
        this.moving = false;
        this.hovering = true;
        this.scrolled = false;
        this.lastMoved = Infinity;
        this.which = undefined;
        this.pressed = undefined;
        this.altKey = undefined;
        this.ctrlKey = undefined;
        this.metaKey = undefined;
        this.shiftKey = undefined;

        this.listen = this.listen.bind( this );
        this.onMousewheel = this.onMousewheel.bind( this );
        this.onMousemove = this.onMousemove.bind( this );
        this.onMousedown = this.onMousedown.bind( this );
        this.onMouseup = this.onMouseup.bind( this );

        this.listen();

        domElement.addEventListener( 'mousewheel', this.onMousewheel );
        domElement.addEventListener( 'wheel', this.onMousewheel );
        domElement.addEventListener( 'MozMousePixelScroll', this.onMousewheel );
        domElement.addEventListener( 'mousemove', this.onMousemove );
        domElement.addEventListener( 'mousedown', this.onMousedown );
        domElement.addEventListener( 'mouseup', this.onMouseup );
        domElement.addEventListener( 'contextmenu', this.onContextmenu );

    }

    setParameters( params ){
        var p = Object.assign( {}, params );
        this.hoverTimeout = defaults( p.hoverTimeout, this.hoverTimeout );
    }

    /**
     * listen to mouse actions
     * @fires MouseObserver#hovered
     * @return {undefined}
     */
    listen(){
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
     * @fires MouseObserver#scrolled
     * @param  {Event} event - mouse event
     * @return {undefined}
     */
    onMousewheel( event ){
        event.preventDefault();

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
     * @fires MouseObserver#moved
     * @fires MouseObserver#dragged
     * @param  {Event} event - mouse event
     * @return {undefined}
     */
    onMousemove( event ){
        event.preventDefault();
        this.setKeys( event );
        this.moving = true;
        this.hovering = false;
        this.lastMoved = performance.now();
        this.prevPosition.copy( this.position );
        this.position.set( event.layerX, event.layerY );
        this.setCanvasPosition( event );
        var x = this.prevPosition.x - this.position.x;
        var y = this.prevPosition.y - this.position.y;
        this.signals.moved.dispatch( x, y );
        if( this.pressed ){
            this.signals.dragged.dispatch( x, y );
        }
    }

    onMousedown( event ){
        event.preventDefault();
        this.setKeys( event );
        this.moving = false;
        this.hovering = false;
        this.down.set( event.layerX, event.layerY );
        this.which = event.which;
        this.pressed = true;
        this.setCanvasPosition( event );
    }

    /**
     * handle mouse up
     * @fires MouseObserver#clicked
     * @fires MouseObserver#dropped
     * @param  {Event} event - mouse event
     * @return {undefined}
     */
    onMouseup( event ){
        event.preventDefault();
        this.setKeys( event );
        this.signals.clicked.dispatch();
        // if( this.distance() > 3 || event.which === RightMouseButton ){
        //     this.signals.dropped.dispatch();
        // }
        this.which = undefined;
        this.pressed = undefined;
    }

    onContextmenu( event ){
        event.preventDefault();
    }

    distance(){
        return this.position.distanceTo( this.down );
    }

    setCanvasPosition( event ){
        var box = this.domElement.getBoundingClientRect();
        var offsetX = event.clientX - box.left;
        var offsetY = event.clientY - box.top;
        this.canvasPosition.set( offsetX, box.height - offsetY );
    }

    setKeys( event ){
        this.altKey = event.altKey;
        this.ctrlKey = event.ctrlKey;
        this.metaKey = event.metaKey;
        this.shiftKey = event.shiftKey;
    }

    dispose(){
        var domElement = this.domElement;
        domElement.removeEventListener( 'mousewheel', this.onMousewheel );
        domElement.removeEventListener( 'wheel', this.onMousewheel );
        domElement.removeEventListener( 'MozMousePixelScroll', this.onMousewheel );
        domElement.removeEventListener( 'mousemove', this.onMousemove );
        domElement.removeEventListener( 'mousedown', this.onMousedown );
        domElement.removeEventListener( 'mouseup', this.onMouseup );
        domElement.removeEventListener( 'contextmenu', this.onContextmenu );
    }

}


export default MouseObserver;
