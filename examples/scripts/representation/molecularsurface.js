
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('surface', {
    surfaceType: 'ms',
    smooth: 2,
    probeRadius: 1.4,
    scaleFactor: 2.0,
    flatShaded: false,
    opacity: 0.7,
    lowResolution: false,
    colorScheme: 'element'
  })
  o.autoView()
})
