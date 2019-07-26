/**
 * @file Representation Element
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Signal } from 'signals'
import { Color } from 'three'

import Stage from '../stage/stage'
import Representation, { RepresentationParameters } from '../representation/representation'
import Component from './component'
import Element, { ElementDefaultParameters, ElementSignals } from './element'

export const RepresentationElementDefaultParameters = Object.assign({
  visible: true
}, ElementDefaultParameters)
export type RepresentationElementParameters = typeof RepresentationElementDefaultParameters

export interface RepresentationElementSignals extends ElementSignals {
  visibilityChanged: Signal  // on visibility change
  parametersChanged: Signal  // on parameters change
}

/**
 * Element wrapping a {@link Representation} object
 */
class RepresentationElement extends Element {
  signals: RepresentationElementSignals
  parameters: RepresentationElementParameters
  get defaultParameters() { return RepresentationElementDefaultParameters }

  repr: Representation

  /**
   * Create representation component
   * @param {Stage} stage - stage object the component belongs to
   * @param {Representation} repr - representation object to wrap
   * @param {RepresentationParameters} [params] - component parameters
   * @param {Component} [parent] - parent component
   */
  constructor (stage: Stage, repr: Representation, params: Partial<RepresentationElementParameters> = {}, readonly parent: Component) {
    super(stage, Object.assign({ name: repr.type }, params))

    this.signals = Object.assign({
      visibilityChanged: new Signal(),
      parametersChanged: new Signal()
    }, this.signals)

    this.setRepresentation(repr)
  }

  get visible () { return this.parameters.visible }

  /**
   * Component type
   * @type {String}
   */
  get type () { return 'representation' }

  getType () {
    return this.repr.type
  }

  setRepresentation (repr: Representation) {
    this._disposeRepresentation()
    this.repr = repr
    // this.name = repr.type;
    this.stage.tasks.listen(this.repr.tasks)
    this.updateVisibility()
  }

  _disposeRepresentation () {
    if (this.repr) {
      this.stage.tasks.unlisten(this.repr.tasks)
      this.repr.dispose()
    }
  }

  dispose () {
    if (this.parent && this.parent.hasRepresentation(this)) {
      this.parent.removeRepresentation(this)
    } else {
      this._disposeRepresentation()
      this.signals.disposed.dispatch()
    }
  }

  /**
   * Set the visibility of the component, takes parent visibility into account
   * @param {Boolean} value - visibility flag
   * @return {RepresentationElement} this object
   */
  setVisibility (value: boolean) {
    this.parameters.visible = value
    this.updateVisibility()
    this.signals.visibilityChanged.dispatch(this.parameters.visible)

    return this
  }

  getVisibility () {
    if (this.parent) {
      return this.parent.parameters.visible && this.parameters.visible
    } else {
      return this.parameters.visible
    }
  }

  /**
   * Toggle visibility of the component, takes parent visibility into account
   * @return {RepresentationElement} this object
   */
  toggleVisibility () {
    return this.setVisibility(!this.parameters.visible)
  }

  updateVisibility () {
    this.repr.setVisibility(this.getVisibility())
  }

  /**
   * Set selection
   * @param {Object} what - flags indicating what attributes to update
   * @param {Boolean} what.position - update position attribute
   * @param {Boolean} what.color - update color attribute
   * @param {Boolean} what.radius - update radius attribute
   * @return {RepresentationElement} this object
   */
  update (what: any) {  // TODO
    (this.repr as any).update(what)  // TODO

    return this
  }

  build (params?: any) {  // TODO
    this.repr.build(params)

    return this
  }

  /**
   * Set selection
   * @param {String} string - selection string
   * @return {RepresentationElement} this object
   */
  setSelection (string: string) {
    const repr: any = this.repr  // TODO

    if (repr.setSelection) {
      repr.setSelection(string)
    }

    return this
  }

  /**
   * Set representation parameters
   * @param {RepresentationParameters} params - parameter object
   * @return {RepresentationElement} this object
   */
  setParameters (params: any) {  // TODO
    this.repr.setParameters(params)
    this.signals.parametersChanged.dispatch(
      this.repr.getParameters()
    )

    return this
  }

  /**
   * Get representation parameters
   * @return {RepresentationParameters} parameter object
   */
  getParameters (): Partial<RepresentationParameters> {
    return this.repr.getParameters()
  }

  /**
   * Set color
   * @param {String|Color|Hex} value - color value
   * @return {RepresentationElement} this object
   */
  setColor (value: string|number|Color) {
    this.repr.setColor(value)

    return this
  }
}

export default RepresentationElement
