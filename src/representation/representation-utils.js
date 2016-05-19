/**
 * @file Representation Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Debug, Log, RepresentationRegistry } from "../globals.js";

import Structure from "../structure/structure.js";
import Surface from "../surface/surface.js";
import Volume from "../surface/volume.js";

import BufferRepresentation from "./buffer-representation.js";
import SurfaceRepresentation from "./surface-representation.js";
import DotRepresentation from "./dot-representation.js";
import TrajectoryRepresentation from "./trajectory-representation.js";


function makeRepresentation( type, object, viewer, params ){

    if( Debug ) Log.time( "makeRepresentation " + type );

    var ReprClass;

    if( type === "buffer" ){

        ReprClass = BufferRepresentation;

    }else if( object instanceof Structure ){

        ReprClass = RepresentationRegistry.get( type );

        if( !ReprClass ){

            Log.error(
                "makeRepresentation: representation type " + type + " unknown"
            );
            return;

        }

    }else if( object instanceof Surface || object instanceof Volume ){

        if( type === "surface" ){

            ReprClass = SurfaceRepresentation;

        }else if( type === "dot" ){

            ReprClass = DotRepresentation;

        }else{

            Log.error(
                "makeRepresentation: representation type " + type + " unknown"
            );
            return;

        }

    }else if( object instanceof Trajectory ){

        ReprClass = TrajectoryRepresentation;

    }else{

        Log.error(
            "makeRepresentation: object " + object + " unknown"
        );
        return;

    }

    var repr = new ReprClass( object, viewer, params );

    if( Debug ) Log.timeEnd( "makeRepresentation " + type );

    return repr;

}


export {
	makeRepresentation
};
