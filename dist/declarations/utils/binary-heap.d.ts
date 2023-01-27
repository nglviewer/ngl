/**
 * @file Binary Heap
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
/**
 * Binary heap implementation
 * @class
 * @author http://eloquentjavascript.net/appendix2.htm
 * @param {Function} scoreFunction - the heap scoring function
 */
declare class BinaryHeap<T> {
    readonly scoreFunction: (x: T) => number;
    content: T[];
    constructor(scoreFunction: (x: T) => number);
    push(element: T): void;
    pop(): T;
    peek(): T;
    remove(element: T): void;
    size(): number;
    bubbleUp(n: number): void;
    sinkDown(n: number): void;
}
export default BinaryHeap;
