/**
 * @file Structure
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Vector3, Box3 } from "../../lib/three.es6.js";
import Signal from "../../lib/signals.es6.js";

import { Debug, Log, GidPool, ColorMakerRegistry } from "../globals.js";
import Bitset from "../utils/bitset.js";
import RadiusFactory from "../utils/radius-factory.js";
import { Matrix, principalAxes } from "../math/matrix-utils.js";
import Selection from "../selection.js";
// import StructureView from "./structure-view.js";
import Unitcell from "../symmetry/unitcell.js";
import Assembly from "../symmetry/assembly.js";

import BondStore from "../store/bond-store.js";
import AtomStore from "../store/atom-store.js";
import ResidueStore from "../store/residue-store.js";
import ChainStore from "../store/chain-store.js";
import ModelStore from "../store/model-store.js";

import AtomMap from "../store/atom-map.js";
import ResidueMap from "../store/residue-map.js";

import BondProxy from "../proxy/bond-proxy.js";
import AtomProxy from "../proxy/atom-proxy.js";
import ResidueProxy from "../proxy/residue-proxy.js";
import ChainProxy from "../proxy/chain-proxy.js";
import ModelProxy from "../proxy/model-proxy.js";


/**
 * Structure
 * @class
 * @param {String} name - structure name
 * @param {String} path - source path
 */
function Structure( name, path ){

    this.signals = {
        refreshed: new Signal(),
    };

    this.name = name;
    this.path = path;
    this.title = "";
    this.id = "";

    this.atomSetCache = {};
    this.atomSetDict = {};
    this.biomolDict = {};
    this.helices = [];
    this.sheets = [];
    this.unitcell = undefined;
    this.selection = undefined;

    this.frames = [];
    this.boxes = [];

    this.bondStore = new BondStore( 0 );
    this.backboneBondStore = new BondStore( 0 );
    this.rungBondStore = new BondStore( 0 );
    this.atomStore = new AtomStore( 0 );
    this.residueStore = new ResidueStore( 0 );
    this.chainStore = new ChainStore( 0 );
    this.modelStore = new ModelStore( 0 );

    this.atomMap = new AtomMap( this );
    this.residueMap = new ResidueMap( this );

    this.atomSet = this.getAtomSet( this.selection );
    this.bondSet = this.getBondSet();

    this.center = new Vector3();
    this.boundingBox = new Box3();

    GidPool.addObject( this );

    this._ap = this.getAtomProxy();
    this._rp = this.getResidueProxy();
    this._cp = this.getChainProxy();

}

Structure.prototype = {

    constructor: Structure,
    type: "Structure",

    refresh: function(){

        if( Debug ) Log.time( "Structure.refresh" );

        this.atomSetCache = {};

        this.atomSet = this.getAtomSet2( this.selection );
        this.bondSet = this.getBondSet();

        for( var name in this.atomSetDict ){
            var as = this.atomSetDict[ name ];
            var as2 = this.getAtomSet2( false );
            this.atomSetCache[ "__" + name ] = as2.intersection( as );
        }

        this.atomCount = this.atomSet.size();
        this.bondCount = this.bondSet.size();

        this.boundingBox = this.getBoundingBox();
        this.center = this.boundingBox.center();

        GidPool.updateObject( this );

        if( Debug ) Log.timeEnd( "Structure.refresh" );

        this.signals.refreshed.dispatch();

    },

    getBondProxy: function( index ){

        return new BondProxy( this, index );

    },

    getAtomProxy: function( index, tmp ){

        if( tmp ){
            if( this.__tmpAtomProxy === undefined ){
                this.__tmpAtomProxy = new AtomProxy( this, index );
            }
            return this.__tmpAtomProxy;
        }else{
            return new AtomProxy( this, index );
        }

    },

    getResidueProxy: function( index, tmp ){

        if( tmp ){
            if( this.__tmpResidueProxy === undefined ){
                this.__tmpResidueProxy = new ResidueProxy( this, index );
            }
            return this.__tmpResidueProxy;
        }else{
            return new ResidueProxy( this, index );
        }

    },

    getChainProxy: function( index ){

        return new ChainProxy( this, index );

    },

    getModelProxy: function( index ){

        return new ModelProxy( this, index );

    },

    getBondSet: function( selection ){

        if( Debug ) Log.time( "Structure.getBondSet" );

        var n = this.bondStore.count;
        var bs = new Bitset( n );
        var as = this.atomSet;

        if( as ){

            var bp = this.getBondProxy();

            for( var i = 0; i < n; ++i ){
                bp.index = i;
                if( as.has( bp.atomIndex1 ) && as.has( bp.atomIndex2 ) ){
                    bs.add_unsafe( bp.index );
                }
            }

        }else{

            bs.set_all( true );

        }

        if( Debug ) Log.timeEnd( "Structure.getBondSet" );

        return bs;

    },

    getBackboneBondSet: function( selection ){

        if( Debug ) Log.time( "Structure.getBackboneBondSet" );

        var n = this.backboneBondStore.count;
        var bs = new Bitset( n );
        var as = this.atomSetCache.__backbone;

        if( as ){

            var bp = this.getBondProxy();
            bp.bondStore = this.backboneBondStore;

            for( var i = 0; i < n; ++i ){
                bp.index = i;
                if( as.has( bp.atomIndex1 ) && as.has( bp.atomIndex2 ) ){
                    bs.add_unsafe( bp.index );
                }
            }

        }else{

            bs.set_all( true );

        }

        if( Debug ) Log.timeEnd( "Structure.getBackboneBondSet" );

        return bs;

    },

    getRungBondSet: function( selection ){

        if( Debug ) Log.time( "Structure.getRungBondSet" );

        var n = this.rungBondStore.count;
        var bs = new Bitset( n );
        var as = this.atomSetCache.__rung;

        if( as ){

            var bp = this.getBondProxy();
            bp.bondStore = this.rungBondStore;

            for( var i = 0; i < n; ++i ){
                bp.index = i;
                if( as.has( bp.atomIndex1 ) && as.has( bp.atomIndex2 ) ){
                    bs.add_unsafe( bp.index );
                }
            }

        }else{

            bs.set_all( true );

        }

        if( Debug ) Log.timeEnd( "Structure.getRungBondSet" );

        return bs;

    },

    getAtomSet: function( selection ){

        if( Debug ) Log.time( "Structure.getAtomSet" );

        var as;
        var n = this.atomStore.count;

        if( selection === false ){

            as = new Bitset( n );

        }else if( selection === true ){

            as = new Bitset( n );
            as.set_all( true );

        }else if( selection && selection.test ){

            var seleString = selection.string;
            as = this.atomSetCache[ seleString ];

            if( !seleString ) console.warn( "empty seleString" );

            if( as === undefined ){

                // TODO can be faster by setting ranges of atoms
                //      but for that must loop over hierarchy itself
                as = new Bitset( n );
                var ap = this.getAtomProxy();
                var test = selection.test;
                for( var i = 0; i < n; ++i ){
                    ap.index = i;
                    if( test( ap ) ) as.add_unsafe( ap.index );
                }
                this.atomSetCache[ seleString ] = as;

            }else{

                // console.log( "getting atomSet from cache", seleString );

            }

        }else{

            as = new Bitset( n );
            as.set_all( true );

        }

        if( Debug ) Log.timeEnd( "Structure.getAtomSet" );

        return as;

    },

    getAtomSet2: function( selection ){

        if( Debug ) Log.time( "Structure.getAtomSet2" );

        var as;
        var n = this.atomStore.count;

        if( selection === false ){

            as = new Bitset( n );

        }else if( selection === true ){

            as = new Bitset( n );
            as.set_all( true );

        }else if( selection && selection.test ){

            var seleString = selection.string;
            as = this.atomSetCache[ seleString ];

            if( !seleString ) console.warn( "empty seleString" );

            if( as === undefined ){

                as = new Bitset( n );
                this.eachAtom( function( ap ){
                    as.add_unsafe( ap.index );
                }, selection );
                this.atomSetCache[ seleString ] = as;

            }else{

                // console.log( "getting atomSet from cache", seleString );

            }

        }else{

            as = new Bitset( n );
            as.set_all( true );

        }

        if( Debug ) Log.timeEnd( "Structure.getAtomSet2" );

        return as;

    },

    setSelection: function( selection ){

        this.selection = selection;

        this.refresh();

    },

    getSelection: function(){

        return this.selection;

    },

    getStructure: function(){

        return this;

    },

    //

    eachBond: function( callback, selection ){

        var bp = this.getBondProxy();
        var bs = this.bondSet;

        if( selection && selection.test ){
            if( bs ){
                bs = bs.new_intersection( this.getBondSet( selection ) );
            }else{
                bs = this.getBondSet( selection );
            }
        }

        if( bs ){
            bs.forEach( function( index ){
                bp.index = index;
                callback( bp );
            } );
        }else{
            var n = this.bondStore.count;
            for( var i = 0; i < n; ++i ){
                bp.index = i;
                callback( bp );
            }
        }

    },

    getAtomSet3: function( selection ){

        if( Debug ) Log.time( "Structure.getAtomSet3" );

        var as = this.atomSet;

        if( selection && selection.test ){
            if( as ){
                as = as.new_intersection( this.getAtomSet2( selection ) );
            }else{
                as = this.getAtomSet2( selection );
            }
        }

        if( Debug ) Log.timeEnd( "Structure.getAtomSet3" );

        return as;

    },

    eachSelectedAtom: function( callback, selection ){

        var ap = this.getAtomProxy();
        var as = this.getAtomSet3( selection );
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

    eachAtom: function( callback, selection ){

        if( selection && selection.test ){
            this.eachModel( function( mp ){
                mp.eachAtom( callback, selection );
            }, selection );
        }else{
            var an = this.atomStore.count;
            var ap = this.getAtomProxy();
            for( var i = 0; i < an; ++i ){
                ap.index = i;
                callback( ap );
            }
        }

    },

    eachResidue: function( callback, selection ){

        var i;
        if( selection && selection.test ){
            var mn = this.modelStore.count;
            var mp = this.getModelProxy();
            if( selection.modelOnlyTest ){
                var modelOnlyTest = selection.modelOnlyTest;
                for( i = 0; i < mn; ++i ){
                    mp.index = i;
                    if( modelOnlyTest( mp ) ){
                        mp.eachResidue( callback, selection );
                    }
                }
            }else{
                for( i = 0; i < mn; ++i ){
                    mp.index = i;
                    mp.eachResidue( callback, selection );
                }
            }
        }else{
            var rn = this.residueStore.count;
            var rp = this.getResidueProxy();
            for( i = 0; i < rn; ++i ){
                rp.index = i;
                callback( rp );
            }
        }

    },

    eachResidueN: function( n, callback ){

        var i, j;
        var rn = this.residueStore.count;
        if( rn < n ) return;
        var array = new Array( n );

        for( i = 0; i < n; ++i ){
            array[ i ] = this.getResidueProxy( i );
        }
        callback.apply( this, array );

        for( j = n; j < rn; ++j ){
            for( i = 0; i < n; ++i ){
                array[ i ].index += 1;
            }
            callback.apply( this, array );
        }

    },

    eachPolymer: function( callback, selection ){

        if( selection && selection.modelOnlyTest ){

            var modelOnlyTest = selection.modelOnlyTest;

            this.eachModel( function( mp ){
                if( modelOnlyTest( mp ) ){
                    mp.eachPolymer( callback, selection );
                }
            } );

        }else{

            this.eachModel( function( mp ){
                mp.eachPolymer( callback, selection );
            } );

        }

    },

    eachChain: function( callback, selection ){

        if( selection && selection.test ){
            this.eachModel( function( mp ){
                mp.eachChain( callback, selection );
            } );
        }else{
            var cn = this.chainStore.count;
            var cp = this.getChainProxy();
            for( var i = 0; i < cn; ++i ){
                cp.index = i;
                callback( cp );
            }
        }

    },

    eachModel: function( callback, selection ){

        var i;
        var n = this.modelStore.count;
        var mp = this.getModelProxy();

        if( selection && selection.test ){
            var modelOnlyTest = selection.modelOnlyTest;
            if( modelOnlyTest ){
                for( i = 0; i < n; ++i ){
                    mp.index = i;
                    if( modelOnlyTest( mp ) ){
                        callback( mp, selection );
                    }
                }
            }else{
                for( i = 0; i < n; ++i ){
                    mp.index = i;
                    callback( mp, selection );
                }
            }
        }else{
            for( i = 0; i < n; ++i ){
                mp.index = i;
                callback( mp );
            }
        }

    },

    //

    getAtomData: function( params ){

        var p = Object.assign( {}, params );
        if( p.colorParams ) p.colorParams.structure = this.getStructure();

        var what = p.what;
        var atomSet = p.atomSet || this.atomSet;

        var radiusFactory, colorMaker, pickingColorMaker;
        var position, color, pickingColor, radius, index;

        var atomData = {};
        var ap = this.getAtomProxy();
        var atomCount = atomSet.size();

        if( !what || what.position ){
            position = new Float32Array( atomCount * 3 );
            atomData.position = position;
        }
        if( !what || what.color ){
            color = new Float32Array( atomCount * 3 );
            atomData.color = color;
            colorMaker = ColorMakerRegistry.getScheme( p.colorParams );
        }
        if( !what || what.pickingColor ){
            pickingColor = new Float32Array( atomCount * 3 );
            atomData.pickingColor = pickingColor;
            var pickingColorParams = Object.assign( p.colorParams, { scheme: "picking" } );
            pickingColorMaker = ColorMakerRegistry.getScheme( pickingColorParams );
        }
        if( !what || what.radius ){
            radius = new Float32Array( atomCount );
            atomData.radius = radius;
            radiusFactory = new RadiusFactory( p.radiusParams.radius, p.radiusParams.scale );
        }
        if( !what || what.index ){
            index = new Float32Array( atomCount );
            atomData.index = index;
        }

        atomSet.forEach( function( idx, i ){
            var i3 = i * 3;
            ap.index = idx;
            if( position ){
                ap.positionToArray( position, i3 );
            }
            if( color ){
                colorMaker.atomColorToArray( ap, color, i3 );
            }
            if( pickingColor ){
                pickingColorMaker.atomColorToArray( ap, pickingColor, i3 );
            }
            if( radius ){
                radius[ i ] = radiusFactory.atomRadius( ap );
            }
            if( index ){
                index[ i ] = idx;
            }
        } );

        return atomData;

    },

    getBondData: function( params ){

        var p = Object.assign( {}, params );
        if( p.colorParams ) p.colorParams.structure = this.getStructure();

        var what = p.what;
        var bondSet = p.bondSet || this.bondSet;

        var radiusFactory, colorMaker, pickingColorMaker;
        var position1, position2, color1, color2, pickingColor1, pickingColor2, radius1, radius2;

        var bondData = {};
        var bp = this.getBondProxy();
        if( p.bondStore ) bp.bondStore = p.bondStore;
        var ap1 = this.getAtomProxy();
        var ap2 = this.getAtomProxy();
        var bondCount = bondSet.size();

        if( !what || what.position ){
            position1 = new Float32Array( bondCount * 3 );
            position2 = new Float32Array( bondCount * 3 );
            bondData.position1 = position1;
            bondData.position2 = position2;
        }
        if( !what || what.color ){
            color1 = new Float32Array( bondCount * 3 );
            color2 = new Float32Array( bondCount * 3 );
            bondData.color1 = color1;
            bondData.color2 = color2;
            colorMaker = ColorMakerRegistry.getScheme( p.colorParams );
        }
        if( !what || what.pickingColor ){
            pickingColor1 = new Float32Array( bondCount * 3 );
            pickingColor2 = new Float32Array( bondCount * 3 );
            bondData.pickingColor1 = pickingColor1;
            bondData.pickingColor2 = pickingColor2;
            var pickingColorParams = Object.assign( p.colorParams, { scheme: "picking" } );
            pickingColorMaker = ColorMakerRegistry.getScheme( pickingColorParams );
        }
        if( !what || what.radius ){
            radiusFactory = new RadiusFactory( p.radiusParams.radius, p.radiusParams.scale );
        }
        if( !what || what.radius ){
            radius1 = new Float32Array( bondCount );
            if( p.radius2 ){
                radius2 = new Float32Array( bondCount );
                bondData.radius1 = radius1;
                bondData.radius2 = radius2;
            }else{
                bondData.radius = radius1;
            }
        }

        bondSet.forEach( function( index, i ){
            var i3 = i * 3;
            bp.index = index;
            ap1.index = bp.atomIndex1;
            ap2.index = bp.atomIndex2;
            if( position1 ){
                ap1.positionToArray( position1, i3 );
                ap2.positionToArray( position2, i3 );
            }
            if( color1 ){
                colorMaker.bondColorToArray( bp, 1, color1, i3 );
                colorMaker.bondColorToArray( bp, 0, color2, i3 );
            }
            if( pickingColor1 ){
                pickingColorMaker.bondColorToArray( bp, 1, pickingColor1, i3 );
                pickingColorMaker.bondColorToArray( bp, 0, pickingColor2, i3 );
            }
            if( radius1 ){
                radius1[ i ] = radiusFactory.atomRadius( ap1 );
            }
            if( radius2 ){
                radius2[ i ] = radiusFactory.atomRadius( ap2 );
            }
        } );

        return bondData;

    },

    getBackboneAtomData: function( params ){

        params = Object.assign( {
            atomSet: this.atomSetCache.__backbone,
        }, params );

        return this.getAtomData( params );

    },

    getBackboneBondData: function( params ){

        params = Object.assign( {
            bondSet: this.getBackboneBondSet(),
            bondStore: this.backboneBondStore
        }, params );

        return this.getBondData( params );

    },

    getRungAtomData: function( params ){

        params = Object.assign( {
            atomSet: this.atomSetCache.__rung,
        }, params );

        return this.getAtomData( params );

    },

    getRungBondData: function( params ){

        params = Object.assign( {
            bondSet: this.getRungBondSet(),
            bondStore: this.rungBondStore
        }, params );

        return this.getBondData( params );

    },

    //

    getBoundingBox: function( selection ){

        if( Debug ) Log.time( "getBoundingBox" );

        var box = new Box3();

        var minX = +Infinity;
        var minY = +Infinity;
        var minZ = +Infinity;

        var maxX = -Infinity;
        var maxY = -Infinity;
        var maxZ = -Infinity;

        this.eachSelectedAtom( function( ap ){

            var x = ap.x;
            var y = ap.y;
            var z = ap.z;

            if( x < minX ) minX = x;
            if( y < minY ) minY = y;
            if( z < minZ ) minZ = z;

            if( x > maxX ) maxX = x;
            if( y > maxY ) maxY = y;
            if( z > maxZ ) maxZ = z;

        }, selection );

        box.min.set( minX, minY, minZ );
        box.max.set( maxX, maxY, maxZ );

        if( Debug ) Log.timeEnd( "getBoundingBox" );

        return box;

    },

    getPrincipalAxes: function( selection ){

        console.time( "getPrincipalAxes" );

        var i = 0;
        var coords = new Matrix( 3, this.atomCount );
        var cd = coords.data;

        this.eachSelectedAtom( function( a ){
            cd[ i + 0 ] = a.x;
            cd[ i + 1 ] = a.y;
            cd[ i + 2 ] = a.z;
            i += 3;
        }, selection );

        console.timeEnd( "getPrincipalAxes" );

        return principalAxes( coords );

    },

    atomCenter: function( selection ){

        if( selection ){
            return this.getBoundingBox( selection ).center();
        }else{
            return this.center.clone();
        }

    },

    getSequence: function(){

        var seq = [];
        var rp = this.getResidueProxy();

        this.eachSelectedAtom( function( ap ){
            rp.index = ap.residueIndex;
            if( ap.index === rp.traceAtomIndex ){
                seq.push( rp.getResname1() );
            }
        } );

        return seq;

    },

    getAtomIndices: function( selection ){

        // Best to use only when the selection resolves to just a few indices!!!

        var indices = [];

        this.eachAtom( function( ap ){
            indices.push( ap.index );
        }, selection );

        return indices;

    },

    atomIndex: function(){

        var i = 0;
        var index = new Float32Array( this.atomCount );

        this.eachSelectedAtom( function( ap ){
            index[ i ] = ap.index;
        } );

        return index;

    },

    //

    updatePosition: function( position ){

        var i = 0;

        this.eachSelectedAtom( function( ap ){
            ap.positionFromArray( position, i );
            i += 3;
        } );

    },

    //

    toJSON: function(){

        if( Debug ) Log.time( "Structure.toJSON" );

        var output = {

            metadata: {
                version: 0.1,
                type: 'Structure',
                generator: 'StructureExporter'
            },

            name: this.name,
            path: this.path,
            title: this.title,
            id: this.id,

            biomolDict: {},
            helices: this.helices,
            sheets: this.sheets,
            unitcell: this.unitcell ? this.unitcell.toJSON() : undefined,

            frames: this.frames,
            boxes: this.boxes,

            center: this.center.toArray(),
            boundingBox: [
                this.boundingBox.min.toArray(),
                this.boundingBox.max.toArray()
            ],

            bondStore: this.bondStore.toJSON(),
            backboneBondStore: this.backboneBondStore.toJSON(),
            rungBondStore: this.rungBondStore.toJSON(),
            atomStore: this.atomStore.toJSON(),
            residueStore: this.residueStore.toJSON(),
            chainStore: this.chainStore.toJSON(),
            modelStore: this.modelStore.toJSON(),

            bondSet: this.bondSet.toJSON(),
            atomSet: this.atomSet.toJSON(),

            atomSetDict: {},
            atomSetCache: {},

            atomMap: this.atomMap.toJSON(),
            residueMap: this.residueMap.toJSON()

        };

        var name;
        for( name in this.biomolDict ){
            output.biomolDict[ name ] = this.biomolDict[ name ].toJSON();
        }
        for( name in this.atomSetDict ){
            output.atomSetDict[ name ] = this.atomSetDict[ name ].toJSON();
        }
        for( name in this.atomSetCache ){
            output.atomSetCache[ name ] = this.atomSetCache[ name ].toJSON();
        }

        if( Debug ) Log.timeEnd( "Structure.toJSON" );

        return output;

    },

    fromJSON: function( input ){

        if( Debug ) Log.time( "Structure.fromJSON" );

        this.name = input.name;
        this.path = input.path;
        this.title = input.title;
        this.id = input.id;

        this.biomolDict = input.biomolDict;
        this.helices = input.helices;
        this.sheets = input.sheets;
        if( input.unitcell ) this.unitcell = new Unitcell().fromJSON( input.unitcell );

        this.frames = input.frames;
        this.boxes = input.boxes;

        this.center = new Vector3().fromArray( input.center );
        this.boundingBox = new Box3(
            new Vector3().fromArray( input.boundingBox[ 0 ] ),
            new Vector3().fromArray( input.boundingBox[ 1 ] )
        );

        this.bondStore.fromJSON( input.bondStore );
        this.backboneBondStore.fromJSON( input.backboneBondStore );
        this.rungBondStore.fromJSON( input.rungBondStore );
        this.atomStore.fromJSON( input.atomStore );
        this.residueStore.fromJSON( input.residueStore );
        this.chainStore.fromJSON( input.chainStore );
        this.modelStore.fromJSON( input.modelStore );

        this.bondSet.fromJSON( input.bondSet );
        this.atomSet.fromJSON( input.atomSet );

        var name, as;
        this.biomolDict = {};
        for( name in input.biomolDict ){
            var assembly = new Assembly();
            this.biomolDict[ name ] = assembly.fromJSON( input.biomolDict[ name ] );
        }
        this.atomSetDict = {};
        for( name in input.atomSetDict ){
            as = new Bitset();
            this.atomSetDict[ name ] = as.fromJSON( input.atomSetDict[ name ] );
        }
        this.atomSetCache = {};
        for( name in input.atomSetCache ){
            as = new Bitset();
            this.atomSetCache[ name ] = as.fromJSON( input.atomSetCache[ name ] );
        }

        this.atomMap.fromJSON( input.atomMap );
        this.residueMap.fromJSON( input.residueMap );

        GidPool.updateObject( this );

        if( Debug ) Log.timeEnd( "Structure.fromJSON" );

        return this;

    },

    getTransferable: function(){

        var transferable = [];

        transferable.concat( this.bondStore.getTransferable() );
        transferable.concat( this.backboneBondStore.getTransferable() );
        transferable.concat( this.rungBondStore.getTransferable() );
        transferable.concat( this.atomStore.getTransferable() );
        transferable.concat( this.residueStore.getTransferable() );
        transferable.concat( this.chainStore.getTransferable() );
        transferable.concat( this.modelStore.getTransferable() );

        var i, n, name;
        if( this.frames ){
            var frames = this.frames;
            n = this.frames.length;
            for( i = 0; i < n; ++i ){
                transferable.push( frames[ i ].buffer );
            }
        }
        if( this.boxes ){
            var boxes = this.boxes;
            n = this.boxes.length;
            for( i = 0; i < n; ++i ){
                transferable.push( boxes[ i ].buffer );
            }
        }

        transferable.concat( this.bondSet.getTransferable() );
        transferable.concat( this.atomSet.getTransferable() );

        for( name in this.atomSetDict ){
            transferable.concat( this.atomSetDict[ name ].getTransferable() );
        }
        for( name in this.atomSetCache ){
            transferable.concat( this.atomSetCache[ name ].getTransferable() );
        }

        return transferable;

    },

    dispose: function(){

        GidPool.removeObject( this );

        if( this.frames ) this.frames.length = 0;
        if( this.boxes ) this.boxes.length = 0;

        this.bondStore.dispose();
        this.backboneBondStore.dispose();
        this.rungBondStore.dispose();
        this.atomStore.dispose();
        this.residueStore.dispose();
        this.chainStore.dispose();
        this.modelStore.dispose();

        delete this.bondStore;
        delete this.atomStore;
        delete this.residueStore;
        delete this.chainStore;
        delete this.modelStore;

        delete this.frames;
        delete this.boxes;
        delete this.cif;

        delete this.bondSet;
        delete this.atomSet;

    }

};


export default Structure;
