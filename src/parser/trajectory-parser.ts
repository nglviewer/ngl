/**
 * @file Trajectory Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Parser, { ParserParameters } from './parser'
import Frames from '../trajectory/frames'
import Streamer from '../streamer/streamer';

class TrajectoryParser extends Parser {
  constructor (streamer: Streamer, params?: Partial<ParserParameters>) {
    super(streamer, params)

    this.frames = new Frames(this.name, this.path)
  }

  get type () { return 'trajectory' }
  get __objName () { return 'frames' }
}

export default TrajectoryParser
