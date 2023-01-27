/**
 * @file Shape
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Box3, Vector3, Color } from 'three';
import Buffer from '../buffer/buffer';
import { TextBufferParameters } from '../buffer/text-buffer';
export declare const ShapeDefaultParameters: {
    aspectRatio: number;
    sphereDetail: number;
    radialSegments: number;
    disableImpostor: boolean;
    openEnded: boolean;
    dashedCylinder: boolean;
    labelParams: Partial<TextBufferParameters>;
    pointSize: number;
    sizeAttenuation: boolean;
    useTexture: boolean;
    linewidth: number;
};
export declare type ShapeParameters = typeof ShapeDefaultParameters;
/**
 * Class for building custom shapes.
 *
 * @example
 * var shape = new NGL.Shape('shape', { disableImpostor: true });
 * shape.addSphere([ 0, 0, 9 ], [ 1, 0, 0 ], 1.5 );
 * shape.addEllipsoid([ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ]);
 * shape.addCylinder([ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5);
 * shape.addCone([ 0, 2, 7 ], [ 0, 3, 3 ], [ 1, 1, 0 ], 1.5);
 * shape.addArrow([ 1, 2, 7 ], [ 30, 3, 3 ], [ 1, 0, 1 ], 1.0);
 * shape.addBox([ 0, 3, 0 ], [ 1, 0, 1 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ]);
 * var shapeComp = stage.addComponentFromObject(shape);
 * geoComp.addRepresentation('buffer');
 */
declare class Shape {
    name: string;
    parameters: ShapeParameters;
    boundingBox: Box3;
    bufferList: Buffer[];
    meshCount: number;
    _center?: Vector3;
    _primitiveData: {
        [k: string]: any;
    };
    /**
     * @param {String} name - name
     * @param {Object} params - parameter object
     * @param {Integer} params.aspectRatio - arrow aspect ratio, used for cylinder radius and cone length
     * @param {Integer} params.sphereDetail - sphere quality (icosahedron subdivisions)
     * @param {Integer} params.radialSegments - cylinder quality (number of segments)
     * @param {Boolean} params.disableImpostor - disable use of raycasted impostors for rendering
     * @param {Boolean} params.openEnded - capped or not
     * @param {TextBufferParameters} params.labelParams - label parameters
     */
    constructor(name?: string, params?: Partial<ShapeParameters>);
    /**
     * Add a buffer
     * @param {Buffer} buffer - buffer object
     * @return {Shape} this object
     */
    addBuffer(buffer: Buffer): this;
    /**
     * Add a mesh
     * @example
     * shape.addMesh(
     *   [ 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1 ],
     *   [ 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 ]
     * );
     *
     * @param {Float32Array|Array} position - positions
     * @param {Float32Array|Array} color - colors
     * @param {Uint32Array|Uint16Array|Array} [index] - indices
     * @param {Float32Array|Array} [normal] - normals
     * @param {String} [name] - text
     * @return {Shape} this object
     */
    addMesh(position: Float32Array | number[], color: Float32Array | number[], index: Uint32Array | Uint16Array | number[], normal?: Float32Array | number[], name?: string): this;
    /**
     * Add a sphere
     * @example
     * shape.addSphere([ 0, 0, 9 ], [ 1, 0, 0 ], 1.5);
     *
     * @param {Vector3|Array} position - position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @param {String} [name] - text
     * @return {Shape} this object
     */
    addSphere(position: Vector3 | [number, number, number], color: Color | [number, number, number], radius: number, name: string): this;
    /**
     * Add an ellipsoid
     * @example
     * shape.addEllipsoid([ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ]);
     *
     * @param {Vector3|Array} position - position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @param {Vector3|Array} majorAxis - major axis vector or array
     * @param {Vector3|Array} minorAxis - minor axis vector or array
     * @param {String} [name] - text
     * @return {Shape} this object
     */
    addEllipsoid(position: Vector3 | [number, number, number], color: Color | [number, number, number], radius: number, majorAxis: Vector3 | [number, number, number], minorAxis: Vector3 | [number, number, number], name: string): this;
    /**
     * Add a torus
     * @example
     * shape.addTorus([ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ]);
     *
     * @param {Vector3|Array} position - position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @param {Vector3|Array} majorAxis - major axis vector or array
     * @param {Vector3|Array} minorAxis - minor axis vector or array
     * @param {String} [name] - text
     * @return {Shape} this object
     */
    addTorus(position: Vector3 | [number, number, number], color: Color | [number, number, number], radius: number, majorAxis: Vector3 | [number, number, number], minorAxis: Vector3 | [number, number, number], name: string): this;
    /**
     * Add a cylinder
     * @example
     * shape.addCylinder([ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5);
     *
     * @param {Vector3|Array} position1 - from position vector or array
     * @param {Vector3|Array} position2 - to position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @param {String} [name] - text
     * @return {Shape} this object
     */
    addCylinder(position1: Vector3 | [number, number, number], position2: Vector3 | [number, number, number], color: Color | [number, number, number], radius: number, name: string): this;
    /**
     * Add a cone
     * @example
     * shape.addCone([ 0, 2, 7 ], [ 0, 3, 3 ], [ 1, 1, 0 ], 1.5);
     *
     * @param {Vector3|Array} position1 - from position vector or array
     * @param {Vector3|Array} position2 - to position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @param {String} [name] - text
     * @return {Shape} this object
     */
    addCone(position1: Vector3 | [number, number, number], position2: Vector3 | [number, number, number], color: Color | [number, number, number], radius: number, name: string): this;
    /**
     * Add an arrow
     * @example
     * shape.addArrow([ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5);
     *
     * @param {Vector3|Array} position1 - from position vector or array
     * @param {Vector3|Array} position2 - to position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @param {String} [name] - text
     * @return {Shape} this object
     */
    addArrow(position1: Vector3 | [number, number, number], position2: Vector3 | [number, number, number], color: Color | [number, number, number], radius: number, name: string): this;
    /**
     * Add a box
     * @example
     * shape.addBox([ 0, 3, 0 ], [ 1, 0, 1 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ]);
     *
     * @param {Vector3|Array} position - position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} size - size value
     * @param {Vector3|Array} heightAxis - height axis vector or array
     * @param {Vector3|Array} depthAxis - depth axis vector or array
     * @param {String} [name] - text
     * @return {Shape} this object
     */
    addBox(position: Vector3 | [number, number, number], color: Color | [number, number, number], size: number, heightAxis: Vector3 | [number, number, number], depthAxis: Vector3 | [number, number, number], name: string): this;
    /**
     * Add an octahedron
     * @example
     * shape.addOctahedron([ 0, 3, 0 ], [ 1, 0, 1 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ]);
     *
     * @param {Vector3|Array} position - position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} size - size value
     * @param {Vector3|Array} heightAxis - height axis vector or array
     * @param {Vector3|Array} depthAxis - depth axis vector or array
     * @param {String} [name] - text
     * @return {Shape} this object
     */
    addOctahedron(position: Vector3 | [number, number, number], color: Color | [number, number, number], size: number, heightAxis: Vector3 | [number, number, number], depthAxis: Vector3 | [number, number, number], name: string): this;
    /**
     * Add a tetrahedron
     * @example
     * shape.addTetrahedron([ 0, 3, 0 ], [ 1, 0, 1 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ]);
     *
     * @param {Vector3|Array} position - position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} size - size value
     * @param {Vector3|Array} heightAxis - height axis vector or array
     * @param {Vector3|Array} depthAxis - depth axis vector or array
     * @param {String} [name] - text
     * @return {Shape} this object
     */
    addTetrahedron(position: Vector3 | [number, number, number], color: Color | [number, number, number], size: number, heightAxis: Vector3 | [number, number, number], depthAxis: Vector3 | [number, number, number], name: string): this;
    /**
     * Add text
     * @example
     * shape.addText([ 10, -2, 4 ], [ 0.2, 0.5, 0.8 ], 0.5, "Hello");
     *
     * @param {Vector3|Array} position - position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} size - size value
     * @param {String} text - text value
     * @return {Shape} this object
     */
    addText(position: Vector3 | [number, number, number], color: Color | [number, number, number], size: number, text: string): this;
    /**
     * Add point
     * @example
     * shape.addPoint([ 10, -2, 4 ], [ 0.2, 0.5, 0.8 ]);
     *
     * @param {Vector3|Array} position - position vector or array
     * @param {Color|Array} color - color object or array
     * @param {String} [name] - text
     * @return {Shape} this object
     */
    addPoint(position: Vector3 | [number, number, number], color: Color | [number, number, number], name: string): this;
    /**
     * Add a wideline
     * @example
     * shape.addWideline([ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ]);
     *
     * @param {Vector3|Array} position1 - from position vector or array
     * @param {Vector3|Array} position2 - to position vector or array
     * @param {Color|Array} color - color object or array
     * @param {String} [name] - text
     * @return {Shape} this object
     */
    addWideline(position1: Vector3 | [number, number, number], position2: Vector3 | [number, number, number], color: Color | [number, number, number], linewidth: number, name: string): this;
    /**
     * Deprecated, use `.addText`
     */
    addLabel(position: Vector3 | [number, number, number], color: Color | [number, number, number], size: number, text: string): this;
    getBufferList(): Buffer[];
    dispose(): void;
    get center(): Vector3;
    get type(): string;
}
export default Shape;
