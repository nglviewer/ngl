/**
 * @file Frames
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

class Frames {
  constructor (name, path) {
    this.name = name
    this.path = path

    this.coordinates = []
    this.boxes = []
    this.times = []

    this.timeOffset = 0
    this.deltaTime = 1
  }

  get type () { return 'Frames' }
}

export default Frames
