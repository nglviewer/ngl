/**
 * @file Trajectory Player
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Signal from "../../lib/signals.es6.js";

import { defaults } from "../utils.js";


function TrajectoryPlayer( traj, step, timeout, start, end ){

    this.signals = {
        startedRunning: new Signal(),
        haltedRunning: new Signal()
    };

    traj.signals.playerChanged.add( function( player ){
        if( player !== this ){
            this.pause();
        }
    }, this );

    var n = traj.numframes;

    this.traj = traj;
    this.step = defaults( step, Math.ceil( ( n + 1 ) / 100 ) );
    this.timeout = defaults( timeout, 50 );
    this.start = defaults( start, 0 );
    this.end = Math.min( defaults( end, n - 1 ), n - 1 );
    this.interpolateType = "";
    this.interpolateStep = 5;

    this.mode = "loop";  // loop, once
    this.direction = "forward";  // forward, backward

    this._stopFlag = false;
    this._running = false;

}

TrajectoryPlayer.prototype = {

    constructor: TrajectoryPlayer,

    _animate: function(){

        var i;
        this._running = true;

        if( !this.traj.inProgress && !this._stopFlag ){

            if( this.direction === "forward" ){
                i = this.traj.currentFrame + this.step;
            }else{
                i = this.traj.currentFrame - this.step;
            }

            if( i >= this.end || i < this.start ){

                if( this.mode === "once" ){

                    this.pause();

                    if( this.direction === "forward" ){
                        i = this.end;
                    }else{
                        i = this.start;
                    }

                }else{

                    if( this.direction === "forward" ){
                        i = this.start;
                    }else{
                        i = this.end;
                    }

                }

            }

            if( !this.interpolateType ){
                this.traj.setFrame( i );
            }

        }

        if( !this._stopFlag ){

            if( !this.traj.inProgress && this.interpolateType ){

                var ip, ipp, ippp;

                if( this.direction === "forward" ){

                    ip = Math.max( this.start, i - this.step );
                    ipp = Math.max( this.start, i - 2 * this.step );
                    ippp = Math.max( this.start, i - 3 * this.step );

                }else{

                    ip = Math.min( this.end, i + this.step );
                    ipp = Math.min( this.end, i + 2 * this.step );
                    ippp = Math.min( this.end, i + 3 * this.step );

                }

                this._interpolate(
                    i, ip, ipp, ippp, 1 / this.interpolateStep, 0
                );

            }else{

                setTimeout( this._animate.bind( this ), this.timeout );

            }

        }else{

            this._running = false;

        }

    },

    _interpolate: function( i, ip, ipp, ippp, d, t ){

        t += d;

        if( t <= 1 ){

            var deltaTime = Math.round( this.timeout * d );

            this.traj.setFrameInterpolated(
                i, ip, ipp, ippp, t, this.interpolateType,
                function(){
                    setTimeout( function(){
                        this._interpolate( i, ip, ipp, ippp, d, t );
                    }.bind( this ), deltaTime );
                }.bind( this )
            );

        }else{

            setTimeout( this._animate.bind( this ), 0 );

        }

    },

    toggle: function(){

        if( this._running ){
            this.pause();
        }else{
            this.play();
        }

    },

    play: function(){

        if( !this._running ){

            if( this.traj.player !== this ){
                this.traj.setPlayer( this );
            }

            var frame = this.traj.currentFrame;

            // snap to the grid implied by this.step division and multiplication
            // thus minimizing cache misses
            var i = Math.ceil( frame / this.step ) * this.step;

            // wrap when restarting from the limit (i.e. end or start)
            if( this.direction === "forward" && frame >= this.end ){

                i = this.start;

            }else if( this.direction === "backward" && frame <= this.start ){

                i = this.end;

            }

            this.traj.setFrame( i );

            this._stopFlag = false;
            this._animate();
            this.signals.startedRunning.dispatch();

        }

    },

    pause: function(){

        if( this._running ){
            this._stopFlag = true;
            this.signals.haltedRunning.dispatch();
        }

    },

    stop: function(){

        this.traj.setFrame( this.start );
        this.pause();

    }

};


export default TrajectoryPlayer;
