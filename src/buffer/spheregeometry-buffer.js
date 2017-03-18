/**
 * @file Sphere Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { IcosahedronGeometry, Vector3 } from "../../lib/three.es6.js";

import { defaults } from "../utils.js";
import GeometryBuffer from "./geometry-buffer.js";


const scale = new Vector3();


class SphereGeometryBuffer extends GeometryBuffer{

    // position, color, radius, pickingColor
    constructor( data, params ){

        const p = params || {};
        const detail = defaults( p.sphereDetail, 1 );
        const geo = new IcosahedronGeometry( 1, detail );

        super( data, p, geo );

        this.setAttributes( data, true );

    }

    applyPositionTransform( matrix, i ){

        const r = this._radius[ i ];
        scale.set( r, r, r );
        matrix.scale( scale );

    }

    setAttributes( data, initNormals ){

        if( data.radius ){
            this._radius = data.radius;
        }

        super.setAttributes( data, initNormals );

    }

}


export default SphereGeometryBuffer;
