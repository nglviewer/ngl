/**
 * @file Globals
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { getBrowser, getQuery, boolean } from './utils'
import Registry from './utils/registry'
import _ColormakerRegistry from './color/colormaker-registry'
import _ParserRegistry from './parser/parser-registry'
import _WorkerRegistry from './worker/worker-registry'
import { MeasurementRepresentationParameters } from './representation/measurement-representation';

/**
 * The browser name: "Opera", "Chrome", "Firefox", "Mobile Safari",
 * "Internet Explorer", "Safari" or false.
 */
export const Browser = getBrowser()

/**
 * Flag indicating support for the 'passive' option for event handler
 */
export let SupportsPassiveEventHandler = false
try {
  // Test via a getter in the options object to see if the passive property is accessed
  const opts = Object.defineProperty({}, 'passive', {
    get: function () {
      SupportsPassiveEventHandler = true
    }
  })
  window.addEventListener('test', e => {}, opts)
} catch (e) {}

/**
 * Flag indicating a mobile browser
 */
export const Mobile = typeof window !== 'undefined' ? typeof window.orientation !== 'undefined' : false

export let SupportsReadPixelsFloat = false
export function setSupportsReadPixelsFloat (value: boolean) {
  SupportsReadPixelsFloat = value
}

/**
 * Flag indicating support for the `EXT_frag_depth` WebGL extension
 * (Always present in WebGL2)
 */
export let ExtensionFragDepth = false
export function setExtensionFragDepth (value: boolean) {
  ExtensionFragDepth = value
}

export const Log = {
  log: Function.prototype.bind.call(console.log, console),
  info: Function.prototype.bind.call(console.info, console),
  warn: Function.prototype.bind.call(console.warn, console),
  error: Function.prototype.bind.call(console.error, console),
  time: Function.prototype.bind.call(console.time, console),
  timeEnd: Function.prototype.bind.call(console.timeEnd, console)
}

export let MeasurementDefaultParams: Partial<MeasurementRepresentationParameters> = {
  color: 'green',
  labelColor: 0x808080,
  labelAttachment: 'bottom-center',
  labelSize: 0.7,
  labelZOffset: 0.5,
  labelYOffset: 0.1,
  labelBorder: true,
  labelBorderColor: 0xd3d3d3,
  labelBorderWidth: 0.25,
  lineOpacity: 0.8,
  linewidth: 5.0,
  opacity: 0.6,

  labelUnit: 'angstrom',
  arcVisible: true,
  planeVisible: false
}
export function setMeasurementDefaultParams (params = {}) {
  Object.assign(MeasurementDefaultParams, params)
}

export let Debug = boolean(getQuery('debug'))
export function setDebug (value: boolean) {
  Debug = value
}

export const WebglErrorMessage = '<div style="display:flex;align-items:center;justify-content:center;height:100%;"><p style="padding:15px;text-align:center;">Your browser/graphics card does not seem to support <a target="_blank" href="https://en.wikipedia.org/wiki/WebGL">WebGL</a>.<br/><br/>Find out how to get it <a target="_blank" href="http://get.webgl.org/">here</a>.</p></div>'

/**
 * List of file extensions to be recognized as scripts
 */
export const ScriptExtensions = [ 'ngl', 'js' ]

export const WorkerRegistry = new _WorkerRegistry()
export const ColormakerRegistry = new _ColormakerRegistry()
export const DatasourceRegistry = new Registry('datasource')
export const RepresentationRegistry = new Registry('representatation')
export const ParserRegistry = new _ParserRegistry()
export const ShaderRegistry = new Registry('shader')
export const DecompressorRegistry = new Registry('decompressor')
export const ComponentRegistry = new Registry('component')
export const BufferRegistry = new Registry('buffer')
export const PickerRegistry = new Registry('picker')

export let ListingDatasource: any
export function setListingDatasource (value: boolean) {
  ListingDatasource = value
}

export let TrajectoryDatasource: any
export function setTrajectoryDatasource (value: boolean) {
  TrajectoryDatasource = value
}
