
var shape = new NGL.Shape( "shape", { disableImpostor: true } );
shape.addSphere( [ -3.5, 2, 2 ], [ 1, 0.5, 0 ], 3 );
shape.addLabel( [ 0, -2, 0 ], [ 0.2, 0.5, 0.8 ], 2.5, "wire-sphere" );
var shapeComp = stage.addComponentFromObject( shape );
shapeComp.addRepresentation( "buffer", { wireframe: true } );
stage.autoView();
