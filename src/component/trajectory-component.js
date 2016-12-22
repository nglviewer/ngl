/**
 * @file Trajectory Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import Component from "./component.js";


/**
 * Trajectory component parameter object.
 * @typedef {Object} TrajectoryComponentParameters - component parameters
 *
 * @property {String} name - component name
 * @property {Integer} initialFrame - initial frame the trajectory is set to
 * @property {Integer} defaultStep - default step size to be used by trajectory players
 * @property {Integer} defaultTimeout - default timeout to be used by trajectory players
 * @property {String} defaultInterpolateType - one of "" (empty string), "linear" or "spline"
 * @property {Integer} defaultInterpolateStep - window size used for interpolation
 * @property {String} defaultMode - either "loop" or "once"
 * @property {String} defaultDirection - either "forward" or "backward"
 */


/**
 * Component wrapping a trajectory object
 * @class
 * @extends Component
 * @param {Stage} stage - stage object the component belongs to
 * @param {Trajectory} trajectory - the trajectory object
 * @param {TrajectoryComponentParameters} params - component parameters
 * @param {StructureComponent} parent - the parent structure
 */
function TrajectoryComponent( stage, trajectory, params, parent ){

    var p = params || {};
    p.name = defaults( p.name, trajectory.name );

    Component.call( this, stage, p );

    this.trajectory = trajectory;
    this.parent = parent;
    this.status = "loaded";

    this.defaultStep = defaults( p.defaultStep, undefined );
    this.defaultTimeout = defaults( p.defaultTimeout, 50 );
    this.defaultInterpolateType = defaults( p.defaultInterpolateType, "" );
    this.defaultInterpolateStep = defaults( p.defaultInterpolateStep, 5 );
    this.defaultMode = defaults( p.defaultMode, "loop" );
    this.defaultDirection = defaults( p.defaultDirection, "forward" );

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

    if( p.initialFrame !== undefined ){
        this.setFrame( p.initialFrame );
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
