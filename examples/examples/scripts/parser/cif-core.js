
stage.setParameters({
  cameraType: 'orthographic',
  clipDist: 0
})

stage.loadFile('data://Fe2O3_mp-715572_conventional_standard.cif').then(function (o) {
  o.addRepresentation('licorice')
  o.addRepresentation('spacefill', {
    radiusScale: 0.25
  })
  o.addRepresentation('unitcell')
  stage.autoView()
})
