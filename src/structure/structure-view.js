/**
 * @file Structure View
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Box3 } from "../../lib/three.es6.js";

import { Debug, Log } from "../globals.js";
import Structure from "./structure.js";
import Selection from "../selection.js";


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
 */
class StructureView extends Structure{

    /**
     * @param {Structure} structure - the structure
     * @param {Selection} selection - the selection
     */
    constructor( structure, selection ){

        super();

        this.structure = structure;
        this.selection = selection;

        this.center = new Vector3();
        this.boundingBox = new Box3();

        this._bp = this.getBondProxy();
        this._ap = this.getAtomProxy();
        this._rp = this.getResidueProxy();
        this._cp = this.getChainProxy();

        if( this.selection ){
            this.selection.signals.stringChanged.add( this.refresh, this );
        }

        this.structure.signals.refreshed.add( this.refresh, this );

        this.refresh();

    }

    init(){}

    get type(){ return "StructureView"; }

    get name(){ return this.structure.name; }
    get path(){ return this.structure.path; }
    get title(){ return this.structure.title; }
    get id(){ return this.structure.id; }
    get atomSetDict(){ return this.structure.atomSetDict; }
    get biomolDict(){ return this.structure.biomolDict; }
    get entityList(){ return this.structure.entityList; }
    get unitcell(){ return this.structure.unitcell; }
    get frames(){ return this.structure.frames; }
    get boxes(){ return this.structure.boxes; }
    get validation(){ return this.structure.validation; }
    get bondStore(){ return this.structure.bondStore; }
    get backboneBondStore(){ return this.structure.backboneBondStore; }
    get rungBondStore(){ return this.structure.rungBondStore; }
    get atomStore(){ return this.structure.atomStore; }
    get residueStore(){ return this.structure.residueStore; }
    get chainStore(){ return this.structure.chainStore; }
    get modelStore(){ return this.structure.modelStore; }
    get atomMap(){ return this.structure.atomMap; }
    get residueMap(){ return this.structure.residueMap; }
    get bondHash(){ return this.structure.bondHash; }
    get spatialHash(){ return this.structure.spatialHash; }

    /**
     * Updates atomSet, bondSet, atomSetCache, atomCount, bondCount, boundingBox, center.
     * @emits {Structure.signals.refreshed} when refreshed
     * @return {undefined}
     */
    refresh(){

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
        this.center = this.boundingBox.getCenter();

        if( Debug ) Log.timeEnd( "StructureView.refresh" );

        this.signals.refreshed.dispatch();

    }

    //

    setSelection( selection ){

        this.selection = selection;

        this.refresh();

    }

    getSelection( selection ){

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

    }

    getStructure(){

        return this.structure.getStructure();

    }

    //

    eachBond( callback, selection ){

        this.structure.eachBond( callback, this.getSelection( selection ) );

    }

    eachAtom( callback, selection ){

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

    }

    eachResidue( callback, selection ){

        this.structure.eachResidue( callback, this.getSelection( selection ) );

    }

    /**
     * Not implemented
     * @alias StructureView#eachResidueN
     * @return {undefined}
     */
    eachResidueN( /*n, callback*/ ){

        console.error( "StructureView.eachResidueN() not implemented" );

    }

    eachChain( callback, selection ){

        this.structure.eachChain( callback, this.getSelection( selection ) );

    }

    eachModel( callback, selection ){

        this.structure.eachModel( callback, this.getSelection( selection ) );

    }

    //

    getAtomSet( selection, ignoreView ){

        if( Debug ) Log.time( "StructureView.getAtomSet" );

        var as = this.structure.getAtomSet( selection );
        if( !ignoreView && this.atomSet ){
            as = as.new_intersection( this.atomSet );
        }

        if( Debug ) Log.timeEnd( "StructureView.getAtomSet" );

        return as;

    }

    //

    getAtomIndices( selection ){

        return this.structure.getAtomIndices( this.getSelection( selection ) );

    }

    refreshPosition(){

        return this.structure.refreshPosition();

    }

    //

    dispose(){

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

}


export default StructureView;
