/**
 * @file Frames
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export default class Frames {
    readonly name: string;
    readonly path: string;
    coordinates: never[];
    boxes: never[];
    times: never[];
    timeOffset: number;
    deltaTime: number;
    constructor(name: string, path: string);
    get type(): string;
}
