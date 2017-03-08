/**
 * @file Mouse Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { RightMouseButton } from "../constants.js";


class MouseBehavior{

    constructor( stage/*, params*/ ){

        this.mouse = stage.mouseObserver;
        this.controls = stage.trackballControls;

        this.mouse.signals.scrolled.add( this.onScroll, this );
        this.mouse.signals.dragged.add( this.onDrag, this );

    }

    onScroll( delta ){

        this.controls.zoom( delta );

    }

    onDrag( x, y ){

        if( this.mouse.which === RightMouseButton ){
            this.controls.pan( x, y );
        }else{
            this.controls.rotate( x, y );
        }

    }

    dispose(){
        this.mouse.signals.scrolled.remove( this.onScroll, this );
        this.mouse.signals.dragged.remove( this.onDrag, this );
    }

}


export default MouseBehavior;
