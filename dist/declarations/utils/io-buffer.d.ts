/**
 * @file IO Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 *
 * Adapted and converted to TypeScript from https://github.com/image-js/iobuffer
 * MIT License, Copyright (c) 2015 Michaël Zasso
 */
import { TypedArray } from '../types';
export interface IOBufferParameters {
    offset?: number;
}
/**
 * Class for writing and reading binary data
 */
declare class IOBuffer {
    private _lastWrittenByte;
    private _mark;
    private _marks;
    private _data;
    offset: number;
    littleEndian: boolean;
    buffer: ArrayBuffer;
    length: number;
    byteLength: number;
    byteOffset: number;
    /**
     * If it's a number, it will initialize the buffer with the number as
     * the buffer's length. If it's undefined, it will initialize the buffer
     * with a default length of 8 Kb. If its an ArrayBuffer, a TypedArray,
     * it will create a view over the underlying ArrayBuffer.
     */
    constructor(data: number | ArrayBuffer | TypedArray, params?: IOBufferParameters);
    /**
     * Checks if the memory allocated to the buffer is sufficient to store more bytes after the offset
     * @param {number} [byteLength=1] The needed memory in bytes
     * @return {boolean} Returns true if there is sufficient space and false otherwise
     */
    available(byteLength: number): boolean;
    /**
     * Check if little-endian mode is used for reading and writing multi-byte values
     * @return {boolean} Returns true if little-endian mode is used, false otherwise
     */
    isLittleEndian(): boolean;
    /**
     * Set little-endian mode for reading and writing multi-byte values
     * @return {IOBuffer}
     */
    setLittleEndian(): this;
    /**
     * Check if big-endian mode is used for reading and writing multi-byte values
     * @return {boolean} Returns true if big-endian mode is used, false otherwise
     */
    isBigEndian(): boolean;
    /**
     * Switches to big-endian mode for reading and writing multi-byte values
     * @return {IOBuffer}
     */
    setBigEndian(): this;
    /**
     * Move the pointer n bytes forward
     * @param {number} n
     * @return {IOBuffer}
     */
    skip(n: number): this;
    /**
     * Move the pointer to the given offset
     * @param {number} offset
     * @return {IOBuffer}
     */
    seek(offset: number): this;
    /**
     * Store the current pointer offset.
     * @see {@link IOBuffer#reset}
     * @return {IOBuffer}
     */
    mark(): this;
    /**
     * Move the pointer back to the last pointer offset set by mark
     * @see {@link IOBuffer#mark}
     * @return {IOBuffer}
     */
    reset(): this;
    /**
     * Push the current pointer offset to the mark stack
     * @see {@link IOBuffer#popMark}
     * @return {IOBuffer}
     */
    pushMark(): this;
    /**
     * Pop the last pointer offset from the mark stack, and set the current pointer offset to the popped value
     * @see {@link IOBuffer#pushMark}
     * @return {IOBuffer}
     */
    popMark(): this;
    /**
     * Move the pointer offset back to 0
     * @return {IOBuffer}
     */
    rewind(): this;
    /**
     * Make sure the buffer has sufficient memory to write a given byteLength at the current pointer offset
     * If the buffer's memory is insufficient, this method will create a new buffer (a copy) with a length
     * that is twice (byteLength + current offset)
     * @param {number} [byteLength = 1]
     * @return {IOBuffer}
     */
    ensureAvailable(byteLength: number): this;
    /**
     * Read a byte and return false if the byte's value is 0, or true otherwise
     * Moves pointer forward
     * @return {boolean}
     */
    readBoolean(): boolean;
    /**
     * Read a signed 8-bit integer and move pointer forward
     * @return {number}
     */
    readInt8(): number;
    /**
     * Read an unsigned 8-bit integer and move pointer forward
     * @return {number}
     */
    readUint8(): number;
    /**
     * Alias for {@link IOBuffer#readUint8}
     * @return {number}
     */
    readByte(): number;
    /**
     * Read n bytes and move pointer forward.
     * @param {number} n
     * @return {Uint8Array}
     */
    readBytes(n: number): Uint8Array;
    /**
     * Read a 16-bit signed integer and move pointer forward
     * @return {number}
     */
    readInt16(): number;
    /**
     * Read a 16-bit unsigned integer and move pointer forward
     * @return {number}
     */
    readUint16(): number;
    /**
     * Read a 32-bit signed integer and move pointer forward
     * @return {number}
     */
    readInt32(): number;
    /**
     * Read a 32-bit unsigned integer and move pointer forward
     * @return {number}
     */
    readUint32(): number;
    /**
     * Read a 32-bit floating number and move pointer forward
     * @return {number}
     */
    readFloat32(): number;
    /**
     * Read a 64-bit floating number and move pointer forward
     * @return {number}
     */
    readFloat64(): number;
    /**
     * Read 1-byte ascii character and move pointer forward
     * @return {string}
     */
    readChar(): string;
    /**
     * Read n 1-byte ascii characters and move pointer forward
     * @param {number} n
     * @return {string}
     */
    readChars(n?: number): string;
    /**
     * Write 0xff if the passed value is truthy, 0x00 otherwise
     * @param {any} value
     * @return {IOBuffer}
     */
    writeBoolean(value?: boolean): this;
    /**
     * Write value as an 8-bit signed integer
     * @param {number} value
     * @return {IOBuffer}
     */
    writeInt8(value: number): this;
    /**
     * Write value as a 8-bit unsigned integer
     * @param {number} value
     * @return {IOBuffer}
     */
    writeUint8(value: number): this;
    /**
     * An alias for {@link IOBuffer#writeUint8}
     * @param {number} value
     * @return {IOBuffer}
     */
    writeByte(value: number): this;
    /**
     * Write bytes
     * @param {Array|Uint8Array} bytes
     * @return {IOBuffer}
     */
    writeBytes(bytes: number[] | Uint8Array): this;
    /**
     * Write value as an 16-bit signed integer
     * @param {number} value
     * @return {IOBuffer}
     */
    writeInt16(value: number): this;
    /**
     * Write value as a 16-bit unsigned integer
     * @param {number} value
     * @return {IOBuffer}
     */
    writeUint16(value: number): this;
    /**
     * Write a 32-bit signed integer at the current pointer offset
     * @param {number} value
     * @return {IOBuffer}
     */
    writeInt32(value: number): this;
    /**
     * Write a 32-bit unsigned integer at the current pointer offset
     * @param {number} value - The value to set
     * @return {IOBuffer}
     */
    writeUint32(value: number): this;
    /**
     * Write a 32-bit floating number at the current pointer offset
     * @param {number} value - The value to set
     * @return {IOBuffer}
     */
    writeFloat32(value: number): this;
    /**
     * Write a 64-bit floating number at the current pointer offset
     * @param {number} value
     * @return {IOBuffer}
     */
    writeFloat64(value: number): this;
    /**
     * Write the charCode of the passed string's first character to the current pointer offset
     * @param {string} str - The character to set
     * @return {IOBuffer}
     */
    writeChar(str: string): this;
    /**
     * Write the charCodes of the passed string's characters to the current pointer offset
     * @param {string} str
     * @return {IOBuffer}
     */
    writeChars(str: string): this;
    /**
     * Export a Uint8Array view of the internal buffer.
     * The view starts at the byte offset and its length
     * is calculated to stop at the last written byte or the original length.
     * @return {Uint8Array}
     */
    toArray(): Uint8Array;
    /**
     * Update the last written byte offset
     * @private
     */
    _updateLastWrittenByte(): void;
}
export default IOBuffer;
