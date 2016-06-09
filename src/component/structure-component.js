/**
 * @file Sturucture Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import Component from "./component.js";
import TrajectoryComponent from "./trajectory-component.js";
import { makeTrajectory } from "../trajectory/trajectory-utils.js";
import Selection from "../selection.js";
import { superpose } from "../align/align-utils.js";


/**
 * Component wrapping a Structure object
 * @class
 * @augments {Component}
 * @param {Stage} stage - stage object the component belongs to
 * @param {Structure} structure - structure object to wrap
 * @param {ComponentParameters} params - component parameters
 */
function StructureComponent( stage, structure, params ){

    var p = params || {};
    p.name = p.name !== undefined ? p.name : structure.name;

    Component.call( this, stage, p );

    this.structure = structure;
    this.trajList = [];
    this.initSelection( p.sele );
    this.setDefaultAssembly( p.assembly || "" );

}

StructureComponent.prototype = Object.assign( Object.create(

    Component.prototype ), {

    constructor: StructureComponent,

    type: "structure",

    signals: Object.assign( {

        trajectoryAdded: null,
        trajectoryRemoved: null,
        defaultAssemblyChanged: null

    }, Component.prototype.signals ),

    initSelection: function( string ){

        this.selection = new Selection( string );

        this.selection.signals.stringChanged.add( function( string ){

            this.applySelection();

            this.rebuildRepresentations();
            this.rebuildTrajectories();

        }, this );

        this.applySelection();

    },

    applySelection: function(){

        this.structure.setSelection( this.selection );

    },

    setSelection: function( string ){

        this.selection.setString( string );

        return this;

    },

    setDefaultAssembly: function( value ){

        this.defaultAssembly = value;
        this.rebuildRepresentations();
        this.signals.defaultAssemblyChanged.dispatch( value );

    },

    rebuildRepresentations: function(){

        this.reprList.forEach( function( repr ){

            var p = repr.getParameters();
            p.defaultAssembly = this.defaultAssembly;

            repr.build( p );

        }, this );

    },

    rebuildTrajectories: function(){

        this.trajList.slice( 0 ).forEach( function( trajComp ){

            trajComp.trajectory.setStructure( this.structure );

        }, this );

    },

    addRepresentation: function( type, params ){

        var p = params || {};
        p.defaultAssembly = this.defaultAssembly;

        return Component.prototype.addRepresentation.call(
            this, type, this.structure, p
        );

    },

    addTrajectory: function( trajPath, sele, i ){

        var params = { "i": i };

        var traj = makeTrajectory(
            trajPath, this.structure, sele
        );

        traj.signals.frameChanged.add( function( value ){

            this.updateRepresentations( { "position": true } );

        }, this );

        var trajComp = new TrajectoryComponent( this.stage, traj, params, this );

        this.trajList.push( trajComp );

        this.signals.trajectoryAdded.dispatch( trajComp );

        return trajComp;

    },

    removeTrajectory: function( traj ){

        var idx = this.trajList.indexOf( traj );

        if( idx !== -1 ){

            this.trajList.splice( idx, 1 );

        }

        traj.dispose();

        this.signals.trajectoryRemoved.dispatch( traj );

    },

    dispose: function(){

        // copy via .slice because side effects may change trajList
        this.trajList.slice().forEach( function( traj ){

            traj.dispose();

        } );

        this.trajList = [];
        this.structure.dispose();

        Component.prototype.dispose.call( this );

    },

    centerView: function( zoom, sele ){

        zoom = zoom !== undefined ? zoom : true;

        var center;

        if( sele ){

            var selection = new Selection( sele );

            center = this.structure.atomCenter( selection );

            if( zoom ){
                var bb = this.structure.getBoundingBox( selection );
                zoom = bb.size().length();
            }

        }else{

            center = this.structure.center;

            if( zoom ){
                zoom = this.structure.boundingBox.size().length();
            }

        }

        this.viewer.centerView( zoom, center );

        return this;

    },

    getCenter: function(){

        return this.structure.center;

    },

    superpose: function( component, align, sele1, sele2, xsele1, xsele2 ){

        // FIXME does not account for structure.atomBitSet

        superpose(
            this.structure, component.structure,
            align, sele1, sele2, xsele1, xsele2
        );

        this.updateRepresentations( { "position": true } );

        return this;

    },

    setVisibility: function( value ){

        Component.prototype.setVisibility.call( this, value );

        this.trajList.forEach( function( traj ){

            // FIXME ???
            traj.setVisibility( value );

        } );

        return this;

    },

} );


export default StructureComponent;
