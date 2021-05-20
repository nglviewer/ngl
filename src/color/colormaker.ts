/**
 * @file Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3, Color } from 'three'
import * as chroma from 'chroma-js'

import { createParams } from '../utils'
import { NumberArray, Partial } from '../types'
import Structure from '../structure/structure'
import Surface from '../surface/surface'
import Volume from '../surface/volume'
import AtomProxy from '../proxy/atom-proxy'
import BondProxy from '../proxy/bond-proxy'

export type ColorMode = 'rgb'|'hsv'|'hsl'|'hsi'|'lab'|'hcl'
export type ColorSpace = 'sRGB' | 'linear'

/**
 * Internal color space for all colors (global).
 * Colors are always specified as sRGB; if this is set to
 * 'linear' then colors get linearized when used internally
 * as vertex or texture colors.
 * @see setColorSpace/getColorSpace.
 */
var colorSpace: ColorSpace = 'sRGB' // default: don't linearize

/** Set the global internal color space for colormakers */
export function setColorSpace(space: ColorSpace) {
  colorSpace = space
}

/** Get the global internal color space for colormakers */
export function getColorSpace() {
  return colorSpace
}

export const ScaleDefaultParameters = {
  scale: 'uniform' as string|string[],
  mode: 'hcl' as ColorMode,
  domain: [ 0, 1 ] as number[],
  value: 0xFFFFFF,
  reverse: false,
}
export type ScaleParameters = typeof ScaleDefaultParameters

export interface ColormakerParameters extends ScaleParameters {
  structure?: Structure
  volume?: Volume
  surface?: Surface
}

export type StuctureColormakerParams = { structure: Structure } & Partial<ColormakerParameters>
export type VolumeColormakerParams = { volume: Volume } & Partial<ColormakerParameters>
export type ColormakerScale = (v: number) => number

const tmpColor = new Color()

/** Decorator for optionally linearizing a numeric color */
type colorFuncType = (value: any) => number // decorator applies to functions with this shape
export function manageColor<T extends {parameters: ColormakerParameters}>
  (_target: Object,
   _name: string | symbol,
   descriptor: TypedPropertyDescriptor<colorFuncType>): PropertyDescriptor {
    const originalMethod = descriptor.value
    const linearize: colorFuncType = function (this: T, value: any) {
      let result = originalMethod!.bind(this, value)()
      if (colorSpace == 'linear') {
        tmpColor.set(result)
        tmpColor.convertSRGBToLinear()
        return tmpColor.getHex()
      } else {
        return result
      }
    }
    descriptor.value = linearize
    return descriptor
  }

/**
 * Class for making colors.
 * @interface
 */
abstract class Colormaker {
  parameters: ColormakerParameters
  atomProxy?: AtomProxy

  /**
   * Create a colormaker instance
   * @param  {ColormakerParameters} params - colormaker parameter
   */
  constructor (params: Partial<ColormakerParameters> = {}) {
    this.parameters = createParams(params, ScaleDefaultParameters)

    if (typeof this.parameters.value === 'string') {
      this.parameters.value = tmpColor.set(this.parameters.value).getHex()
    }

    if (this.parameters.structure) {
      this.atomProxy = this.parameters.structure.getAtomProxy()
    }
  }

  getScale (params: Partial<ScaleParameters> = {}) {
    const p = createParams(params, this.parameters)

    if (p.scale === 'rainbow') {
      p.scale = [ 'red', 'orange', 'yellow', 'green', 'blue' ]
    } else if (p.scale === 'rwb') {
      p.scale = [ 'red', 'white', 'blue' ]
    }

    if (p.reverse) {
      p.domain.reverse()
    }
    return chroma
      .scale(p.scale as any)  // TODO
      .mode(p.mode)
      .domain(p.domain)
      .out('num' as any)  // returns RGB color as numeric (not string "#ffffff")
  }

  /**
   * save a color to an array
   * @param  {Integer} color - hex color value
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  colorToArray (color: number, array: NumberArray = [], offset = 0) {
    array[ offset ] = (color >> 16 & 255) / 255
    array[ offset + 1 ] = (color >> 8 & 255) / 255
    array[ offset + 2 ] = (color & 255) / 255

    return array
  }

  atomColor? (atom: AtomProxy): number

  /**
   * save an atom color to an array
   * @param  {AtomProxy} atom - atom to get color for
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  atomColorToArray (atom: AtomProxy, array: NumberArray, offset: number) {
    return this.colorToArray(
      this.atomColor ? this.atomColor(atom) : 0x000000, array, offset
    )
  }

  /**
   * return the color for an bond
   * @param  {BondProxy} bond - bond to get color for
   * @param  {Boolean} fromTo - whether to use the first or second atom of the bond
   * @return {Integer} hex bond color
   */
  bondColor (bond: BondProxy, fromTo: boolean) {
    if (this.atomProxy && this.atomColor) {
      this.atomProxy.index = fromTo ? bond.atomIndex1 : bond.atomIndex2
      return this.atomColor(this.atomProxy)
    } else {
      return 0x000000
    }
  }

  /**
   * safe a bond color to an array
   * @param  {BondProxy} bond - bond to get color for
   * @param  {Boolean} fromTo - whether to use the first or second atom of the bond
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  bondColorToArray (bond: BondProxy, fromTo: boolean, array: NumberArray, offset: number) {
    return this.colorToArray(
      this.bondColor(bond, fromTo), array, offset
    )
  }

  volumeColor? (index: number): number

  /**
   * safe a volume cell color to an array
   * @param  {Integer} index - volume cell index
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  volumeColorToArray (index: number, array: NumberArray, offset: number) {
    return this.colorToArray(
      this.volumeColor ? this.volumeColor(index) : 0x000000, array, offset
    )
  }

  positionColor? (position: Vector3): number

  /**
   * safe a color for coordinates in space to an array
   * @param  {Vector3} coords - xyz coordinates
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  positionColorToArray (coords: Vector3, array: NumberArray, offset: number) {
    return this.colorToArray(
      this.positionColor ? this.positionColor(coords) : 0x000000, array, offset
    )
  }
}

export default Colormaker
