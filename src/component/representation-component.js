/**
 * @file Representation Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Signal from '../../lib/signals.es6.js'

import { defaults } from '../utils.js'
import Component from './component.js'

// add here to avoid cyclic import dependency
Component.prototype.__getRepresentationComponent = function (repr, p) {
  return new RepresentationComponent(
        this.stage, repr, p, this
    )
}

/**
 * Extends {@link ComponentSignals}
 *
 * @typedef {Object} RepresentationComponentSignals
 * @property {Signal<String>} parametersChanged - on parameters change
 */

/**
 * Component wrapping a {@link Representation} object
 */
class RepresentationComponent extends Component {
    /**
     * Create representation component
     * @param {Stage} stage - stage object the component belongs to
     * @param {Representation} repr - representation object to wrap
     * @param {RepresentationParameters} [params] - component parameters
     * @param {Component} [parent] - parent component
     */
  constructor (stage, repr, params, parent) {
    var p = params || {}
    p.name = defaults(p.name, repr.type)

    super(stage, p)

        /**
         * Events emitted by the component
         * @type {RepresentationComponentSignals}
         */
    this.signals = Object.assign(this.signals, {
      parametersChanged: new Signal()
    })

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

    /**
     * @ignore
     * @alias RepresentationComponent#addRepresentation
     * @return {undefined}
     */
  addRepresentation () {}

    /**
     * @ignore
     * @alias RepresentationComponent#removeRepresentation
     * @return {undefined}
     */
  removeRepresentation () {}

    /**
     * @ignore
     * @alias RepresentationComponent#hasRepresentation
     * @return {undefined}
     */
  hasRepresentation () {}

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
     * @return {RepresentationComponent} this object
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
     * @return {RepresentationComponent} this object
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
     * @return {RepresentationComponent} this object
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
     * @return {RepresentationComponent} this object
     */
  setSelection (string) {
    this.repr.setSelection(string)

    return this
  }

    /**
     * Set representation parameters
     * @param {RepresentationParameters} params - parameter object
     * @return {RepresentationComponent} this object
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
     * @return {RepresentationComponent} this object
     */
  setColor (value) {
    this.repr.setColor(value)

    return this
  }

    /**
     * @ignore
     * @return {undefined}
     */
  getCenter () {}

    /**
     * @ignore
     * @return {undefined}
     */
  getZoom () {}

    /**
     * @ignore
     * @return {undefined}
     */
  getBox () {}
}

export default RepresentationComponent
