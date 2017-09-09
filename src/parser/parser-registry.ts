/**
 * @file Parser Registry
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Registry from '../utils/registry'

class ParserRegistry extends Registry {
  constructor () {
    super('parser')
  }

  __hasObjName (key: string, objName: string) {
    const parser = this.get(key)
    return parser && parser.prototype.__objName === objName
  }

  isTrajectory (key: string) {
    return this.__hasObjName(key, 'frames')
  }

  isStructure (key: string) {
    return this.__hasObjName(key, 'structure')
  }

  isVolume (key: string) {
    return this.__hasObjName(key, 'volume')
  }

  isSurface (key: string) {
    return this.__hasObjName(key, 'surface')
  }

  isBinary (key: string) {
    const parser = this.get(key)
    return parser && parser.prototype.isBinary
  }

  isXml (key: string) {
    const parser = this.get(key)
    return parser && parser.prototype.isXml
  }

  isJson (key: string) {
    const parser = this.get(key)
    return parser && parser.prototype.isJson
  }

  getTrajectoryExtensions () {
    return this.names.filter(name => this.isTrajectory(name))
  }

  getStructureExtensions () {
    return this.names.filter(name => this.isStructure(name))
  }

  getVolumeExtensions () {
    return this.names.filter(name => this.isVolume(name))
  }

  getSurfaceExtensions () {
    return this.names.filter(name => this.isSurface(name))
  }
}

export default ParserRegistry
