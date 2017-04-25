/**
 * @file Atomindex Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ColormakerRegistry } from "../globals.js";
import Colormaker from "./colormaker.js";


/**
 * Color by atom index. The {@link AtomProxy.index} property is used for coloring.
 * Each {@link ModelProxy} of a {@link Structure} is colored seperately. The
 * `params.domain` parameter is ignored.
 *
 * __Name:__ _atomindex_
 *
 * @example
 * stage.loadFile( "rcsb://1crn" ).then( function( o ){
 *     o.addRepresentation( "ball+stick", { colorScheme: "atomindex" } );
 *     o.autoView();
 * } );
 */
class AtomindexColormaker extends Colormaker{

    constructor( params ){

        super( params );

        if( !params.scale ){
            this.scale = "rainbow";
        }

        this.scalePerModel = {};

        this.structure.eachModel( mp => {
            this.domain = [ mp.atomOffset, mp.atomEnd ];
            this.scalePerModel[ mp.index ] = this.getScale();
        } );

    }

    atomColor( a ){
        return this.scalePerModel[ a.modelIndex ]( a.index );
    }

}


ColormakerRegistry.add( "atomindex", AtomindexColormaker );


export default AtomindexColormaker;
