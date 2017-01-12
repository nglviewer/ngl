/**
 * @file Structure View
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Box3 } from "../../lib/three.es6.js";
import Signal from "../../lib/signals.es6.js";

import { Debug, Log } from "../globals.js";
import Structure from "./structure.js";
import Selection from "../selection.js";


/**
 * {@link Signal}, dispatched when StructureView.refresh() is called
 * @example
 * structureView.signals.refreshed.add( function(){ ... } );
 * @event StructureView#refreshed
 */


/**
 * Get view on structure restricted to the selection
 * @param  {Selection} selection - the selection
 * @return {StructureView} the view on the structure
 */
Structure.prototype.getView = function( selection ){
    // added here to avoid cyclic import dependency
    return new StructureView( this, selection );
};


/**
 * View on the structure, restricted to the selection
 * @class
 * @extends Structure
 * @param {Structure} structure - the structure
 * @param {Selection} selection - the selection
 */
function StructureView( structure, selection ){

    this.signals = {
        refreshed: new Signal(),
    };

    this.structure = structure;
    this.selection = selection;

    this.center = new Vector3();
    this.boundingBox = new Box3();

    this.init();
    this.refresh();

}

StructureView.prototype = Object.assign( Object.create(

    Structure.prototype ), {

    constructor: StructureView,
    type: "StructureView",

    init: function(){

        Object.defineProperties( this, {
            name: {
                get: function(){ return this.structure.name; }
            },
            path: {
                get: function(){ return this.structure.path; }
            },
            title: {
                get: function(){ return this.structure.title; }
            },
            id: {
                get: function(){ return this.structure.id; }
            },

            atomSetDict: {
                get: function(){ return this.structure.atomSetDict; }
            },
            biomolDict: {
                get: function(){ return this.structure.biomolDict; }
            },
            entityList: {
                get: function(){ return this.structure.entityList; }
            },
            unitcell: {
                get: function(){ return this.structure.unitcell; }
            },

            frames: {
                get: function(){ return this.structure.frames; }
            },
            boxes: {
                get: function(){ return this.structure.boxes; }
            },

            bondStore: {
                get: function(){ return this.structure.bondStore; }
            },
            backboneBondStore: {
                get: function(){ return this.structure.backboneBondStore; }
            },
            rungBondStore: {
                get: function(){ return this.structure.rungBondStore; }
            },
            atomStore: {
                get: function(){ return this.structure.atomStore; }
            },
            residueStore: {
                get: function(){ return this.structure.residueStore; }
            },
            chainStore: {
                get: function(){ return this.structure.chainStore; }
            },
            modelStore: {
                get: function(){ return this.structure.modelStore; }
            },

            atomMap: {
                get: function(){ return this.structure.atomMap; }
            },
            residueMap: {
                get: function(){ return this.structure.residueMap; }
            },

            bondHash: {
                get: function(){ return this.structure.bondHash; }
            },
            spatialHash: {
                get: function(){ return this.structure.spatialHash; }
            }
        } );

        this._ap = this.getAtomProxy();
        this._rp = this.getResidueProxy();
        this._cp = this.getChainProxy();

        if( this.selection ){
            this.selection.signals.stringChanged.add( this.refresh, this );
        }

        this.structure.signals.refreshed.add( this.refresh, this );

    },

    /**
     * Updates atomSet, bondSet, atomSetCache, atomCount, bondCount, boundingBox, center.
     * @fires StructureView#refreshed
     * @return {undefined}
     */
    refresh: function(){

        if( Debug ) Log.time( "StructureView.refresh" );

        this.atomSetCache = {};

        this.atomSet = this.getAtomSet( this.selection, true );
        if( this.structure.atomSet ){
            if( Debug ) Log.time( "StructureView.refresh#atomSet.intersection" );
            this.atomSet = this.atomSet.intersection( this.structure.atomSet );
            if( Debug ) Log.timeEnd( "StructureView.refresh#atomSet.intersection" );
        }

        this.bondSet = this.getBondSet();

        if( Debug ) Log.time( "StructureView.refresh#atomSetDict.new_intersection" );
        for( var name in this.atomSetDict ){
            var as = this.atomSetDict[ name ];
            this.atomSetCache[ "__" + name ] = as.new_intersection( this.atomSet );
        }
        if( Debug ) Log.timeEnd( "StructureView.refresh#atomSetDict.new_intersection" );

        if( Debug ) Log.time( "StructureView.refresh#size" );
        this.atomCount = this.atomSet.size();
        this.bondCount = this.bondSet.size();
        if( Debug ) Log.timeEnd( "StructureView.refresh#size" );

        this.boundingBox = this.getBoundingBox();
        this.center = this.boundingBox.center();

        if( Debug ) Log.timeEnd( "StructureView.refresh" );

        this.signals.refreshed.dispatch();

    },

    //

    setSelection: function( selection ){

        this.selection = selection;

        this.refresh();

    },

    getSelection: function( selection ){

        var seleList = [];

        if( selection && selection.string ){
            seleList.push( selection.string );
        }

        var parentSelection = this.structure.getSelection();
        if( parentSelection && parentSelection.string ){
            seleList.push( parentSelection.string );
        }

        if( this.selection && this.selection.string ){
            seleList.push( this.selection.string );
        }

        var sele = "";
        if( seleList.length > 0 ){
            sele = "( " + seleList.join( " ) AND ( " ) + " )";
        }

        return new Selection( sele );

    },

    getStructure: function(){

        return this.structure.getStructure();

    },

    //

    eachBond: function( callback, selection ){

        this.structure.eachBond( callback, this.getSelection( selection ) );

    },

    eachAtom: function( callback, selection ){

        var ap = this.getAtomProxy();
        var as = this.getAtomSet( selection );
        var n = this.atomStore.count;

        if( as && as.size() < n ){
            as.forEach( function( index ){
                ap.index = index;
                callback( ap );
            } );
        }else{
            for( var i = 0; i < n; ++i ){
                ap.index = i;
                callback( ap );
            }
        }

    },

    eachResidue: function( callback, selection ){

        this.structure.eachResidue( callback, this.getSelection( selection ) );

    },

    /**
     * Not implemented
     * @alias StructureView#eachResidueN
     * @return {undefined}
     */
    eachResidueN: function( /*n, callback*/ ){

        console.error( "StructureView.eachResidueN() not implemented" );

    },

    eachChain: function( callback, selection ){

        this.structure.eachChain( callback, this.getSelection( selection ) );

    },

    eachModel: function( callback, selection ){

        this.structure.eachModel( callback, this.getSelection( selection ) );

    },

    //

    getAtomSet: function( selection, ignoreView ){

        if( Debug ) Log.time( "StructureView.getAtomSet" );

        var as = this.structure.getAtomSet( selection );
        if( !ignoreView && this.atomSet ){
            as = as.new_intersection( this.atomSet );
        }

        if( Debug ) Log.timeEnd( "StructureView.getAtomSet" );

        return as;

    },

    //

    getAtomIndices: function( selection ){

        return this.structure.getAtomIndices( this.getSelection( selection ) );

    },

    refreshPosition: function(){

        return this.structure.refreshPosition();

    },

    //

    dispose: function(){

        if( this.selection ){
            this.selection.signals.stringChanged.remove( this.refresh, this );
        }

        this.structure.signals.refreshed.remove( this.refresh, this );

        delete this.structure;

        delete this.atomSet;
        delete this.bondSet;

        delete this.atomCount;
        delete this.bondCount;

    }

} );


export default StructureView;
