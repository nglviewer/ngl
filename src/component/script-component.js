/**
 * @file Script Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ComponentRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import Component from "./component.js";


/**
 * Component wrapping a Script object
 * @class
 * @extends Component
 * @param {Stage} stage - stage object the component belongs to
 * @param {Script} script - script object to wrap
 * @param {ComponentParameters} params - component parameters
 */
function ScriptComponent( stage, script, params ){

    var p = params || {};
    p.name = defaults( p.name, script.name );

    Component.call( this, stage, p );

    this.script = script;
    this.status = "loaded";

    this.script.signals.nameChanged.add( function( value ){

        this.setName( value );

    }, this );

}

ScriptComponent.prototype = Object.assign( Object.create(

    Component.prototype ), {

    constructor: ScriptComponent,

    type: "script",

    addRepresentation: function( /*type*/ ){},

    removeRepresentation: function( /*repr*/ ){},

    run: function(){

        var scope = this;

        this.setStatus( "running" );

        this.script.call( this.stage, function(){

            scope.setStatus( "finished" );

        } );

        this.setStatus( "called" );

    },

    dispose: function(){

        this.signals.disposed.dispatch();

    },

    setVisibility: function( /*value*/ ){},

    getCenter: function(){}

} );

ComponentRegistry.add( "script", ScriptComponent );


export default ScriptComponent;
