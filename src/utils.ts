/**
 * @file Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector2, Vector3, Matrix4, Quaternion } from 'three'

export function getQuery (id: string) {
  if (typeof window === 'undefined') return undefined

  const a = new RegExp(`${id}=([^&#=]*)`)
  const m = a.exec(window.location.search)

  if (m) {
    return decodeURIComponent(m[1])
  } else {
    return undefined
  }
}

export function boolean (value: any) {
  if (!value) {
    return false
  }

  if (typeof value === 'string') {
    return /^1|true|t|yes|y$/i.test(value)
  }

  return true
}

export function defaults (value: any, defaultValue: any) {
  return value !== undefined ? value : defaultValue
}

export function createParams<T> (params: {[k in keyof T]?: any}, defaultParams: T) {
  const o: any = Object.assign({}, params)
  for (const k in defaultParams) {
    const value = params[k]
    if (value === undefined) o[k] = defaultParams[k]
  }
  return o as T
}

export function updateParams<T> (params: T, newParams: {[k in keyof T]?: any}) {
  for (const k in newParams) {
    const value = newParams[k]
    if (value !== undefined) params[k] = value
  }
  return params as T
}

export function pick (object: { [index: string]: any }) {
  const properties = [].slice.call(arguments, 1)
  return properties.reduce((a: { [index: string]: any }, e: any) => {
    a[ e ] = object[ e ]
    return a
  }, {})
}

export function flatten (array: any[], ret: any[]) {
  ret = defaults(ret, [])
  for (let i = 0; i < array.length; i++) {
    if (Array.isArray(array[i])) {
      flatten(array[i], ret)
    } else {
      ret.push(array[i])
    }
  }
  return ret
}

export function getProtocol () {
  const protocol = window.location.protocol
  return protocol.match(/http(s)?:/gi) === null ? 'http:' : protocol
}

export function getBrowser () {
  if (typeof window === 'undefined') return false

  const ua = window.navigator.userAgent

  if (/Opera|OPR/.test(ua)) {
    return 'Opera'
  } else if (/Chrome/i.test(ua)) {
    return 'Chrome'
  } else if (/Firefox/i.test(ua)) {
    return 'Firefox'
  } else if (/Mobile(\/.*)? Safari/i.test(ua)) {
    return 'Mobile Safari'
  } else if (/MSIE/i.test(ua)) {
    return 'Internet Explorer'
  } else if (/Safari/i.test(ua)) {
    return 'Safari'
  }

  return false
}

export function getAbsolutePath (relativePath: string) {
  const loc = window.location
  const pn = loc.pathname
  const basePath = pn.substring(0, pn.lastIndexOf('/') + 1)

  return loc.origin + basePath + relativePath
}

export function deepCopy (src: any) {
  if (typeof src !== 'object') {
    return src
  }

  const dst: { [index: string]: any } = Array.isArray(src) ? [] : {}

  for (let key in src) {
    dst[ key ] = deepCopy(src[ key ])
  }

  return dst
}

export function deepEqual(a: any, b: any) {
  // from https://github.com/epoberezkin/fast-deep-equal MIT
  if (a === b) return true;

  const arrA = Array.isArray(a)
  const arrB = Array.isArray(b)

  if (arrA && arrB) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }

  if (arrA !== arrB) return false

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false;

    const dateA = a instanceof Date
    const dateB = b instanceof Date
    if (dateA && dateB) return a.getTime() === b.getTime()
    if (dateA !== dateB) return false

    const regexpA = a instanceof RegExp
    const regexpB = b instanceof RegExp
    if (regexpA && regexpB) return a.toString() === b.toString()
    if (regexpA !== regexpB) return false

    for (let i = 0; i < keys.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false
    }

    for (let i = 0; i < keys.length; i++) {
      if(!deepEqual(a[keys[i]], b[keys[i]])) return false
    }

    return true
  }

  return false
}

function openUrl (url: string) {
  const opened = window.open(url, '_blank')
  if (!opened) {
    window.location.href = url
  }
}

export function download (data: Blob|string, downloadName = 'download') {
  // using ideas from https://github.com/eligrey/FileSaver.js/blob/master/FileSaver.js

  if (!data) return

  const isSafari = getBrowser() === 'Safari'
  const isChromeIos = /CriOS\/[\d]+/.test(window.navigator.userAgent)

  const a = document.createElement('a')

  function open (str: string) {
    openUrl(isChromeIos ? str : str.replace(/^data:[^;]*;/, 'data:attachment/file;'))
  }

  if (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob) {
    // native saveAs in IE 10+
    navigator.msSaveOrOpenBlob(data, downloadName)
  } else if ((isSafari || isChromeIos) && FileReader) {
    if (data instanceof Blob) {
      // no downloading of blob urls in Safari
      var reader = new FileReader()
      reader.onloadend = function () {
        open(reader.result as string)
      }
      reader.readAsDataURL(data)
    } else {
      open(data)
    }
  } else {
    let objectUrlCreated = false
    if (data instanceof Blob) {
      data = URL.createObjectURL(data)
      objectUrlCreated = true
    }

    if ('download' in a) {
      // download link available
      a.style.display = 'hidden'
      document.body.appendChild(a)
      a.href = data
      a.download = downloadName
      a.target = '_blank'
      a.click()
      document.body.removeChild(a)
    } else {
      openUrl(data)
    }

    if (objectUrlCreated) {
      window.URL.revokeObjectURL(data)
    }
  }
}

export function submit (url: string, data: FormData, callback: Function, onerror: Function) {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', url)

  xhr.addEventListener('load', function () {
    if (xhr.status === 200 || xhr.status === 304) {
      callback(xhr.response)
    } else {
      if (typeof onerror === 'function') {
        onerror(xhr.status)
      }
    }
  }, false)

  xhr.send(data)
}

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

export function open (callback: Function, extensionList = ['*']) {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.multiple = true
  fileInput.style.display = 'hidden'
  document.body.appendChild(fileInput)
  fileInput.accept = '.' + extensionList.join(',.')
  fileInput.addEventListener('change', function (e: HTMLInputEvent) {
    callback(e.target.files)
  }, false)

  fileInput.click()
}

export function throttle (func: Function, wait: number, options: { leading?: boolean, trailing?: boolean }) {
  // from http://underscorejs.org/docs/underscore.html

  let context: any
  let args: any
  let result: any
  let timeout: any = null
  let previous = 0

  if (!options) options = {}

  function later () {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }

  return function throttle (this: any) {
    var now = Date.now()
    if (!previous && options.leading === false) previous = now
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }

    return result
  }
}

export function lexicographicCompare<T> (elm1: T, elm2: T) {
  if (elm1 < elm2) return -1
  if (elm1 > elm2) return 1
  return 0
}

/**
 * Does a binary search to get the index of an element in the input array
 * @function
 * @example
 * var array = [ 1, 2, 3, 4, 5, 6 ];
 * var element = 4;
 * binarySearchIndexOf( array, element );  // returns 3
 *
 * @param {Array} array - sorted array
 * @param {Anything} element - element to search for in the array
 * @param {Function} [compareFunction] - compare function
 * @return {Number} the index of the element or -1 if not in the array
 */
export function binarySearchIndexOf<T> (array: T[], element: T, compareFunction = lexicographicCompare) {
  let low = 0
  let high = array.length - 1
  while (low <= high) {
    const mid = (low + high) >> 1
    const cmp = compareFunction(element, array[ mid ])
    if (cmp > 0) {
      low = mid + 1
    } else if (cmp < 0) {
      high = mid - 1
    } else {
      return mid
    }
  }
  return -low - 1
}

export function binarySearchForLeftRange (array: number[], leftRange: number) {
  let high = array.length - 1
  if (array[ high ] < leftRange) return -1
  let low = 0
  while (low <= high) {
    const mid = (low + high) >> 1
    if (array[ mid ] >= leftRange) {
      high = mid - 1
    } else {
      low = mid + 1
    }
  }
  return high + 1
}

export function binarySearchForRightRange (array: number[], rightRange: number) {
  if (array[ 0 ] > rightRange) return -1
  let low = 0
  let high = array.length - 1
  while (low <= high) {
    const mid = (low + high) >> 1
    if (array[ mid ] > rightRange) {
      high = mid - 1
    } else {
      low = mid + 1
    }
  }
  return low - 1
}

export function rangeInSortedArray (array: number[], min: number, max: number) {
  const indexLeft = binarySearchForLeftRange(array, min)
  const indexRight = binarySearchForRightRange(array, max)
  if (indexLeft === -1 || indexRight === -1 || indexLeft > indexRight) {
    return 0
  } else {
    return indexRight - indexLeft + 1
  }
}

export function dataURItoImage (dataURI: string) {
  const img = document.createElement('img')
  img.src = dataURI
  return img
}

export function uniqueArray (array: any[]) {
  return array.sort().filter(function (value, index, sorted) {
    return (index === 0) || (value !== sorted[ index - 1 ])
  })
}

// String/arraybuffer conversion

export function uint8ToString (u8a: Uint8Array) {
  const chunkSize = 0x7000

  if (u8a.length > chunkSize) {
    const c = []

    for (let i = 0; i < u8a.length; i += chunkSize) {
      c.push(String.fromCharCode.apply(
        null, u8a.subarray(i, i + chunkSize)
      ))
    }

    return c.join('')
  } else {
    return String.fromCharCode.apply(null, u8a)
  }
}

export function uint8ToLines (u8a: Uint8Array, chunkSize = 1024 * 1024 * 10, newline = '\n') {
  let partialLine = ''
  let lines: string[] = []

  for (let i = 0; i < u8a.length; i += chunkSize) {
    const str = uint8ToString(u8a.subarray(i, i + chunkSize))
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
  }

  if (partialLine !== '') {
    lines.push(partialLine)
  }

  return lines
}

export type TypedArrayString = 'int8'|'int16'|'int32'|'uint8'|'uint16'|'uint32'|'float32'
export function getTypedArray (arrayType: TypedArrayString, arraySize: number) {
  switch (arrayType) {
    case 'int8':
      return new Int8Array(arraySize)
    case 'int16':
      return new Int16Array(arraySize)
    case 'int32':
      return new Int32Array(arraySize)
    case 'uint8':
      return new Uint8Array(arraySize)
    case 'uint16':
      return new Uint16Array(arraySize)
    case 'uint32':
      return new Uint32Array(arraySize)
    case 'float32':
      return new Float32Array(arraySize)
    default:
      throw new Error('arrayType unknown: ' + arrayType)
  }
}

export function getUintArray (sizeOrArray: any, maxUint: number) {  // TODO
  const TypedArray = maxUint > 65535 ? Uint32Array : Uint16Array
  return new TypedArray(sizeOrArray)
}

export function ensureArray (value: any) {
  return Array.isArray(value) ? value : [value]
}

export function ensureBuffer (a: any) {  // TODO
  return (a.buffer && a.buffer instanceof ArrayBuffer) ? a.buffer : a
}

function _ensureClassFromArg (arg: any, constructor: { new (arg: any): any }) {
  return arg instanceof constructor ? arg : new constructor(arg)
}

function _ensureClassFromArray (array: any, constructor: { new (): any }) {
  if (array === undefined) {
    array = new constructor()
  } else if (Array.isArray(array)) {
    array = new constructor().fromArray(array)
  }
  return array
}

export function ensureVector2 (v?: number[]|Vector2) {
  return _ensureClassFromArray(v, Vector2)
}

export function ensureVector3 (v?: number[]|Vector3) {
  return _ensureClassFromArray(v, Vector3)
}

export function ensureMatrix4 (m?: number[]|Matrix4) {
  return _ensureClassFromArray(m, Matrix4)
}

export function ensureQuaternion (q?: number[]|Quaternion) {
  return _ensureClassFromArray(q, Quaternion)
}

export function ensureFloat32Array (a?: number[]|Float32Array) {
  return _ensureClassFromArg(a, Float32Array)
}

export interface RingBuffer<T> {
  has: (value: T) => boolean
  get: (value: number) => T
  push: (value: T) => void
  count: number
  data: T[]
  clear: () => void
}

export function createRingBuffer<T> (length: number): RingBuffer<T> {
  let pointer = 0
  let count = 0
  const buffer: T[] = []

  return {
    has: function (value: any) { return buffer.indexOf(value) !== -1 },
    get: function (idx: number) { return buffer[idx] },
    push: function (item: any) {
      buffer[pointer] = item
      pointer = (length + pointer + 1) % length
      ++count
    },
    get count () { return count },
    get data () { return buffer.slice(0, Math.min(count, length)) },
    clear: function () {
      count = 0
      pointer = 0
      buffer.length = 0
    }
  }
}

export interface SimpleDict<K, V> {
  has: (k: K) => boolean
  add: (k: K, v: V) => void
  del: (k: K) => void
  values: V[]
}

export function createSimpleDict<K, V> (): SimpleDict<K, V> {
  const set: { [k: string]: V } = {}

  return {
    has: function (k: K) { return set[JSON.stringify(k)] !== undefined },
    add: function (k: K, v: V) { set[JSON.stringify(k)] = v },
    del: function (k: K) { delete set[JSON.stringify(k)] },
    get values () { return Object.keys(set).map(k => set[k]) }
  }
}

export interface SimpleSet<T> {
  has: (value: T) => boolean
  add: (value: T) => void
  del: (value: T) => void
  list: T[]
}

export function createSimpleSet<T> (): SimpleSet<T> {
  const set: { [k: string]: T } = {}

  return {
    has: function (v: T) { return set[JSON.stringify(v)] !== undefined },
    add: function (v: T) { set[JSON.stringify(v)] = v },
    del: function (v: T) { delete set[JSON.stringify(v)] },
    get list () { return Object.keys(set).map(k => set[k]) },
  }
}
