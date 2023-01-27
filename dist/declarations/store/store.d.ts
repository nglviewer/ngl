/**
 * @file Store
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { TypedArrayString } from '../utils';
export declare type StoreField = [string, number, TypedArrayString];
/**
 * Store base class
 * @interface
 */
export default class Store {
    [k: string]: any;
    length: number;
    count: number;
    _fields: StoreField[];
    get _defaultFields(): StoreField[];
    /**
     * @param {Integer} [size] - initial size
     */
    constructor(size?: number);
    /**
     * Initialize the store
     * @param  {Integer} size - size to initialize
     * @return {undefined}
     */
    _init(size: number): void;
    /**
     * Initialize a field
     * @param  {String} name - field name
     * @param  {Integer} size - element size
     * @param  {String} type - data type, one of int8, int16, int32,
     *                         uint8, uint16, uint32, float32
     * @return {undefined}
     */
    _initField(name: string, size: number, type: TypedArrayString): void;
    /**
     * Add a field
     * @param  {String} name - field name
     * @param  {Integer} size - element size
     * @param  {String} type - data type, one of int8, int16, int32,
     *                         uint8, uint16, uint32, float32
     * @return {undefined}
     */
    addField(name: string, size: number, type: TypedArrayString): void;
    /**
     * Resize the store to the new size
     * @param  {Integer} size - new size
     * @return {undefined}
     */
    resize(size?: number): void;
    /**
     * Resize the store to 1.5 times its current size if full
     * @return {undefined}
     */
    growIfFull(): void;
    /**
     * Copy data from one store to another
     * @param  {Store} other - store to copy from
     * @param  {Integer} thisOffset - offset to start copying to
     * @param  {Integer} otherOffset - offset to start copying from
     * @param  {Integer} length - number of entries to copy
     * @return {undefined}
     */
    copyFrom(other: Store, thisOffset: number, otherOffset: number, length: number): void;
    /**
     * Copy data within this store
     * @param  {Integer} thisOffset - offset to start copying to
     * @param  {Integer} otherOffset - offset to start copying from
     * @param  {Integer} length - number of entries to copy
     * @return {undefined}
     */
    copyWithin(offsetTarget: number, offsetSource: number, length: number): void;
    /**
     * Sort entries in the store given the compare function
     * @param  {[type]} compareFunction - function to sort by
     * @return {undefined}
     */
    sort(compareFunction: (a: any, b: any) => number): void;
    /**
     * Empty the store
     * @return {undefined}
     */
    clear(): void;
    /**
     * Dispose of the store entries and fields
     * @return {undefined}
     */
    dispose(): void;
}
