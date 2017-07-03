
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


const exampleUrl = "http://localhost:" + port + "/ngl/examples/test.html?script=";
const exampleDir = "../examples/scripts/";


function renderExample( name ){
    return new Promise( function( resolve, reject ){
        const page = webpage.create();
        page.onConsoleMessage = function( msg, line, file, level ){
            if( [ "error", "warning" ].includes( level ) ){
                console.log( "CONSOLE." + level.toUpperCase(), msg );
            }
        };
        page.onError = function( msg, stack ){
            console.log( "ERROR", msg );
        };
        page.onResourceError = function( e ){
            console.log( "RESOURCE-ERROR", e.errorString );
        };
        page.onCallback = function( cmd ){
            switch( cmd ){
                case "render":
                    page.render( "../build/gallery/img/" + name + ".png" );
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
        page.open( exampleUrl + name );
    });
}

const pkg = JSON.parse( fs.open( "../package.json", "r" ).read() );
const nglVersion = pkg.version;

const nglUrl = "https://cdn.rawgit.com/arose/ngl/v" + nglVersion + "/dist/ngl.js";

const html = (
    "<div id=\"viewport\" style=\"width:100%; height:100%;\"></div>"
);

const css = (
    "html, body { width: 100%; height: 100%; overflow: hidden; margin: 0; padding: 0; }\n"
);

const jsPrefix = (
    "// Setup to load data from rawgit\n" +
    "NGL.DatasourceRegistry.add(\n" +
    "    \"data\", new NGL.StaticDatasource( \"//cdn.rawgit.com/arose/ngl/v" + nglVersion + "/data/\" )\n" +
    ");\n\n" +
    "// Create NGL Stage object\n" +
    "var stage = new NGL.Stage( \"viewport\" );\n\n" +
    "// Handle window resizing\n" +
    "window.addEventListener( \"resize\", function( event ){\n" +
    "    stage.handleResize();\n" +
    "}, false );\n\n\n"
);

const ga = (
    "<script>\n" +
    "    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n" +
    "    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n" +
    "    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n" +
    "    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');\n" +
    "\n" +
    "    ga('create', 'UA-69549173-1', 'auto');\n" +
    "    ga('send', 'pageview');\n" +
    "</script>\n\n\n"
);


function buildExamplePage( exampleNames, exampleUrl ){
    const pageLines = [];
    exampleNames.forEach( name => {
        pageLines.push( "<div class='outer'>" );
        pageLines.push( "<img src='./img/" + name + ".png' />" );
        pageLines.push( "<span class='name'>" + name + "</span>" );
        const path = exampleDir + name + ".js";
        const doc = "// Code for example: " + name + "\n";
        const js = jsPrefix + doc + fs.open( path, "r" ).read();
        const data = {
            title: "NGL@" + nglVersion + " - " + name,
            tags: [ "ngl", "nglviewer", "webgl", "molecule", "scientific" ],
            editors: "001",
            layout: "left",
            html: html,
            css: css,
            js: js.replace(/'/g, '"').replace(/"/g, '\"'),
            js_external: nglUrl
        };
        const json = JSON.stringify( data );
        pageLines.push(
            "" +
            "<form method='post' id='" + name + "' action='https://codepen.io/pen/define/' target='_blank'>" +
            "<input type='submit' value='View/Edit' style='cursor:pointer'/>" +
            "<input type='hidden' name='data' value='" + json + "'/>" +
            "</form>"
        );
        pageLines.push( "</div>" );
    } );
    return (
        "<!DOCTYPE html>\n" +
        "<html lang='en'>\n" +
        "<head>\n" +
            "<title>NGL - gallery</title>" +
            "<style>" +
                "body { font-family:sans-serif; } " +
                ".outer { position:relative; display:inline-block; } " +
                ".name { position:absolute; bottom:15px; right:5px; z-index:10; color:lightgrey; } " +
                "input, form { display:inline; position:absolute; top:5px; right:5px; z-index:10; } " +
            "</style>" +
        "</head>\n" +
        "<body>\n" +
            "<h1>NGL@" + nglVersion + " gallery</h1>\n" +
            pageLines.join( "\n" ) + "\n" +
            ga +
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
    return flatten( fs.list( dir ).sort()
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
        "../build/gallery/index.html",
        buildExamplePage( exampleNames, exampleUrl )
    );
    slimer.exit();
} );
