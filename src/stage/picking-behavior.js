/**
 * @file Picking Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector2, Vector3 } from "../../lib/three.es6.js";

import { RightMouseButton, MiddleMouseButton } from "../constants.js";
import { Debug, Log } from "../globals.js";
import { defaults } from "../utils.js";


class PickingBehavior{

    constructor( stage ){

        this.stage = stage;
        this.mouse = stage.mouseObserver;
        this.gidPool = stage.gidPool;

        this.mouse.signals.clicked.add( this.onClick, this );
        this.mouse.signals.hovered.add( this.onHover, this );

    }

    pick(){
        return this.stage.pick(
            this.mouse.canvasPosition.x, this.mouse.canvasPosition.y
        );
    }

    onClick(){
        var pd = this.pick();
        if( pd.position && this.mouse.which === MiddleMouseButton ){
            this.stage.viewer.centerView( false, pd.position );
        }
        this.stage.signals.clicked.dispatch( pd );
        if( Debug ) Log.log( "clicked", pd );
    }

    onHover(){
        this.stage.signals.hovered.dispatch( this.pick() );
    }

    dispose(){
        this.mouse.signals.clicked.remove( this.onClick, this );
        this.mouse.signals.hovered.remove( this.onHover, this );
    }

};


export default PickingBehavior;
