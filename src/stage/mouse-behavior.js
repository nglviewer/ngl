/**
 * @file Mouse Behavior
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { RightMouseButton } from "../constants.js";
import { pclamp, almostIdentity } from "../math/math-utils.js";


class MouseBehavior{

    constructor( stage/*, params*/ ){

        this.stage = stage;
        this.mouse = stage.mouseObserver;
        this.controls = stage.trackballControls;

        this.mouse.signals.scrolled.add( this.onScroll, this );
        this.mouse.signals.dragged.add( this.onDrag, this );

    }

    onScroll( delta ){

        if( this.mouse.shiftKey ){
            const sp = this.stage.getParameters();
            // ensure clipFar is not smaller than clipNear
            if( sp.clipFar < sp.clipNear ){
                const tmp = sp.clipFar;
                sp.clipFar = sp.clipNear;
                sp.clipNear = tmp;
            }
            // ensure clipFar and clipNear are symmetric around 50
            if( sp.clipFar + sp.clipNear !== 100 ){
                sp.clipFar = 100 - sp.clipNear;
            }
            const spDiff = sp.clipFar - sp.clipNear;
            const sign = Math.sign( delta );
            const step = sign * almostIdentity( spDiff / 10, 10, 0.05 );
            let clipNear = pclamp( sp.clipNear + step );
            let clipFar = pclamp( sp.clipFar - step );
            if( clipFar < clipNear ){
                clipNear = sp.clipNear;
                clipFar = sp.clipFar;
            }
            const diff = clipFar - clipNear;
            if( diff < 0.1 ){
                if( clipNear === 0 ){
                    clipFar = 0.1;
                }else if( clipFar === 100 ){
                    clipNear = 99.9;
                }else{
                    clipFar += 0.1;
                }
            }
            const diffHalf = ( clipFar - clipNear ) / 2;
            this.stage.setParameters( {
                clipNear,
                clipFar,
                fogNear: pclamp( clipFar - diffHalf ),
                fogFar: pclamp( clipFar + diffHalf )
            } );
        }else{
            this.controls.zoom( delta );
        }

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
