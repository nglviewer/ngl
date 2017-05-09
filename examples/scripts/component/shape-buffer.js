
var shape = new NGL.Shape( "shape" );
var sphereBuffer = new NGL.SphereBuffer( {
    position: new Float32Array( [ 0, 0, 0, 4, 0, 0 ] ),
    color: new Float32Array( [ 1, 0, 0, 1, 1, 0 ] ),
    radius: new Float32Array( [ 1, 1.2 ] )
} );
shape.addBuffer( sphereBuffer );
var shapeComp = stage.addComponentFromObject( shape );
shapeComp.addRepresentation( "buffer" );
shapeComp.autoView();
