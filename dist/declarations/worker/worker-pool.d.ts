/**
 * @file Worker Pool
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import Worker from './worker';
declare class WorkerPool {
    maxCount: number;
    pool: Worker[];
    count: number;
    name: string;
    constructor(name: string, maxCount?: number);
    post(aMessage?: any, transferList?: any, onmessage?: Function, onerror?: Function): this;
    terminate(): void;
    getNextWorker(): Worker | undefined;
}
export default WorkerPool;
