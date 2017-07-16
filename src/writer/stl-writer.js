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
 * molsurf = new MolecularSurface(structure)
 * surf = molsurf.getSurface({type: 'av', probeRadius: 1.4})
 * stl = new StlWriter(surf)
 * stl.download('myFileName')
 */
class StlWriter extends Writer {
  /**
   * @param {Surface} surface - the surface to write out
   */
  constructor (surface) {
    super()

    this.surface = surface
    this._records = []
  }

  get mimeType () { return 'application/vnd.ms-pki.stl' }
  get defaultName () { return 'surface' }
  get defaultExt () { return 'stl' }

  /*
   * Get STL Binary data
   *
   * Adapted from: https://github.com/mrdoob/three.js/blob/master/examples/js/exporters/STLBinaryExporter.js
   * see https://en.wikipedia.org/wiki/STL_(file_format)#Binary_STL for the file format description
   *
   * @return {DataView} the data
   */
  getData () {
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
}

export default StlWriter
