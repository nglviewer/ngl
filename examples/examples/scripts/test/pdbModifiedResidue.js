
stage.loadFile('data://2src.pdb').then(function (o) {
  o.addRepresentation('cartoon', {
    color: 'residueindex',
    colorReverse: true
  })
  o.addRepresentation('licorice', {
    sele: 'ligand',
    scale: 2.0
  })
  o.autoView()
})
