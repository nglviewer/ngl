/**
 * @file Animation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Quaternion } from "../../lib/three.es6.js";

import { defaults, ensureVector3, ensureQuaternion } from "../utils.js";
import { lerp, smoothstep } from "../math/math-utils.js";


/**
 * Animation. Base animation class.
 * @interface
 */
class Animation{

    constructor( duration, controls, ...args ){

        this.duration = defaults( duration, 1000 );
        this.controls = controls;

        this.startTime = performance.now();
        this.elapsedTime = 0;

        this._init( ...args );

    }

    /**
     * init animation
     * @abstract
     * @return {undefined}
     */
    _init(){}

    /**
     * called on every tick
     * @abstract
     * @return {undefined}
     */
    _tick(){}

    tick( stats ){

        this.elapsedTime = stats.currentTime - this.startTime;

        if( this.duration === 0 ){
            this.alpha = 1;
        }else{
            this.alpha = smoothstep( 0, 1, this.elapsedTime / this.duration );
        }

        this._tick( stats );

        return this.alpha === 1;

    }

}


/**
 * Spin animation. Spin around an axis.
 */
class SpinAnimation extends Animation{

    constructor( duration, ...args ){

        super( defaults( duration, Infinity ), ...args );

    }

    _init( axis, angle ){

        if( Array.isArray( axis ) ){
            this.axis = new Vector3().fromArray( axis );
        }else{
            this.axis = defaults( axis, new Vector3( 0, 1, 0 ) );
        }
        this.angle = defaults( angle, 0.01 );

    }

    _tick( stats ){

        if( !this.axis || !this.angle ) return;

        this.controls.spin(
            this.axis, this.angle * stats.lastDuration / 16
        );

    }

}


/**
 * Rock animation. Rock around an axis.
 */
class RockAnimation extends Animation{

    constructor( duration, ...args ){

        super( defaults( duration, Infinity ), ...args );

    }

    _init( axis, angleStep, angleEnd ){

        if( Array.isArray( axis ) ){
            this.axis = new Vector3().fromArray( axis );
        }else{
            this.axis = defaults( axis, new Vector3( 0, 1, 0 ) );
        }
        this.angleStep = defaults( angleStep, 0.01 );
        this.angleEnd = defaults( angleEnd, 0.2 );

        this.angleSum = 0;
        this.direction = 1;

    }

    _tick( stats ){

        if( !this.axis || !this.angleStep || !this.angleEnd ) return;

        const alpha = smoothstep(
            0, 1, Math.abs( this.angleSum ) / this.angleEnd
        );
        const angle = this.angleStep * this.direction * ( 1.1 - alpha );

        this.controls.spin(
            this.axis, angle * stats.lastDuration / 16
        );

        this.angleSum += this.angleStep;

        if( this.angleSum >= this.angleEnd ){
            this.direction *= -1;
            this.angleSum = -this.angleEnd;
        }

    }

}


/**
 * Move animation. Move from one position to another.
 */
class MoveAnimation extends Animation{

    _init( moveFrom, moveTo ){

        this.moveFrom = ensureVector3( defaults( moveFrom, new Vector3() ) );
        this.moveTo = ensureVector3( defaults( moveTo, new Vector3() ) );

    }

    _tick( /*stats*/ ){

        this.controls.position.lerpVectors(
            this.moveFrom, this.moveTo, this.alpha ).negate();
        this.controls.changed();

    }

}


/**
 * Zoom animation. Gradually change the zoom level.
 */
class ZoomAnimation extends Animation{

    _init( zoomFrom, zoomTo ){

        this.zoomFrom = zoomFrom;
        this.zoomTo = zoomTo;

    }

    _tick( /*stats*/ ){

        this.controls.distance( lerp( this.zoomFrom, this.zoomTo, this.alpha ) );

    }

}


/**
 * Rotate animation. Rotate from one orientation to another.
 */
class RotateAnimation extends Animation{

    _init( rotateFrom, rotateTo ){

        this.rotateFrom = ensureQuaternion( rotateFrom );
        this.rotateTo = ensureQuaternion( rotateTo );

        this._currentRotation = new Quaternion();

    }

    _tick( /*stats*/ ){

        this._currentRotation
            .copy( this.rotateFrom )
            .slerp( this.rotateTo, this.alpha );

        this.controls.rotate( this._currentRotation );

    }

}


export {
    Animation,
    SpinAnimation,
    RockAnimation,
    MoveAnimation,
    ZoomAnimation,
    RotateAnimation
};
