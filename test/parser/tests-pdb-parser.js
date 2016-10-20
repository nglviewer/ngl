
import StringStreamer from "../../src/streamer/string-streamer.js";
import PdbParser from "../../src/parser/pdb-parser.js";
import {
    PolymerEntity, NonPolymerEntity, WaterEntity
} from "../../src/structure/structure-constants.js";

import { assert } from 'chai';
import fs from 'fs';


function checkEntity( e0, e1 ){
    assert.strictEqual( e0.description, e1.description );
    assert.deepEqual( e0.chainIndexList, e1.chainIndexList );
    assert.strictEqual( e0.entityType, e1.entityType );
    assert.strictEqual( e0.index, e1.index );
}


describe('parser/pdb-parser', function() {


describe('parsing', function () {
    it('basic', function () {
        var path = __dirname + "/../data/1crn.pdb";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            assert.strictEqual( structure.atomCount, 327 );
            assert.strictEqual( structure.bondCount, 337 );
            assert.strictEqual( structure.residueStore.count, 46 );
            assert.strictEqual( structure.chainStore.count, 1 );
            assert.strictEqual( structure.modelStore.count, 1 );

            assert.strictEqual( structure.atomSet.length, 327 );
            assert.strictEqual( structure.bondSet.length, 337 );
            assert.strictEqual( structure.backboneBondStore.count, 45 );
            assert.strictEqual( structure.rungBondStore.count, 0 );

            assert.deepEqual(
                structure.boundingBox.max.toArray(),
                [ 24.284000396728516, 20.937000274658203, 19.579999923706055 ]
            );
            assert.deepEqual(
                structure.boundingBox.min.toArray(),
                [ -3.0969998836517334, -0.515999972820282, -7.421999931335449 ]
            );
            assert.deepEqual(
                structure.center.toArray(),
                [ 10.593500256538391, 10.21050015091896, 6.078999996185303 ]
            );

            assert.deepEqual( structure.boxes, [
                new Float32Array([
                    40.959999084472656, 0, 0,
                    0, 18.649999618530273, 0,
                    0, 0, 22.520000457763672
                ])
            ] );
            assert.deepEqual( structure.frames, [] );
            assert.deepEqual( structure.header, {} );
            // TODO
            // assert.deepEqual( structure.header, {
            //     "depositionDate": "1981-04-30",
            //     "releaseDate": "2012-07-11",
            //     "experimentalMethods": [
            //         "X-RAY DIFFRACTION"
            //     ],
            //     "resolution": 1.5
            // } );
            assert.strictEqual( structure.id, "1CRN" );
            assert.strictEqual( structure.title, "WATER STRUCTURE OF A HYDROPHOBIC PROTEIN AT ATOMIC RESOLUTION. PENTAGON RINGS OF WATER MOLECULES IN CRYSTALS OF CRAMBIN" );

            assert.strictEqual( structure.atomMap.list.length, 27 );
            assert.strictEqual( Object.keys( structure.biomolDict ).length, 3 );
            assert.strictEqual( structure.bondHash.countArray.length, 327 );
            assert.strictEqual( structure.bondHash.indexArray.length, 337 * 2 );
            assert.strictEqual( structure.bondHash.offsetArray.length, 327 );
            assert.strictEqual( structure.residueMap.list.length, 16 );
            assert.strictEqual( structure.entityList.length, 1 );
            assert.ok( structure.spatialHash !== undefined );
        } );
    });

    it('entity', function () {
        var path = __dirname + "/../data/3pqr.pdb";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            assert.strictEqual( structure.atomCount, 2904 );
            assert.strictEqual( structure.bondCount, 2968 );
            assert.strictEqual( structure.residueStore.count, 373 );
            assert.strictEqual( structure.chainStore.count, 17 );
            assert.strictEqual( structure.modelStore.count, 1 );
            assert.strictEqual( structure.entityList.length, 12 );

            checkEntity( structure.entityList[ 0 ], {
                description: "RHODOPSIN",
                chainIndexList: [ 0 ],
                entityType: PolymerEntity,
                index: 0
            } );
            checkEntity( structure.entityList[ 8 ], {
                description: "SULFATE ION",
                chainIndexList: [ 11 ],
                entityType: NonPolymerEntity,
                index: 8
            } );
            checkEntity( structure.entityList[ 11 ], {
                description: "water",
                chainIndexList: [ 15, 16 ],
                entityType: WaterEntity,
                index: 11
            } );
        } );
    });

    it('double bonds', function () {
        var path = __dirname + "/../data/doubleBonds.pdb";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var pdbParser = new PdbParser( streamer );
        pdbParser.parse( function( structure ){
            var bs = structure.bondStore;
            assert.strictEqual( bs.atomIndex1[ 0 ], 0 );
            assert.strictEqual( bs.atomIndex2[ 0 ], 1 );
            assert.strictEqual( bs.bondOrder[ 0 ], 1 );
            assert.strictEqual( bs.atomIndex1[ 25 ], 18 );
            assert.strictEqual( bs.atomIndex2[ 25 ], 19 );
            assert.strictEqual( bs.bondOrder[ 25 ], 1 );
            assert.strictEqual( bs.atomIndex1[ 26 ], 19 );
            assert.strictEqual( bs.atomIndex2[ 26 ], 20 );
            assert.strictEqual( bs.bondOrder[ 26 ], 2 );
        } );
    });
});


});
