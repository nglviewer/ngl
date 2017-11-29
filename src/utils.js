/**
 * @file Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector2, Vector3, Matrix4, Quaternion } from '../lib/three.es6.js'

import { DecompressorRegistry } from './globals.js'

function getQuery (id) {
  if (typeof window === 'undefined') return undefined

  var a = new RegExp(`${id}=([^&#=]*)`)
  var m = a.exec(window.location.search)

  if (m) {
    return decodeURIComponent(m[1])
  } else {
    return undefined
  }
}

function boolean (value) {
  if (!value) {
    return false
  }

  if (typeof value === 'string') {
    return /^1|true|t|yes|y$/i.test(value)
  }

  return true
}

function defaults (value, defaultValue) {
  return value !== undefined ? value : defaultValue
}

function pick (object) {
  var properties = [].slice.call(arguments, 1)
  return properties.reduce((a, e) => {
    a[ e ] = object[ e ]
    return a
  }, {})
}

function flatten (array, ret) {
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

function getProtocol () {
  var protocol = window.location.protocol
  return protocol.match(/http(s)?:/gi) === null ? 'http:' : protocol
}

function getBrowser () {
  if (typeof window === 'undefined') return false

  var ua = window.navigator.userAgent

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

function getAbsolutePath (relativePath) {
  var loc = window.location
  var pn = loc.pathname
  var basePath = pn.substring(0, pn.lastIndexOf('/') + 1)

  return loc.origin + basePath + relativePath
}

function deepCopy (src) {
  if (typeof src !== 'object') {
    return src
  }

  var dst = Array.isArray(src) ? [] : {}

  for (var key in src) {
    dst[ key ] = deepCopy(src[ key ])
  }

  return dst
}

function download (data, downloadName) {
  // using ideas from https://github.com/eligrey/FileSaver.js/blob/master/FileSaver.js

  if (!data) return

  downloadName = downloadName || 'download'

  var isSafari = getBrowser() === 'Safari'
  var isChromeIos = /CriOS\/[\d]+/.test(window.navigator.userAgent)

  var a = document.createElement('a')

  function openUrl (url) {
    var opened = window.open(url, '_blank')
    if (!opened) {
      window.location.href = url
    }
  }

  function open (str) {
    openUrl(isChromeIos ? str : str.replace(/^data:[^;]*;/, 'data:attachment/file;'))
  }

  if (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob) {
    // native saveAs in IE 10+
    navigator.msSaveOrOpenBlob(data, downloadName)
  } else if ((isSafari || isChromeIos) && window.FileReader) {
    if (data instanceof window.Blob) {
      // no downloading of blob urls in Safari
      var reader = new window.FileReader()
      reader.onloadend = function () {
        open(reader.result)
      }
      reader.readAsDataURL(data)
    } else {
      open(data)
    }
  } else {
    if (data instanceof window.Blob) {
      data = window.URL.createObjectURL(data)
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

    if (data instanceof window.Blob) {
      window.URL.revokeObjectURL(data)
    }
  }
}

function submit (url, data, callback, onerror) {
  if (data instanceof window.FormData) {
    var xhr = new window.XMLHttpRequest()
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
  } else {
    throw new Error('submit: data must be a FormData instance.')
  }
}

function open (callback, extensionList) {
  extensionList = extensionList || [ '*' ]

  var fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.multiple = true
  fileInput.style.display = 'hidden'
  document.body.appendChild(fileInput)
  fileInput.accept = '.' + extensionList.join(',.')
  fileInput.addEventListener('change', function (e) {
    callback(e.target.files)
  }, false)

  fileInput.click()
}

function getFileInfo (file) {
  var compressedExtList = DecompressorRegistry.names

  var path, compressed, protocol

  if ((typeof window !== 'undefined' && file instanceof window.File) ||
      (typeof window !== 'undefined' && file instanceof window.Blob)
  ) {
    path = file.name || ''
  } else {
    path = file
  }
  var queryIndex = path.lastIndexOf('?')
  var query = queryIndex !== -1 ? path.substring(queryIndex) : ''
  path = path.substring(0, queryIndex === -1 ? path.length : queryIndex)

  var name = path.replace(/^.*[\\/]/, '')
  var base = name.substring(0, name.lastIndexOf('.'))

  var nameSplit = name.split('.')
  var ext = nameSplit.length > 1 ? nameSplit.pop().toLowerCase() : ''

  var protocolMatch = path.match(/^(.+):\/\/(.+)$/)
  if (protocolMatch) {
    protocol = protocolMatch[ 1 ].toLowerCase()
    path = protocolMatch[ 2 ]
  }

  var dir = path.substring(0, path.lastIndexOf('/') + 1)

  if (compressedExtList.includes(ext)) {
    compressed = ext
    var n = path.length - ext.length - 1
    ext = path.substr(0, n).split('.').pop().toLowerCase()
    var m = base.length - ext.length - 1
    base = base.substr(0, m)
  } else {
    compressed = false
  }

  return {
    'path': path,
    'name': name,
    'ext': ext,
    'base': base,
    'dir': dir,
    'compressed': compressed,
    'protocol': protocol,
    'src': file,
    'query': query
  }
}

function throttle (func, wait, options) {
  // from http://underscorejs.org/docs/underscore.html

  var context, args, result
  var timeout = null
  var previous = 0

  if (!options) options = {}

  var later = function () {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }

  return function throttle () {
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

function lexicographicCompare (elm1, elm2) {
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
function binarySearchIndexOf (array, element, compareFunction = lexicographicCompare) {
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

function binarySearchForLeftRange (array, leftRange) {
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

function binarySearchForRightRange (array, rightRange) {
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

function rangeInSortedArray (array, min, max) {
  const indexLeft = binarySearchForLeftRange(array, min)
  const indexRight = binarySearchForRightRange(array, max)
  if (indexLeft === -1 || indexRight === -1 || indexLeft > indexRight) {
    return 0
  } else {
    return indexRight - indexLeft + 1
  }
}

function dataURItoImage (dataURI) {
  if (typeof importScripts !== 'function') {
    var img = document.createElement('img')
    img.src = dataURI
    return img
  }
}

function uniqueArray (array) {
  return array.sort().filter(function (value, index, sorted) {
    return (index === 0) || (value !== sorted[ index - 1 ])
  })
}

// String/arraybuffer conversion

function uint8ToString (u8a) {
  var chunkSize = 0x7000

  if (u8a.length > chunkSize) {
    var c = []

    for (var i = 0; i < u8a.length; i += chunkSize) {
      c.push(String.fromCharCode.apply(
        null, u8a.subarray(i, i + chunkSize)
      ))
    }

    return c.join('')
  } else {
    return String.fromCharCode.apply(null, u8a)
  }
}

function uint8ToLines (u8a, chunkSize, newline) {
  chunkSize = chunkSize !== undefined ? chunkSize : 1024 * 1024 * 10
  newline = newline !== undefined ? newline : '\n'

  var partialLine = ''
  var lines = []

  for (var i = 0; i < u8a.length; i += chunkSize) {
    var str = uint8ToString(u8a.subarray(i, i + chunkSize))
    var idx = str.lastIndexOf(newline)

    if (idx === -1) {
      partialLine += str
    } else {
      var str2 = partialLine + str.substr(0, idx)
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

function getTypedArray (arrayType, arraySize) {
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

function getUintArray (sizeOrArray, maxUnit) {
  const TypedArray = maxUnit > 65535 ? Uint32Array : Uint16Array
  return new TypedArray(sizeOrArray)
}

function ensureArray (value) {
  return Array.isArray(value) ? value : [value]
}

function ensureBuffer (a) {
  return (a.buffer && a.buffer instanceof ArrayBuffer) ? a.buffer : a
}

function _ensureClassFromArg (arg, constructor) {
  return arg instanceof constructor ? arg : new constructor(arg)
}

function _ensureClassFromArray (array, constructor) {
  if (array === undefined) {
    array = new constructor()
  } else if (Array.isArray(array)) {
    array = new constructor().fromArray(array)
  }
  return array
}

function ensureVector2 (v) {
  return _ensureClassFromArray(v, Vector2)
}

function ensureVector3 (v) {
  return _ensureClassFromArray(v, Vector3)
}

function ensureMatrix4 (m) {
  return _ensureClassFromArray(m, Matrix4)
}

function ensureQuaternion (q) {
  return _ensureClassFromArray(q, Quaternion)
}

function ensureFloat32Array (a) {
  return _ensureClassFromArg(a, Float32Array)
}

export {
  getQuery,
  boolean,
  defaults,
  pick,
  flatten,
  getProtocol,
  getBrowser,
  getAbsolutePath,
  deepCopy,
  download,
  submit,
  open,
  getFileInfo,
  throttle,
  binarySearchIndexOf,
  rangeInSortedArray,
  dataURItoImage,
  uniqueArray,
  uint8ToString,
  uint8ToLines,
  getTypedArray,
  getUintArray,
  ensureArray,
  ensureBuffer,
  ensureVector2,
  ensureVector3,
  ensureMatrix4,
  ensureQuaternion,
  ensureFloat32Array
}
