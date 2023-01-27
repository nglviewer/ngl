/**
 * @file Queue
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
declare class Queue<T> {
    readonly fn: Function;
    queue: T[];
    pending: boolean;
    constructor(fn: Function, argList?: T[]);
    private run;
    private next;
    push(arg: T): void;
    kill(): void;
    length(): number;
}
export default Queue;
