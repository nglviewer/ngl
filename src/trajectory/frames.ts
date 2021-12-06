/**
 * @file Frames
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

export default class Frames {
  coordinates = []
  boxes = []
  times = []

  timeOffset = 0
  deltaTime = 1

  constructor (readonly name: string, readonly path: string) {}

  get type () { return 'Frames' }
}
