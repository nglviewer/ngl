/**
 * @file Picking Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { MiddleMouseButton } from "../constants.js";
import { Debug, Log } from "../globals.js";


class PickingBehavior{

    constructor( stage ){

        this.stage = stage;
        this.mouse = stage.mouseObserver;

        this.mouse.signals.clicked.add( this.onClick, this );
        this.mouse.signals.hovered.add( this.onHover, this );

    }

    pick(){
        const cp = this.mouse.canvasPosition;
        return this.stage.pickingControls.pick( cp.x, cp.y );
    }

    onClick(){
        var pp = this.pick();
        if( pp && this.mouse.which === MiddleMouseButton ){
            this.stage.animationControls.move( pp.position.clone() );
        }
        this.stage.signals.clicked.dispatch( pp );
        if( Debug ) Log.log( "clicked", pp );
    }

    onHover(){
        this.stage.signals.hovered.dispatch( this.pick() );
    }

    dispose(){
        this.mouse.signals.clicked.remove( this.onClick, this );
        this.mouse.signals.hovered.remove( this.onHover, this );
    }

}


export default PickingBehavior;
