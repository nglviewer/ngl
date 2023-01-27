/**
 * @file Bit array
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Paul Pillot <paulpillot@gmail.com>
 * @private
 */
/**
 * Bit array
 *
 * Based heavily on https://github.com/lemire/FastBitSet.js
 * which is licensed under the Apache License, Version 2.0.
 */
export default class BitArray {
    private _words;
    length: number;
    /**
     * @param  {Integer} length - array length
     * @param  {Boolean} [setAll] - initialize with true
     */
    constructor(length: number, setAll?: boolean);
    /**
     * Get value at index
     * @param  {Integer} index - the index
     * @return {Boolean} value
     */
    get(index: number): boolean;
    /**
     * Set value at index to true
     * @param  {Integer} index - the index
     * @return {undefined}
     */
    set(index: number): void;
    /**
     * Set value at index to false
     * @param  {Integer} index - the index
     * @return {undefined}
     */
    clear(index: number): void;
    /**
     * Flip value at index
     * @param  {Integer} index - the index
     * @return {undefined}
     */
    flip(index: number): void;
    _assignRange(start: number, end: number, value: boolean): this | undefined;
    /**
     * Set bits of the given range
     * @param {Integer} start - start index
     * @param {Integer} end - end index
     * @return {BitArray} this object
     */
    setRange(start: number, end: number): this | undefined;
    /**
     * Clear bits of the given range
     * @param {Integer} start - start index
     * @param {Integer} end - end index
     * @return {BitArray} this object
     */
    clearRange(start: number, end: number): this | undefined;
    /**
     * Set bits at all given indices
     * @param {...Integer} arguments - indices
     * @return {Boolean} this object
     */
    setBits(...indices: number[]): this;
    /**
     * Clear bits at all given indices
     * @param {...Integer} arguments - indices
     * @return {Boolean} this object
     */
    clearBits(...indices: number[]): this;
    /**
     * Set all bits of the array
     * @return {BitArray} this object
     */
    setAll(): this | undefined;
    /**
     * Clear all bits of the array
     * @return {BitArray} this object
     */
    clearAll(): this | undefined;
    /**
     * Flip all the values in the array
     * @return {BitArray} this object
     */
    flipAll(): this;
    _isRangeValue(start: number, end: number, value: boolean): boolean | undefined;
    /**
     * Test if bits in given range are set
     * @param {Integer} start - start index
     * @param {Integer} end - end index
     * @return {BitArray} this object
     */
    isRangeSet(start: number, end: number): boolean | undefined;
    /**
     * Test if bits in given range are clear
     * @param {Integer} start - start index
     * @param {Integer} end - end index
     * @return {BitArray} this object
     */
    isRangeClear(start: number, end: number): boolean | undefined;
    /**
     * Test if all bits in the array are set
     * @return {Boolean} test result
     */
    isAllSet(): boolean | undefined;
    /**
     * Test if all bits in the array are clear
     * @return {Boolean} test result
     */
    isAllClear(): boolean | undefined;
    /**
     * Test if bits at all given indices are set
     * @param {...Integer} arguments - indices
     * @return {Boolean} test result
     */
    isSet(...indices: number[]): boolean;
    /**
     * Test if bits at all given indices are clear
     * @param {...Integer} arguments - indices
     * @return {Boolean} test result
     */
    isClear(...indices: number[]): boolean;
    /**
     * Test if two BitArrays are identical in all their values
     * @param {BitArray} otherBitarray - the other BitArray
     * @return {Boolean} test result
     */
    isEqualTo(otherBitarray: BitArray): boolean;
    /**
     * How many set bits?
     * @return {Integer} number of set bits
     */
    getSize(): number;
    /**
     * Calculate difference betwen this and another bit array.
     * Store result in this object.
     * @param  {BitArray} otherBitarray - the other bit array
     * @return {BitArray} this object
     */
    difference(otherBitarray: BitArray): this;
    /**
     * Calculate union betwen this and another bit array.
     * Store result in this object.
     * @param  {BitArray} otherBitarray - the other bit array
     * @return {BitArray} this object
     */
    union(otherBitarray: BitArray): this;
    /**
     * Calculate intersection betwen this and another bit array.
     * Store result in this object.
     * @param  {BitArray} otherBitarray - the other bit array
     * @return {BitArray} this object
     */
    intersection(otherBitarray: BitArray): this;
    /**
     * Test if there is any intersection betwen this and another bit array.
     * @param  {BitArray} otherBitarray - the other bit array
     * @return {Boolean} test result
     */
    intersects(otherBitarray: BitArray): boolean;
    /**
     * Calculate the number of bits in common betwen this and another bit array.
     * @param  {BitArray} otherBitarray - the other bit array
     * @return {Integer} size
     */
    getIntersectionSize(otherBitarray: BitArray): number;
    /**
     * Calculate intersection betwen this and another bit array.
     * Store result in a new bit array.
     * @param  {BitArray} otherBitarray - the other bit array
     * @return {BitArray} the new bit array
     */
    makeIntersection(otherBitarray: BitArray): any;
    /**
     * Iterate over all set bits in the array
     * @param  {function( index: Integer, i: Integer )} callback - the callback
     * @return {undefined}
     */
    forEach(callback: (index: number, i: number) => any): void;
    /**
     * Get an array with the set bits
     * @return {Array} bit indices
     */
    toArray(): any[];
    toString(): string;
    toSeleString(): string;
    /**
     * Clone this object
     * @return {BitArray} the cloned object
     */
    clone(): any;
}
