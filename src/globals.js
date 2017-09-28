/**
 * @file Globals
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { getBrowser, getQuery, boolean } from './utils.js'
import Registry from './utils/registry.js'
import _ColormakerRegistry from './color/colormaker-registry.js'
import _ParserRegistry from './parser/parser-registry.js'
import _WorkerRegistry from './worker/worker-registry.js'

/**
 * The browser name: "Opera", "Chrome", "Firefox", "Mobile Safari",
 * "Internet Explorer", "Safari" or false.
 * @type {String|false}
 */
const Browser = getBrowser()

/**
 * Flag indicating support for the 'passive' option for event handler
 * @type {Boolean}
 */
let SupportsPassiveEventHandler = false
try {
  // Test via a getter in the options object to see if the passive property is accessed
  const opts = Object.defineProperty({}, 'passive', {
    get: function () {
      SupportsPassiveEventHandler = true
    }
  })
  window.addEventListener('test', null, opts)
} catch (e) {}

/**
 * Flag indicating a mobile browser
 * @type {Boolean}
 */
const Mobile = typeof window !== 'undefined' ? typeof window.orientation !== 'undefined' : false

let SupportsReadPixelsFloat = false
function setSupportsReadPixelsFloat (value) {
  SupportsReadPixelsFloat = value
}

/**
 * Flag indicating support for the `EXT_frag_depth` WebGL extension
 * @type {Boolean}
 */
let ExtensionFragDepth = false
function setExtensionFragDepth (value) {
  ExtensionFragDepth = value
}

const Log = {
  log: Function.prototype.bind.call(console.log, console),
  info: Function.prototype.bind.call(console.info, console),
  warn: Function.prototype.bind.call(console.warn, console),
  error: Function.prototype.bind.call(console.error, console),
  time: Function.prototype.bind.call(console.time, console),
  timeEnd: Function.prototype.bind.call(console.timeEnd, console)
}

let Debug = boolean(getQuery('debug'))
function setDebug (value) {
  Debug = value
}

const WebglErrorMessage = '<div style="display:flex;align-items:center;justify-content:center;height:100%;"><p style="padding:15px;text-align:center;">Your browser/graphics card does not seem to support <a target="_blank" href="https://en.wikipedia.org/wiki/WebGL">WebGL</a>.<br/><br/>Find out how to get it <a target="_blank" href="http://get.webgl.org/">here</a>.</p></div>'

/**
 * List of file extensions to be recognized as scripts
 * @type {String[]}
 */
const ScriptExtensions = [ 'ngl', 'js' ]

const WorkerRegistry = new _WorkerRegistry()
/**
 * Global instance of {@link src/color/colormaker-registry.js~ColormakerRegistry}
 * @type {src/color/colormaker-registry.js~ColormakerRegistry}
 */
const ColormakerRegistry = new _ColormakerRegistry()
const DatasourceRegistry = new Registry('datasource')
const RepresentationRegistry = new Registry('representatation')
const ParserRegistry = new _ParserRegistry()
const ShaderRegistry = new Registry('shader')
const DecompressorRegistry = new Registry('decompressor')
const ComponentRegistry = new Registry('component')
const BufferRegistry = new Registry('buffer')
const PickerRegistry = new Registry('picker')

export {
  Browser,
  Mobile,
  SupportsPassiveEventHandler,
  SupportsReadPixelsFloat,
  setSupportsReadPixelsFloat,
  ExtensionFragDepth,
  setExtensionFragDepth,
  Log,
  Debug,
  setDebug,
  WebglErrorMessage,
  ScriptExtensions,
  WorkerRegistry,
  ColormakerRegistry,
  DatasourceRegistry,
  RepresentationRegistry,
  ParserRegistry,
  ShaderRegistry,
  DecompressorRegistry,
  ComponentRegistry,
  BufferRegistry,
  PickerRegistry
}
