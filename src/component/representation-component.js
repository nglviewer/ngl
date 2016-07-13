/**
 * @file Representation Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Component from "./component.js";


// add here to avoid cyclic import dependency
Component.prototype.__getRepresentationComponent = function( repr, p ){
    return new RepresentationComponent(
        this.stage, repr, p, this
    );
};


function RepresentationComponent( stage, repr, params, parent ){

    var p = params || {};
    p.name = p.name !== undefined ? p.name : repr.type;

    Component.call( this, stage, p );

    this.parent = parent;

    this.setRepresentation( repr );

}

RepresentationComponent.prototype = Object.assign( Object.create(

    Component.prototype ), {

    constructor: RepresentationComponent,

    type: "representation",

    signals: Object.assign( {

        parametersChanged: null,

    }, Component.prototype.signals ),

    getType: function(){

        return this.repr.type;

    },

    setRepresentation: function( repr ){

        if( this.repr ){
            this.removeRepresentation( this.repr );
        }
        this.repr = repr;
        // this.name = repr.type;
        this.stage.tasks.listen( this.repr.tasks );
        this.updateVisibility();

    },

    addRepresentation: function( type ){},

    removeRepresentation: function( repr ){

        this.stage.tasks.unlisten( this.repr.tasks );
        this.repr.dispose();

    },

    dispose: function(){

        if( this.parent ){
            this.parent.removeRepresentation( this );
        }
        this.removeRepresentation( this.repr );
        this.signals.disposed.dispatch();

    },

    setVisibility: function( value ){

        this.visible = value;
        this.updateVisibility();
        this.signals.visibilityChanged.dispatch( this.visible );

        return this;

    },

    updateVisibility: function(){

        if( this.parent ){
            this.repr.setVisibility( this.parent.visible && this.visible );
        }else{
            this.repr.setVisibility( this.visible );
        }

    },

    update: function( what ){

        this.repr.update( what );

        return this;

    },

    build: function( params ){

        this.repr.build( params );

        return this;

    },

    setSelection: function( string ){

        this.repr.setSelection( string );

        return this;

    },

    setParameters: function( params ){

        this.repr.setParameters( params );
        this.signals.parametersChanged.dispatch(
            this.repr.getParameters()
        );

        return this;

    },

    getParameters: function(){

        return this.repr.getParameters();

    },

    setColor: function( value ){

        this.repr.setColor( value );

        return this;

    },

    getCenter: function(){}

} );


export default RepresentationComponent;
