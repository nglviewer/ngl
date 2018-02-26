
stage.setParameters({
  cameraType: 'orthographic',
  mousePreset: 'coot'
})

stage.loadFile('data://3ek3.cif').then(function (o) {
  o.addRepresentation('licorice', {
    colorValue: 'yellow',
    roughness: 1.0
  })
  o.autoView('FMN')
  stage.setFocus(97)
})

stage.loadFile('data://3ek3-2fofc.map.gz').then(function (o) {
  o.addRepresentation('surface', {
    color: 'skyblue',
    isolevel: 1.5,
    boxSize: 10,
    useWorker: false,
    contour: true
  })
})

stage.loadFile('data://3ek3-fofc.map.gz').then(function (o) {
  o.addRepresentation('surface', {
    color: 'lightgreen',
    isolevel: 3,
    boxSize: 10,
    useWorker: false,
    contour: true
  })
  o.addRepresentation('surface', {
    color: 'tomato',
    isolevel: 3,
    negateIsolevel: true,
    boxSize: 10,
    useWorker: false,
    contour: true
  })
})
