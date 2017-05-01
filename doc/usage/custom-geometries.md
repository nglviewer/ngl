
# Custom geometries

## Shape

Convenience API
- [Shape](../class/src/geometry/shape.js~Shape.html) class
- [ShapeComponent](../class/src/component/shape-component.js~ShapeComponent.html) class

Render a variety of geometry primitives using a Shape object:
```
var shape = new NGL.Shape( "shape" );
shape.addMesh(
    [ 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1 ],
    [ 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 ],
    undefined, undefined, "My mesh"
);
shape.addSphere( [ 0, 0, 9 ], [ 1, 0, 0 ], 1.5 );
shape.addSphere( [ 12, 5, 15 ], [ 1, 0.5, 0 ], 1 );
shape.addEllipsoid( [ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ] );
shape.addCylinder( [ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5 );
shape.addCone( [ 0, 2, 7 ], [ 0, 3, 3 ], [ 1, 1, 0 ], 1.5 );
shape.addArrow( [ 1, 2, 7 ], [ 30, 3, 3 ], [ 1, 0, 1 ], 1.0 );
shape.addArrow( [ 2, 2, 7 ], [ 30, -3, -3 ], [ 1, 0.5, 1 ], 1.0 );
shape.addLabel( [ 15, -4, 4 ], [ 0.2, 0.5, 0.8 ], 2.5, "Hello" );

var shapeComp = stage.addComponentFromObject( shape );
shapeComp.addRepresentation( "buffer" );
shapeComp.autoView();
```


## Buffer

Low level approach, more scalable
- [Buffer](../class/src/representation/buffer-representation.js~BufferRepresentation.html) class
- [BufferRepresentation](../class/src/representation/buffer-representation.js~BufferRepresentation.html) class

Render two spheres (sscales to many more) a SphereBuffer object:
```
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
```