
import GidPool from "../../src/utils/gid-pool.js";

import { assert } from 'chai';


describe('utils/gid-pool', function() {


describe('GidPool', function () {
    it('basic', function () {

        function AtomProxy( index ){
            this.type = "AtomProxy";
            this.index = index;
        }

        function BondProxy( index ){
            this.type = "BondProxy";
            this.index = index;
            this.bondStore = { name: "bondStore" };
        }

        var structure = {
            type: "Structure",
            atomStore: { count: 1 },
            bondStore: { count: 1, name: "bondStore" },
            backboneBondStore: { count: 1, name: "backboneBondStore" },
            rungBondStore: { count: 1, name: "rungBondStore" },
            getAtomProxy: function( index ){ return new AtomProxy( index ); },
            getBondProxy: function( index ){ return new BondProxy( index ); }
        };

        var gidPool = new GidPool();

        // check new, empty gid pool

        assert.equal( gidPool.getGidCount( structure ), 4, "getGidCount" );

        assert.equal( gidPool.nextGid, 1, "nextGid" );
        assert.deepEqual( gidPool.rangeList, [], "rangeList" );
        assert.deepEqual( gidPool.objectList, [], "objectList" );
        assert.equal( gidPool.getByGid( 0 ), undefined );

        // add object and check

        gidPool.addObject( structure );

        assert.equal( gidPool.nextGid, 5, "nextGid" );
        assert.deepEqual( gidPool.rangeList, [ [ 1, 5 ] ], "rangeList" );
        assert.deepEqual( gidPool.objectList, [ structure ], "objectList" );
        assert.equal( gidPool.getByGid( 0 ), undefined );
        assert.equal( gidPool.getByGid( 5 ), undefined );

        var entity1 = gidPool.getByGid( 1 );
        assert.equal( entity1.type, "AtomProxy" );
        assert.equal( entity1.index, 0 );

        var entity2 = gidPool.getByGid( 2 );
        assert.equal( entity2.type, "BondProxy" );
        assert.equal( entity2.bondStore.name, "bondStore" );
        assert.equal( entity2.index, 0 );

        var entity3 = gidPool.getByGid( 3 );
        assert.equal( entity3.type, "BondProxy" );
        assert.equal( entity3.bondStore.name, "backboneBondStore" );
        assert.equal( entity3.index, 0 );

        var entity4 = gidPool.getByGid( 4 );
        assert.equal( entity4.type, "BondProxy" );
        assert.equal( entity4.bondStore.name, "rungBondStore" );
        assert.equal( entity4.index, 0 );

        // remove object and check

        gidPool.removeObject( structure );

        assert.equal( gidPool.nextGid, 1, "nextGid" );
        assert.deepEqual( gidPool.rangeList, [], "rangeList" );
        assert.deepEqual( gidPool.objectList, [], "objectList" );
        assert.equal( gidPool.getByGid( 0 ), undefined );

    });
});


});
