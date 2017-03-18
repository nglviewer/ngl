/**
 * @file Cone Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Matrix4, Vector3, ConeBufferGeometry } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import { calculateCenterArray } from "../math/array-utils.js";
import GeometryBuffer from "./geometry-buffer.js";


const scale = new Vector3();
const eye = new Vector3();
const target = new Vector3();
const up = new Vector3( 0, 1, 0 );


class ConeGeometryBuffer extends GeometryBuffer{

    // position1, position2, color, radius, pickingColor
    constructor( data, params ){

        const p = params || {};

        const radialSegments = defaults( p.radialSegments, 60 );
        const openEnded = defaults( p.openEnded, false );
        const matrix = new Matrix4().makeRotationX( -Math.PI / 2  );

        const geo = new ConeBufferGeometry(
            1,  // radius
            1,  // height
            radialSegments,  // radialSegments
            1,  // heightSegments
            openEnded  // openEnded
        );
        geo.applyMatrix( matrix );

        const n = data.position1.length;
        const m = data.radius.length;

        const position = new Float32Array( n );

        super( {
            position: position,
            color: data.color,
            pickingColor: data.pickingColor
        }, p, geo );

        this._position = position;
        this._from = new Float32Array( n );
        this._to = new Float32Array( n );
        this._radius = new Float32Array( m );

        this.setAttributes( data, true );

    }

    applyPositionTransform( matrix, i, i3 ){

        eye.fromArray( this._from, i3 );
        target.fromArray( this._to, i3 );
        matrix.lookAt( eye, target, up );

        const r = this._radius[ i ];
        scale.set( r, r, eye.distanceTo( target ) );
        matrix.scale( scale );

    }

    setAttributes( data, initNormals ){

        var geoData = {};

        if( data.position1 && data.position2 ){
            calculateCenterArray(
                data.position1, data.position2, this._position
            );
            this._from.set( data.position1 );
            this._to.set( data.position2 );
            geoData.position = this._position;
        }

        if( data.color ){
            geoData.color = data.color;
        }

        if( data.pickingColor ){
            geoData.pickingColor = data.pickingColor;
        }

        if( data.radius ){
            this._radius.set( data.radius );
        }

        super.setAttributes( geoData, initNormals );

    }

    get updateNormals (){ return true; }

}


export default ConeGeometryBuffer;
