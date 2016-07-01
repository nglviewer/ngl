/**
 * @file Sturucture Component
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import Component from "./component.js";
import TrajectoryComponent from "./trajectory-component.js";
import { makeTrajectory } from "../trajectory/trajectory-utils.js";
import Selection from "../selection.js";
import { superpose } from "../align/align-utils.js";


/**
 * Component wrapping a Structure object
 * @class
 * @extends Component
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

    /**
     * Initialize selection
     * @private
     * @param  {String} string - selection string
     */
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

    /**
     * Add a new structure representation to the component
     * @alias StructureComponent#addRepresentation
     * @param {String} type - the name of the representation, one of:
     *                        axes, backbone, ball+stick, base, cartoon, contact,
     *                        distance, helixorient, hyperball, label, licorice, line
     *                        surface, ribbon, rocket, rope, spacefill, trace, tube,
     *                        unitcell.
     * @param {StructureRepresentationParameters} params - representation parameters
     * @return {RepresentationComponent} the created representation wrapped into
     *                                   a representation component object
     */
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

        var center = this.getCenter( sele );

        if( zoom ){

            var bb;

            if( sele ){
                bb = this.structure.getBoundingBox( new Selection( sele ) );
            }else{
                bb = this.structure.boundingBox;
            }

            var bbSize = bb.size();
            var maxSize = Math.max( bbSize.x, bbSize.y, bbSize.z );
            var minSize = Math.min( bbSize.x, bbSize.y, bbSize.z );
            // var avgSize = ( bbSize.x + bbSize.y + bbSize.z ) / 3;
            zoom = Math.max( 1, maxSize + ( minSize / 2 ) );  // object size

            // zoom = bb.size().length();

        }

        this.viewer.centerView( zoom, center );

        return this;

    },

    getCenter: function( sele ){

        if( sele ){

            return this.structure.atomCenter( new Selection( sele ) );

        }else{

            return this.structure.center;

        }

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
