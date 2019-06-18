
stage.loadFile('data://1crn_apbs.pqr').then(function (o) {
  o.addRepresentation('spacefill', {
    radiusType: 'explicit',
    colorScheme: 'partialCharge',
    visible: false
  })
  o.addRepresentation('surface', {
    surfaceType: 'av',
    colorScheme: 'electrostatic',
    scaleFactor: 3.0,
    opacity: 1.0,
    radiusType: 'explicit'
  })
  o.autoView()
})
