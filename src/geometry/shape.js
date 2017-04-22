/**
 * @file Shape
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Box3 } from "../../lib/three.es6.js";

import { defaults, ensureFloat32Array } from "../utils.js";
import {
    ArrowPicker, ConePicker, CylinderPicker,
    EllipsoidPicker, MeshPicker, SpherePicker
} from "../utils/picker.js";
import { serialArray } from "../math/array-utils.js";
import MeshBuffer from "../buffer/mesh-buffer.js";
import SphereBuffer from "../buffer/sphere-buffer.js";
import EllipsoidBuffer from "../buffer/ellipsoid-buffer.js";
import CylinderBuffer from "../buffer/cylinder-buffer.js";
import ConeBuffer from "../buffer/cone-buffer.js";
import ArrowBuffer from "../buffer/arrow-buffer.js";
import TextBuffer from "../buffer/text-buffer.js";


function addElement( elm, array ){
    if( elm.toArray !== undefined ){
        elm = elm.toArray();
    }else if( elm.x !== undefined ){
        elm = [ elm.x, elm.y, elm.z ];
    }else if( elm.r !== undefined ){
        elm = [ elm.r, elm.g, elm.b ];
    }
    array.push.apply( array, elm );
}

const tmpVec = new Vector3();
const tmpBox = new Box3();


/**
 * Class for building custom shapes.
 */
class Shape{

    /**
     * Create Shape object.
     * @example
     * var shape = new NGL.Shape( "shape", { disableImpostor: true } );
     * shape.addSphere( [ 0, 0, 9 ], [ 1, 0, 0 ], 1.5 );
     * shape.addEllipsoid( [ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ] );
     * shape.addCylinder( [ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5 );
     * shape.addCone( [ 0, 2, 7 ], [ 0, 3, 3 ], [ 1, 1, 0 ], 1.5 );
     * shape.addArrow( [ 1, 2, 7 ], [ 30, 3, 3 ], [ 1, 0, 1 ], 1.0 );
     * var shapeComp = stage.addComponentFromObject( shape );
     * geoComp.addRepresentation( "buffer" );
     *
     * @param {String} name - name
     * @param {Object} params - parameter object
     * @param {Integer} params.aspectRatio - arrow aspect ratio, used for cylinder radius and cone length
     * @param {Integer} params.sphereDetail - sphere quality (icosahedron subdivisions)
     * @param {Integer} params.radialSegments - cylinder quality (number of segments)
     * @param {Boolean} params.disableImpostor - disable use of raycasted impostors for rendering
     * @param {Boolean} params.openEnded - capped or not
     * @param {TextBufferParameters} params.labelParams - label parameters
     */
    constructor( name, params ){

        this.name = defaults( name, "shape" );

        var p = params || {};

        this.aspectRatio = defaults( p.aspectRatio, 1.5 );
        this.sphereDetail = defaults( p.sphereDetail, 2 );
        this.radialSegments = defaults( p.radialSegments, 50 );
        this.disableImpostor = defaults( p.disableImpostor, false );
        this.openEnded = defaults( p.openEnded, false );
        this.labelParams = defaults( p.labelParams, {} );

        this.boundingBox = new Box3();

        this.bufferList = [];
        this.meshCount = 0;

        this.spherePosition = [];
        this.sphereColor = [];
        this.sphereRadius = [];

        this.ellipsoidPosition = [];
        this.ellipsoidColor = [];
        this.ellipsoidRadius = [];
        this.ellipsoidMajorAxis = [];
        this.ellipsoidMinorAxis = [];

        this.cylinderPosition1 = [];
        this.cylinderPosition2 = [];
        this.cylinderColor = [];
        this.cylinderRadius = [];

        this.conePosition1 = [];
        this.conePosition2 = [];
        this.coneColor = [];
        this.coneRadius = [];

        this.arrowPosition1 = [];
        this.arrowPosition2 = [];
        this.arrowColor = [];
        this.arrowRadius = [];

        this.labelPosition = [];
        this.labelColor = [];
        this.labelSize = [];
        this.labelText = [];

    }

    /**
     * Add a buffer
     * @param {Buffer} buffer - buffer object
     * @return {Shape} this object
     */
    addBuffer( buffer ){

        this.bufferList.push( buffer );

        var geometry = buffer.geometry;
        if( !geometry.boundingBox ){
            geometry.computeBoundingBox();
        }
        this.boundingBox.union( geometry.boundingBox );

        return this;

    }

    /**
     * Add a mesh
     * @example
     * shape.addMesh(
     *     [ 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1 ],
     *     [ 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 ]
     * );
     *
     * @param {Float32Array|Array} position - positions
     * @param {Float32Array|Array} color - colors
     * @param {Uint32Array|Uint16Array|Array} [index] - indices
     * @param {Float32Array|Array} [normal] - normals
     * @return {Shape} this object
     */
    addMesh( position, color, index, normal ){

        position = ensureFloat32Array( position );
        color = ensureFloat32Array( color );
        if( Array.isArray( index ) ){
            const ctor = position.length > 65535 ? Uint32Array : Uint16Array;
            index = new ctor( index );
        }
        if( normal ){
            normal = ensureFloat32Array( normal );
        }

        const data = { position, color, index, normal };
        const picking = new MeshPicker(
            serialArray( position.length ),
            Object.assign( { shape: this, serial: this.meshCount }, data )
        );
        const meshBuffer = new MeshBuffer(
            Object.assign( { picking: picking }, data )
        );
        this.bufferList.push( meshBuffer );

        tmpBox.setFromArray( position );
        this.boundingBox.union( tmpBox );
        this.meshCount += 1;

        return this;

    }

    /**
     * Add a sphere
     * @example
     * shape.addSphere( [ 0, 0, 9 ], [ 1, 0, 0 ], 1.5 );
     *
     * @param {Vector3|Array} position - position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @return {Shape} this object
     */
    addSphere( position, color, radius ){

        addElement( position, this.spherePosition );
        addElement( color, this.sphereColor );
        this.sphereRadius.push( radius );

        this.boundingBox.expandByPoint( tmpVec.fromArray( position ) );

        return this;

    }

    /**
     * Add an ellipsoid
     * @example
     * shape.addEllipsoid( [ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ] );
     *
     * @param {Vector3|Array} position - position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @param {Vector3|Array} majorAxis - major axis vector or array
     * @param {Vector3|Array} minorAxis - minor axis vector or array
     * @return {Shape} this object
     */
    addEllipsoid( position, color, radius, majorAxis, minorAxis ){

        addElement( position, this.ellipsoidPosition );
        addElement( color, this.ellipsoidColor );
        this.ellipsoidRadius.push( radius );
        addElement( majorAxis, this.ellipsoidMajorAxis );
        addElement( minorAxis, this.ellipsoidMinorAxis );

        this.boundingBox.expandByPoint( tmpVec.fromArray( position ) );

        return this;

    }

    /**
     * Add a cylinder
     * @example
     * shape.addCylinder( [ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5 );
     *
     * @param {Vector3|Array} position1 - from position vector or array
     * @param {Vector3|Array} position2 - to position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @return {Shape} this object
     */
    addCylinder( position1, position2, color, radius ){

        addElement( position1, this.cylinderPosition1 );
        addElement( position2, this.cylinderPosition2 );
        addElement( color, this.cylinderColor );
        this.cylinderRadius.push( radius );

        this.boundingBox.expandByPoint( tmpVec.fromArray( position1 ) );
        this.boundingBox.expandByPoint( tmpVec.fromArray( position2 ) );

        return this;

    }

    /**
     * Add a cone
     * @example
     * shape.addCone( [ 0, 2, 7 ], [ 0, 3, 3 ], [ 1, 1, 0 ], 1.5 );
     *
     * @param {Vector3|Array} position1 - from position vector or array
     * @param {Vector3|Array} position2 - to position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @return {Shape} this object
     */
    addCone( position1, position2, color, radius ){

        addElement( position1, this.conePosition1 );
        addElement( position2, this.conePosition2 );
        addElement( color, this.coneColor );
        this.coneRadius.push( radius );

        this.boundingBox.expandByPoint( tmpVec.fromArray( position1 ) );
        this.boundingBox.expandByPoint( tmpVec.fromArray( position2 ) );

        return this;

    }

    /**
     * Add an arrow
     * @example
     * shape.addArrow( [ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5 );
     *
     * @param {Vector3|Array} position1 - from position vector or array
     * @param {Vector3|Array} position2 - to position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @return {Shape} this object
     */
    addArrow( position1, position2, color, radius ){

        addElement( position1, this.arrowPosition1 );
        addElement( position2, this.arrowPosition2 );
        addElement( color, this.arrowColor );
        this.arrowRadius.push( radius );

        this.boundingBox.expandByPoint( tmpVec.fromArray( position1 ) );
        this.boundingBox.expandByPoint( tmpVec.fromArray( position2 ) );

        return this;

    }

    /**
     * Add a label
     * @example
     * shape.addLabel( [ 10, -2, 4 ], [ 0.2, 0.5, 0.8 ], 0.5, "Hello" );
     *
     * @param {Vector3|Array} position - from position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} size - size value
     * @param {String} text - text value
     * @return {Shape} this object
     */
    addLabel( position, color, size, text ){

        addElement( position, this.labelPosition );
        addElement( color, this.labelColor );
        this.labelSize.push( size );
        this.labelText.push( text );

        this.boundingBox.expandByPoint( tmpVec.fromArray( position ) );

        return this;

    }

    getBufferList(){

        const buffers = [];

        if( this.spherePosition.length ){
            const sphereData = {
                position: new Float32Array( this.spherePosition ),
                color: new Float32Array( this.sphereColor ),
                radius: new Float32Array( this.sphereRadius )
            };
            const spherePicking = new SpherePicker(
                serialArray( this.sphereRadius.length ),
                Object.assign( { shape: this }, sphereData )
            );
            const sphereBuffer = new SphereBuffer(
                Object.assign( { picking: spherePicking }, sphereData ),
                {
                    sphereDetail: this.sphereDetail,
                    disableImpostor: this.disableImpostor
                }
            );
            buffers.push( sphereBuffer );
        }

        if( this.ellipsoidPosition.length ){
            const ellipsoidData = {
                position: new Float32Array( this.ellipsoidPosition ),
                color: new Float32Array( this.ellipsoidColor ),
                radius: new Float32Array( this.ellipsoidRadius ),
                majorAxis: new Float32Array( this.ellipsoidMajorAxis ),
                minorAxis: new Float32Array( this.ellipsoidMinorAxis )
            };
            const ellipsoidPicking = new EllipsoidPicker(
                serialArray( this.ellipsoidRadius.length ),
                Object.assign( { shape: this }, ellipsoidData )
            );
            const ellipsoidBuffer = new EllipsoidBuffer(
                Object.assign( { picking: ellipsoidPicking }, ellipsoidData ),
                {
                    sphereDetail: this.sphereDetail,
                    disableImpostor: this.disableImpostor
                }
            );
            buffers.push( ellipsoidBuffer );
        }

        if( this.cylinderPosition1.length ){
            const cylinderData = {
                position1: new Float32Array( this.cylinderPosition1 ),
                position2: new Float32Array( this.cylinderPosition2 ),
                color: new Float32Array( this.cylinderColor ),
                color2: new Float32Array( this.cylinderColor ),
                radius: new Float32Array( this.cylinderRadius )
            };
            const cylinderPicking = new CylinderPicker(
                serialArray( this.cylinderRadius.length ),
                Object.assign( { shape: this }, cylinderData )
            );
            const cylinderBuffer = new CylinderBuffer(
                Object.assign( { picking: cylinderPicking }, cylinderData ),
                {
                    radialSegments: this.radialSegments,
                    disableImpostor: this.disableImpostor,
                    openEnded: this.openEnded,
                }
            );
            buffers.push( cylinderBuffer );
        }

        if( this.conePosition1.length ){
            const coneData = {
                position1: new Float32Array( this.conePosition1 ),
                position2: new Float32Array( this.conePosition2 ),
                color: new Float32Array( this.coneColor ),
                radius: new Float32Array( this.coneRadius )
            };
            const conePicking = new ConePicker(
                serialArray( this.coneRadius.length ),
                Object.assign( { shape: this }, coneData )
            );
            const coneBuffer = new ConeBuffer(
                Object.assign( { picking: conePicking }, coneData ),
                {
                    radialSegments: this.radialSegments,
                    disableImpostor: this.disableImpostor,
                    openEnded: this.openEnded,
                }
            );
            buffers.push( coneBuffer );
        }

        if( this.arrowPosition1.length ){
            const arrowData = {
                position1: new Float32Array( this.arrowPosition1 ),
                position2: new Float32Array( this.arrowPosition2 ),
                color: new Float32Array( this.arrowColor ),
                radius: new Float32Array( this.arrowRadius )
            };
            const arrowPicking = new ArrowPicker(
                serialArray( this.arrowRadius.length ),
                Object.assign( { shape: this }, arrowData )
            );
            const arrowBuffer = new ArrowBuffer(
                Object.assign( { picking: arrowPicking }, arrowData ),
                {
                    aspectRatio: this.aspectRatio,
                    radialSegments: this.radialSegments,
                    disableImpostor: this.disableImpostor,
                    openEnded: this.openEnded,
                }
            );
            buffers.push( arrowBuffer );
        }

        if( this.labelPosition.length ){
            const labelData = {
                position: new Float32Array( this.labelPosition ),
                color: new Float32Array( this.labelColor ),
                size: new Float32Array( this.labelSize ),
                text: this.labelText
            };
            const labelBuffer = new TextBuffer( labelData, this.labelParams );
            buffers.push( labelBuffer );
        }

        return this.bufferList.concat( buffers );

    }

    dispose(){

        this.bufferList.forEach( function( buffer ){
            buffer.dispose();
        } );
        this.bufferList.length = 0;

        this.spherePosition.length = 0;
        this.sphereColor.length = 0;
        this.sphereRadius.length = 0;

        this.ellipsoidPosition.length = 0;
        this.ellipsoidColor.length = 0;
        this.ellipsoidRadius.length = 0;
        this.ellipsoidMajorAxis.length = 0;
        this.ellipsoidMinorAxis.length = 0;

        this.cylinderPosition1.length = 0;
        this.cylinderPosition2.length = 0;
        this.cylinderColor.length = 0;
        this.cylinderRadius.length = 0;

        this.conePosition1.length = 0;
        this.conePosition2.length = 0;
        this.coneColor.length = 0;
        this.coneRadius.length = 0;

        this.arrowPosition1.length = 0;
        this.arrowPosition2.length = 0;
        this.arrowColor.length = 0;
        this.arrowRadius.length = 0;

    }

    get center(){

        if( !this._center ){
            this._center = this.boundingBox.getCenter();
        }
        return this._center;

    }

    get type(){ return "Shape"; }

}


export default Shape;
