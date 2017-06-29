
stage.loadFile('data://emd_2682.map.gz').then(function (o) {
  o.addRepresentation('surface', {
    opacity: 0.5,
    opaqueBack: true
  })
  stage.autoView()
})

stage.loadFile('data://4UJD.cif.gz').then(function (o) {
  o.addRepresentation('cartoon', { color: 'chainindex' })
  stage.autoView()
})
