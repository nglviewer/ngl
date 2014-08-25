

var suite = new Benchmark.Suite( "bench",

    {
        onCycle: function( event, bench ){

            console.log(
                String( event.target ),
                ( event.target.stats.mean * 1000 ).toFixed(2) + " ms"
            );

            document.body.appendChild( document.createElement( 'br' ) );

            var titleDom = document.createElement( 'div' );
            titleDom.style.fontWeight = 'bold';
            titleDom.textContent = event.target.name;
            document.body.appendChild( titleDom );

            var msDom = document.createElement( 'div' );
            document.body.appendChild( msDom );
            msDom.textContent = ( event.target.stats.mean * 1000 ).toFixed(2) + " ms";

        },
        onComplete: function(){

            console.log( "Done" );

            document.body.appendChild( document.createElement( 'br' ) );

            var done = document.createElement( 'div' );
            done.style.fontWeight = 'bold';
            done.textContent = "Done";
            document.body.appendChild( done );

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

    "pbc": "../../data/__example__/pbc.gro",
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




// suite.add( '1crn parse',
    
//     {
//         async: true,
//         fn: function(){
//             pdbStructure.reset();
//             pdbStructure._parse( data[ "1crn" ] );
//         },
//         setup: function(){
//             var pdbStructure = new NGL.PdbStructure();
//         }
//     }

// );

// suite.add( '1crn autoBond',
    
//     {
//         async: true,
//         fn: function(){
    
//             pdbStructure.bondSet = new NGL.BondSet();
//             pdbStructure.autoBond();

//         },
//         setup: function(){
//             var pdbStructure = new NGL.PdbStructure();
//             pdbStructure.parse( data[ "1crn" ] );
//         }
//     }

// );


// suite.add( '3dqb parse',
    
//     {
//         async: true,
//         fn: function(){
//             pdbStructure.reset();
//             pdbStructure._parse( data[ "3dqb" ] );
//         },
//         setup: function(){
//             var pdbStructure = new NGL.PdbStructure();
//         }
//     }

// );

// suite.add( '3dqb autoBond',

//     {
//         async: true,
//         fn: function(){
    
//             pdbStructure.bondSet = new NGL.BondSet();
//             pdbStructure.autoBond();

//         },
//         setup: function(){
//             var pdbStructure = new NGL.PdbStructure();
//             pdbStructure.parse( data[ "3dqb" ] );
//         }
//     }

// );


suite.add( '3l5q parse',
    
    {
        async: true,
        fn: function(){
            pdbStructure.reset();
            pdbStructure._parse( data[ "3l5q" ] );
        },
        setup: function(){
            var pdbStructure = new NGL.PdbStructure();
        }
    }

);


// suite.add( '3l5q parse2',
    
//     {
//         async: true,
//         fn: function(){
//             pdbStructure.reset();
//             pdbStructure._parse2( data[ "3l5q" ] );
//         },
//         setup: function(){
//             var pdbStructure = new NGL.PdbStructure();
//         }
//     }

// );


// suite.add( '3l5q autoBond',

//     {
//         async: true,
//         fn: function(){
    
//             pdbStructure.bondSet = new NGL.BondSet();
//             pdbStructure.autoBond();

//         },
//         setup: function(){
//             var pdbStructure = new NGL.PdbStructure();
//             pdbStructure.parse( data[ "3l5q" ] );
//         }
//     }

// );


// suite.add( 'pbc parse',
    
//     {
//         async: true,
//         fn: function(){
//             groStructure.reset();
//             groStructure._parse( data[ "pbc" ] );
//         },
//         setup: function(){
//             var groStructure = new NGL.GroStructure();
//         }
//     }

// );


// suite.add( 'pbc parse2',
    
//     {
//         async: true,
//         fn: function(){
//             groStructure.reset();
//             groStructure._parse2( data[ "pbc" ] );
//         },
//         setup: function(){
//             var groStructure = new NGL.GroStructure();
//         }
//     }

// );

