/**
 * @file Representation Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Debug, Log, RepresentationRegistry } from "../globals.js";

import Structure from "../structure/structure.js";
import Surface from "../surface/surface.js";
import Volume from "../surface/volume.js";
import Trajectory from "../trajectory/trajectory.js";
import Shape from "../geometry/shape.js";

import BufferRepresentation from "./buffer-representation.js";
import SurfaceRepresentation from "./surface-representation.js";
import DotRepresentation from "./dot-representation.js";
import SliceRepresentation from "./slice-representation.js";
import TrajectoryRepresentation from "./trajectory-representation.js";


function logReprUnknown( type ){
    Log.error( "makeRepresentation: representation type " + type + " unknown" );
}


function makeRepresentation( type, object, viewer, params ){

    if( Debug ) Log.time( "makeRepresentation " + type );

    var ReprClass;

    if( object instanceof Structure ){

        ReprClass = RepresentationRegistry.get( type );

        if( !ReprClass ){
            logReprUnknown( type );
            return;
        }

    }else if( object instanceof Surface ){

        if( type === "surface" ){
            ReprClass = SurfaceRepresentation;
        }else if( type === "dot" ){
            ReprClass = DotRepresentation;
        }else{
            logReprUnknown( type );
            return;
        }

    }else if( object instanceof Volume ){

        if( type === "surface" ){
            ReprClass = SurfaceRepresentation;
        }else if( type === "dot" ){
            ReprClass = DotRepresentation;
        }else if( type === "slice" ){
            ReprClass = SliceRepresentation;
        }else{
            logReprUnknown( type );
            return;
        }

    }else if( object instanceof Trajectory ){

        ReprClass = TrajectoryRepresentation;

    }else if( object instanceof Shape ){

        ReprClass = BufferRepresentation;
        object = object.getBufferList();

    }else if( type === "buffer" ){

        ReprClass = BufferRepresentation;

    }else{

        Log.error( "makeRepresentation: object " + object + " unknown" );
        return;

    }

    var repr = new ReprClass( object, viewer, params );

    if( Debug ) Log.timeEnd( "makeRepresentation " + type );

    return repr;

}


export {
	makeRepresentation
};
