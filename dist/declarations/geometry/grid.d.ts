import { NumberArray, TypedArray } from "../types";
/**
 * @file Grid
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export interface iGrid {
    data: TypedArray;
    index: (x: number, y: number, z: number) => number;
    set: (x: number, y: number, z: number, ...arg: number[]) => void;
    toArray: (x: number, y: number, z: number, array?: NumberArray, offset?: number) => void;
    fromArray: (x: number, y: number, z: number, array: NumberArray, offset?: number) => void;
    copy: (grid: iGrid) => void;
}
declare function makeGrid(length: number, width: number, height: number, DataCtor: any, elemSize: number): iGrid;
export { makeGrid };
