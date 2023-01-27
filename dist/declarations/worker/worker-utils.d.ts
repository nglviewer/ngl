/**
 * @file Worker Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
export declare type FunctionWithDeps = {
    __deps?: Function[];
} & Function;
export interface WorkerEvent {
    data: {
        __name: string;
        __postId: string;
    };
}
export declare function makeWorkerBlob(func: Function, deps: Function[]): Blob;
