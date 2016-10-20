/**
 * @file Stats
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Signal from "../../lib/signals.es6.js";


function Stats(){

    this.signals = {

        updated: new Signal(),

    };

    this.begin();

    this.maxDuration = -Infinity;
    this.minDuration = Infinity;
    this.avgDuration = 14;
    this.lastDuration = Infinity;

    this.prevFpsTime = 0;
    this.lastFps = Infinity;
    this.lastFrames = 1;
    this.frames = 0;
    this.count = 0;

}

Stats.prototype = {

    update: function(){

        this.startTime = this.end();
        this.signals.updated.dispatch();

    },

    begin: function(){

        this.startTime = performance.now();
        this.lastFrames = this.frames;

    },

    end: function(){

        var time = performance.now();

        this.count += 1;
        this.frames += 1;

        this.lastDuration = time - this.startTime;
        this.minDuration = Math.min( this.minDuration, this.lastDuration );
        this.maxDuration = Math.max( this.maxDuration, this.lastDuration );
        this.avgDuration -= this.avgDuration / 30;
        this.avgDuration += this.lastDuration / 30;

        if( time > this.prevFpsTime + 1000 ) {
            this.lastFps = this.frames;
            this.prevFpsTime = time;
            this.frames = 0;
        }

        return time;

    }

};


export default Stats;
