
stage.loadFile('data://acrolein1gs.cube.gz').then(function (o) {
  o.addRepresentation('surface', {
    visible: true, isolevel: 0.1, opacity: 0.6
  })
  o.autoView()
})

stage.loadFile('data://acrolein.pdb').then(function (o) {
  o.addRepresentation('licorice')
  o.autoView()
})
