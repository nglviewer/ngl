/**
 * @file IO Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 *
 * Adapted and converted to TypeScript from https://github.com/image-js/iobuffer
 * MIT License, Copyright (c) 2015 Michaël Zasso
 */

import { TypedArray } from '../types'

const defaultByteLength = 1024 * 8
const charArray: string[] = []

export interface IOBufferParameters {
  offset?: number  // Ignore the first n bytes of the ArrayBuffer
}

/**
 * Class for writing and reading binary data
 */
class IOBuffer {
  private _lastWrittenByte: number
  private _mark = 0
  private _marks: number[] = []
  private _data: DataView

  offset = 0  // The current offset of the buffer's pointer
  littleEndian = true
  buffer: ArrayBuffer  // Reference to the internal ArrayBuffer object
  length: number  // Byte length of the internal ArrayBuffer
  byteLength: number  // Byte length of the internal ArrayBuffer
  byteOffset: number  // Byte offset of the internal ArrayBuffer

  /**
   * If it's a number, it will initialize the buffer with the number as
   * the buffer's length. If it's undefined, it will initialize the buffer
   * with a default length of 8 Kb. If its an ArrayBuffer, a TypedArray,
   * it will create a view over the underlying ArrayBuffer.
   */
  constructor (data: number|ArrayBuffer|TypedArray, params: IOBufferParameters = {}) {
    let dataIsGiven = false
    if (data === undefined) {
      data = defaultByteLength
    }
    if (typeof data === 'number') {
      data = new ArrayBuffer(data)
    } else {
      dataIsGiven = true
    }

    const offset = params.offset ? params.offset >>> 0 : 0
    let byteLength = data.byteLength - offset
    let dvOffset = offset
    if (!(data instanceof ArrayBuffer)) {
      if (data.byteLength !== data.buffer.byteLength) {
        dvOffset = data.byteOffset + offset
      }
      data = data.buffer
    }
    if (dataIsGiven) {
      this._lastWrittenByte = byteLength
    } else {
      this._lastWrittenByte = 0
    }

    this.buffer = data
    this.length = byteLength
    this.byteLength = byteLength
    this.byteOffset = dvOffset

    this._data = new DataView(this.buffer, dvOffset, byteLength)
  }

  /**
   * Checks if the memory allocated to the buffer is sufficient to store more bytes after the offset
   * @param {number} [byteLength=1] The needed memory in bytes
   * @return {boolean} Returns true if there is sufficient space and false otherwise
   */
  available (byteLength: number) {
    if (byteLength === undefined) byteLength = 1
    return (this.offset + byteLength) <= this.length
  }

  /**
   * Check if little-endian mode is used for reading and writing multi-byte values
   * @return {boolean} Returns true if little-endian mode is used, false otherwise
   */
  isLittleEndian () {
    return this.littleEndian
  }

  /**
   * Set little-endian mode for reading and writing multi-byte values
   * @return {IOBuffer}
   */
  setLittleEndian () {
    this.littleEndian = true
    return this
  }

  /**
   * Check if big-endian mode is used for reading and writing multi-byte values
   * @return {boolean} Returns true if big-endian mode is used, false otherwise
   */
  isBigEndian () {
    return !this.littleEndian
  }

  /**
   * Switches to big-endian mode for reading and writing multi-byte values
   * @return {IOBuffer}
   */
  setBigEndian () {
    this.littleEndian = false
    return this
  }

  /**
   * Move the pointer n bytes forward
   * @param {number} n
   * @return {IOBuffer}
   */
  skip (n: number) {
    if (n === undefined) n = 1
    this.offset += n
    return this
  }

  /**
   * Move the pointer to the given offset
   * @param {number} offset
   * @return {IOBuffer}
   */
  seek (offset: number) {
    this.offset = offset
    return this
  }

  /**
   * Store the current pointer offset.
   * @see {@link IOBuffer#reset}
   * @return {IOBuffer}
   */
  mark () {
    this._mark = this.offset
    return this
  }

  /**
   * Move the pointer back to the last pointer offset set by mark
   * @see {@link IOBuffer#mark}
   * @return {IOBuffer}
   */
  reset () {
    this.offset = this._mark
    return this
  }

  /**
   * Push the current pointer offset to the mark stack
   * @see {@link IOBuffer#popMark}
   * @return {IOBuffer}
   */
  pushMark () {
    this._marks.push(this.offset)
    return this
  }

  /**
   * Pop the last pointer offset from the mark stack, and set the current pointer offset to the popped value
   * @see {@link IOBuffer#pushMark}
   * @return {IOBuffer}
   */
  popMark () {
    const offset = this._marks.pop()
    if (offset === undefined) throw new Error('Mark stack empty')
    this.seek(offset)
    return this
  }

  /**
   * Move the pointer offset back to 0
   * @return {IOBuffer}
   */
  rewind () {
    this.offset = 0
    return this
  }

  /**
   * Make sure the buffer has sufficient memory to write a given byteLength at the current pointer offset
   * If the buffer's memory is insufficient, this method will create a new buffer (a copy) with a length
   * that is twice (byteLength + current offset)
   * @param {number} [byteLength = 1]
   * @return {IOBuffer}
   */
  ensureAvailable (byteLength: number) {
    if (byteLength === undefined) byteLength = 1
    if (!this.available(byteLength)) {
      const lengthNeeded = this.offset + byteLength
      const newLength = lengthNeeded * 2
      const newArray = new Uint8Array(newLength)
      newArray.set(new Uint8Array(this.buffer))
      this.buffer = newArray.buffer
      this.length = this.byteLength = newLength
      this._data = new DataView(this.buffer)
    }
    return this
  }

  /**
   * Read a byte and return false if the byte's value is 0, or true otherwise
   * Moves pointer forward
   * @return {boolean}
   */
  readBoolean () {
    return this.readUint8() !== 0
  }

  /**
   * Read a signed 8-bit integer and move pointer forward
   * @return {number}
   */
  readInt8 () {
    return this._data.getInt8(this.offset++)
  }

  /**
   * Read an unsigned 8-bit integer and move pointer forward
   * @return {number}
   */
  readUint8 () {
    return this._data.getUint8(this.offset++)
  }

  /**
   * Alias for {@link IOBuffer#readUint8}
   * @return {number}
   */
  readByte () {
    return this.readUint8()
  }

  /**
   * Read n bytes and move pointer forward.
   * @param {number} n
   * @return {Uint8Array}
   */
  readBytes (n: number) {
    if (n === undefined) n = 1
    var bytes = new Uint8Array(n)
    for (var i = 0; i < n; i++) {
      bytes[i] = this.readByte()
    }
    return bytes
  }

  /**
   * Read a 16-bit signed integer and move pointer forward
   * @return {number}
   */
  readInt16 () {
    var value = this._data.getInt16(this.offset, this.littleEndian)
    this.offset += 2
    return value
  }

  /**
   * Read a 16-bit unsigned integer and move pointer forward
   * @return {number}
   */
  readUint16 () {
    var value = this._data.getUint16(this.offset, this.littleEndian)
    this.offset += 2
    return value
  }

  /**
   * Read a 32-bit signed integer and move pointer forward
   * @return {number}
   */
  readInt32 () {
    var value = this._data.getInt32(this.offset, this.littleEndian)
    this.offset += 4
    return value
  }

  /**
   * Read a 32-bit unsigned integer and move pointer forward
   * @return {number}
   */
  readUint32 () {
    var value = this._data.getUint32(this.offset, this.littleEndian)
    this.offset += 4
    return value
  }

  /**
   * Read a 32-bit floating number and move pointer forward
   * @return {number}
   */
  readFloat32 () {
    var value = this._data.getFloat32(this.offset, this.littleEndian)
    this.offset += 4
    return value
  }

  /**
   * Read a 64-bit floating number and move pointer forward
   * @return {number}
   */
  readFloat64 () {
    var value = this._data.getFloat64(this.offset, this.littleEndian)
    this.offset += 8
    return value
  }

  /**
   * Read 1-byte ascii character and move pointer forward
   * @return {string}
   */
  readChar () {
    return String.fromCharCode(this.readInt8())
  }

  /**
   * Read n 1-byte ascii characters and move pointer forward
   * @param {number} n
   * @return {string}
   */
  readChars (n = 1) {
    charArray.length = n
    for (var i = 0; i < n; i++) {
      charArray[i] = this.readChar()
    }
    return charArray.join('')
  }

  /**
   * Write 0xff if the passed value is truthy, 0x00 otherwise
   * @param {any} value
   * @return {IOBuffer}
   */
  writeBoolean (value = false) {
    this.writeUint8(value ? 0xff : 0x00)
    return this
  }

  /**
   * Write value as an 8-bit signed integer
   * @param {number} value
   * @return {IOBuffer}
   */
  writeInt8 (value: number) {
    this.ensureAvailable(1)
    this._data.setInt8(this.offset++, value)
    this._updateLastWrittenByte()
    return this
  }

  /**
   * Write value as a 8-bit unsigned integer
   * @param {number} value
   * @return {IOBuffer}
   */
  writeUint8 (value: number) {
    this.ensureAvailable(1)
    this._data.setUint8(this.offset++, value)
    this._updateLastWrittenByte()
    return this
  }

  /**
   * An alias for {@link IOBuffer#writeUint8}
   * @param {number} value
   * @return {IOBuffer}
   */
  writeByte (value: number) {
    return this.writeUint8(value)
  }

  /**
   * Write bytes
   * @param {Array|Uint8Array} bytes
   * @return {IOBuffer}
   */
  writeBytes (bytes: number[]|Uint8Array) {
    this.ensureAvailable(bytes.length)
    for (var i = 0; i < bytes.length; i++) {
      this._data.setUint8(this.offset++, bytes[i])
    }
    this._updateLastWrittenByte()
    return this
  }

  /**
   * Write value as an 16-bit signed integer
   * @param {number} value
   * @return {IOBuffer}
   */
  writeInt16 (value: number) {
    this.ensureAvailable(2)
    this._data.setInt16(this.offset, value, this.littleEndian)
    this.offset += 2
    this._updateLastWrittenByte()
    return this
  }

  /**
   * Write value as a 16-bit unsigned integer
   * @param {number} value
   * @return {IOBuffer}
   */
  writeUint16 (value: number) {
    this.ensureAvailable(2)
    this._data.setUint16(this.offset, value, this.littleEndian)
    this.offset += 2
    this._updateLastWrittenByte()
    return this
  }

  /**
   * Write a 32-bit signed integer at the current pointer offset
   * @param {number} value
   * @return {IOBuffer}
   */
  writeInt32 (value: number) {
    this.ensureAvailable(4)
    this._data.setInt32(this.offset, value, this.littleEndian)
    this.offset += 4
    this._updateLastWrittenByte()
    return this
  }

  /**
   * Write a 32-bit unsigned integer at the current pointer offset
   * @param {number} value - The value to set
   * @return {IOBuffer}
   */
  writeUint32 (value: number) {
    this.ensureAvailable(4)
    this._data.setUint32(this.offset, value, this.littleEndian)
    this.offset += 4
    this._updateLastWrittenByte()
    return this
  }

  /**
   * Write a 32-bit floating number at the current pointer offset
   * @param {number} value - The value to set
   * @return {IOBuffer}
   */
  writeFloat32 (value: number) {
    this.ensureAvailable(4)
    this._data.setFloat32(this.offset, value, this.littleEndian)
    this.offset += 4
    this._updateLastWrittenByte()
    return this
  }

  /**
   * Write a 64-bit floating number at the current pointer offset
   * @param {number} value
   * @return {IOBuffer}
   */
  writeFloat64 (value: number) {
    this.ensureAvailable(8)
    this._data.setFloat64(this.offset, value, this.littleEndian)
    this.offset += 8
    this._updateLastWrittenByte()
    return this
  }

  /**
   * Write the charCode of the passed string's first character to the current pointer offset
   * @param {string} str - The character to set
   * @return {IOBuffer}
   */
  writeChar (str: string) {
    return this.writeUint8(str.charCodeAt(0))
  }

  /**
   * Write the charCodes of the passed string's characters to the current pointer offset
   * @param {string} str
   * @return {IOBuffer}
   */
  writeChars (str: string) {
    for (var i = 0; i < str.length; i++) {
      this.writeUint8(str.charCodeAt(i))
    }
    return this
  }

  /**
   * Export a Uint8Array view of the internal buffer.
   * The view starts at the byte offset and its length
   * is calculated to stop at the last written byte or the original length.
   * @return {Uint8Array}
   */
  toArray () {
    return new Uint8Array(this.buffer, this.byteOffset, this._lastWrittenByte)
  }

  /**
   * Update the last written byte offset
   * @private
   */
  _updateLastWrittenByte () {
    if (this.offset > this._lastWrittenByte) {
      this._lastWrittenByte = this.offset
    }
  }
}

export default IOBuffer
