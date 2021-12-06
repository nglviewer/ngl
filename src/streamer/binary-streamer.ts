import Streamer from './streamer'

export default class BinaryStreamer extends Streamer {
  
  _read () {
    if (this.src instanceof ArrayBuffer) this.src = new Uint8Array(this.src)

    return Promise.resolve(this.src)
  }
 
  get type () { return 'binary' }
 
  get __srcName () { return 'bin' }
}