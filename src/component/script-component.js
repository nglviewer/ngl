/**
 * @file Script Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { ComponentRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import Component from './component.js'

/**
 * Component wrapping a {@link Script} object
 */
class ScriptComponent extends Component {
    /**
     * @param {Stage} stage - stage object the component belongs to
     * @param {Script} script - script object to wrap
     * @param {ComponentParameters} params - component parameters
     */
  constructor (stage, script, params) {
    var p = params || {}
    p.name = defaults(p.name, script.name)

    super(stage, p)

    this.script = script
    this.status = 'loaded'

    this.script.signals.nameChanged.add(value => {
      this.setName(value)
    })
  }

  get type () { return 'script' }

  addRepresentation () {}

  removeRepresentation () {}

  run () {
    this.setStatus('running')

    this.script.call(this.stage).then(() => {
      this.setStatus('finished')
    })

    this.setStatus('called')
  }

  dispose () {
        // TODO dispose script
    this.signals.disposed.dispatch()
  }

  setVisibility () {}

  getCenter () {}

  getZoom () {}

  getBox () {}
}

ComponentRegistry.add('script', ScriptComponent)

export default ScriptComponent
