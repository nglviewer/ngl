
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


const nglUrl = "https://rawgit.com/arose/ngl/master/dist/ngl.js";

const html = (
    "<div id=\"viewport\" style=\"width:600px; height:600px;\"></div>"
);

const jsPrefix = (
    "// Datasources\n" +
    "NGL.DatasourceRegistry.add(\n" +
    "    \"data\", new NGL.StaticDatasource( \"//rawgit.com/arose/ngl/master/data/\" )\n" +
    ");\n\n" +
    "var stage;\n" +
    "document.addEventListener( \"DOMContentLoaded\", function(){\n" +
    "stage = new NGL.Stage( \"viewport\" );"
);

const jsSuffix = (
    "} );"
);


function buildExamplePage( exampleNames, exampleUrl ){
    const pageLines = [];
    exampleNames.forEach( name => {
        pageLines.push( "<div class='outer'>" );
        pageLines.push(
            "<a href='" + exampleUrl + "./scripts/" + name + ".js' target='_blank' >" +
                "<img src='./img/" + name + ".png' />" +
            "</a>"
        );
        pageLines.push( "<span class='name'>" + name + "</span>" );
        console.log(name)
        const path = exampleDir + name + ".js";
        const js = jsPrefix + "\n\n" + fs.open( path, "r" ).read() + "\n\n" + jsSuffix;
        pageLines.push(
            "" +
            "<form method='post' id='name' action='http://jsfiddle.net/api/post/library/pure/' target='_blank'>" +
            "<input type='submit' value='JSFiddle'/>" +
            "<input type='hidden' name='resources' value='" + nglUrl + "'/>" +
            "<input type='hidden' name='html' value='" + html + "'/>" +
            "<input type='hidden' name='js' value='" + js + "'/>" +
            "</form>"
        );
        pageLines.push( "</div>" );
    } );
    return (
        "<!DOCTYPE html>\n" +
        "<html lang='en'>\n" +
        "<head>\n" +
            "<title>NGL - results</title>" +
            "<style>" +
                ".outer { position:relative; display:inline-block; } " +
                ".name { position:absolute; bottom:15px; right:5px; z-index:10; color:lightgrey; font-family:sans-serif; } " +
                "input, form { display:inline; position:absolute; top:5px; right:5px; z-index:10; } " +
            "</style>" +
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
