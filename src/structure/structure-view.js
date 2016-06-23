/**
 * @file Structure View
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Box3 } from "../../lib/three.es6.js";
import Signal from "../../lib/signals.es6.js";

import { Debug, Log } from "../globals.js";
import Bitset from "../utils/bitset.js";
import Structure from "./structure.js";
import Selection from "../selection.js";


// add here to avoid cyclic import dependency
Structure.prototype.getView = function( selection ){
    return new StructureView( this, selection );
};


function StructureView( structure, selection ){

    this.signals = {
        refreshed: new Signal(),
    };

    this.structure = structure;
    this.selection = selection;

    this.center = new Vector3();
    this.boundingBox = new Box3();

    // to allow creating an empty object to call .fromJSON onto
    if( !structure && !selection ) return;

    this.init();

    this.refresh();

}

StructureView.prototype = Object.assign( Object.create(

    Structure.prototype ), {

    constructor: StructureView,
    type: "StructureView",

    init: function(){

        Object.defineProperties( this, {
            atomSetDict: {
                get: function(){ return this.structure.atomSetDict; }
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
            }
        } );

        this._ap = this.getAtomProxy();
        this._rp = this.getResidueProxy();
        this._cp = this.getChainProxy();

        // FIXME should selection be serializable?
        if( this.selection ){
            this.selection.signals.stringChanged.add( function( string ){
                this.refresh();
            }, this );
        }

        this.structure.signals.refreshed.add( this.refresh, this );

    },

    refresh: function(){

        if( Debug ) Log.time( "StructureView.refresh" );

        this.atomSetCache = {};

        this.atomSet = this.getAtomSet2( this.selection );
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

    getSelection: function(){

        var parentSelection = this.structure.getSelection();
        if( parentSelection ){
            if( parentSelection.string && this.selection.string ){
                return new Selection(
                    "( " + parentSelection.string + " ) AND " +
                    "( " + this.selection.string + " )"
                );
            }else if( parentSelection.string ){
                return new Selection( parentSelection.string );
            }else if( this.selection.string ){
                return new Selection( this.selection.string );
            }else{
                return new Selection( "" );
            }
        }else{
            return this.selection;
        }

    },

    getStructure: function(){

        return this.structure.getStructure();

    },

    toJSON: function(){

        var output = {

            metadata: {
                version: 0.1,
                type: 'StructureView',
                generator: 'StructureViewExporter'
            },

            structure: this.structure.toJSON(),
            // selection: this.selection.toJSON(),

            atomSet: this.atomSet.toJSON(),
            bondSet: this.bondSet.toJSON(),

            atomCount: this.atomCount,
            bondCount: this.bondCount,

            atomSetCache: {}

        };

        for( var name in this.atomSetCache ){
            output.atomSetCache[ name ] = this.atomSetCache[ name ].toJSON();
        }

        return output;

    },

    fromJSON: function( input ){

        if( input.structure.metadata.type === "Structure" ){
            this.structure = new Structure().fromJSON( input.structure );
        }else if( input.structure.metadata.type === "StructureView" ){
            this.structure = new StructureView().fromJSON( input.structure );
        }

        this.atomSet = new Bitset().fromJSON( input.atomSet );
        this.bondSet = new Bitset().fromJSON( input.bondSet );

        this.atomCount = input.atomCount;
        this.bondCount = input.bondCount;

        this.atomSetCache = {};
        for( var name in input.atomSetCache ){
            var as = new Bitset();
            this.atomSetCache[ name ] = as.fromJSON( input.atomSetCache[ name ] );
        }

        this.init();

        return this;

    },

    getTransferable: function(){

        var transferable = [];

        transferable.concat( this.structure.getTransferable() );

        transferable.concat( this.bondSet.getTransferable() );
        transferable.concat( this.atomSet.getTransferable() );

        for( var name in this.atomSetCache ){
            transferable.concat( this.atomSetCache[ name ].getTransferable() );
        }

        return transferable;

    },

    dispose: function(){

        delete this.structure;

        delete this.atomSet;
        delete this.bondSet;

        delete this.atomCount;
        delete this.bondCount;

    }

} );


export default StructureView;
