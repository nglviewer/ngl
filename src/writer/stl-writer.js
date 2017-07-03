/**
 * @file STL Writer
 * @author Paul Pillot <paul.pillot@cimf.ca>
 * @private
 */

import { download } from '../utils.js'

function StlWriter (surface) {
  var records

  function writeRecords () {
    records = []

    writeHeader()
    writeFacets()
    writeFooter()
  }

  // https://en.wikipedia.org/wiki/STL_(file_format)#ASCII_STL

  function avgNormal (normals, vertIndices) {
    let v = []
    for (let i = 0; i < 3; i++) {
      v[i] = (normals[vertIndices[0] + i] + normals[vertIndices[1] + i] + normals[vertIndices[2] + i]) / 3
    }
    return v
  }

  function writeHeader () {
    records.push('solid surface')
  }

  function writeFooter () {
    records.push('endsolid surface')
  }

  function writeLoop (vertices) {
    records.push('outer loop')
    for (let i = 0; i < 3; i++) {
      records.push(`    vertex ${surface.position[vertices[i] * 3]} ${surface.position[vertices[i] * 3 + 1]} ${surface.position[vertices[i] * 3 + 2]}`)
    }
    records.push('outer loop')
  }

  function writeFacets () {
    for (let i = 0; i < surface.index.length / 3; i++) {
      let vert1Index = surface.index[i * 3]
      let vert2Index = surface.index[i * 3 + 1]
      let vert3Index = surface.index[i * 3 + 2]

      let facetNormal = avgNormal(surface.normal, [vert1Index, vert2Index, vert3Index])
      records.push(`facet normal ${facetNormal[0]} ${facetNormal[1]} ${facetNormal[2]}`)

      writeLoop([vert1Index, vert2Index, vert3Index])

      records.push('endfacet')
    }
  }

  function getString () {
    writeRecords()
    return records.join('\n')
  }

  function getBlob () {
    return new window.Blob([ getString() ], { type: 'text/plain' })
  }

  function _download (name, ext) {
    name = name || 'surface'
    ext = ext || 'stl'

    var file = name + '.' + ext
    var blob = getBlob()

    download(blob, file)
  }

  // API

  this.getString = getString
  this.getBlob = getBlob
  this.download = _download
}

export default StlWriter
