/**
 * @file Script
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Signal } from 'signals';
import Stage from './stage/stage';
export interface ScriptSignals {
    elementAdded: Signal;
    elementRemoved: Signal;
    nameChanged: Signal;
}
/**
 * Script class
 */
declare class Script {
    readonly name: string;
    readonly path: string;
    readonly signals: ScriptSignals;
    readonly dir: string;
    readonly fn: Function;
    readonly type = "Script";
    /**
     * Create a script instance
     * @param {String} functionBody - the function source
     * @param {String} name - name of the script
     * @param {String} path - path of the script
     */
    constructor(functionBody: string, name: string, path: string);
    /**
     * Execute the script
     * @param  {Stage} stage - the stage context
     * @return {Promise} - resolve when script finished running
     */
    run(stage: Stage): Promise<void>;
}
export default Script;
