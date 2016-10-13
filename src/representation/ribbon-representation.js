/**
 * @file Ribbon Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { RepresentationRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import Spline from "../geometry/spline.js";
import StructureRepresentation from "./structure-representation.js";
import RibbonBuffer from "../buffer/ribbon-buffer.js";


function RibbonRepresentation( structure, viewer, params ){

    StructureRepresentation.call( this, structure, viewer, params );

    this.defaultScale.sstruc *= 3.0;

}

RibbonRepresentation.prototype = Object.assign( Object.create(

    StructureRepresentation.prototype ), {

    constructor: RibbonRepresentation,

    type: "ribbon",

    parameters: Object.assign( {

        subdiv: {
            type: "integer", max: 50, min: 1, rebuild: true
        },
        tension: {
            type: "number", precision: 1, max: 1.0, min: 0.1
        },
        smoothSheet: {
            type: "boolean", rebuild: true
        }

    }, StructureRepresentation.prototype.parameters, {

        side: null,
        wireframe: null,
        linewidth: null

    } ),

    init: function( params ){

        var p = params || {};
        p.colorScheme = defaults( p.colorScheme, "chainname" );
        p.colorScale = defaults( p.colorScale, "RdYlBu" );
        p.radius = defaults( p.radius, "sstruc" );
        p.scale = defaults( p.scale, 4.0 );

        if( p.quality === "low" ){
            this.subdiv = 3;
        }else if( p.quality === "medium" ){
            this.subdiv = 6;
        }else if( p.quality === "high" ){
            this.subdiv = 12;
        }else{
            this.subdiv = defaults( p.subdiv, 6 );
        }

        this.tension = defaults( p.tension, NaN );
        this.smoothSheet = defaults( p.smoothSheet, false );

        StructureRepresentation.prototype.init.call( this, p );

    },

    getSplineParams: function( params ){

        return Object.assign( {
            subdiv: this.subdiv,
            tension: this.tension,
            directional: true,
            smoothSheet: this.smoothSheet
        }, params );

    },

    createData: function( sview ){

        var bufferList = [];
        var polymerList = [];

        this.structure.eachPolymer( function( polymer ){

            if( polymer.residueCount < 4 ) return;
            polymerList.push( polymer );

            var spline = new Spline( polymer, this.getSplineParams() );
            var subPos = spline.getSubdividedPosition();
            var subOri = spline.getSubdividedOrientation();
            var subCol = spline.getSubdividedColor( this.getColorParams() );
            var subSize = spline.getSubdividedSize( this.radius, this.scale );

            bufferList.push(
                new RibbonBuffer(
                    subPos.position,
                    subOri.binormal,
                    subOri.normal,
                    subCol.color,
                    subSize.size,
                    subCol.pickingColor,
                    this.getBufferParams()
                )
            );

        }.bind( this ), sview.getSelection() );

        return {
            bufferList: bufferList,
            polymerList: polymerList
        };

    },

    updateData: function( what, data ){

        what = what || {};

        var i = 0;
        var n = data.polymerList.length;

        for( i = 0; i < n; ++i ){

            var bufferData = {};
            var spline = new Spline( data.polymerList[ i ], this.getSplineParams() );

            if( what.position ){
                var subPos = spline.getSubdividedPosition();
                var subOri = spline.getSubdividedOrientation();
                bufferData.position = subPos.position;
                bufferData.normal = subOri.binormal;
                bufferData.dir = subOri.normal;
            }

            if( what.radius || what.scale ){
                var subSize = spline.getSubdividedSize( this.radius, this.scale );
                bufferData.size = subSize.size;
            }

            if( what.color ){
                var subCol = spline.getSubdividedColor( this.getColorParams() );
                bufferData.color = subCol.color;
            }

            data.bufferList[ i ].setAttributes( bufferData );

        }

    },

    setParameters: function( params ){

        var rebuild = false;
        var what = {};

        if( params && params.tension ){
            what.position = true;
        }

        StructureRepresentation.prototype.setParameters.call(
            this, params, what, rebuild
        );

        return this;

    }

} );


RepresentationRegistry.add( "ribbon", RibbonRepresentation );


export default RibbonRepresentation;
