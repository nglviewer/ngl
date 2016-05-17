/**
 * @file Script Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import Component from "./component.js";


function ScriptComponent( stage, script, params ){

    var p = params || {};
    p.name = p.name !== undefined ? p.name : script.name;

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

    addRepresentation: function( type ){},

    removeRepresentation: function( repr ){},

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

    setVisibility: function( value ){},

    getCenter: function(){}

} );


export default ScriptComponent;
