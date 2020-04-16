/**
 * @file Obj Parser
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { BufferGeometry, BufferAttribute } from 'three'

import { ParserRegistry } from '../globals'
import SurfaceParser from './surface-parser'

export interface _OBJLoader {
  regexp: {[k: string]: RegExp}
}

interface _OBJLoaderConstructor {
  (this: _OBJLoader): void
  new(): _OBJLoader
}

interface ObjectType {
  name: string,
  fromDeclaration: boolean,
  geometry: {
    vertices: number[],
    normals: number[],
    type?: string
  }
}
/**
 * OBJLoader
 * @class
 * @private
 * @author mrdoob / http://mrdoob.com/
 */
const OBJLoader = (function OBJLoader (this: _OBJLoader) {
  this.regexp = {
    // v float float float
    vertex_pattern: /^v\s+([\d.+\-eE]+)\s+([\d.+\-eE]+)\s+([\d.+\-eE]+)/,
    // vn float float float
    normal_pattern: /^vn\s+([\d.+\-eE]+)\s+([\d.+\-eE]+)\s+([\d.+\-eE]+)/,
    // vt float float
    uv_pattern: /^vt\s+([\d.+\-eE]+)\s+([\d.+\-eE]+)/,
    // f vertex vertex vertex
    face_vertex: /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
    // f vertex/uv vertex/uv vertex/uv
    face_vertex_uv: /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
    face_vertex_uv_normal: /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
    // f vertex//normal vertex//normal vertex//normal
    face_vertex_normal: /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,
    // o object_name | g group_name
    object_pattern: /^[og]\s*(.+)?/,
    // s boolean
    smoothing_pattern: /^s\s+(\d+|on|off)/,
    // mtllib file_reference
    material_library_pattern: /^mtllib /,
    // usemtl material_name
    material_use_pattern: /^usemtl /
  }
}) as _OBJLoaderConstructor

OBJLoader.prototype = {

  constructor: OBJLoader,

  setPath: function (value: string) {
    this.path = value
  },

  _createParserState: function () {
    var state = {
      objects: [] as ObjectType[],
      object: {} as ObjectType,

      vertices: [],
      normals: [],

      startObject: function (name: string, fromDeclaration: boolean) {
        // If the current object (initial from reset) is not from a g/o declaration in the parsed
        // file. We need to use it for the first parsed g/o to keep things in sync.
        if (this.object && this.object.fromDeclaration === false) {
          this.object.name = name
          this.object.fromDeclaration = (fromDeclaration !== false)
          return
        }

        this.object = {
          name: name || '',
          geometry: {
            vertices: [],
            normals: []
          },
          fromDeclaration: (fromDeclaration !== false)
        }

        this.objects.push(this.object)
      },

      parseVertexIndex: function (value: string, len: number) {
        var index = parseInt(value, 10)
        return (index >= 0 ? index - 1 : index + len / 3) * 3
      },

      parseNormalIndex: function (value: string, len: number) {
        var index = parseInt(value, 10)
        return (index >= 0 ? index - 1 : index + len / 3) * 3
      },

      addVertex: function (a: number, b: number, c: number) {
        var src = this.vertices
        var dst = this.object.geometry.vertices

        dst.push(src[ a + 0 ])
        dst.push(src[ a + 1 ])
        dst.push(src[ a + 2 ])
        dst.push(src[ b + 0 ])
        dst.push(src[ b + 1 ])
        dst.push(src[ b + 2 ])
        dst.push(src[ c + 0 ])
        dst.push(src[ c + 1 ])
        dst.push(src[ c + 2 ])
      },

      addVertexLine: function (a: number) {
        var src = this.vertices
        var dst = this.object.geometry.vertices

        dst.push(src[ a + 0 ])
        dst.push(src[ a + 1 ])
        dst.push(src[ a + 2 ])
      },

      addNormal: function (a: number, b: number, c: number) {
        var src = this.normals
        var dst = this.object.geometry.normals

        dst.push(src[ a + 0 ])
        dst.push(src[ a + 1 ])
        dst.push(src[ a + 2 ])
        dst.push(src[ b + 0 ])
        dst.push(src[ b + 1 ])
        dst.push(src[ b + 2 ])
        dst.push(src[ c + 0 ])
        dst.push(src[ c + 1 ])
        dst.push(src[ c + 2 ])
      },

      addFace: function (a: string, b: string, c: string, d?: string, na?: string, nb?: string, nc?: string, nd?: string) {
        var vLen = this.vertices.length

        var ia = this.parseVertexIndex(a, vLen)
        var ib = this.parseVertexIndex(b, vLen)
        var ic = this.parseVertexIndex(c, vLen)
        var id

        if (d === undefined) {
          this.addVertex(ia, ib, ic)
        } else {
          id = this.parseVertexIndex(d, vLen)

          this.addVertex(ia, ib, id)
          this.addVertex(ib, ic, id)
        }

        if (na !== undefined) {
          // Normals are many times the same. If so, skip function call and parseInt.
          var nLen = this.normals.length
          ia = this.parseNormalIndex(na, nLen)

          ib = na === nb ? ia : this.parseNormalIndex(nb!, nLen)
          ic = na === nc ? ia : this.parseNormalIndex(nc!, nLen)

          if (d === undefined) {
            this.addNormal(ia, ib, ic)
          } else {
            id = this.parseNormalIndex(nd!, nLen)

            this.addNormal(ia, ib, id)
            this.addNormal(ib, ic, id)
          }
        }
      },

      addLineGeometry: function (vertices: string[]) {
        this.object.geometry.type = 'Line'

        var vLen = this.vertices.length

        for (var vi = 0, l = vertices.length; vi < l; vi++) {
          this.addVertexLine(this.parseVertexIndex(vertices[ vi ], vLen))
        }
      }

    }

    state.startObject('', false)

    return state
  },

  parse: function (text: string) {
    var state = this._createParserState()

    if (text.indexOf('\r\n') !== -1) {
      // This is faster than String.split with regex that splits on both
      text = text.replace(/\r\n/g, '\n')
    }

    if (text.indexOf('\\\n') !== -1) {
      // join lines separated by a line continuation character (\)
      text = text.replace(/\\\n/g, '')
    }

    var i, l
    var lines = text.split('\n')
    var line = ''
    var lineFirstChar = ''
    var lineSecondChar = ''
    var lineLength = 0
    var result = []

    // Faster to just trim left side of the line. Use if available.
    var trimLeft = (typeof ''.trimLeft === 'function')

    for (i = 0, l = lines.length; i < l; i++) {
      line = lines[ i ]

      line = trimLeft ? line.trimLeft() : line.trim()

      lineLength = line.length

      if (lineLength === 0) continue

      lineFirstChar = line.charAt(0)

      // @todo invoke passed in handler if any
      if (lineFirstChar === '#') continue

      if (lineFirstChar === 'v') {
        lineSecondChar = line.charAt(1)

        if (lineSecondChar === ' ' && (result = this.regexp.vertex_pattern.exec(line)) !== null) {
          // 0                  1      2      3
          // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

          state.vertices.push(
            parseFloat(result[ 1 ]),
            parseFloat(result[ 2 ]),
            parseFloat(result[ 3 ])
          )
        } else if (lineSecondChar === 'n' && (result = this.regexp.normal_pattern.exec(line)) !== null) {
          // 0                   1      2      3
          // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

          state.normals.push(
            parseFloat(result[ 1 ]),
            parseFloat(result[ 2 ]),
            parseFloat(result[ 3 ])
          )
        } else if (lineSecondChar === 't' && this.regexp.uv_pattern.exec(line) !== null) {

          // ignore uv line

        } else {
          throw new Error("Unexpected vertex/normal/uv line: '" + line + "'")
        }
      } else if (lineFirstChar === 'f') {
        if ((result = this.regexp.face_vertex_uv_normal.exec(line)) !== null) {
          // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
          // 0                        1    2    3    4    5    6    7    8    9   10         11         12
          // ["f 1/1/1 2/2/2 3/3/3", "1", "1", "1", "2", "2", "2", "3", "3", "3", undefined, undefined, undefined]

          state.addFace(
            result[ 1 ], result[ 4 ], result[ 7 ], result[ 10 ],
            // result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],  // ignore uv part
            result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
          )
        } else if (this.regexp.face_vertex_uv.exec(line) !== null) {

          // ignore uv line

        } else if ((result = this.regexp.face_vertex_normal.exec(line)) !== null) {
          // f vertex//normal vertex//normal vertex//normal
          // 0                     1    2    3    4    5    6   7          8
          // ["f 1//1 2//2 3//3", "1", "1", "2", "2", "3", "3", undefined, undefined]

          state.addFace(
            result[ 1 ], result[ 3 ], result[ 5 ], result[ 7 ],
            result[ 2 ], result[ 4 ], result[ 6 ], result[ 8 ]
          )
        } else if ((result = this.regexp.face_vertex.exec(line)) !== null) {
          // f vertex vertex vertex
          // 0            1    2    3   4
          // ["f 1 2 3", "1", "2", "3", undefined]

          state.addFace(
            result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ]
          )
        } else {
          throw new Error("Unexpected face line: '" + line + "'")
        }
      } else if (lineFirstChar === 'l') {
        var lineParts = line.substring(1).trim().split(' ')
        var lineVertices = []
        var lineUVs = []

        if (line.indexOf('/') === -1) {
          lineVertices = lineParts
        } else {
          for (var li = 0, llen = lineParts.length; li < llen; li++) {
            var parts = lineParts[ li ].split('/')

            if (parts[ 0 ] !== '') lineVertices.push(parts[ 0 ])
            if (parts[ 1 ] !== '') lineUVs.push(parts[ 1 ])
          }
        }
        state.addLineGeometry(lineVertices, lineUVs)
      } else if ((result = this.regexp.object_pattern.exec(line)) !== null) {
        // o object_name
        // or
        // g group_name

        var name = result[ 0 ].substr(1).trim()
        state.startObject(name)

        // ignore material related lines
        // eslint-disable-next-line no-empty
      } else if (this.regexp.material_use_pattern.test(line)) {
        // eslint-disable-next-line no-empty
      } else if (this.regexp.material_library_pattern.test(line)) {
        // eslint-disable-next-line no-empty
      } else if (this.regexp.smoothing_pattern.exec(line) !== null) {
      } else {
        // Handle null terminated files without exception
        if (line === '\0') continue

        throw new Error("Unexpected line: '" + line + "'")
      }
    }

    var container = []

    for (i = 0, l = state.objects.length; i < l; i++) {
      var object = state.objects[ i ]
      var geometry = object.geometry

      // Skip o/g line declarations that did not follow with any faces
      if (geometry.vertices.length === 0) continue

      var buffergeometry = new BufferGeometry()

      buffergeometry.setAttribute('position', new BufferAttribute(new Float32Array(geometry.vertices), 3))

      if (geometry.normals.length > 0) {
        buffergeometry.setAttribute('normal', new BufferAttribute(new Float32Array(geometry.normals), 3))
      } else {
        buffergeometry.computeVertexNormals()
      }

      container.push(buffergeometry)
    }

    return container
  }

}

class ObjParser extends SurfaceParser {
  get type () { return 'obj' }

  getLoader () {
    return new OBJLoader()
  }
}

ParserRegistry.add('obj', ObjParser)

export default ObjParser
