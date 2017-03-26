/**
 * @file Sturucture Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { ComponentRegistry } from "../globals.js";
import { defaults } from "../utils.js";
import Component from "./component.js";
import TrajectoryComponent from "./trajectory-component.js";
import { makeTrajectory } from "../trajectory/trajectory-utils.js";
import Selection from "../selection.js";
import StructureView from "../structure/structure-view.js";
import { superpose } from "../align/align-utils.js";


const SignalNames = [
    "trajectoryAdded", "trajectoryRemoved", "defaultAssemblyChanged"
];


/**
 * {@link Signal}, dispatched when the default assembly is changed
 * @example
 * structureComponent.signals.defaultAssemblyChanged.add( function( value ){ ... } );
 * @event StructureComponent#defaultAssemblyChanged
 * @type {String}
 */


class StructureComponent extends Component{

    /**
     * Create component wrapping a structure object
     * @param {Stage} stage - stage object the component belongs to
     * @param {Structure} structure - structure object to wrap
     * @param {ComponentParameters} params - component parameters
     */
    constructor( stage, structure, params ){

        var p = params || {};
        p.name = defaults( p.name, structure.name );

        super( stage, p );

        /**
         * The wrapped structure
         * @alias StructureComponent#structure
         * @member {Structure}
         */
        this.structure = structure;

        this.trajList = [];
        this.initSelection( p.sele );
        this.setDefaultAssembly( p.assembly || "" );

        this.stage.gidPool.addObject( this.structure );

    }

    /**
     * Component type
     * @alias StructureComponent#type
     * @constant
     * @type {String}
     * @default
     */
    get type(){ return "structure"; }

    get _signalNames(){
        return super._signalNames.concat( SignalNames );
    }

    /**
     * Initialize selection
     * @private
     * @param {String} sele - selection string
     * @return {undefined}
     */
    initSelection( sele ){

        /**
         * Selection for {@link StructureComponent#structureView}
         * @alias StructureComponent#selection
         * @private
         * @member {Selection}
         */
        this.selection = new Selection( sele );

        /**
         * View on {@link StructureComponent#structure}.
         * Change its selection via {@link StructureComponent#setSelection}.
         * @alias StructureComponent#structureView
         * @member {StructureView}
         */
        this.structureView = new StructureView(
            this.structure, this.selection
        );

        this.selection.signals.stringChanged.add( () => {

            this.structureView.setSelection( this.selection );

            this.rebuildRepresentations();
            this.rebuildTrajectories();

        } );

    }

    /**
     * Set selection of {@link StructureComponent#structureView}
     * @alias StructureComponent#setSelection
     * @param {String} string - selection string
     * @return {StructureComponent} this object
     */
    setSelection( string ){

        this.selection.setString( string );

        return this;

    }

    /**
     * Set the default assembly
     * @alias StructureComponent#setDefaultAssembly
     * @fires StructureComponent#defaultAssemblyChanged
     * @param {String} value - assembly name
     * @return {undefined}
     */
    setDefaultAssembly( value ){

        this.defaultAssembly = value;
        this.reprList.forEach( repr => {
            repr.setParameters( { defaultAssembly: this.defaultAssembly } );
        } );
        this.signals.defaultAssemblyChanged.dispatch( value );

    }

    /**
     * Rebuild all representations
     * @alias StructureComponent#rebuildRepresentations
     * @return {undefined}
     */
    rebuildRepresentations(){

        this.reprList.forEach( repr => {
            repr.build();
        } );

    }

    /**
     * Rebuild all trajectories
     * @alias StructureComponent#rebuildTrajectories
     * @return {undefined}
     */
    rebuildTrajectories(){

        this.trajList.slice().forEach( trajComp => {
            trajComp.trajectory.setStructure( this.structureView );
        } );

    }

    /**
     * Add a new structure representation to the component
     * @alias StructureComponent#addRepresentation
     * @fires Component#representationAdded
     * @param {String} type - the name of the representation, one of:
     *                        axes, backbone, ball+stick, base, cartoon, contact,
     *                        distance, helixorient, hyperball, label, licorice, line
     *                        surface, ribbon, rocket, rope, spacefill, trace, tube,
     *                        unitcell.
     * @param {StructureRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
    addRepresentation( type, params ){

        var p = params || {};
        p.defaultAssembly = this.defaultAssembly;

        return super.addRepresentation( type, this.structureView, p );

    }

    /**
     * Add a new trajectory component to the structure
     * @param {String|Frames} trajPath - path or frames object
     * @param {TrajectoryComponentParameters|TrajectoryParameters} params - parameters
     * @return {TrajectoryComponent} the created trajectory component object
     */
    addTrajectory( trajPath, params ){

        var traj = makeTrajectory( trajPath, this.structureView, params );

        traj.signals.frameChanged.add( () => {
            this.updateRepresentations( { "position": true } );
        } );

        var trajComp = new TrajectoryComponent( this.stage, traj, params, this );
        this.trajList.push( trajComp );
        this.signals.trajectoryAdded.dispatch( trajComp );

        return trajComp;

    }

    removeTrajectory( traj ){

        var idx = this.trajList.indexOf( traj );
        if( idx !== -1 ){
            this.trajList.splice( idx, 1 );
        }

        traj.dispose();

        this.signals.trajectoryRemoved.dispatch( traj );

    }

    dispose(){

        this.stage.gidPool.removeObject( this.structure );

        // copy via .slice because side effects may change trajList
        this.trajList.slice().forEach( traj => {
            traj.dispose();
        } );

        this.trajList.length = 0;
        this.structure.dispose();

        super.dispose();

    }

    /**
     * Automatically center and zoom the component
     * @param  {String|Integer} [sele] - selection string or duration if integer
     * @param  {Integer} [duration] - duration of the animation, defaults to 0
     * @return {undefined}
     */
    autoView( sele, duration ){

        if( Number.isInteger( sele ) ){
            duration = sele;
            sele = undefined;
        }

        this.stage.animationControls.zoomMove(
            this.getCenter( sele ),
            this.getZoom( sele ),
            defaults( duration, 0 )
        );

    }

    getBox( sele ){

        var bb;

        if( sele ){
            bb = this.structureView.getBoundingBox( new Selection( sele ) );
        }else{
            bb = this.structureView.boundingBox;
        }

        return bb;

    }

    getCenter( sele ){

        if( sele ){
            return this.structure.atomCenter( new Selection( sele ) );
        }else{
            return this.structure.center;
        }

    }

    superpose( component, align, sele1, sele2 ){

        superpose(
            this.structureView, component.structureView, align, sele1, sele2
        );

        this.updateRepresentations( { "position": true } );

        return this;

    }

    setVisibility( value ){

        super.setVisibility( value );

        this.trajList.forEach( traj => {
            // FIXME ???
            traj.setVisibility( value );
        } );

        return this;

    }

}

ComponentRegistry.add( "structure", StructureComponent );


export default StructureComponent;
