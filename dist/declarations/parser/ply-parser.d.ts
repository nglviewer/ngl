import SurfaceParser from "./surface-parser";
import { BufferGeometry, Color } from "three";
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
declare const dataTypes: readonly ["int8", "char", "uint8", "uchar", "int16", "short", "uint16", "ushort", "int32", "int", "uint32", "uint", "float32", "float", "float64", "double"];
declare type DataType = (typeof dataTypes)[number];
interface HeaderText {
    headerText: string;
    headerLength: number;
}
interface BasePLYProperty {
    type: DataType;
    name: string;
    valueReader?: BinaryReader;
}
interface SinglePLYProperty extends BasePLYProperty {
    isList: false;
}
interface BinarySinglePLYProperty extends SinglePLYProperty {
    valueReader: BinaryReader;
}
interface ListPLYProperty extends BasePLYProperty {
    isList: true;
    countType: DataType;
    countReader?: BinaryReader;
}
interface BinaryListPLYProperty extends ListPLYProperty {
    countReader: BinaryReader;
    valueReader: BinaryReader;
}
declare type PLYProperty = SinglePLYProperty | ListPLYProperty;
declare type BinaryPLYProperty = BinarySinglePLYProperty | BinaryListPLYProperty;
interface PLYElement {
    name: string;
    count: number;
    properties: PLYProperty[];
    x: number;
    y: number;
    z: number;
    red: number;
    green: number;
    blue: number;
    [k: string]: any;
}
declare type PLYElementSpec = Pick<PLYElement, 'name' | 'count' | 'properties'>;
interface PLYHeader {
    format: string;
    version: string;
    comments: string[];
    elements: PLYElementSpec[];
    headerLength: number;
    objInfo: string;
}
/** JS object that we generate the buffer from */
interface PLYBuffer {
    indices: number[];
    vertices: number[];
    normals: number[];
    uvs: number[];
    faceVertexUvs: number[];
    colors: number[];
    faceVertexColors: number[];
    [k: string]: number[];
}
declare type BinaryReader = {
    read: (at: number) => number;
    size: number;
};
declare class PLYLoader {
    propertyNameMapping: {
        [k: string]: string;
    };
    customPropertyMapping: {
        [k: string]: string;
    };
    _color: Color;
    constructor();
    setPropertyNameMapping(mapping: {
        [k: string]: string;
    }): void;
    createBuffer(): PLYBuffer;
    extractHeaderText(bytes: Uint8Array): HeaderText;
    handleElement(buffer: PLYBuffer, elementName: string, element: PLYElement, cacheEntry: MappedAttributes): void;
    parse(data: string | ArrayBuffer): BufferGeometry;
    parseHeader(data: string, headerLength?: number): PLYHeader;
    parseASCII(data: string, header: PLYHeader): BufferGeometry;
    parseBinary(data: Uint8Array, header: PLYHeader): BufferGeometry;
    postProcess(buffer: PLYBuffer): BufferGeometry;
    /** Augments properties with their appropriate valueReader attribute and
     * countReader if the property is a list type
     */
    makeBinaryProperties(properties: PLYProperty[], body: DataView, little_endian: boolean): BinaryPLYProperty[];
}
declare function mapElementAttributes(properties: PLYProperty[]): {
    attrX: string;
    attrY: string;
    attrZ: string;
    attrNX: string | null;
    attrNY: string | null;
    attrNZ: string | null;
    attrS: string | null;
    attrT: string | null;
    attrR: string | null;
    attrG: string | null;
    attrB: string | null;
};
declare type MappedAttributes = ReturnType<typeof mapElementAttributes>;
declare class PlyParser extends SurfaceParser {
    get type(): string;
    getLoader(): PLYLoader;
}
export default PlyParser;
