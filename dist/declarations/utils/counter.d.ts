/**
 * @file Counter
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import * as signalsWrapper from 'signals';
/**
 * {@link Signal}, dispatched when the `count` changes
 * @example
 * counter.signals.countChanged.add( function( delta ){ ... } );
 * @event Counter#countChanged
 * @type {Integer}
 */
export interface CounterSignals {
    countChanged: signalsWrapper.Signal;
}
/**
 * Counter class for keeping track of counts
 */
declare class Counter {
    count: number;
    signals: CounterSignals;
    /**
     * Set the `count` to zero
     * @return {undefined}
     */
    clear(): void;
    /**
     * Change the `count`
     * @fires Counter#countChanged
     * @param {Integer} delta - count change
     * @return {undefined}
     */
    change(delta: number): void;
    /**
     * Increments the `count` by one.
     * @return {undefined}
     */
    increment(): void;
    /**
     * Decrements the `count` by one.
     * @return {undefined}
     */
    decrement(): void;
    /**
     * Listen to another counter object and change this `count` by the
     * same amount
     * @param  {Counter} counter - the counter object to listen to
     * @return {undefined}
     */
    listen(counter: Counter): void;
    /**
     * Stop listening to the other counter object
     * @param  {Counter} counter - the counter object to stop listening to
     * @return {undefined}
     */
    unlisten(counter: Counter): void;
    /**
     * Invole the callback function once, when the `count` becomes zero
     * @param  {Function} callback - the callback function
     * @param  {Object}   context - the context for the callback function
     * @return {undefined}
     */
    onZeroOnce(callback: () => void, context?: any): void;
    dispose(): void;
}
export default Counter;
