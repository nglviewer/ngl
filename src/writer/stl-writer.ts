/**
 * @file STL Writer
 * @author Paul Pillot <paul.pillot@cimf.ca>
 * @private
 */

import { Vector3 } from 'three'

import Writer from './writer'
import IOBuffer from '../utils/io-buffer'
import Surface from '../surface/surface'

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
export default class StlWriter extends Writer {
  readonly mimeType = 'application/vnd.ms-pki.stl'
  readonly defaultName = 'surface'
  readonly defaultExt = 'stl'

  surface: any  // TODO

  /**
   * @param {Surface} surface - the surface to write out
   */
  constructor (surface: Surface) {
    super()

    this.surface = surface
  }

  /*
   * Get STL Binary data
   *
   * Adapted from: https://github.com/mrdoob/three.js/blob/master/examples/js/exporters/STLBinaryExporter.js
   * see https://en.wikipedia.org/wiki/STL_(file_format)#Binary_STL for the file format description
   *
   * @return {DataView} the data
   */
  getData () {
    const triangles = this.surface.index.length / 3
    const bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4
    const output = new IOBuffer(bufferLength)

    output.skip(80)  // skip header
    output.writeUint32(triangles)

    const vector = new Vector3()
    const vectorNorm1 = new Vector3()
    const vectorNorm2 = new Vector3()
    const vectorNorm3 = new Vector3()

    // traversing vertices
    for (let i = 0; i < triangles; i++) {
      const indices = [
        this.surface.index[i * 3],
        this.surface.index[i * 3 + 1],
        this.surface.index[i * 3 + 2]
      ]

      vectorNorm1.fromArray(this.surface.normal, indices[0] * 3)
      vectorNorm2.fromArray(this.surface.normal, indices[1] * 3)
      vectorNorm3.fromArray(this.surface.normal, indices[2] * 3)

      vector.addVectors(vectorNorm1, vectorNorm2).add(vectorNorm3).normalize()

      output.writeFloat32(vector.x)
      output.writeFloat32(vector.y)
      output.writeFloat32(vector.z)

      for (let j = 0; j < 3; j++) {
        vector.fromArray(this.surface.position, indices[j] * 3)

        output.writeFloat32(vector.x)  // vertices
        output.writeFloat32(vector.y)
        output.writeFloat32(vector.z)
      }

      output.writeUint16(0)  // attribute byte count
    }

    return new DataView(output.buffer)
  }
}