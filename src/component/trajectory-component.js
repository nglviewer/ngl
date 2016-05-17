/**
 * @file Trajectory Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import Component from "./component.js";


function TrajectoryComponent( stage, trajectory, params, parent ){

    var p = params || {};
    p.name = p.name !== undefined ? p.name : trajectory.name;

    Component.call( this, stage, p );

    this.trajectory = trajectory;
    this.parent = parent;
    this.status = "loaded";

    // signals

    trajectory.signals.frameChanged.add( function( i ){

        this.signals.frameChanged.dispatch( i );

    }, this );

    trajectory.signals.playerChanged.add( function( player ){

        this.signals.playerChanged.dispatch( player );

    }, this );

    trajectory.signals.gotNumframes.add( function( n ){

        this.signals.gotNumframes.dispatch( n );

    }, this );

    //

    if( p.i !== undefined ){

        this.setFrame( p.i );

    }

}

TrajectoryComponent.prototype = Object.assign( Object.create(

    Component.prototype ), {

    constructor: TrajectoryComponent,

    type: "trajectory",

    signals: Object.assign( {

        frameChanged: null,
        playerChanged: null,
        gotNumframes: null,
        parametersChanged: null

    }, Component.prototype.signals ),

    addRepresentation: function( type, params ){

        return Component.prototype.addRepresentation.call(
            this, type, this.trajectory, params
        );

    },

    setFrame: function( i ){

        this.trajectory.setFrame( i );

    },

    setParameters: function( params ){

        this.trajectory.setParameters( params );
        this.signals.parametersChanged.dispatch( params );

        return this;

    },

    dispose: function(){

        this.trajectory.dispose();

        Component.prototype.dispose.call( this );

    },

    getCenter: function(){}

} );


export default TrajectoryComponent;
