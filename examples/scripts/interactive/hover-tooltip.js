
// create tooltip element and add to the viewer canvas
var tooltip = document.createElement( "div" );
Object.assign( tooltip.style, {
    display: "none",
    position: "absolute",
    zIndex: 10,
    pointerEvents: "none",
    backgroundColor: "rgba( 0, 0, 0, 0.6 )",
    color: "lightgrey",
    padding: "0.5em",
    fontFamily: "sans-serif"
} );
stage.viewer.container.appendChild( tooltip );

// load a structure file
stage.loadFile( "data://1blu.mmtf", { defaultRepresentation: true } );

// listen to `hovered` signal to move tooltip around and change its text
stage.signals.hovered.add( function( pickingProxy ){
    if( pickingProxy && ( pickingProxy.atom || pickingProxy.bond ) ){
        var atom = pickingProxy.atom || pickingProxy.closestBondAtom;
        var cp = pickingProxy.canvasPosition;
        tooltip.innerText = "ATOM: " + atom.qualifiedName();
        tooltip.style.bottom = cp.y + 3 + "px";
        tooltip.style.left = cp.x + 3 + "px";
        tooltip.style.display = "block";
    }else{
        tooltip.style.display = "none";
    }
} );
