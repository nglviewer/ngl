
NGL = {};
THREE = {};

importScripts(
    '../lib/async.min.js',
    '../lib/signals.min.js',
    '../three/three.min.js',
    '../ngl/core.js',
    '../ngl/structure.js',
    '../ngl/parser.js'
);

var parser = {
    pdb: NGL.PdbParser,
    cif: NGL.CifParser,
    gro: NGL.GroParser
};

onmessage = function( e ){

    // console.log( e.data );

    var d = e.data;

    var p = new parser[ d.type ];

    p.parse( d.data, function( structure ){

        self.postMessage(
            structure.toJSON()
        );

    } );

}
