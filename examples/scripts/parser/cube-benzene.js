
stage.loadFile('data://benzene-homo.cube').then(function (o) {
  o.addRepresentation('surface', {
    visible: true,
    isolevelType: 'value',
    isolevel: 0.01,
    color: 'blue',
    opacity: 0.7,
    opaqueBack: false
  })
  o.addRepresentation('surface', {
    visible: true,
    isolevelType: 'value',
    isolevel: -0.01,
    color: 'red',
    opacity: 0.7,
    opaqueBack: false
  })
  o.autoView()
})

stage.loadFile('data://benzene.sdf').then(function (o) {
  o.addRepresentation('licorice')
  o.autoView()
})
