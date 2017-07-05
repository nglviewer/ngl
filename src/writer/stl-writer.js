/**
 * @file STL Writer
 * @author Paul Pillot <paul.pillot@cimf.ca>
 * @private
 */

import Writer from './writer.js'

// https://en.wikipedia.org/wiki/STL_(file_format)#ASCII_STL

/**
 * Create an STL File from a surface Object (for 3D printing)
 * 
 * @example
 * molsurf = new NGL.MolecularSurface(structure)
 * surf = molsurf.getSurface({type: ‘av’, probeRadius: 1.4})
 * stl = new NGL.StlWriter(surf)
 * stl.download(‘my_file_name’)
 * @class StlWriter
 * @extends {Writer}
 */
class StlWriter extends Writer {
  constructor (surface) {
    super()

    this.surface = surface
    this._records = []
  }

  get mimeType () { return 'text/plain' }
  get defaultName () { return 'surface' }
  get defaultExt () { return 'stl' }

  _writeRecords () {
    this._records.length = 0

    this._writeHeader()
    this._writeFacets()
    this._writeFooter()
  }

  _avgNormal (normals, vertIndices) {
    let v = []
    for (let i = 0; i < 3; i++) {
      v[i] = (normals[vertIndices[0] + i] + normals[vertIndices[1] + i] + normals[vertIndices[2] + i]) / 3
    }
    return v
  }

  _writeHeader () {
    this._records.push('solid surface')
  }

  _writeFooter () {
    this._records.push('endsolid surface')
  }

  _writeLoop (vertices) {
    this._records.push('outer loop')
    for (let i = 0; i < 3; i++) {
      this._records.push(`    vertex ${this.surface.position[vertices[i] * 3]} ${this.surface.position[vertices[i] * 3 + 1]} ${this.surface.position[vertices[i] * 3 + 2]}`)
    }
    this._records.push('outer loop')
  }

  _writeFacets () {
    for (let i = 0; i < this.surface.index.length / 3; i++) {
      let vert1Index = this.surface.index[i * 3]
      let vert2Index = this.surface.index[i * 3 + 1]
      let vert3Index = this.surface.index[i * 3 + 2]

      let facetNormal = this._avgNormal(this.surface.normal, [vert1Index, vert2Index, vert3Index])
      this._records.push(`facet normal ${facetNormal[0]} ${facetNormal[1]} ${facetNormal[2]}`)

      this._writeLoop([vert1Index, vert2Index, vert3Index])

      this._records.push('endfacet')
    }
  }

  getData () {
    this._writeRecords()
    return this._records.join('\n')
  }
}

export default StlWriter
