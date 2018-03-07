/**
 * @file Trajectory Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Parser from './parser'
import Frames from '../trajectory/frames'

class TrajectoryParser extends Parser {
  constructor (streamer, params) {
    super(streamer, params)

    this.frames = new Frames(this.name, this.path)
  }

  get type () { return 'trajectory' }
  get __objName () { return 'frames' }
}

export default TrajectoryParser
