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
        return this.stage.pickingControls.pick(
            this.mouse.canvasPosition.x, this.mouse.canvasPosition.y
        );
    }

    onClick(){
        var pd = this.pick();
        if( pd.position && this.mouse.which === MiddleMouseButton ){
            this.stage.animationControls.move( pd.position );
        }
        this.stage.signals.clicked.dispatch( pd );
        if( Debug ) Log.log( "clicked", pd );
    }

    onHover(){
        var pd = this.pick();
        var sele = "", obj;
        if( pd.component && pd.component.type === "structure" ){
            if( pd.atom ){
                sele = "@" + pd.atom.index;
            }
            obj = pd.component;
        }else{
            obj = this.stage;
        }
        obj.eachRepresentation( function( reprComp ){
            reprComp.setParameters( { hoveredSele: sele } );
        } );
        this.stage.signals.hovered.dispatch( pd );
    }

    dispose(){
        this.mouse.signals.clicked.remove( this.onClick, this );
        this.mouse.signals.hovered.remove( this.onHover, this );
    }

}


export default PickingBehavior;
