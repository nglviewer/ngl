

var suite = new Benchmark.Suite( "bench",

    {
        onCycle: function( event, bench ){
            console.log(
                String( event.target ),
                ( event.target.stats.mean * 1000 ).toFixed(2) + " ms"
            );
        },
        onComplete: function(){
            console.log( "Done" );
        },
        onError: function( e ){
            console.error( e );
        }
    }

);

var data = {
    "1crn": "../../data/__example__/1crn.pdb",
    "3dqb": "../../data/__example__/3dqb.pdb",
    "3l5q": "../../data/__example__/3l5q.pdb",
};

var loadingManager = new THREE.LoadingManager( function(){

    console.log( "data loaded" );
    suite.run( true );

});

var xhrLoader = new THREE.XHRLoader( loadingManager );

Object.keys( data ).forEach( function( name ){

    var url = data[ name ];

    xhrLoader.load( url, function( response ){

        data[ name ] = response;

    } );

} );




suite.add( '1crn parse',
    
    {
        fn: function(){
            pdbStructure.reset();
            pdbStructure._parse( data[ "1crn" ] );
        },
        setup: function(){
            var pdbStructure = new NGL.PdbStructure();
        }
    }

);

suite.add( '1crn autoBond',
    
    {
        fn: function(){
    
            pdbStructure.bondSet = new NGL.BondSet();
            pdbStructure.autoBond();

        },
        setup: function(){
            var pdbStructure = new NGL.PdbStructure();
            pdbStructure.parse( data[ "1crn" ] );
        }
    }

);


suite.add( '3dqb parse',
    
    {
        fn: function(){
            pdbStructure.reset();
            pdbStructure._parse( data[ "3dqb" ] );
        },
        setup: function(){
            var pdbStructure = new NGL.PdbStructure();
        }
    }

);

suite.add( '3dqb autoBond',

    {
        fn: function(){
    
            pdbStructure.bondSet = new NGL.BondSet();
            pdbStructure.autoBond();

        },
        setup: function(){
            var pdbStructure = new NGL.PdbStructure();
            pdbStructure.parse( data[ "3dqb" ] );
        }
    }

);


suite.add( '3l5q parse',
    
    {
        fn: function(){
            pdbStructure.reset();
            pdbStructure._parse( data[ "3l5q" ] );
        },
        setup: function(){
            var pdbStructure = new NGL.PdbStructure();
        }
    }

);

suite.add( '3l5q autoBond',

    {
        fn: function(){
    
            pdbStructure.bondSet = new NGL.BondSet();
            pdbStructure.autoBond();

        },
        setup: function(){
            var pdbStructure = new NGL.PdbStructure();
            pdbStructure.parse( data[ "3l5q" ] );
        }
    }

);





