/**
 * @file Streamer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { DecompressorRegistry } from '../globals'
import { uint8ToString, defaults } from '../utils'

export interface StreamerParams {
  compressed?: string|false
  binary?: boolean
  json?: boolean
  xml?: boolean
}

abstract class Streamer {
  src: any
  data: any

  compressed: string|false
  binary: boolean
  json: boolean
  xml: boolean

  chunkSize = 1024 * 1024 * 10
  newline = '\n'

  protected __pointer = 0
  protected __partialLine = ''

  constructor (src: any, params: StreamerParams = {}) {
    this.compressed = defaults(params.compressed, false)
    this.binary = defaults(params.binary, false)
    this.json = defaults(params.json, false)
    this.xml = defaults(params.xml, false)

    this.src = src
  }

  isBinary () {
    return this.binary || this.compressed
  }

  read () {
    return this._read().then(data => {
      const decompressFn = this.compressed ? DecompressorRegistry.get(this.compressed) : undefined

      if (this.compressed && decompressFn) {
        this.data = decompressFn(data)
      } else {
        if ((this.binary || this.compressed) && data instanceof ArrayBuffer) {
          data = new Uint8Array(data)
        }
        this.data = data
      }

      return this.data
    })
  }

  protected abstract _read (): Promise<any>

  protected _chunk (start: number, end: number) {
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

  chunk (start: number) {
    const end = start + this.chunkSize

    return this._chunk(start, end)
  }

  peekLines (m: number) {
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

  chunkToLines (chunk: string|Uint8Array, partialLine: string, isLast: boolean) {
    const newline = this.newline

    if (!this.isBinary() && chunk.length === this.data.length) {
      return {
        lines: (chunk as string).split(newline),
        partialLine: ''
      }
    }

    let lines: string[] = []
    const str = this.isBinary() ? uint8ToString(chunk as Uint8Array) : chunk
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

  eachChunk (callback: (chunk: string|Uint8Array, chunkNo: number, chunkCount: number) => void) {
    const chunkSize = this.chunkSize
    const n = this.data.length
    const chunkCount = this.chunkCount()

    for (let i = 0; i < n; i += chunkSize) {
      const chunk = this.chunk(i)
      const chunkNo = Math.round(i / chunkSize)

      callback(chunk, chunkNo, chunkCount)
    }
  }

  eachChunkOfLines (callback: (chunk: string[], chunkNo: number, chunkCount: number) => void) {
    this.eachChunk((chunk, chunkNo, chunkCount) => {
      const isLast = chunkNo === chunkCount + 1
      const d = this.chunkToLines(chunk, this.__partialLine, isLast)

      this.__partialLine = d.partialLine

      callback(d.lines, chunkNo, chunkCount)
    })
  }

  dispose () {
    delete this.src
  }
}

export default Streamer
