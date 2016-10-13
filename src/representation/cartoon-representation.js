/**
 * @file Cartoon Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import { Debug, Log, RepresentationRegistry } from "../globals.js";
import Spline from "../geometry/spline.js";
import StructureRepresentation from "./structure-representation.js";
import TubeMeshBuffer from "../buffer/tubemesh-buffer.js";


function CartoonRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

}

CartoonRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: CartoonRepresentation,

    type: "cartoon",

    parameters: Object.assign( {

        aspectRatio: {
            type: "number", precision: 1, max: 10.0, min: 1.0
        },
        subdiv: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        radialSegments: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        capped: {
            type: "boolean", rebuild: true
        },
        smoothSheet: {
            type: "boolean", rebuild: true
        }

    }, StructureRepresentation.prototype.parameters ),

    init: function( params ){

        var p = params || {};
        p.colorScheme = defaults( p.colorScheme, "chainname" );
        p.colorScale = defaults( p.colorScale, "RdYlBu" );
        p.radius = defaults( p.radius, "sstruc" );
        p.scale = defaults( p.scale, 0.7 );

        this.aspectRatio = defaults( p.aspectRatio, 5.0 );
        this.tension = defaults( p.tension, NaN );
        this.capped = defaults( p.capped, true );
        this.smoothSheet = defaults( p.smoothSheet, false );

        StructureRepresentation.prototype.init.call( this, p );

        if( p.quality === "low" ){
            this.subdiv = 3;
            this.radialSegments = 6;
        }else if( p.quality === "medium" ){
            this.subdiv = 6;
        }else if( p.quality === "high" ){
            this.subdiv = 12;
        }else{
            this.subdiv = defaults( p.subdiv, 6 );
        }

    },

    getSplineParams: function( params ){

        return Object.assign( {
            subdiv: this.subdiv,
            tension: this.tension,
            directional: this.aspectRatio === 1.0 ? false : true,
            smoothSheet: this.smoothSheet
        }, params );

    },

    getSpline: function( polymer ){

        return new Spline( polymer, this.getSplineParams() );

    },

    getScale: function( polymer ){

        return polymer.isCg() ? this.scale * this.aspectRatio : this.scale;

    },

    getAspectRatio: function( polymer ){

        return polymer.isCg() ? 1.0 : this.aspectRatio;

    },

    createData: function( sview ){

        var bufferList = [];
        var polymerList = [];

        this.structure.eachPolymer( function( polymer ){

            if( polymer.residueCount < 4 ) return;
            polymerList.push( polymer );

            var spline = this.getSpline( polymer );

            var subPos = spline.getSubdividedPosition();
            var subOri = spline.getSubdividedOrientation();
            var subCol = spline.getSubdividedColor( this.getColorParams() );
            var subSize = spline.getSubdividedSize( this.radius, this.getScale( polymer ) );

            bufferList.push(
                new TubeMeshBuffer(
                    subPos.position,
                    subOri.normal,
                    subOri.binormal,
                    subOri.tangent,
                    subCol.color,
                    subSize.size,
                    subCol.pickingColor,
                    this.getBufferParams( {
                        radialSegments: this.radialSegments,
                        aspectRatio: this.getAspectRatio( polymer ),
                        capped: this.capped,
                        dullInterior: true
                    } )
                )
            );

        }.bind( this ), sview.getSelection() );

        return {
            bufferList: bufferList,
            polymerList: polymerList
        };

    },

    updateData: function( what, data ){

        if( Debug ) Log.time( this.type + " repr update" );

        what = what || {};

        for( var i = 0, il = data.polymerList.length; i < il; ++i ){

            var bufferData = {};
            var polymer = data.polymerList[ i ];
            var spline = this.getSpline( polymer );

            data.bufferList[ i ].aspectRatio = this.getAspectRatio( polymer );

            if( what.position || what.radius ){

                var subPos = spline.getSubdividedPosition();
                var subOri = spline.getSubdividedOrientation();
                var subSize = spline.getSubdividedSize( this.radius, this.getScale( polymer ) );

                bufferData.position = subPos.position;
                bufferData.normal = subOri.normal;
                bufferData.binormal = subOri.binormal;
                bufferData.tangent = subOri.tangent;
                bufferData.size = subSize.size;

            }

            if( what.color ){

                var subCol = spline.getSubdividedColor( this.getColorParams() );

                bufferData.color = subCol.color;
                bufferData.pickingColor = subCol.pickingColor;

            }

            data.bufferList[ i ].setAttributes( bufferData );

        }

        if( Debug ) Log.timeEnd( this.type + " repr update" );

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params.aspectRatio ){
            what.radius = true;
        }

        if( params && params.tension ){
            what.position = true;
        }

        StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


RepresentationRegistry.add( "cartoon", CartoonRepresentation );


export default CartoonRepresentation;
