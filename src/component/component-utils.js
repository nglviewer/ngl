/**
 * @file Component Utils
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import StructureComponent from "./structure-component.js";
import SurfaceComponent from "./surface-component.js";
import ScriptComponent from "./script-component.js";


function makeComponent( stage, object, params ){

    var component;

    if( object.type === "structure" ){

        component = new StructureComponent( stage, object, params );

    }else if( object.type == "surface" || object.type === "volume" ){

        component = new SurfaceComponent( stage, object, params );

    }else if( object.type === "script" ){

        component = new ScriptComponent( stage, object, params );

    }else{

        log.warn( "makeComponent: object type unknown", object );

    }

    return component;

};


export {
	makeComponent
};
