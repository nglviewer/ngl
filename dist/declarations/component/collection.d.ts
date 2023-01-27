/**
 * @file Collection
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Component from './component';
import Element from './element';
declare class Collection<T extends (Component | Element)> {
    readonly list: T[];
    constructor(list?: T[]);
    _remove(elm: T): void;
    get first(): T | undefined;
    forEach(fn: (x: T) => any): this;
    dispose(): this;
}
export default Collection;
