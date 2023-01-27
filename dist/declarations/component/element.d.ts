/**
 * @file Element
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Signal } from 'signals';
import Stage from '../stage/stage';
export declare const ElementDefaultParameters: {
    name: string;
    status: string;
};
export declare type ElementParameters = typeof ElementDefaultParameters;
export interface ElementSignals {
    statusChanged: Signal;
    nameChanged: Signal;
    disposed: Signal;
}
/**
 * Element base class
 */
declare abstract class Element {
    readonly stage: Stage;
    /**
     * Events emitted by the element
     */
    signals: ElementSignals;
    readonly parameters: ElementParameters;
    readonly uuid: string;
    get defaultParameters(): {
        name: string;
        status: string;
    };
    /**
     * @param {Stage} stage - stage object the component belongs to
     * @param {ElementParameters} params - component parameters
     */
    constructor(stage: Stage, params?: Partial<ElementParameters>);
    abstract get type(): string;
    get name(): string;
    setStatus(value: string): this;
    setName(value: string): this;
    dispose(): void;
}
export default Element;
