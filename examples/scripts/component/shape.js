
var shape = new NGL.Shape('shape', { dashedCylinder: true })
shape.addMesh(
  [ 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1 ],
  [ 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 ],
  undefined, undefined, 'My mesh'
)
shape.addSphere([ 0, 0, 9 ], [ 1, 0, 0 ], 1.5)
shape.addSphere([ 12, 5, 15 ], [ 1, 0.5, 0 ], 1)
shape.addEllipsoid([ 6, 0, 0 ], [ 1, 0, 0 ], 1.5, [ 3, 0, 0 ], [ 0, 2, 0 ])
shape.addCylinder([ 0, 2, 7 ], [ 0, 0, 9 ], [ 1, 1, 0 ], 0.5, 'My Cylinder')
shape.addCone([ 0, 2, 7 ], [ 0, 3, 3 ], [ 1, 1, 0 ], 1.5)
shape.addArrow([ 1, 2, 7 ], [ 30, 3, 3 ], [ 1, 0, 1 ], 1.0)
shape.addArrow([ 2, 2, 7 ], [ 30, -3, -3 ], [ 1, 0.5, 1 ], 1.0)
shape.addBox([ 23, 1, 2 ], [ 0, 1, 0 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ])
shape.addTetrahedron([ 27, 0, 1 ], [ 0, 1, 0 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ])
shape.addOctahedron([ 8, 5, 14 ], [ 0, 1, 0 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ])
shape.addTorus([ 16, 5, 14 ], [ 0, 1, 0 ], 2, [ 0, 1, 1 ], [ 1, 0, 1 ])
shape.addText([ 15, -4, 4 ], [ 0.2, 0.5, 0.8 ], 2.5, 'Hello')

var shapeComp = stage.addComponentFromObject(shape)
shapeComp.addRepresentation('buffer')
shapeComp.autoView()
