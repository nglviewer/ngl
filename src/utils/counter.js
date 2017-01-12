/**
 * @file Counter
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log } from "../globals.js";

import Signal from "../../lib/signals.es6.js";


/**
 * {@link Signal}, dispatched when the `count` changes
 * @example
 * counter.signals.countChanged.add( function( delta ){ ... } );
 * @event Counter#countChanged
 * @type {Integer}
 */


/**
 * Counter class for keeping track of counts
 * @class
 */
function Counter(){

    /**
     * The `count`
     * @member {Integer}
     */
    this.count = 0;

    this.signals = {
        countChanged: new Signal(),
    };

}

Counter.prototype = {

    /**
     * Set the `count` to zero
     * @return {undefined}
     */
    clear: function(){

        this.change( -this.count );

    },

    /**
     * Change the `count`
     * @fires Counter#countChanged
     * @param {Integer} delta - count change
     * @return {undefined}
     */
    change: function( delta ){

        this.count += delta;
        this.signals.countChanged.dispatch( delta, this.count );

        if( this.count < 0 ){
            Log.warn( "Counter.count below zero", this.count );
        }

    },

    /**
     * Increments the `count` by one.
     * @return {undefined}
     */
    increment: function(){

        this.change( 1 );

    },

    /**
     * Decrements the `count` by one.
     * @return {undefined}
     */
    decrement: function(){

        this.change( -1 );

    },

    /**
     * Listen to another counter object and change this `count` by the
     * same amount
     * @param  {Counter} counter - the counter object to listen to
     * @return {undefined}
     */
    listen: function( counter ){

        this.change( counter.count );
        counter.signals.countChanged.add( this.change, this );

    },

    /**
     * Stop listening to the other counter object
     * @param  {Counter} counter - the counter object to stop listening to
     * @return {undefined}
     */
    unlisten: function( counter ){

        var countChanged = counter.signals.countChanged;
        if( countChanged.has( this.change, this ) ){
            countChanged.remove( this.change, this );
        }

    },

    /**
     * Invole the callback function once, when the `count` becomes zero
     * @param  {Function} callback - the callback function
     * @param  {Object}   context - the context for the callback function
     * @return {undefined}
     */
    onZeroOnce: function( callback, context ){

        if( this.count === 0 ){

            callback.call( context, 0, 0 );

        }else{

            var fn = function(){

                if( this.count === 0 ){
                    this.signals.countChanged.remove( fn, this );
                    callback.apply( context, arguments );
                }

            };
            this.signals.countChanged.add( fn, this );

        }

    },

    dispose: function(){

        this.clear();
        this.signals.countChanged.dispose();

    }

};


export default Counter;
