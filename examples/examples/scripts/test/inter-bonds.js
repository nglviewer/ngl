
stage.loadFile('data://inter-bonds.pdb').then(function (o) {
  o.addRepresentation('licorice')
  o.autoView()
})
