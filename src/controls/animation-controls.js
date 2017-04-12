/**
 * @file Animation Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Quaternion } from "../../lib/three.es6.js";

import { defaults, ensureVector3, ensureQuaternion } from "../utils.js";
import { lerp, smoothstep } from "../math/math-utils.js";


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
        this.alpha = smoothstep( 0, 1, this.elapsedTime / this.duration );

        this._tick( stats );

        return this.alpha === 1;

    }

}


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


class ZoomAnimation extends Animation{

    _init( zoomFrom, zoomTo ){

        this.zoomFrom = zoomFrom;
        this.zoomTo = zoomTo;

    }

    _tick( /*stats*/ ){

        this.controls.distance( lerp( this.zoomFrom, this.zoomTo, this.alpha ) );

    }

}


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


class AnimationControls{

    /**
     * create animation controls
     * @param  {Stage} stage - the stage object
     */
    constructor( stage ){

        this.stage = stage;
        this.viewer = stage.viewer;
        this.controls = stage.viewerControls;

        this.animationList = [];
        this.finishedList = [];

    }

    /**
     * Add an animation
     * @param {Animation} animation - the animation
     * @return {Animation} the animation
     */
    add( animation ){

        this.animationList.push( animation );

        return animation;

    }

    /**
     * Remove an animation
     * @param {Animation} animation - the animation
     * @return {undefined}
     */
    remove( animation ){

        const list = this.animationList;
        const index = list.indexOf( animation );

        if( index > -1 ){
            list.splice( index, 1 );
        }

    }

    /**
     * Run all animations
     * @param  {Stats} stats - a viewer stats objects
     * @return {undefined}
     */
    run( stats ){

        const finishedList = this.finishedList;
        const animationList = this.animationList;

        const n = animationList.length;
        for( let i = 0; i < n; ++i ){
            const animation = animationList[ i ];
            // tick returns true when finished
            if( animation.tick( stats ) ){
                finishedList.push( animation );
            }
        }

        const m = finishedList.length;
        if( m ){
            for( let j = 0; j < m; ++j ){
                this.remove( finishedList[ j ] );
            }
            finishedList.length = 0;
        }

    }

    /**
     * Add a spin animation
     * @param  {Vector3} axis - axis to spin around
     * @param  {Number} angle - amount to spin
     * @param  {Number} duration - animation time in milliseconds
     * @return {SpinAnimation} the animation
     */
    spin( axis, angle, duration ){

        return this.add(
            new SpinAnimation( duration, this.controls, axis, angle )
        );

    }

    /**
     * Add a rotate animation
     * @param  {Quaternion} rotateTo - target rotation
     * @param  {Number} duration - animation time in milliseconds
     * @return {RotateAnimation} the animation
     */
    rotate( rotateTo, duration ){

        const rotateFrom = this.viewer.rotationGroup.quaternion.clone();

        return this.add(
            new RotateAnimation( duration, this.controls, rotateFrom, rotateTo )
        );

    }

    /**
     * Add a move animation
     * @param  {Vector3} moveTo - target position
     * @param  {Number} duration - animation time in milliseconds
     * @return {MoveAnimation} the animation
     */
    move( moveTo, duration ){

        const moveFrom = this.controls.position.clone().negate();

        return this.add(
            new MoveAnimation( duration, this.controls, moveFrom, moveTo )
        );

    }

    /**
     * Add a zoom animation
     * @param  {Number} zoomTo - target distance
     * @param  {Number} duration - animation time in milliseconds
     * @return {ZoomAnimation} the animation
     */
    zoom( zoomTo, duration ){

        const zoomFrom = this.viewer.camera.position.z;

        return this.add(
            new ZoomAnimation( duration, this.controls, zoomFrom, zoomTo )
        );

    }

    /**
     * Add a zoom and a move animation
     * @param  {Vector3} moveTo - target position
     * @param  {Number} zoomTo - target distance
     * @param  {Number} duration - animation time in milliseconds
     * @return {Array} the animations
     */
    zoomMove( moveTo, zoomTo, duration ){

        return [
            this.move( moveTo, duration ),
            this.zoom( zoomTo, duration )
        ];

    }

    /**
     * Clear all animations
     * @return {undefined}
     */
    clear(){

        this.animationList.length = 0;

    }

    dispose(){

        this.clear();

    }

}


export default AnimationControls;
