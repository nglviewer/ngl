/**
 * @file Mouse Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


class MouseBehavior{

    constructor( stage/*, params*/ ){

        this.stage = stage;
        this.mouse = stage.mouseObserver;
        this.controls = stage.mouseControls;

        this.stage.signals.hovered.add( this._onHover, this );
        this.mouse.signals.scrolled.add( this._onScroll, this );
        this.mouse.signals.dragged.add( this._onDrag, this );

    }

    _onHover( pickingProxy ){

        if( pickingProxy && this.mouse.down.equals( this.mouse.position ) ){
            this.stage.transformComponent = pickingProxy.component;
        }

    }

    _onScroll( delta ){

        this.controls.run( "scroll", delta );

    }

    _onDrag( x, y ){

        this.controls.run( "drag", x, y );

    }

    dispose(){
        this.stage.signals.hovered.remove( this._onHover, this );
        this.mouse.signals.scrolled.remove( this._onScroll, this );
        this.mouse.signals.dragged.remove( this._onDrag, this );
    }

}


export default MouseBehavior;
