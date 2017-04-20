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


/**
 * Class for building custom shapes.
 * @class
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
 */
function Shape( name, params ){

    this.name = defaults( name, "shape" );

    var p = params || {};

    var aspectRatio = defaults( p.aspectRatio, 1.5 );
    var sphereDetail = defaults( p.sphereDetail, 2 );
    var radialSegments = defaults( p.radialSegments, 50 );
    var disableImpostor = defaults( p.disableImpostor, false );
    var openEnded = defaults( p.openEnded, false );

    var center = new Vector3();
    var boundingBox = new Box3();

    var tmpVec = new Vector3();
    var tmpBox = new Box3();

    var bufferList = [];
    var meshCount = 0;

    var spherePosition = [];
    var sphereColor = [];
    var sphereRadius = [];

    var ellipsoidPosition = [];
    var ellipsoidColor = [];
    var ellipsoidRadius = [];
    var ellipsoidMajorAxis = [];
    var ellipsoidMinorAxis = [];

    var cylinderPosition1 = [];
    var cylinderPosition2 = [];
    var cylinderColor = [];
    var cylinderRadius = [];

    var conePosition1 = [];
    var conePosition2 = [];
    var coneColor = [];
    var coneRadius = [];

    var arrowPosition1 = [];
    var arrowPosition2 = [];
    var arrowColor = [];
    var arrowRadius = [];

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

    /**
     * Add a buffer
     * @instance
     * @memberof Shape
     * @param {Buffer} buffer - buffer object
     * @return {undefined}
     */
    function addBuffer( buffer ){

        bufferList.push( buffer );

        var geometry = buffer.geometry;
        if( !geometry.boundingBox ){
            geometry.computeBoundingBox();
        }
        boundingBox.union( geometry.boundingBox );

    }

    /**
     * Add a mesh
     * @instance
     * @memberof Shape
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
     * @return {undefined}
     */
    function addMesh( position, color, index, normal ){

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
            Object.assign( { shape: this, serial: meshCount }, data )
        );
        const meshBuffer = new MeshBuffer(
            Object.assign( { picking: picking }, data )
        );
        bufferList.push( meshBuffer );

        tmpBox.setFromArray( position );
        boundingBox.union( tmpBox );
        meshCount += 1;

    }

    /**
     * Add a sphere
     * @instance
     * @memberof Shape
     * @example
     * shape.addSphere( [ 0, 0, 9 ], [ 1, 0, 0 ], 1.5 );
     *
     * @param {Vector3|Array} position - position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @return {undefined}
     */
    function addSphere( position, color, radius ){

        addElement( position, spherePosition );
        addElement( color, sphereColor );
        sphereRadius.push( radius );

        boundingBox.expandByPoint( tmpVec.fromArray( position ) );

    }

    /**
     * Add an ellipsoid
     * @instance
     * @memberof Shape
     * @example
     * shape.addEllipsoid( [ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ] );
     *
     * @param {Vector3|Array} position - position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @param {Vector3|Array} majorAxis - major axis vector or array
     * @param {Vector3|Array} minorAxis - minor axis vector or array
     * @return {undefined}
     */
    function addEllipsoid( position, color, radius, majorAxis, minorAxis ){

        addElement( position, ellipsoidPosition );
        addElement( color, ellipsoidColor );
        ellipsoidRadius.push( radius );
        addElement( majorAxis, ellipsoidMajorAxis );
        addElement( minorAxis, ellipsoidMinorAxis );

        boundingBox.expandByPoint( tmpVec.fromArray( position ) );

    }

    /**
     * Add a cylinder
     * @instance
     * @memberof Shape
     * @example
     * shape.addCylinder( [ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5 );
     *
     * @param {Vector3|Array} position1 - from position vector or array
     * @param {Vector3|Array} position2 - to position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @return {undefined}
     */
    function addCylinder( position1, position2, color, radius ){

        addElement( position1, cylinderPosition1 );
        addElement( position2, cylinderPosition2 );
        addElement( color, cylinderColor );
        cylinderRadius.push( radius );

        boundingBox.expandByPoint( tmpVec.fromArray( position1 ) );
        boundingBox.expandByPoint( tmpVec.fromArray( position2 ) );

    }

    /**
     * Add a cone
     * @instance
     * @memberof Shape
     * @example
     * shape.addCone( [ 0, 2, 7 ], [ 0, 3, 3 ], [ 1, 1, 0 ], 1.5 );
     *
     * @param {Vector3|Array} position1 - from position vector or array
     * @param {Vector3|Array} position2 - to position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @return {undefined}
     */
    function addCone( position1, position2, color, radius ){

        addElement( position1, conePosition1 );
        addElement( position2, conePosition2 );
        addElement( color, coneColor );
        coneRadius.push( radius );

        boundingBox.expandByPoint( tmpVec.fromArray( position1 ) );
        boundingBox.expandByPoint( tmpVec.fromArray( position2 ) );

    }

    /**
     * Add an arrow
     * @instance
     * @memberof Shape
     * @example
     * shape.addArrow( [ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5 );
     *
     * @param {Vector3|Array} position1 - from position vector or array
     * @param {Vector3|Array} position2 - to position vector or array
     * @param {Color|Array} color - color object or array
     * @param {Float} radius - radius value
     * @return {undefined}
     */
    function addArrow( position1, position2, color, radius ){

        addElement( position1, arrowPosition1 );
        addElement( position2, arrowPosition2 );
        addElement( color, arrowColor );
        arrowRadius.push( radius );

        boundingBox.expandByPoint( tmpVec.fromArray( position1 ) );
        boundingBox.expandByPoint( tmpVec.fromArray( position2 ) );

    }

    function getBufferList(){

        const buffers = [];

        if( spherePosition.length ){
            const sphereData = {
                position: new Float32Array( spherePosition ),
                color: new Float32Array( sphereColor ),
                radius: new Float32Array( sphereRadius )
            };
            const spherePicking = new SpherePicker(
                serialArray( sphereRadius.length ),
                Object.assign( { shape: this }, sphereData )
            );
            const sphereBuffer = new SphereBuffer(
                Object.assign( { picking: spherePicking }, sphereData ),
                {
                    sphereDetail: sphereDetail,
                    disableImpostor: disableImpostor
                }
            );
            buffers.push( sphereBuffer );
        }

        if( ellipsoidPosition.length ){
            const ellipsoidData = {
                position: new Float32Array( ellipsoidPosition ),
                color: new Float32Array( ellipsoidColor ),
                radius: new Float32Array( ellipsoidRadius ),
                majorAxis: new Float32Array( ellipsoidMajorAxis ),
                minorAxis: new Float32Array( ellipsoidMinorAxis )
            };
            const ellipsoidPicking = new EllipsoidPicker(
                serialArray( ellipsoidRadius.length ),
                Object.assign( { shape: this }, ellipsoidData )
            );
            const ellipsoidBuffer = new EllipsoidBuffer(
                Object.assign( { picking: ellipsoidPicking }, ellipsoidData ),
                {
                    sphereDetail: sphereDetail,
                    disableImpostor: disableImpostor
                }
            );
            buffers.push( ellipsoidBuffer );
        }

        if( cylinderPosition1.length ){
            const cylinderData = {
                position1: new Float32Array( cylinderPosition1 ),
                position2: new Float32Array( cylinderPosition2 ),
                color: new Float32Array( cylinderColor ),
                color2: new Float32Array( cylinderColor ),
                radius: new Float32Array( cylinderRadius )
            };
            const cylinderPicking = new CylinderPicker(
                serialArray( cylinderRadius.length ),
                Object.assign( { shape: this }, cylinderData )
            );
            const cylinderBuffer = new CylinderBuffer(
                Object.assign( { picking: cylinderPicking }, cylinderData ),
                {
                    radialSegments: radialSegments,
                    disableImpostor: disableImpostor,
                    openEnded: openEnded,
                }
            );
            buffers.push( cylinderBuffer );
        }

        if( conePosition1.length ){
            const coneData = {
                position1: new Float32Array( conePosition1 ),
                position2: new Float32Array( conePosition2 ),
                color: new Float32Array( coneColor ),
                radius: new Float32Array( coneRadius )
            };
            const conePicking = new ConePicker(
                serialArray( coneRadius.length ),
                Object.assign( { shape: this }, coneData )
            );
            const coneBuffer = new ConeBuffer(
                Object.assign( { picking: conePicking }, coneData ),
                {
                    radialSegments: radialSegments,
                    disableImpostor: disableImpostor,
                    openEnded: openEnded,
                }
            );
            buffers.push( coneBuffer );
        }

        if( arrowPosition1.length ){
            const arrowData = {
                position1: new Float32Array( arrowPosition1 ),
                position2: new Float32Array( arrowPosition2 ),
                color: new Float32Array( arrowColor ),
                radius: new Float32Array( arrowRadius )
            };
            const arrowPicking = new ArrowPicker(
                serialArray( arrowRadius.length ),
                Object.assign( { shape: this }, arrowData )
            );
            const arrowBuffer = new ArrowBuffer(
                Object.assign( { picking: arrowPicking }, arrowData ),
                {
                    aspectRatio: aspectRatio,
                    radialSegments: radialSegments,
                    disableImpostor: disableImpostor,
                    openEnded: openEnded,
                }
            );
            buffers.push( arrowBuffer );
        }

        return bufferList.concat( buffers );

    }

    function dispose(){

        bufferList.forEach( function( buffer ){
            buffer.dispose();
        } );
        bufferList.length = 0;

        spherePosition.length = 0;
        sphereColor.length = 0;
        sphereRadius.length = 0;

        ellipsoidPosition.length = 0;
        ellipsoidColor.length = 0;
        ellipsoidRadius.length = 0;
        ellipsoidMajorAxis.length = 0;
        ellipsoidMinorAxis.length = 0;

        cylinderPosition1.length = 0;
        cylinderPosition2.length = 0;
        cylinderColor.length = 0;
        cylinderRadius.length = 0;

        conePosition1.length = 0;
        conePosition2.length = 0;
        coneColor.length = 0;
        coneRadius.length = 0;

        arrowPosition1.length = 0;
        arrowPosition2.length = 0;
        arrowColor.length = 0;
        arrowRadius.length = 0;

    }

    // API

    Object.defineProperties( this, {
        center: {
            get: function(){ return boundingBox.getCenter( center ); }
        },
    } );
    this.boundingBox = boundingBox;

    this.addBuffer = addBuffer;
    this.addMesh = addMesh;
    this.addSphere = addSphere;
    this.addEllipsoid = addEllipsoid;
    this.addCylinder = addCylinder;
    this.addCone = addCone;
    this.addArrow = addArrow;
    this.getBufferList = getBufferList;
    this.dispose = dispose;

}

Shape.prototype.constructor = Shape;
Shape.prototype.type = "Shape";


export default Shape;
