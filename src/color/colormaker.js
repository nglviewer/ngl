/**
 * @file Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color } from '../../lib/three.es6.js'

import { defaults } from '../utils.js'

import chroma from '../../lib/chroma.es6.js'

/**
 * Colormaker parameter object.
 * @typedef {Object} ColormakerParameters - colormaker parameters
 * @property {String|Array} [scale] - color scale, either a string for a
 *                                    predefined scale or an array of
 *                                    colors to be used as the scale
 * @property {String} [mode] - color mode, one of rgb, hsv, hsl, hsi, lab, hcl
 * @property {Integer[]} [colorDomain] - scale value range
 * @property {Integer} colorDomain.0 - min value
 * @property {Integer} colorDomain.1 - max value
 * @property {Color|String|Integer} [value] - color value
 * @property {Structure} [structure] - structure object
 * @property {Volume} [volume] - volume object
 * @property {Surface} [surface] - surface object
 */

/**
 * Class for making colors.
 * @interface
 */
class Colormaker {
  /**
   * Create a colormaker instance
   * @param  {ColormakerParameters} params - colormaker parameter
   */
  constructor (params) {
    const p = params || {}

    this.scale = defaults(p.scale, 'uniform')
    this.mode = defaults(p.mode, 'hcl')
    this.domain = defaults(p.domain, [ 0, 1 ])
    this.value = new Color(defaults(p.value, 0xFFFFFF)).getHex()
    this.reverse = defaults(p.reverse, false)

    this.structure = p.structure
    this.volume = p.volume
    this.surface = p.surface

    if (this.structure) {
      this.atomProxy = this.structure.getAtomProxy()
    }
  }

  getScale (params) {
    const p = params || {}

    let scale = defaults(p.scale, this.scale)
    if (scale === 'rainbow') {
      scale = [ 'red', 'orange', 'yellow', 'green', 'blue' ]
    } else if (scale === 'rwb') {
      scale = [ 'red', 'white', 'blue' ]
    }

    let domain = defaults(p.domain, this.domain)
    if (this.reverse) {
      domain = domain.slice().reverse()
    }

    return chroma
            .scale(scale)
            .mode(defaults(p.mode, this.mode))
            .domain(domain)
            .out('num')
  }

  /**
   * safe a color to an array
   * @param  {Integer} color - hex color value
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  colorToArray (color, array, offset) {
    if (array === undefined) array = []
    if (offset === undefined) offset = 0

    array[ offset + 0 ] = (color >> 16 & 255) / 255
    array[ offset + 1 ] = (color >> 8 & 255) / 255
    array[ offset + 2 ] = (color & 255) / 255

    return array
  }

  /**
   * safe a atom color to an array
   * @param  {AtomProxy} atom - atom to get color for
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  atomColorToArray (atom, array, offset) {
    return this.colorToArray(
      this.atomColor(atom), array, offset
    )
  }

  /**
   * return the color for an bond
   * @param  {BondProxy} bond - bond to get color for
   * @param  {Boolean} fromTo - whether to use the first or second atom of the bond
   * @return {Integer} hex bond color
   */
  bondColor (bond, fromTo) {
    this.atomProxy.index = fromTo ? bond.atomIndex1 : bond.atomIndex2
    return this.atomColor(this.atomProxy)
  }

  /**
   * safe a bond color to an array
   * @param  {BondProxy} bond - bond to get color for
   * @param  {Boolean} fromTo - whether to use the first or second atom of the bond
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  bondColorToArray (bond, fromTo, array, offset) {
    return this.colorToArray(
      this.bondColor(bond, fromTo), array, offset
    )
  }

  /**
   * safe a volume cell color to an array
   * @param  {Integer} index - volume cell index
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  volumeColorToArray (index, array, offset) {
    return this.colorToArray(
      this.volumeColor(index), array, offset
    )
  }

  /**
   * safe a color for coordinates in space to an array
   * @param  {Vector3} coords - xyz coordinates
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  positionColorToArray (coords, array, offset) {
    return this.colorToArray(
      this.positionColor(coords), array, offset
    )
  }
}

export default Colormaker
