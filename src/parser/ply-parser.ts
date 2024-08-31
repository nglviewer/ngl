import SurfaceParser from "./surface-parser"
import { ParserRegistry } from "../globals"
import { BufferGeometry, Color, Float32BufferAttribute } from "three"

/**
 * Port of PLYLoader from the MIT-licensed three.js project:
 * https://github.com/mrdoob/three.js/blob/97b5d428d598228cae9b206d9a321f18d53a3e86/examples/jsm/loaders/PLYLoader.js
 * 
 * The original code has been modified to work with NGL and TypeScript.
 * Adaptation by @fredludlow 
 * 
 * Description: A THREE loader for PLY ASCII files (known as the Polygon
 * File Format or the Stanford Triangle Format).
 *
 * Limitations: ASCII decoding assumes file is UTF-8.
 *
 * Usage:
 *	const loader = new PLYLoader();
 *	loader.load('./models/ply/ascii/dolphins.ply', function (geometry) {
 *
 *		scene.add( new THREE.Mesh( geometry ) );
 *
 *	} );
 *
 * If the PLY file uses non standard property names, they can be mapped while
 * loading. For example, the following maps the properties
 * “diffuse_(red|green|blue)” in the file to standard color names.
 *
 * loader.setPropertyNameMapping( {
 *	diffuse_red: 'red',
 *	diffuse_green: 'green',
 *	diffuse_blue: 'blue'
 * } );
 *
 * Custom properties outside of the defaults for position, uv, normal
 * and color attributes can be added using the setCustomPropertyNameMapping method.
 * For example, the following maps the element properties “custom_property_a”
 * and “custom_property_b” to an attribute “customAttribute” with an item size of 2.
 * Attribute item sizes are set from the number of element properties in the property array.
 *
 * loader.setCustomPropertyNameMapping( {
 *	customAttribute: ['custom_property_a', 'custom_property_b'],
 * } );
 *
 */

const dataTypes = [
  'int8', 'char', 'uint8', 'uchar',
  'int16', 'short', 'uint16', 'ushort',
  'int32', 'int', 'uint32', 'uint',
  'float32', 'float', 'float64', 'double'
] as const;

// Extract the literal union type from the array
type DataType = (typeof dataTypes)[number];

// Define a function that checks if the string is a valid DataType
function is(type: string): type is DataType {
  return dataTypes.includes(type as DataType);
}

// Wrapper function to check and return the DataType
function getDataType(type: string): DataType {
  if (is(type)) {
    return type;
  }
  throw new Error(`Unsupported data type: ${type}`);
}

interface HeaderText {
  headerText: string,
  headerLength: number
}

interface BasePLYProperty {
  type: DataType;
  name: string;
  valueReader?: BinaryReader;
}

interface SinglePLYProperty extends BasePLYProperty {
  isList: false;  // Discriminant with a fixed value
}

interface BinarySinglePLYProperty extends SinglePLYProperty {
  valueReader: BinaryReader;
}

interface ListPLYProperty extends BasePLYProperty {
  isList: true;   // Discriminant with a different fixed value
  countType: DataType;
  countReader?: BinaryReader;
}

interface BinaryListPLYProperty extends ListPLYProperty {
  countReader: BinaryReader;
  valueReader: BinaryReader;
}

type PLYProperty = SinglePLYProperty | ListPLYProperty;

type BinaryPLYProperty = BinarySinglePLYProperty | BinaryListPLYProperty;

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
  [k: string]: any
}

type PLYElementSpec = Pick<PLYElement, 'name' | 'count' | 'properties'>

function assertPLYElementSpec(element: Partial<PLYElement>): asserts element is PLYElementSpec {
  if (typeof element !== 'object' || element === null) {
    throw new Error('Expected element to be an object')
  }
  if (typeof element.name !== 'string') {
    throw new Error('Expected element.name to be a string')
  }
  if (typeof element.count !== 'number') {
    throw new Error('Expected element.count to be a number')
  }
  if (!Array.isArray(element.properties)) {
    throw new Error('Expected element.properties to be an array')
  }
}

// function assertPLYElement (element: Partial<PLYElement>): asserts element is PLYElement {
//   assertPLYElementSpec(element as PLYElementSpec)
//   if (typeof element.x !== 'number') {
//     throw new Error('Expected element.x to be a number')
//   }
//   if (typeof element.y !== 'number') {
//     throw new Error('Expected element.y to be a number')
//   }
//   if (typeof element.z !== 'number') {
//     throw new Error('Expected element.z to be a number')
//   }
//   if (typeof element.red !== 'number') {
//     throw new Error('Expected element.red to be a number')
//   }
//   if (typeof element.green !== 'number') {
//     throw new Error('Expected element.green to be a number')
//   }
//   if (typeof element.blue !== 'number') {
//     throw new Error('Expected element.blue to be a number')
//   }

// }

interface PLYHeader {
  format: string,
  version: string,
  comments: string[],
  elements: PLYElementSpec[],
  headerLength: number,
  objInfo: string
}

/** JS object that we generate the buffer from */
interface PLYBuffer {
  indices: number[],
  vertices: number[],
  normals: number[],
  uvs: number[],
  faceVertexUvs: number[],
  colors: number[],
  faceVertexColors: number[],
  [k: string]: number[]
}

// Define a type for the reader function that will return either a number or a double (for float64)
type BinaryReader = {
  read: (at: number) => number;
  size: number;
};

function getBinaryReader(dataview: DataView, type: DataType, little_endian: boolean): BinaryReader {
  switch (type) {
    case 'int8':
    case 'char':
      return {
        read: (at: number) => dataview.getInt8(at),
        size: 1
      };

    case 'uint8':
    case 'uchar':
      return {
        read: (at: number) => dataview.getUint8(at),
        size: 1
      };

    case 'int16':
    case 'short':
      return {
        read: (at: number) => dataview.getInt16(at, little_endian),
        size: 2
      };

    case 'uint16':
    case 'ushort':
      return {
        read: (at: number) => dataview.getUint16(at, little_endian),
        size: 2
      };

    case 'int32':
    case 'int':
      return {
        read: (at: number) => dataview.getInt32(at, little_endian),
        size: 4
      };

    case 'uint32':
    case 'uint':
      return {
        read: (at: number) => dataview.getUint32(at, little_endian),
        size: 4
      };

    case 'float32':
    case 'float':
      return {
        read: (at: number) => dataview.getFloat32(at, little_endian),
        size: 4
      };

    case 'float64':
    case 'double':
      return {
        read: (at: number) => dataview.getFloat64(at, little_endian),
        size: 8
      };

    default:
      throw new Error(`Unsupported data type: ${type}`);
  }
}

function binaryReadElement(at: number, properties: BinaryPLYProperty[]): [PLYElement, number] {

  const element: Partial<PLYElement> = {};
  let read = 0;

  for (let i = 0; i < properties.length; i++) {

    const property = properties[i];
    const valueReader = property.valueReader;

    if (property.isList) {

      const list = [];

      const n = property.countReader.read(at + read);
      read += property.countReader.size;

      for (let j = 0; j < n; j++) {

        list.push(valueReader.read(at + read));
        read += valueReader.size;

      }

      element[property.name] = list;

    } else {

      element[property.name] = valueReader.read(at + read);
      read += valueReader.size;

    }

  }

  // assertPLYElement(element)

  return [element as PLYElement, read]; // TODO: We're sloppy about what types are actually available in PLYElement

}

class PLYLoader {
  propertyNameMapping: { [k: string]: string }
  customPropertyMapping: { [k: string]: string }
  _color: Color = new Color()

  constructor() {
    this.propertyNameMapping = {}
    this.customPropertyMapping = {}
  }

  setPropertyNameMapping(mapping: { [k: string]: string }) {
    this.propertyNameMapping = mapping
  }

  createBuffer(): PLYBuffer {

    const buffer: PLYBuffer = {
      indices: [],
      vertices: [],
      normals: [],
      uvs: [],
      faceVertexUvs: [],
      colors: [],
      faceVertexColors: []
    };

    for (const customProperty of Object.keys(this.customPropertyMapping)) {

      buffer[customProperty] = [];

    }

    return buffer;

  }

  extractHeaderText(bytes: Uint8Array): HeaderText {
    let i = 0;
    let cont = true;

    let line = '';
    const lines = [];

    const startLine = new TextDecoder().decode(bytes.subarray(0, 5));
    const hasCRNL = /^ply\r\n/.test(startLine);

    do {

      const c = String.fromCharCode(bytes[i++]);

      if (c !== '\n' && c !== '\r') {

        line += c;

      } else {

        if (line === 'end_header') cont = false;
        if (line !== '') {

          lines.push(line);
          line = '';

        }

      }

    } while (cont && i < bytes.length);

    // ascii section using \r\n as line endings
    if (hasCRNL === true) i++;

    return { headerText: lines.join('\r') + '\r', headerLength: i };

  }

  handleElement(buffer: PLYBuffer, elementName: string, element: PLYElement, cacheEntry: MappedAttributes) {

    if (elementName === 'vertex') {

      buffer.vertices.push(element[cacheEntry.attrX], element[cacheEntry.attrY], element[cacheEntry.attrZ]);

      if (cacheEntry.attrNX !== null && cacheEntry.attrNY !== null && cacheEntry.attrNZ !== null) {

        buffer.normals.push(element[cacheEntry.attrNX], element[cacheEntry.attrNY], element[cacheEntry.attrNZ]);

      }

      if (cacheEntry.attrS !== null && cacheEntry.attrT !== null) {

        buffer.uvs.push(element[cacheEntry.attrS], element[cacheEntry.attrT]);

      }

      if (cacheEntry.attrR !== null && cacheEntry.attrG !== null && cacheEntry.attrB !== null) {

        this._color.setRGB(
          element[cacheEntry.attrR] / 255.0,
          element[cacheEntry.attrG] / 255.0,
          element[cacheEntry.attrB] / 255.0
        ).convertSRGBToLinear();

        buffer.colors.push(this._color.r, this._color.g, this._color.b);

      }

      for (const customProperty of Object.keys(this.customPropertyMapping)) {

        for (const elementProperty of this.customPropertyMapping[customProperty]) {

          buffer[customProperty].push(element[elementProperty]);

        }

      }

    } else if (elementName === 'face') {

      const vertex_indices = element.vertex_indices || element.vertex_index; // issue #9338
      const texcoord = element.texcoord;

      if (vertex_indices.length === 3) {

        buffer.indices.push(vertex_indices[0], vertex_indices[1], vertex_indices[2]);

        if (texcoord && texcoord.length === 6) {

          buffer.faceVertexUvs.push(texcoord[0], texcoord[1]);
          buffer.faceVertexUvs.push(texcoord[2], texcoord[3]);
          buffer.faceVertexUvs.push(texcoord[4], texcoord[5]);

        }

      } else if (vertex_indices.length === 4) {

        buffer.indices.push(vertex_indices[0], vertex_indices[1], vertex_indices[3]);
        buffer.indices.push(vertex_indices[1], vertex_indices[2], vertex_indices[3]);

      }

      // face colors

      if (cacheEntry.attrR !== null && cacheEntry.attrG !== null && cacheEntry.attrB !== null) {

        this._color.setRGB(
          element[cacheEntry.attrR] / 255.0,
          element[cacheEntry.attrG] / 255.0,
          element[cacheEntry.attrB] / 255.0
        ).convertSRGBToLinear();
        buffer.faceVertexColors.push(this._color.r, this._color.g, this._color.b);
        buffer.faceVertexColors.push(this._color.r, this._color.g, this._color.b);
        buffer.faceVertexColors.push(this._color.r, this._color.g, this._color.b);

      }

    }

  }


  parse(data: string | ArrayBuffer): BufferGeometry {
    let geometry: BufferGeometry
    if (data instanceof ArrayBuffer) {
      const bytes = new Uint8Array(data)
      const { headerText, headerLength } = this.extractHeaderText(bytes)
      const header = this.parseHeader(headerText, headerLength)
      if (header.format === 'ascii') {
        const text = new TextDecoder().decode(bytes)
        geometry = this.parseASCII(text, header)
      } else {
        geometry = this.parseBinary(bytes, header)
      }

    } else {
      geometry = this.parseASCII(data, this.parseHeader(data))
    }

    return geometry
  }

  parseHeader(data: string, headerLength: number = 0): PLYHeader {
    const patternHeader = /^ply([\s\S]*)end_header(\r\n|\r|\n)/;
    let headerText = '';
    const result = patternHeader.exec(data);

    if (result !== null) {

      headerText = result[1];

    }

    const header: PLYHeader = {
      comments: [],
      elements: [],
      headerLength: headerLength,
      objInfo: '',
      format: '',
      version: ''
    };

    const lines = headerText.split(/\r\n|\r|\n/);
    let currentElement: PLYElementSpec | undefined;

    for (let i = 0; i < lines.length; i++) {

      let line = lines[i];
      line = line.trim();

      if (line === '') continue;

      const lineValues = line.split(/\s+/);
      const lineType = lineValues.shift();
      line = lineValues.join(' ');

      switch (lineType) {

        case 'format':

          header.format = lineValues[0];
          header.version = lineValues[1];

          break;

        case 'comment':

          header.comments.push(line);

          break;

        case 'element':

          if (currentElement !== undefined) {
            assertPLYElementSpec(currentElement)
            header.elements.push(currentElement)
          }

          currentElement = {
            name: lineValues[0],
            count: parseInt(lineValues[1]),
            properties: [],
          }

          break

        case 'property':

          if (currentElement === undefined) {

            console.warn('property without element');
            continue;

          }
          currentElement.properties.push(makePlyPropertySpec(lineValues, this.propertyNameMapping));

          break;

        case 'obj_info':

          header.objInfo = line;

          break;


        default:

          console.log('unhandled', lineType, lineValues);

      }

    }

    if (currentElement !== undefined) {

      header.elements.push(currentElement);

    }

    return header;

  }

  parseASCII(data: string, header: PLYHeader): BufferGeometry {
    // PLY ascii format specification, as per http://en.wikipedia.org/wiki/PLY_(file_format)

    const buffer = this.createBuffer();

    const patternBody = /end_header\s+(\S[\s\S]*\S|\S)\s*$/;
    let body: string[], matches;

    if ((matches = patternBody.exec(data)) !== null) {

      body = matches[1].split(/\s+/);

    } else {

      body = [];

    }

    const tokens = new ArrayStream(body);

    loop: for (let i = 0; i < header.elements.length; i++) {

      const elementDesc = header.elements[i];
      const attributeMap: MappedAttributes = mapElementAttributes(elementDesc.properties);

      for (let j = 0; j < elementDesc.count; j++) {

        // TODO - we're cooercing element to PLYElement inside this call
        // handle properly!
        const element = parseASCIIElement(elementDesc.properties, tokens);

        if (!element) break loop;

        this.handleElement(buffer, elementDesc.name, element, attributeMap);

      }

    }

    return this.postProcess(buffer);
  }

  parseBinary(data: Uint8Array, header: PLYHeader): BufferGeometry {
    const buffer = this.createBuffer();

    const little_endian = (header.format === 'binary_little_endian');
    const body = new DataView(data, header.headerLength);
    let result, loc = 0;

    for (let currentElement = 0; currentElement < header.elements.length; currentElement++) {

      const elementDesc = header.elements[currentElement];
      const properties = elementDesc.properties;
      const attributeMap: MappedAttributes = mapElementAttributes(properties);

      const binaryProperties = this.makeBinaryProperties(properties, body, little_endian);

      for (let currentElementCount = 0; currentElementCount < elementDesc.count; currentElementCount++) {

        result = binaryReadElement(loc, binaryProperties);
        loc += result[1];
        const element = result[0];

        this.handleElement(buffer, elementDesc.name, element, attributeMap);

      }

    }

    return this.postProcess(buffer);
  }

  postProcess(buffer: PLYBuffer): BufferGeometry {

    let geometry = new BufferGeometry();

    // mandatory buffer data

    if (buffer.indices.length > 0) {

      geometry.setIndex(buffer.indices);

    }

    geometry.setAttribute('position', new Float32BufferAttribute(buffer.vertices, 3));

    // optional buffer data

    if (buffer.normals.length > 0) {

      geometry.setAttribute('normal', new Float32BufferAttribute(buffer.normals, 3));

    }

    if (buffer.uvs.length > 0) {

      geometry.setAttribute('uv', new Float32BufferAttribute(buffer.uvs, 2));

    }

    if (buffer.colors.length > 0) {

      geometry.setAttribute('color', new Float32BufferAttribute(buffer.colors, 3));

    }

    if (buffer.faceVertexUvs.length > 0 || buffer.faceVertexColors.length > 0) {

      geometry = geometry.toNonIndexed();

      if (buffer.faceVertexUvs.length > 0) geometry.setAttribute('uv', new Float32BufferAttribute(buffer.faceVertexUvs, 2));
      if (buffer.faceVertexColors.length > 0) geometry.setAttribute('color', new Float32BufferAttribute(buffer.faceVertexColors, 3));

    }

    // custom buffer data

    for (const customProperty of Object.keys(this.customPropertyMapping)) {

      if (buffer[customProperty].length > 0) {

        geometry.setAttribute(
          customProperty,
          new Float32BufferAttribute(
            buffer[customProperty],
            this.customPropertyMapping[customProperty].length
          )
        );

      }

    }

    geometry.computeBoundingSphere();

    return geometry;

  }

  /** Augments properties with their appropriate valueReader attribute and
   * countReader if the property is a list type
   */
  makeBinaryProperties(properties: PLYProperty[], body: DataView, little_endian: boolean): BinaryPLYProperty[] {
    const newProperties: BinaryPLYProperty[] = []

    for (let i = 0, l = properties.length; i < l; i++) {

      const property = properties[i];

      if (property.isList) {

        newProperties.push({
          ...property,
          countReader: getBinaryReader(body, property.countType, little_endian),
          valueReader: getBinaryReader(body, property.type, little_endian)
        })
      } else {

        newProperties.push({
          ...property,
          valueReader: getBinaryReader(body, property.type, little_endian)
        })
      }
    }
    return newProperties
  }

}



function makePlyPropertySpec(propertyValues: string[], propertyNameMapping: { [k: string]: string }): PLYProperty {

  const prop0 = propertyValues[0];

  let property: PLYProperty;

  if (prop0 === 'list') {
    property = {
      isList: true,
      name: propertyValues[3],
      type: getDataType(propertyValues[2]),
      countType: getDataType(propertyValues[1]),
    };
  } else {
    property = {
      isList: false,
      name: propertyValues[1],
      type: getDataType(prop0)
    };
  }

  if (property.name in propertyNameMapping) {
    property.name = propertyNameMapping[property.name];
  }

  return property;
}

function parseASCIINumber(n: string, type: string): number {
  switch (type) {
    case 'char': case 'uchar': case 'short': case 'ushort': case 'int': case 'uint':
    case 'int8': case 'uint8': case 'int16': case 'uint16': case 'int32': case 'uint32':

      return parseInt(n)

    case 'float': case 'double': case 'float32': case 'float64':

      return parseFloat(n)
  }
  return 0
}

function parseASCIIElement(properties: PLYProperty[], tokens: ArrayStream<string>): PLYElement | null {

  const element: Partial<PLYElement> = {
    name: '',
    type: ''
  };

  for (let i = 0; i < properties.length; i++) {

    if (tokens.empty()) return null;

    const property = properties[i]

    if (property.isList) {

      const list = [];
      const n = parseASCIINumber(tokens.next(), property.countType);

      for (let j = 0; j < n; j++) {

        if (tokens.empty()) return null;

        list.push(parseASCIINumber(tokens.next(), property.type));

      }

      element[property.name] = list;

    } else {

      element[properties[i].name] = parseASCIINumber(tokens.next(), properties[i].type);

    }

  }

  return element as PLYElement // TODO: Properly handle types here

}

function mapElementAttributes(properties: PLYProperty[]) {

  const elementNames = properties.map(property => {

    return property.name;

  });

  function findAttrName(names: string[]) {

    for (let i = 0, l = names.length; i < l; i++) {

      const name = names[i];

      if (elementNames.includes(name)) return name;

    }

    return null;

  }

  return {
    attrX: findAttrName(['x', 'px', 'posx']) || 'x',
    attrY: findAttrName(['y', 'py', 'posy']) || 'y',
    attrZ: findAttrName(['z', 'pz', 'posz']) || 'z',
    attrNX: findAttrName(['nx', 'normalx']),
    attrNY: findAttrName(['ny', 'normaly']),
    attrNZ: findAttrName(['nz', 'normalz']),
    attrS: findAttrName(['s', 'u', 'texture_u', 'tx']),
    attrT: findAttrName(['t', 'v', 'texture_v', 'ty']),
    attrR: findAttrName(['red', 'diffuse_red', 'r', 'diffuse_r']),
    attrG: findAttrName(['green', 'diffuse_green', 'g', 'diffuse_g']),
    attrB: findAttrName(['blue', 'diffuse_blue', 'b', 'diffuse_b']),
  };

}

type MappedAttributes = ReturnType<typeof mapElementAttributes>


class PlyParser extends SurfaceParser {
  get type() { return 'ply' }

  getLoader() {
    return new PLYLoader()
  }
}

class ArrayStream<T> {
  arr: Array<T>
  i: number

  constructor(arr: Array<T>) {

    this.arr = arr;
    this.i = 0;

  }

  empty() {

    return this.i >= this.arr.length;

  }

  next() {

    return this.arr[this.i++];

  }

}


ParserRegistry.add('ply', PlyParser)

export default PlyParser
