/**
 * @file Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { DecompressorRegistry } from '../globals.js'
import { uint8ToString, defaults } from '../utils.js'

class Streamer {
  constructor (src, params) {
    const p = params || {}

    this.compressed = defaults(p.compressed, false)
    this.binary = defaults(p.binary, false)
    this.json = defaults(p.json, false)
    this.xml = defaults(p.xml, false)

    this.src = src
    this.chunkSize = 1024 * 1024 * 10
    this.newline = '\n'

    this.__pointer = 0
    this.__partialLine = ''

    if (this.__srcName) {
      this[ this.__srcName ] = src
    }
  }

  get type () { return '' }

  get __srcName () { return undefined }

  isBinary () {
    return this.binary || this.compressed
  }

  onload () {}

  onprogress () {}

  onerror () {}

  read () {
    return new Promise((resolve, reject) => {
      try {
        this._read(data => {
          const decompressFn = DecompressorRegistry.get(this.compressed)

          if (this.compressed && decompressFn) {
            this.data = decompressFn(data)
          } else {
            if ((this.binary || this.compressed) && data instanceof ArrayBuffer) {
              data = new Uint8Array(data)
            }
            this.data = data
          }

          resolve(this.data)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  _read (callback) {
    // overwrite this method when this.src does not contain the data
    callback(this.src)
  }

  _chunk (start, end) {
    end = Math.min(this.data.length, end)

    if (start === 0 && this.data.length === end) {
      return this.data
    } else {
      if (this.isBinary()) {
        return this.data.subarray(start, end)
      } else {
        return this.data.substring(start, end)
      }
    }
  }

  chunk (start) {
    const end = start + this.chunkSize

    return this._chunk(start, end)
  }

  peekLines (m) {
    const data = this.data
    const n = data.length

    // FIXME does not work for multi-char newline
    const newline = this.isBinary() ? this.newline.charCodeAt(0) : this.newline

    let i
    let count = 0
    for (i = 0; i < n; ++i) {
      if (data[ i ] === newline) ++count
      if (count === m) break
    }

    const chunk = this._chunk(0, i + 1)
    const d = this.chunkToLines(chunk, '', i > n)

    return d.lines
  }

  chunkCount () {
    return Math.floor(this.data.length / this.chunkSize) + 1
  }

  asText () {
    return this.isBinary() ? uint8ToString(this.data) : this.data
  }

  chunkToLines (chunk, partialLine, isLast) {
    const newline = this.newline

    if (!this.isBinary() && chunk.length === this.data.length) {
      return {
        lines: chunk.split(newline),
        partialLine: ''
      }
    }

    let lines = []
    const str = this.isBinary() ? uint8ToString(chunk) : chunk
    const idx = str.lastIndexOf(newline)

    if (idx === -1) {
      partialLine += str
    } else {
      const str2 = partialLine + str.substr(0, idx)
      lines = lines.concat(str2.split(newline))

      if (idx === str.length - newline.length) {
        partialLine = ''
      } else {
        partialLine = str.substr(idx + newline.length)
      }
    }

    if (isLast && partialLine !== '') {
      lines.push(partialLine)
    }

    return {
      lines: lines,
      partialLine: partialLine
    }
  }

  nextChunk () {
    const start = this.__pointer

    if (start > this.data.length) {
      return undefined
    }

    this.__pointer += this.chunkSize
    return this.chunk(start)
  }

  nextChunkOfLines () {
    const chunk = this.nextChunk()

    if (chunk === undefined) {
      return undefined
    }

    const isLast = this.__pointer > this.data.length
    const d = this.chunkToLines(chunk, this.__partialLine, isLast)

    this.__partialLine = d.partialLine

    return d.lines
  }

  eachChunk (callback) {
    const chunkSize = this.chunkSize
    const n = this.data.length
    const chunkCount = this.chunkCount()

    for (let i = 0; i < n; i += chunkSize) {
      const chunk = this.chunk(i)
      const chunkNo = Math.round(i / chunkSize)

      callback(chunk, chunkNo, chunkCount)
    }
  }

  eachChunkOfLines (callback) {
    this.eachChunk((chunk, chunkNo, chunkCount) => {
      const isLast = chunkNo === chunkCount + 1
      const d = this.chunkToLines(chunk, this.__partialLine, isLast)

      this.__partialLine = d.partialLine

      callback(d.lines, chunkNo, chunkCount)
    })
  }

  dispose () {
    delete this.src

    if (this.__srcName) {
      delete this[ this.__srcName ]
    }
  }
}

export default Streamer
