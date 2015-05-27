
NGL = {};
THREE = {};

importScripts(
    '../lib/async.min.js',
    '../lib/signals.min.js',
    '../three/three.min.js',
    '../ngl/core.js',
    '../ngl/symmetry.js',
    '../ngl/viewer.js',
    '../ngl/geometry.js',
    '../ngl/surface.js',
    '../ngl/structure.js',
    '../ngl/streamer.js',
    '../ngl/parser.js'
);

var parser = {
    pdb: NGL.PdbParser,
    cif: NGL.CifParser,
    gro: NGL.GroParser,
    cube: NGL.CubeParser
};

onmessage = function( e ){

    NGL.time( "WORKER parse" );

    var d = e.data;
    var p = new parser[ d.type ]( d.name, d.path, d.params );
    var streamer = NGL.fromJSON( d.streamer );

    p.parse( streamer, function(){

        NGL.timeEnd( "WORKER parse" );

        if( d.type === "cube" ){

            var v = p.volume;

            self.postMessage( v.toJSON(), v.getTransferable() );

        }else{

            var s = p.structure;

            // FIXME put into a more efficient format and transfer?
            s.helices = [];
            s.sheets = [];

            self.postMessage( s.toJSON(), s.getTransferable() );

        }

    } );

}
