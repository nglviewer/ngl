
var shape = new NGL.Shape('shape')
var sphereBuffer = new NGL.SphereBuffer({
  position: new Float32Array([ 0, 0, 0, 4, 0, 0 ]),
  color: new Float32Array([ 1, 0, 0, 1, 1, 0 ]),
  radius: new Float32Array([ 1, 1.2 ])
})
shape.addBuffer(sphereBuffer)
var boxBuffer = new NGL.BoxBuffer({
  position: new Float32Array([ 0, 3, 0, -2, 0, 0 ]),
  color: new Float32Array([ 1, 0, 1, 0, 1, 0 ]),
  size: new Float32Array([ 2, 1.5 ]),
  heightAxis: new Float32Array([ 0, 1, 1, 0, 2, 0 ]),
  depthAxis: new Float32Array([ 1, 0, 1, 0, 0, 2 ])
})
shape.addBuffer(boxBuffer)
var shapeComp = stage.addComponentFromObject(shape)
shapeComp.addRepresentation('buffer')
shapeComp.autoView()
