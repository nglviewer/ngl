/**
 * @file STL Writer
 * @author Paul Pillot <paul.pillot@cimf.ca>
 * @private
 */
import { Vector3 } from '../../lib/three.es6.js'
import Writer from './writer.js'

// https://en.wikipedia.org/wiki/STL_(file_format)#ASCII_STL

/**
 * Create an STL File from a surface Object (e.g. for 3D printing)
 *
 * @example
 * molsurf = new NGL.MolecularSurface(structure)
 * surf = molsurf.getSurface({type: ‘av’, probeRadius: 1.4})
 * stl = new NGL.StlWriter(surf)
 * stl.download(‘my_file_name’)
 * @class StlWriter
 */
class StlWriter extends Writer {
  constructor (surface, isBinary) {
    super()

    this.surface = surface
    this.isBinary = isBinary || false
    this._records = []
  }

  get mimeType () { return this.isBinary ? 'application/vnd.ms-pki.stl' : 'text/plain' }
  get defaultName () { return 'surface' }
  get defaultExt () { return 'stl' }

  /*
   * STL ASCII
   */
  _writeRecords () {
    this._records.length = 0

    this._writeHeader()
    this._writeFacets()
    this._writeFooter()
  }

  _avgNormal (normals, vertIndices) {
    let v = []
    for (let i = 0; i < 3; i++) {
      v[i] = (normals[vertIndices[0] * 3 + i] + normals[vertIndices[1] * 3 + i] + normals[vertIndices[2] * 3 + i]) / 3
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

  /*
   * STL Binary
   * Adapted from: https://github.com/mrdoob/three.js/blob/master/examples/js/exporters/STLBinaryExporter.js
   * see https://en.wikipedia.org/wiki/STL_(file_format)#Binary_STL for the file format description
   */
  _getBinaryData () {
    let offset = 80 // skip header
    const triangles = this.surface.index.length / 3
    const bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4
    let arrayBuffer = new ArrayBuffer(bufferLength)
    let output = new DataView(arrayBuffer)
    output.setUint32(offset, triangles, true)
    offset += 4

    let vector = new Vector3()
    let vectorNorm1 = new Vector3()
    let vectorNorm2 = new Vector3()
    let vectorNorm3 = new Vector3()

    // traversing vertices
    for (let i = 0; i < triangles; i++) {
      let indices = [
        this.surface.index[i * 3],
        this.surface.index[i * 3 + 1],
        this.surface.index[i * 3 + 2]
      ]

      vectorNorm1.fromArray(this.surface.normal, indices[0] * 3)
      vectorNorm2.fromArray(this.surface.normal, indices[1] * 3)
      vectorNorm3.fromArray(this.surface.normal, indices[2] * 3)

      vector.addVectors(vectorNorm1, vectorNorm2).add(vectorNorm3).normalize()

      output.setFloat32(offset, vector.x, true)
      offset += 4
      output.setFloat32(offset, vector.y, true)
      offset += 4
      output.setFloat32(offset, vector.z, true)
      offset += 4

      for (let j = 0; j < 3; j++) {
        vector.fromArray(this.surface.position, indices[j] * 3)

        output.setFloat32(offset, vector.x, true) // vertices
        offset += 4
        output.setFloat32(offset, vector.y, true)
        offset += 4
        output.setFloat32(offset, vector.z, true)
        offset += 4
      }

      output.setUint16(offset, 0, true) // attribute byte count
      offset += 2
    }

    return output
  }

  getData () {
    if (this.isBinary) {
      return this._getBinaryData()
    } else {
      this._writeRecords()
      return this._records.join('\n')
    }
  }
}

export default StlWriter
