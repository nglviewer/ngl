/**
 * @file Primitive
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Box3 } from 'three';
import Shape from './shape';
export declare type PrimitiveFields = {
    [k: string]: string;
};
/**
 * Base class for geometry primitives
 * @interface
 */
export declare abstract class Primitive {
    static type: string;
    static fields: PrimitiveFields;
    static get Picker(): any;
    static get Buffer(): any;
    static getShapeKey(name: string): string;
    static expandBoundingBox(box: Box3, data: any): void;
    static valueToShape(shape: Shape, name: string, value: any): void;
    static objectToShape(shape: Shape, data: any): void;
    static valueFromShape(shape: Shape, pid: number, name: string): any;
    static objectFromShape(shape: Shape, pid: number): any;
    static arrayFromShape(shape: Shape, name: string): any;
    static dataFromShape(shape: Shape): any;
    static bufferFromShape(shape: Shape, params: any): any;
}
/**
 * Sphere geometry primitive
 */
export declare class SpherePrimitive extends Primitive {
    static type: string;
    static fields: {
        position: string;
        color: string;
        radius: string;
    };
    static positionFromShape(shape: Shape, pid: number): any;
    static expandBoundingBox(box: Box3, data: any): void;
}
/**
 * Box geometry primitive
 */
export declare class BoxPrimitive extends Primitive {
    static type: string;
    static fields: {
        position: string;
        color: string;
        size: string;
        heightAxis: string;
        depthAxis: string;
    };
    static positionFromShape(shape: Shape, pid: number): any;
    static expandBoundingBox(box: Box3, data: any): void;
}
/**
 * Octahedron geometry primitive
 */
export declare class OctahedronPrimitive extends BoxPrimitive {
    static type: string;
}
/**
 * Tetrahedron geometry primitive
 */
export declare class TetrahedronPrimitive extends BoxPrimitive {
    static type: string;
}
/**
 * Cylinder geometry primitive
 */
export declare class CylinderPrimitive extends Primitive {
    static type: string;
    static fields: {
        position1: string;
        position2: string;
        color: string;
        radius: string;
    };
    static positionFromShape(shape: Shape, pid: number): any;
    static expandBoundingBox(box: Box3, data: any): void;
    static bufferFromShape(shape: Shape, params?: any): any;
}
/**
 * Arrow geometry primitive
 */
export declare class ArrowPrimitive extends CylinderPrimitive {
    static type: string;
}
/**
 * Cone geometry primitive
 */
export declare class ConePrimitive extends CylinderPrimitive {
    static type: string;
}
/**
 * Ellipsoid geometry primitive
 */
export declare class EllipsoidPrimitive extends SpherePrimitive {
    static type: string;
    static fields: {
        position: string;
        color: string;
        radius: string;
        majorAxis: string;
        minorAxis: string;
    };
}
/**
 * Torus geometry primitive
 */
export declare class TorusPrimitive extends EllipsoidPrimitive {
    static type: string;
}
/**
 * Text geometry primitive
 */
export declare class TextPrimitive extends Primitive {
    static type: string;
    static fields: {
        position: string;
        color: string;
        size: string;
        text: string;
    };
    static positionFromShape(shape: Shape, pid: number): any;
    static expandBoundingBox(box: Box3, data: any): void;
}
/**
 * Point primitive
 */
export declare class PointPrimitive extends Primitive {
    static type: string;
    static fields: {
        position: string;
        color: string;
    };
    static positionFromShape(shape: Shape, pid: number): any;
    static expandBoundingBox(box: Box3, data: any): void;
}
/**
 * Wideline geometry primitive
 */
export declare class WidelinePrimitive extends Primitive {
    static type: string;
    static fields: {
        position1: string;
        position2: string;
        color: string;
    };
    static positionFromShape(shape: Shape, pid: number): any;
    static expandBoundingBox(box: Box3, data: any): void;
}
