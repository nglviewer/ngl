/**
 * @file Worker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export default class _Worker {
    pending: number;
    postCount: number;
    onmessageDict: {
        [k: number]: Function | undefined;
    };
    onerrorDict: {
        [k: number]: Function | undefined;
    };
    name: string;
    blobUrl: string;
    worker: Worker;
    constructor(name: string);
    post(aMessage?: any, transferList?: any, onmessage?: Function, onerror?: Function): this;
    terminate(): void;
}
