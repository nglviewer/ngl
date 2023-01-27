/**
 * @file Representation Element
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Signal } from 'signals';
import { Color } from 'three';
import Stage from '../stage/stage';
import Representation, { RepresentationParameters } from '../representation/representation';
import Component from './component';
import Element, { ElementSignals } from './element';
export declare const RepresentationElementDefaultParameters: {
    visible: boolean;
} & {
    name: string;
    status: string;
};
export declare type RepresentationElementParameters = typeof RepresentationElementDefaultParameters;
export interface RepresentationElementSignals extends ElementSignals {
    visibilityChanged: Signal;
    parametersChanged: Signal;
}
/**
 * Element wrapping a {@link Representation} object
 */
declare class RepresentationElement extends Element {
    readonly parent: Component;
    signals: RepresentationElementSignals;
    parameters: RepresentationElementParameters;
    get defaultParameters(): {
        visible: boolean;
    } & {
        name: string;
        status: string;
    };
    repr: Representation;
    /**
     * Create representation component
     * @param {Stage} stage - stage object the component belongs to
     * @param {Representation} repr - representation object to wrap
     * @param {RepresentationParameters} [params] - component parameters
     * @param {Component} [parent] - parent component
     */
    constructor(stage: Stage, repr: Representation, params: Partial<{
        visible: boolean;
    } & {
        name: string;
        status: string;
    }> | undefined, parent: Component);
    get visible(): boolean;
    /**
     * Component type
     * @type {String}
     */
    get type(): string;
    getType(): string;
    setRepresentation(repr: Representation): void;
    _disposeRepresentation(): void;
    dispose(): void;
    /**
     * Set the visibility of the component, takes parent visibility into account
     * @param {Boolean} value - visibility flag
     * @return {RepresentationElement} this object
     */
    setVisibility(value: boolean): this;
    getVisibility(): boolean;
    /**
     * Toggle visibility of the component, takes parent visibility into account
     * @return {RepresentationElement} this object
     */
    toggleVisibility(): this;
    updateVisibility(): void;
    /**
     * Set selection
     * @param {Object} what - flags indicating what attributes to update
     * @param {Boolean} what.position - update position attribute
     * @param {Boolean} what.color - update color attribute
     * @param {Boolean} what.radius - update radius attribute
     * @return {RepresentationElement} this object
     */
    update(what: any): this;
    build(params?: any): this;
    /**
     * Set selection
     * @param {String} string - selection string
     * @return {RepresentationElement} this object
     */
    setSelection(string: string): this;
    /**
     * Set representation parameters
     * @param {RepresentationParameters} params - parameter object
     * @return {RepresentationElement} this object
     */
    setParameters(params: any): this;
    /**
     * Get representation parameters
     * @return {RepresentationParameters} parameter object
     */
    getParameters(): Partial<RepresentationParameters>;
    /**
     * Set color
     * @param {String|Color|Hex} value - color value
     * @return {RepresentationElement} this object
     */
    setColor(value: string | number | Color): this;
}
export default RepresentationElement;
