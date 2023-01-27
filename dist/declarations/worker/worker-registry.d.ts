/**
 * @file Worker Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
declare class WorkerRegistry {
    activeWorkerCount: number;
    private _funcDict;
    private _depsDict;
    private _blobDict;
    add(name: string, func: Function, deps: Function[]): void;
    get(name: string): Blob;
}
export default WorkerRegistry;
