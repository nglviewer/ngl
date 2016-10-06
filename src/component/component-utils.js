/**
 * @file Component Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log } from "../globals.js";
import StructureComponent from "./structure-component.js";
import SurfaceComponent from "./surface-component.js";
import VolumeComponent from "./volume-component.js";
import ShapeComponent from "./shape-component.js";
import ScriptComponent from "./script-component.js";


function makeComponent( stage, object, params ){

    var component;

    switch( object.type ){

        case "Structure":
            component = new StructureComponent( stage, object, params );
            break;

        case "Surface":
            component = new SurfaceComponent( stage, object, params );
            break;

        case "Volume":
            component = new VolumeComponent( stage, object, params );
            break;

        case "Shape":
            component = new ShapeComponent( stage, object, params );
            break;

        case "Script":
            component = new ScriptComponent( stage, object, params );
            break;

        default:
            Log.warn( "makeComponent: object type unknown", object );

    }

    return component;

}


export {
	makeComponent
};
