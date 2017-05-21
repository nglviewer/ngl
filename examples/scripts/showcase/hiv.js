
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

stage.loadFile( "rcsb://3j3q.mmtf" ).then( function( o ){

    var point = o.addRepresentation( "point" );

    var surface = o.addRepresentation( "surface", {
        surfaceType: "sas",
        smooth: 2,
        scaleFactor: 0.2,
        colorScheme: "chainindex",
        opaqueBack: false
    } );

    var cartoon = o.addRepresentation( "cartoon", {
        sele: ":f0 or :f1 or :f2 or :f3 or :f4 or :f5",
        colorScheme: "chainindex"
    } );

    var ballnstick = o.addRepresentation( "ball+stick", {
        sele: ":f0",
        colorScheme: "element"
    } );

    var rocket = o.addRepresentation( "rocket", {
        sele: ":f0",
        colorScheme: "chainindex"
    } );

    stage.tasks.onZeroOnce( function(){ stage.autoView(); } );

    var pointButton = createElement( "input", {
      type: "button",
      value: "toggle points",
    }, { top: "1em", left: "1em" } );
    pointButton.onclick = function( e ){
        point.toggleVisibility();
    };
    addElement( pointButton );

    var surfaceButton = createElement( "input", {
      type: "button",
      value: "toggle surface",
    }, { top: "3em", left: "1em" } );
    surfaceButton.onclick = function( e ){
        surface.toggleVisibility();
    };
    addElement( surfaceButton );

    var cartoonButton = createElement( "input", {
      type: "button",
      value: "toggle cartoon",
    }, { top: "5em", left: "1em" } );
    cartoonButton.onclick = function( e ){
        cartoon.toggleVisibility();
    };
    addElement( cartoonButton );

    var centerAllButton = createElement( "input", {
      type: "button",
      value: "center all",
    }, { top: "8em", left: "1em" } );
    centerAllButton.onclick = function( e ){
        stage.autoView()
    };
    addElement( centerAllButton );

    var centerSubunitButton = createElement( "input", {
      type: "button",
      value: "center subunit",
    }, { top: "10em", left: "1em" } );
    centerSubunitButton.onclick = function( e ){
        o.autoView( ":f0 or :f1 or :f2 or :f3 or :f4 or :f5" )
    };
    addElement( centerSubunitButton );

    addElement( createElement( "span", {
      innerText: "surface transparency",
    }, { top: "11em", left: "1em", color: "lightgrey" } ) );
    var opacityRange = createElement( "input", {
      type: "range",
      value: 0,
      min: 0,
      max: 10,
      step: 1
    }, { top: "15em", left: "1em" } );
    opacityRange.oninput = function( e ){
        surface.setParameters( { opacity: 1 - ( e.target.value / 10 ) } );
    };
    addElement( opacityRange );

} );
