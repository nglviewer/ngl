/**
 * @file Ellipsoid Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { IcosahedronGeometry, Vector3 } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import GeometryBuffer from "./geometry-buffer.js";


const scale = new Vector3();
const target = new Vector3();
const up = new Vector3();
const eye = new Vector3( 0, 0, 0 );


class EllipsoidGeometryBuffer extends GeometryBuffer{

    // position, color, radius, majorAxis, minorAxis, pickingColor
    constructor( data, params ){

        const p = params || {};
        const detail = defaults( p.sphereDetail, 2 );
        const geo = new IcosahedronGeometry( 1, detail );

        super( data, p, geo );

        this.setAttributes( data, true );

    }

    applyPositionTransform( matrix, i, i3 ){

        target.fromArray( this._majorAxis, i3 );
        up.fromArray( this._minorAxis, i3 );
        matrix.lookAt( eye, target, up );

        scale.set( this._radius[ i ], up.length(), target.length() );
        matrix.scale( scale );

    }

    setAttributes( data, initNormals ){

        if( data.radius ){
            this._radius = data.radius;
        }

        if( data.majorAxis ){
            this._majorAxis = data.majorAxis;
        }

        if( data.minorAxis ){
            this._minorAxis = data.minorAxis;
        }

        super.setAttributes( data, initNormals );

    }

    get updateNormals (){ return true; }

}


export default EllipsoidGeometryBuffer;
