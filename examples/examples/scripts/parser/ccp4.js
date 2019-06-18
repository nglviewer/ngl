
stage.loadFile('data://3pqr.ccp4.gz').then(function (o) {
  o.addRepresentation('surface', {
    contour: true,
    color: 'skyblue',
    boxSize: 10
  })
  o.autoView()

  var position = new NGL.Vector3()
  function getCenterArray () {
    position.copy(stage.viewerControls.position)
    return position.negate().toArray()
  }

  var sphereBuffer = new NGL.SphereBuffer(
    {
      position: new Float32Array(getCenterArray()),
      color: new Float32Array([ 1, 0, 0 ]),
      radius: new Float32Array([ 1 ])
    },
    { disableImpostor: true }
  )
  o.addBufferRepresentation(sphereBuffer, { flatShaded: true })

  stage.viewerControls.signals.changed.add(function () {
    sphereBuffer.setAttributes({
      position: getCenterArray()
    })
  })
})

// mode 0 data
stage.loadFile('data://3pqr-mode0.ccp4').then(function (o) {
  o.addRepresentation('surface', {
    contour: true,
    color: 'tomato',
    boxSize: 10
  })
  o.autoView()
})

stage.loadFile('data://3pqr.pdb').then(function (o) {
  o.addRepresentation('line', {
    linewidth: 5, colorValue: 'yellow'
  })
  o.autoView()
})
