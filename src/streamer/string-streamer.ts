import Streamer from './streamer'
/**
 * Provides a streamer interface for a string.
 * Used in unit tests
 */
class StringStreamer extends Streamer {
  get type () { return 'string' }
 
  get __srcName () { return 'str' }
 
  // _chunk (start, end) {
  //   return this.data.substr(start, end)
  // }

  _read() {
    return Promise.resolve(this.src)
  }
}

export default StringStreamer
