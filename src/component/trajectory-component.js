/**
 * @file Trajectory Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { defaults } from "../utils.js";
import Component from "./component.js";


const SignalNames = [
    "frameChanged", "playerChanged", "gotNumframes", "parametersChanged"
];


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


class TrajectoryComponent extends Component{

    /**
     * Create component wrapping a trajectory object
     * @param {Stage} stage - stage object the component belongs to
     * @param {Trajectory} trajectory - the trajectory object
     * @param {TrajectoryComponentParameters} params - component parameters
     * @param {StructureComponent} parent - the parent structure
     */
    constructor( stage, trajectory, params, parent ){

        var p = params || {};
        p.name = defaults( p.name, trajectory.name );

        super( stage, p );

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

        trajectory.signals.frameChanged.add( i => {
            this.signals.frameChanged.dispatch( i );
        } );

        trajectory.signals.playerChanged.add( player => {
            this.signals.playerChanged.dispatch( player );
        } );

        trajectory.signals.gotNumframes.add( n => {
            this.signals.gotNumframes.dispatch( n );
        } );

        //

        if( p.initialFrame !== undefined ){
            this.setFrame( p.initialFrame );
        }

    }

    get type(){ return "trajectory" }

    get _signalNames(){
        return super._signalNames.concat( SignalNames );
    }

    addRepresentation( type, params ){

        return super.addRepresentation( type, this.trajectory, params );

    }

    setFrame( i ){

        this.trajectory.setFrame( i );

    }

    setParameters( params ){

        this.trajectory.setParameters( params );
        this.signals.parametersChanged.dispatch( params );

        return this;

    }

    dispose(){

        this.trajectory.dispose();
        super.dispose();

    }

    getCenter(){}

}


export default TrajectoryComponent;
