/**
 * @file Representation Element
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Signal } from 'signals'

import { defaults } from '../utils'
import { generateUUID } from '../math/math-utils'

/**
 * Extends {@link ComponentSignals}
 *
 * @typedef {Object} RepresentationElementSignals
 * @property {Signal<String>} parametersChanged - on parameters change
 * @property {Signal<Boolean>} visibilityChanged - on visibility change
 * @property {Signal<String>} nameChanged - on name change
 * @property {Signal} disposed - on dispose
 */

/**
 * Element wrapping a {@link Representation} object
 */
class RepresentationElement {
  /**
   * Create representation component
   * @param {Stage} stage - stage object the component belongs to
   * @param {Representation} repr - representation object to wrap
   * @param {RepresentationParameters} [params] - component parameters
   * @param {Component} [parent] - parent component
   */
  constructor (stage, repr, params, parent) {
    const p = params || {}

    this.name = defaults(p.name, repr.type)
    this.uuid = generateUUID()
    this.visible = p.visible !== undefined ? p.visible : true

    /**
     * Events emitted by the component
     * @type {RepresentationElementSignals}
     */
    this.signals = {
      parametersChanged: new Signal(),
      visibilityChanged: new Signal(),
      nameChanged: new Signal(),
      disposed: new Signal()
    }

    this.stage = stage
    this.parent = parent

    this.setRepresentation(repr)
  }

  /**
   * Component type
   * @type {String}
   */
  get type () { return 'representation' }

  getType () {
    return this.repr.type
  }

  setRepresentation (repr) {
    this.disposeRepresentation()
    this.repr = repr
    // this.name = repr.type;
    this.stage.tasks.listen(this.repr.tasks)
    this.updateVisibility()
  }

  disposeRepresentation () {
    if (this.repr) {
      this.stage.tasks.unlisten(this.repr.tasks)
      this.repr.dispose()
    }
  }

  dispose () {
    if (this.parent && this.parent.hasRepresentation(this)) {
      this.parent.removeRepresentation(this)
    } else {
      this.disposeRepresentation()
      this.signals.disposed.dispatch()
    }
  }

  /**
   * Set the visibility of the component, takes parent visibility into account
   * @param {Boolean} value - visibility flag
   * @return {RepresentationElement} this object
   */
  setVisibility (value) {
    this.visible = value
    this.updateVisibility()
    this.signals.visibilityChanged.dispatch(this.visible)

    return this
  }

  getVisibility () {
    if (this.parent) {
      return this.parent.visible && this.visible
    } else {
      return this.visible
    }
  }

  /**
   * Toggle visibility of the component, takes parent visibility into account
   * @return {RepresentationElement} this object
   */
  toggleVisibility () {
    return this.setVisibility(!this.visible)
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
  update (what) {
    this.repr.update(what)

    return this
  }

  build (params) {
    this.repr.build(params)

    return this
  }

  /**
   * Set selection
   * @param {String} string - selection string
   * @return {RepresentationElement} this object
   */
  setSelection (string) {
    this.repr.setSelection(string)

    return this
  }

  /**
   * Set representation parameters
   * @param {RepresentationParameters} params - parameter object
   * @return {RepresentationElement} this object
   */
  setParameters (params) {
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
  getParameters () {
    return this.repr.getParameters()
  }

  /**
   * Set color
   * @param {String|Color|Hex} value - color value
   * @return {RepresentationElement} this object
   */
  setColor (value) {
    this.repr.setColor(value)

    return this
  }

  setName (value) {
    this.name = value
    this.signals.nameChanged.dispatch(value)

    return this
  }
}

export default RepresentationElement
