
stage.setParameters( {
    cameraType: "orthographic",
    mousePreset: "coot",
    lightIntensity: 0.4,
    ambientIntensity: 0.9
} );


function addElement( el ){
    Object.assign( el.style, {
        position: "absolute",
        zIndex: 10
    } );
    stage.viewer.container.appendChild( el );
}

function createElement( name, properties, style ){
    var el = document.createElement( name );
    Object.assign( el, properties );
    Object.assign( el.style, style );
    return el;
}

function createSelect( options, properties, style ){
    var select = createElement( "select", properties, style );
    options.forEach( function( d ){
        select.add( createElement( "option", {
            value: d[ 0 ], text: d[ 1 ]
        } ) );
    } )
    return select;
}

function createFileButton( label, properties, style ){
    var input = createElement( "input", Object.assign( {
        type: "file",
    }, properties ), { display: "none" } );
    addElement( input );
    var button = createElement( "input", {
        value: label,
        type: "button",
        onclick: function(){ input.click(); }
    }, style );
    return button;
}


var struc;
function loadStructure( input ){
    struc = undefined;
    surf2fofc = undefined;
    surfFofc = undefined;
    surfFofcNeg = undefined;
    isolevel2fofcText.innerText = "";
    isolevelFofcText.innerText = "";
    stage.removeAllComponents();
    return stage.loadFile( input ).then( function( o ){
        struc = o;
        o.autoView();
        o.addRepresentation( "licorice", {
            colorValue: "yellow",
            roughness: 1.0
        } );
    } );
}

var surf2fofc;
function load2fofc( input ){
    return stage.loadFile( input ).then( function( o ){
        isolevel2fofcText.innerText = "2fofc level: 1.5\u03C3";
        if( surfFofc ){
            isolevelFofcText.innerText = "fofc level: 3.0\u03C3";
            surfFofc.setParameters( { isolevel: 3 } );
            surfFofcNeg.setParameters( { isolevel: 3 } );
        }
        surf2fofc = o.addRepresentation( "surface", {
            color: "skyblue",
            isolevel: 1.5,
            boxSize: 10,
            useWorker: false,
            contour: true,
            opaqueBack: false
        } );
    } );
}

var surfFofc, surfFofcNeg;
function loadFofc( input ){
    return stage.loadFile( input ).then( function( o ){
        isolevelFofcText.innerText = "fofc level: 3.0\u03C3";
        if( surf2fofc ){
            isolevel2fofcText.innerText = "2fofc level: 1.5\u03C3";
            surf2fofc.setParameters( { isolevel: 1.5 } );
        }
        surfFofc = o.addRepresentation( "surface", {
            color: "lightgreen",
            isolevel: 3,
            boxSize: 10,
            useWorker: false,
            contour: true,
            opaqueBack: false
        } );
        surfFofcNeg = o.addRepresentation( "surface", {
            color: "tomato",
            isolevel: 3,
            negateIsolevel: true,
            boxSize: 10,
            useWorker: false,
            contour: true,
            opaqueBack: false
        } );
    } );
}


var loadStructureButton = createFileButton( "load structure", {
    accept: ".pdb,.cif,.ent,.gz",
    onchange: function( e ){
        if( e.target.files[ 0 ] ){
            loadStructure( e.target.files[ 0 ] );
        }
    }
}, { top: "12px", left: "12px" } );
addElement( loadStructureButton );

var load2fofcButton = createFileButton( "load 2fofc", {
    accept: ".map,.ccp4,.brix,.dsn6,.mrc,.gz",
    onchange: function( e ){
        if( e.target.files[ 0 ] ){
            load2fofc( e.target.files[ 0 ] );
        }
    }
}, { top: "36px", left: "12px" } );
addElement( load2fofcButton );

var loadFofcButton = createFileButton( "load fofc", {
    accept: ".map,.ccp4,.brix,.dsn6,.mrc,.gz",
    onchange: function( e ){
        if( e.target.files[ 0 ] ){
            loadFofc( e.target.files[ 0 ] );
        }
    }
}, { top: "60px", left: "12px" } );
addElement( loadFofcButton );


var surfaceSelect = createSelect( [
    [ "contour", "contour" ],
    [ "wireframe", "wireframe" ],
    [ "smooth", "smooth" ],
    [ "flat", "flat" ]
], {
    onchange: function( e ){
        var v = e.target.value;
        var p;
        if( v === "contour" ){
            p = {
                contour: true,
                flatShaded: false,
                opacity: 1,
                metalness: 0,
                wireframe: false
            };
        }else if( v === "wireframe" ){
            p = {
                contour: false,
                flatShaded: false,
                opacity: 1,
                metalness: 0,
                wireframe: true
            };
        }else if( v === "smooth" ){
            p = {
                contour: false,
                flatShaded: false,
                opacity: 0.5,
                metalness: 0,
                wireframe: false
            };
        }else if( v === "flat" ){
            p = {
                contour: false,
                flatShaded: true,
                opacity: 0.5,
                metalness: 0.2,
                wireframe: false
            };
        }
        stage.getRepresentationsByName( "surface" ).setParameters( p );
    }
}, { top: "84px", left: "12px" } );
addElement( surfaceSelect );


var seleText = createElement( "span", {
    innerText: "center selection",
    title: "press enter to apply and center"
}, { top: "120px", left: "12px", color: "lightgrey" } );
addElement( seleText );

var lastSele;
function checkSele( str ){
    var selection = new NGL.Selection( str );
    return !selection.selection[ "error" ];
}
var seleInput = createElement( "input", {
    type: "text",
    title: "press enter to apply and center",
    onkeypress: function( e ){
        var value = e.target.value;
        var character = String.fromCharCode( e.which );
        if( e.keyCode === 13 ){
            e.preventDefault();
            if( checkSele( value ) ){
                if( struc ){
                    lastSele = value;
                    struc.autoView( value );
                    var z = stage.viewer.camera.position.z;
                    stage.setFocus( 100 - Math.abs( z / 10 ) );
                    e.target.style.backgroundColor = "white";
                }
            }else{
                e.target.style.backgroundColor = "tomato";
            }
        }else if( lastSele !== value + character ){
            e.target.style.backgroundColor = "skyblue";
        }else{
            e.target.style.backgroundColor = "white";
        }
    }
}, { top: "140px", left: "12px", width: "100px" } );
addElement( seleInput );


var isolevel2fofcText = createElement(
    "span", {}, { bottom: "32px", left: "12px", color: "lightgrey" }
);
addElement( isolevel2fofcText );

var isolevelFofcText = createElement(
    "span", {}, { bottom: "12px", left: "12px", color: "lightgrey" }
);
addElement( isolevelFofcText );

stage.mouseControls.add( "scroll", function(){
    if( surf2fofc ){
        var level2fofc = surf2fofc.getParameters().isolevel.toFixed( 1 );
        isolevel2fofcText.innerText = "2fofc level: " + level2fofc + "\u03C3";
    }
    if( surfFofc ){
        var levelFofc = surfFofc.getParameters().isolevel.toFixed( 1 );
        isolevelFofcText.innerText = "fofc level: " + levelFofc + "\u03C3";
    }
} );


loadStructure( "data://3ek3.cif" );
load2fofc( "data://3ek3-2fofc.map.gz" );
loadFofc( "data://3ek3-fofc.map.gz" );
