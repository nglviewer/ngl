/**
 * @file Gid Pool
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import { Log } from "../globals.js";


function GidPool( name ){

    this.name = name || "";

    this.nextGid = 1;
    this.objectList = [];
    this.rangeList = [];

}

GidPool.prototype = {

    constructor: GidPool,

    getBaseObject: function( object ){

        if( object.type === "StructureView" ){
            object = object.getStructure();
        }

        return object;

    },

    addObject: function( object ){

        object = this.getBaseObject( object );

        var gidRange = this.allocateGidRange( object );

        if( gidRange ){
            this.objectList.push( object );
            this.rangeList.push( gidRange );
        }

        return this;

    },

    removeObject: function( object ){

        object = this.getBaseObject( object );

        var idx = this.objectList.indexOf( object );

        if( idx !== -1 ){

            this.objectList.splice( idx, 1 );
            this.rangeList.splice( idx, 1 );

            if( this.objectList.length === 0 ){
                this.nextGid = 1;
            }

        }

        return this;

    },

    updateObject: function( object, silent ){

        object = this.getBaseObject( object );

        var idx = this.objectList.indexOf( object );

        if( idx !== -1 ){

            var range = this.rangeList[ idx ];

            if( range[1] === this.nextGid ){
                var count = this.getGidCount( object );
                this.nextGid += count - ( range[1] - range[0] );
                range[ 1 ] = this.nextGid;
            }else{
                this.rangeList[ idx ] = this.allocateGidRange( object );
            }

        }else{

            if( !silent ){
                Log.warn( "GidPool.updateObject: object not found." );
            }

        }

        return this;

    },

    getGidCount: function( object ){

        object = this.getBaseObject( object );

        var count = 0;

        if( object.type === "Structure" ){
            count = (
                object.atomStore.count +
                object.bondStore.count +
                object.backboneBondStore.count +
                object.rungBondStore.count
            );
        }else if( object.type === "Volume" ){
            count = object.__data.length;
        }else{
            Log.warn( "GidPool.getGidCount: unknown object type" );
        }

        return count;

    },

    allocateGidRange: function( object ){

        object = this.getBaseObject( object );

        var gidCount = this.getGidCount( object )

        if( gidCount > Math.pow( 10, 7 ) ){
            Log.warn( "GidPool.allocateGidRange: gidCount too large" );
            return null;
        }

        var firstGid = this.nextGid;
        this.nextGid += gidCount;

        if( this.nextGid > Math.pow( 2, 24 ) ){
            Log.error( "GidPool.allocateGidRange: GidPool overflown" );
        }

        return [ firstGid, this.nextGid ];

    },

    // freeGidRange: function( object ){

    //     object = this.getBaseObject( object );
    //     // TODO

    // },

    getNextGid: function(){

        return this.nextGid++;

    },

    getGid: function( object, offset ){

        object = this.getBaseObject( object );
        offset = offset || 0;

        var gid = 0;
        var idx = this.objectList.indexOf( object );

        if( idx !== -1 ){

            var range = this.rangeList[ idx ];
            var first = range[ 0 ];

            gid = first + offset;

        }else{

            Log.warn( "GidPool.getGid: object not found." );

        }

        return gid;

    },

    getByGid: function( gid ){

        var entity;

        this.objectList.forEach( function( o, i ){

            var range = this.rangeList[ i ];
            if( gid < range[ 0 ] || gid >= range[ 1 ] ){
                return;
            }
            var offset = gid - range[ 0 ];

            if( o.type === "Structure" ){

                if( offset < o.atomStore.count ){

                    entity = o.getAtomProxy( offset );

                }else if( offset < o.atomStore.count + o.bondStore.count ){

                    offset -= o.atomStore.count;
                    entity = o.getBondProxy( offset );

                }else if( offset < o.atomStore.count + o.bondStore.count + o.backboneBondStore.count ){

                    offset -= ( o.atomStore.count + o.bondStore.count );
                    entity = o.getBondProxy( offset );
                    entity.bondStore = o.backboneBondStore;

                }else if( offset < o.atomStore.count + o.bondStore.count + o.backboneBondStore.count + o.rungBondStore.count ){

                    offset -= ( o.atomStore.count + o.bondStore.count + o.backboneBondStore.count );
                    entity = o.getBondProxy( offset );
                    entity.bondStore = o.rungBondStore;

                }else{

                    Log.warn( "GidPool.getByGid: invalid Structure gid", gid );

                }

            }else if( o.type === "Volume" ){

                entity = {
                    volume: o,
                    index: offset,
                    value: o.data[ offset ],
                    x: o.dataPosition[ offset * 3 ],
                    y: o.dataPosition[ offset * 3 + 1 ],
                    z: o.dataPosition[ offset * 3 + 2 ],
                };

            }else{

                Log.warn( "GidPool.getByGid: unknown object type for gid", gid );

            }

        }, this );

        return entity;

    }

};


export default GidPool;
