/**
 * @file Ply Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Geometry, Vector3, Face3, Color } from 'three'

import { ParserRegistry } from '../globals'
import SurfaceParser from './surface-parser'

/**
 * PLYLoader
 * @class
 * @private
 * @author Wei Meng / http://about.me/menway
 *
 * @description
 * A THREE loader for PLY ASCII files (known as the Polygon File Format or the Stanford Triangle Format).
 *
 * Limitations: ASCII decoding assumes file is UTF-8.
 *
 * @example
 * var loader = new THREE.PLYLoader();
 * loader.load('./models/ply/ascii/dolphins.ply', function (geometry) {
 *     scene.add( new THREE.Mesh( geometry ) );
 * } );
 *
 * // If the PLY file uses non standard property names, they can be mapped while
 * // loading. For example, the following maps the properties
 * // “diffuse_(red|green|blue)” in the file to standard color names.
 *
 * loader.setPropertyNameMapping( {
 *     diffuse_red: 'red',
 *     diffuse_green: 'green',
 *     diffuse_blue: 'blue'
 * } );
 *
 */

export interface _PLYLoader {
  propertyNameMapping: {[k: string]: string}
}

interface _PLYLoaderConstructor {
  (this: _PLYLoader): void
  new(): _PLYLoader
}

interface PLYProperty {
  type: string,
  name: string,
  countType: string,
  itemType: string
}

interface PLYElement {
  name: string,
  count: number,
  properties: PLYProperty[],
  x: number,
  y: number,
  z: number,
  red: number,
  green: number,
  blue: number,
  [k:string]: any
}

interface PLYHeader {
  format: string,
  version: string,
  comments: string[],
  elements: PLYElement[],
  headerLength: number
}

interface GeometryPLY extends Geometry {
  useColor: boolean
}

const PLYLoader = (function PLYLoader (this: _PLYLoader) {
  this.propertyNameMapping = {}
}) as _PLYLoaderConstructor

PLYLoader.prototype = {

  constructor: PLYLoader,

  setPropertyNameMapping: function (mapping: {[k: string]: string}) {
    this.propertyNameMapping = mapping
  },

  bin2str: function (buf: ArrayBuffer) {
    var arrayBuffer = new Uint8Array(buf)
    var str = ''
    for (var i = 0; i < buf.byteLength; i++) {
      str += String.fromCharCode(arrayBuffer[ i ]) // implicitly assumes little-endian
    }

    return str
  },

  isASCII: function (data: ArrayBuffer) {
    var header = this.parseHeader(this.bin2str(data))

    return header.format === 'ascii'
  },

  parse: function (data: string|ArrayBuffer) {
    if (data instanceof ArrayBuffer) {
      return (
        this.isASCII(data)
          ? this.parseASCII(this.bin2str(data))
          : this.parseBinary(data)
      )
    } else {
      return this.parseASCII(data)
    }
  },

  parseHeader: function (data: string) {
    var patternHeader = /ply([\s\S]*)end_header\s/
    var headerText = ''
    var headerLength = 0
    var result = patternHeader.exec(data)
    if (result !== null) {
      headerText = result[ 1 ]
      headerLength = result[ 0 ].length
    }

    var header: Partial<PLYHeader> = {
      comments: [],
      elements: [],
      headerLength: headerLength
    }

    var lines = headerText.split('\n')
    var currentElement: PLYElement|undefined, lineType, lineValues

    function makePlyElementProperty (propertValues: string[], propertyNameMapping: {[k: string]: string}) {
      var property = {
        type: propertValues[ 0 ]
      } as PLYProperty

      if (property.type === 'list') {
        property.name = propertValues[ 3 ]
        property.countType = propertValues[ 1 ]
        property.itemType = propertValues[ 2 ]
      } else {
        property.name = propertValues[ 1 ]
      }

      if (property.name in propertyNameMapping) {
        property.name = propertyNameMapping[ property.name ]
      }

      return property
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[ i ]
      line = line.trim()
      if (line === '') {
        continue
      }
      lineValues = line.split(/\s+/)
      lineType = lineValues.shift()
      line = lineValues.join(' ')

      switch (lineType) {
        case 'format':

          header.format = lineValues[ 0 ]
          header.version = lineValues[ 1 ]

          break

        case 'comment':

          header.comments!.push(line)

          break

        case 'element':

          if (currentElement !== undefined) {
            header.elements!.push(currentElement as PLYElement)
          }

          currentElement = {} as PLYElement
          currentElement.name = lineValues[ 0 ]
          currentElement.count = parseInt(lineValues[ 1 ])
          currentElement.properties = []

          break

        case 'property':

          currentElement!.properties.push(makePlyElementProperty(lineValues, this.propertyNameMapping))

          break

        default:

          console.log('unhandled', lineType, lineValues)
      }
    }

    if (currentElement !== undefined) {
      header.elements!.push(currentElement)
    }

    return header
  },

  parseASCIINumber: function (n: string, type: string) {
    switch (type) {
      case 'char': case 'uchar': case 'short': case 'ushort': case 'int': case 'uint':
      case 'int8': case 'uint8': case 'int16': case 'uint16': case 'int32': case 'uint32':

        return parseInt(n)

      case 'float': case 'double': case 'float32': case 'float64':

        return parseFloat(n)
    }
  },

  parseASCIIElement: function (properties: PLYProperty[], line: string) {
    var values = line.split(/\s+/)

    var element = {} as PLYElement

    for (var i = 0; i < properties.length; i++) {
      if (properties[ i ].type === 'list') {
        var list = []
        var n = this.parseASCIINumber(values.shift(), properties[ i ].countType)

        for (var j = 0; j < n; j++) {
          list.push(this.parseASCIINumber(values.shift(), properties[ i ].itemType))
        }

        element[ properties[ i ].name ] = list
      } else {
        element[ properties[ i ].name ] = this.parseASCIINumber(values.shift(), properties[ i ].type)
      }
    }

    return element
  },

  parseASCII: function (data: string) {
    // PLY ascii format specification, as per http://en.wikipedia.org/wiki/PLY_(file_format)

    var geometry = new Geometry() as GeometryPLY

    var result

    var header = this.parseHeader(data)

    var patternBody = /end_header\s([\s\S]*)$/
    var body = ''
    if ((result = patternBody.exec(data)) !== null) {
      body = result[ 1 ]
    }

    var lines = body.split('\n')
    var currentElement = 0
    var currentElementCount = 0
    geometry.useColor = false

    for (var i = 0; i < lines.length; i++) {
      var line = lines[ i ]
      line = line.trim()
      if (line === '') {
        continue
      }

      if (currentElementCount >= header.elements[ currentElement ].count) {
        currentElement++
        currentElementCount = 0
      }

      var element = this.parseASCIIElement(header.elements[ currentElement ].properties, line)

      this.handleElement(geometry, header.elements[ currentElement ].name, element)

      currentElementCount++
    }

    return this.postProcess(geometry)
  },

  postProcess: function (geometry: GeometryPLY) {
    if (geometry.useColor) {
      for (var i = 0; i < geometry.faces.length; i++) {
        geometry.faces[ i ].vertexColors = [
          geometry.colors[ geometry.faces[ i ].a ],
          geometry.colors[ geometry.faces[ i ].b ],
          geometry.colors[ geometry.faces[ i ].c ]
        ]
      }

      geometry.elementsNeedUpdate = true
    }

    geometry.computeBoundingSphere()

    return geometry
  },

  handleElement: function (geometry: GeometryPLY, elementName: string, element: PLYElement) {
    if (elementName === 'vertex') {
      geometry.vertices.push(
        new Vector3(element.x, element.y, element.z)
      )

      if ('red' in element && 'green' in element && 'blue' in element) {
        geometry.useColor = true

        var color = new Color()
        color.setRGB(element.red / 255.0, element.green / 255.0, element.blue / 255.0)
        geometry.colors.push(color)
      }
    } else if (elementName === 'face') {
      var vertexIndices = element.vertex_indices

      if (vertexIndices.length === 3) {
        geometry.faces.push(
          new Face3(vertexIndices[ 0 ], vertexIndices[ 1 ], vertexIndices[ 2 ])
        )
      } else if (vertexIndices.length === 4) {
        geometry.faces.push(
          new Face3(vertexIndices[ 0 ], vertexIndices[ 1 ], vertexIndices[ 3 ]),
          new Face3(vertexIndices[ 1 ], vertexIndices[ 2 ], vertexIndices[ 3 ])
        )
      }
    }
  },

  binaryRead: function (dataview: DataView, at: number, type: string, littleEndian: boolean) {
    switch (type) {
      // corespondences for non-specific length types here match rply:
      case 'int8': case 'char': return [ dataview.getInt8(at), 1 ]

      case 'uint8': case 'uchar': return [ dataview.getUint8(at), 1 ]

      case 'int16': case 'short': return [ dataview.getInt16(at, littleEndian), 2 ]

      case 'uint16': case 'ushort': return [ dataview.getUint16(at, littleEndian), 2 ]

      case 'int32': case 'int': return [ dataview.getInt32(at, littleEndian), 4 ]

      case 'uint32': case 'uint': return [ dataview.getUint32(at, littleEndian), 4 ]

      case 'float32': case 'float': return [ dataview.getFloat32(at, littleEndian), 4 ]

      case 'float64': case 'double': return [ dataview.getFloat64(at, littleEndian), 8 ]
    }
  },

  binaryReadElement: function (dataview: DataView, at: number, properties: PLYProperty[], littleEndian: boolean) {
    var element = {} as PLYElement
    var result
    var read = 0

    for (var i = 0; i < properties.length; i++) {
      if (properties[ i ].type === 'list') {
        var list = []

        result = this.binaryRead(dataview, at + read, properties[ i ].countType, littleEndian)
        var n = result[ 0 ]
        read += result[ 1 ]

        for (var j = 0; j < n; j++) {
          result = this.binaryRead(dataview, at + read, properties[ i ].itemType, littleEndian)
          list.push(result[ 0 ])
          read += result[ 1 ]
        }

        element[ properties[ i ].name ] = list
      } else {
        result = this.binaryRead(dataview, at + read, properties[ i ].type, littleEndian)
        element[ properties[ i ].name ] = result[ 0 ]
        read += result[ 1 ]
      }
    }

    return [ element, read ]
  },

  parseBinary: function (data: ArrayBuffer) {
    var geometry = new Geometry()

    var header = this.parseHeader(this.bin2str(data))
    var littleEndian = (header.format === 'binary_little_endian')
    var body = new DataView(data, header.headerLength)
    var result
    var loc = 0

    for (var currentElement = 0; currentElement < header.elements.length; currentElement++) {
      for (var currentElementCount = 0; currentElementCount < header.elements[ currentElement ].count; currentElementCount++) {
        result = this.binaryReadElement(body, loc, header.elements[ currentElement ].properties, littleEndian)
        loc += result[ 1 ]
        var element = result[ 0 ]

        this.handleElement(geometry, header.elements[ currentElement ].name, element)
      }
    }

    return this.postProcess(geometry)
  }

}

class PlyParser extends SurfaceParser {
  get type () { return 'ply' }

  getLoader () {
    return new PLYLoader()
  }
}

ParserRegistry.add('ply', PlyParser)

export default PlyParser
