
const fs = require( "fs" );
const system = require('system');
const webpage = require( "webpage" );


let port = 80;
let examples = false;


const argCount = system.args.length;
for( let i = 1; i < argCount; ++i ){
    const [ name, value ] = system.args[ i ].split( ":" );
    if( name === "port" ){
        port = parseInt( value );
    }else if( name === "name" ){
        examples = value.split( "," );
    }
}


const exampleUrl = "http://localhost:" + port + "/ngl/examples/test.html?load=";
const exampleDir = "../examples/scripts/";


function renderExample( name ){
    return new Promise( function( resolve, reject ){
        const page = webpage.create();
        page.onConsoleMessage = function( msg, line, file, level ){
            if( [ "error", "warning" ].includes( level ) ){
                console.log( level.toUpperCase(), msg );
            }
        };
        page.onCallback = function( cmd ){
            switch( cmd ){
                case "render":
                    page.render( "../build/test/img/" + name + ".png" );
                    page.close();
                    console.log( "FINISH", name );
                    resolve();
                    break;
            }
        }
        page.onLoadFinished = function(){
            page.evaluate( function(){
                stage.handleResize();
                let t0 = performance.now();
                stage.tasks.signals.countChanged.add( function(){
                    t0 = performance.now();
                } );
                setInterval( function(){
                    const t = performance.now();
                    if( stage.tasks.count === 0 ){
                        if( t - t0 > 1000 ){
                            window.callPhantom( "render" );
                        }
                    }
                }, 100 );
            } );
        };

        page.viewportSize = { width: 512, height: 384 };
        page.open( exampleUrl + "./scripts/" + name + ".js" );
    });
}


function buildExamplePage( exampleNames, exampleUrl ){
    const pageLines = [];
    exampleNames.forEach( name => {
        pageLines.push(
            "<a href='" + exampleUrl + "./scripts/" + name + ".js' >" +
                "<img src='./img/" + name + ".png' />" +
            "</a>"
        );
    } );
    return (
        "<!DOCTYPE html>\n" +
        "<html lang='en'>\n" +
        "<head>\n" +
            "<title>NGL - results</title>" +
        "</head>\n" +
        "<body>\n" +
            pageLines.join( "\n" ) + "\n" +
        "</body>\n" +
        "</html>"
    );
}


function flatten( arr ){
    return arr.reduce( function( acc, val ){
        return acc.concat(
            Array.isArray( val ) ? flatten( val ) : val
        );
    }, [] );
}


function getExampleNames( dir, prefix = "" ){
    return flatten( fs.list( dir )
        .filter( name => !name.startsWith( "." ) )
        .map( name => {
            const path = fs.join( dir, name );
            if( fs.isDirectory( path ) ){
                return getExampleNames( path, name + "/" );
            }else if( fs.isFile( path ) ){
                return prefix + name.substr( 0, name.length - 3 );
            }
        } )
    );
}


const exampleNames = getExampleNames( exampleDir );
if( !examples ) examples = exampleNames;


examples.reduce( function( acc, name ){
    return acc.then( function(){
        console.log( "START", name );
        return renderExample( name );
    } );
}, Promise.resolve( [] ) ).then( function(){
    fs.write(
        "../build/test/results.html",
        buildExamplePage( exampleNames, exampleUrl )
    );
    slimer.exit();
} );
