/**
 * @file Animation Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import {
    SpinAnimation, RockAnimation, MoveAnimation,
    ZoomAnimation, RotateAnimation
} from "../animation/animation.js";


/**
 * Animation controls
 */
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
     * @param  {Number} angle - amount to spin per frame, radians
     * @param  {Number} duration - animation time in milliseconds
     * @return {SpinAnimation} the animation
     */
    spin( axis, angle, duration ){

        return this.add(
            new SpinAnimation( duration, this.controls, axis, angle )
        );

    }

    /**
     * Add a rock animation
     * @param  {Vector3} axis - axis to rock around
     * @param  {Number} angle - amount to spin per frame, radians
     * @param  {Number} end - maximum extend of motion, radians
     * @param  {Number} duration - animation time in milliseconds
     * @return {SpinAnimation} the animation
     */
    rock( axis, angle, end, duration ){

        return this.add(
            new RockAnimation( duration, this.controls, axis, angle, end )
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
