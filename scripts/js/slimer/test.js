
var fs = require( "fs" );
var webpage = require( "webpage" );


var exampleUrl = "http://localhost:8091/ngl/examples/test.html?load=";
var exampleDir = "../examples/scripts/";


function renderExample( name ){
    return new Promise( function( resolve, reject ){
        var page = webpage.create();
        page.onConsoleMessage = function( msg ){
            console.log( name, msg );
        };
        page.onCallback = function( cmd ){
            switch( cmd ){
                case "render":
                    page.render( "../build/test/" + name + ".png" );
                    page.close();
                    console.log( name, "FINISH" );
                    resolve();
                    break;
            }
        }
        page.onLoadFinished = function(){
            page.evaluate( function(){
                var t0 = performance.now();
                stage.tasks.signals.countChanged.add( function(){
                    t0 = performance.now();
                } );
                setInterval( function(){
                    var t = performance.now();
                    if( stage.tasks.count === 0 ){
                        if( t - t0 > 500 ){
                            window.callPhantom( "render" );
                        }
                    }
                }, 100 );
            } );
        };

        page.viewportSize = { width: 1024, height: 768 };
        page.open( exampleUrl + "./scripts/" + name + ".js" );
    });
}

function getExampleNames( dir ){
    return fs.list( dir ).map( name => {
        return name.substr( 0, name.length - 3 )
    } );
}


var exampleNames = getExampleNames( exampleDir );

exampleNames.reduce( function( acc, name ){
    return acc.then( function(){
        console.log( name, "START" );
        return renderExample( name );
    } );
}, Promise.resolve( [] ) ).then( function(){
    slimer.exit();
} );
