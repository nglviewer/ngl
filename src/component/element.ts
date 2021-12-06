/**
 * @file Element
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Signal } from 'signals'

import { createParams } from '../utils'
import { generateUUID } from '../math/math-utils'
import Stage from '../stage/stage'

export const ElementDefaultParameters = {
  name: 'some element',
  status: ''
}
export type ElementParameters = typeof ElementDefaultParameters

export interface ElementSignals {
  statusChanged: Signal  // on status change
  nameChanged: Signal  // on name change
  disposed: Signal  // on dispose
}

/**
 * Element base class
 */
abstract class Element {
  /**
   * Events emitted by the element
   */
  signals: ElementSignals = {
    statusChanged: new Signal(),
    nameChanged: new Signal(),
    disposed: new Signal()
  }
  readonly parameters: ElementParameters
  readonly uuid: string

  get defaultParameters() { return ElementDefaultParameters }

  /**
   * @param {Stage} stage - stage object the component belongs to
   * @param {ElementParameters} params - component parameters
   */
  constructor (readonly stage: Stage, params: Partial<ElementParameters> = {}) {
    this.parameters = createParams(params, this.defaultParameters)
    this.uuid = generateUUID()
  }

  abstract get type (): string

  get name () { return this.parameters.name }

  setStatus (value: string) {
    this.parameters.status = value
    this.signals.statusChanged.dispatch(value)

    return this
  }

  setName (value: string) {
    this.parameters.name = value
    this.signals.nameChanged.dispatch(value)

    return this
  }

  dispose () {
    this.signals.disposed.dispatch()
  }
}

export default Element
