import Streamer from './streamer'

export default class BinaryStreamer extends Streamer {

  _read () {
    if (this.src instanceof ArrayBuffer)
      this.src = new Uint8Array(this.src)
    else if (this.src instanceof Buffer && this.src.buffer)
      this.src = new Uint8Array(this.src.buffer, 0, this.src.length)
    // this.src should be an ArrayBuffer or Uint8Array at this point

    return Promise.resolve(this.src)
  }

  get type () { return 'binary' }

  get __srcName () { return 'bin' }
}
