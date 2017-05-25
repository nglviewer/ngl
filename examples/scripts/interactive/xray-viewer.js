
stage.setParameters( {
    cameraType: "orthographic",
    mousePreset: "coot"
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


function loadStructure( input ){
    stage.removeAllComponents();
    return stage.loadFile( input ).then( function( o ){
        o.autoView();
        o.addRepresentation( "licorice", {
            colorValue: "yellow",
            roughness: 1.0
        } );
    } );
}

function load2fofc( input ){
    return stage.loadFile( input ).then( function( o ){
        o.addRepresentation( "surface", {
            color: "skyblue",
            isolevel: 2.5,
            boxSize: 10,
            useWorker: false,
            contour: true,
            opaqueBack: false
        } );
    } );
}

function loadFofc( input ){
    return stage.loadFile( input ).then( function( o ){
        o.addRepresentation( "surface", {
            color: "lightgreen",
            isolevel: 2,
            boxSize: 10,
            useWorker: false,
            contour: true,
            opaqueBack: false
        } );
        o.addRepresentation( "surface", {
            color: "tomato",
            isolevel: -2,
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
    [ "wireframe", "wireframe" ],
    [ "smooth", "smooth" ],
    [ "flat", "flat" ]
], {
    onchange: function( e ){
        var v = e.target.value;
        var p;
        if( v === "wireframe" ){
            p = {
                contour: true,
                flatShaded: false,
                opacity: 1,
                metalness: 0
            }
        }else if( v === "smooth" ){
            p = {
                contour: false,
                flatShaded: false,
                opacity: 0.5,
                metalness: 0
            }
        }else if( v === "flat" ){
            p = {
                contour: false,
                flatShaded: true,
                opacity: 0.5,
                metalness: 0.2
            }
        }
        stage.getRepresentationsByName( "surface" ).setParameters( p );
    }
}, { top: "84px", left: "12px" } );
addElement( surfaceSelect );
