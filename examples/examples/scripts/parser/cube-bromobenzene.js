
stage.loadFile('data://bromobenzene-med.cube.gz').then(function (o) {
  o.addRepresentation('surface', { opacity: 0.6 })
  stage.autoView()
})

stage.loadFile('data://bromobenzene.pdb').then(function (o) {
  o.addRepresentation('ball+stick')
  stage.autoView()
})
