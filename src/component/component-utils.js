/**
 * @file Component Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { Debug, Log } from "../globals.js";
import StructureComponent from "./structure-component.js";
import SurfaceComponent from "./surface-component.js";
import ScriptComponent from "./script-component.js";


function makeComponent( stage, object, params ){

    var component;

    if( object.type === "Structure" ){

        component = new StructureComponent( stage, object, params );

    }else if( object.type == "Surface" || object.type === "Volume" ){

        component = new SurfaceComponent( stage, object, params );

    }else if( object.type === "Script" ){

        component = new ScriptComponent( stage, object, params );

    }else{

        Log.warn( "makeComponent: object type unknown", object );

    }

    return component;

};


export {
	makeComponent
};
