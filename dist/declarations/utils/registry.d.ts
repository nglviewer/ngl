/**
 * @file Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export default class Registry {
    name: string;
    private _dict;
    constructor(name: string);
    add(key: string, value: any): void;
    get(key: string): any;
    get names(): string[];
}
