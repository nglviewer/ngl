
import StringStreamer from "../../src/streamer/string-streamer.js";
import CifParser from "../../src/parser/cif-parser.js";

import { assert } from 'chai';
import fs from 'fs';


describe('parser/cif-parser', function() {


describe('parsing', function () {
    it('basic/mmcif', function () {
        var path = __dirname + "/../data/1CRN.cif";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var cifParser = new CifParser( streamer );
        cifParser.parse( function( structure ){
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
            assert.deepEqual( structure.header, {
                "depositionDate": "1981-04-30",
                "releaseDate": "2012-07-11",
                "experimentalMethods": [
                    "X-RAY DIFFRACTION"
                ],
                "resolution": 1.5
            } );
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

    it('basic/chemComp', function () {
        var path = __dirname + "/../data/PRDCC_000001.cif";
        var str = fs.readFileSync( path, "utf-8" );
        var streamer = new StringStreamer( str );
        var cifParser = new CifParser( streamer );
        cifParser.parse( function( structure ){
            assert.strictEqual( structure.atomCount, 352 );
            assert.strictEqual( structure.bondCount, 364 );
        } );
    });
});


});
