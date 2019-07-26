
stage.loadFile('data://3dqb.pdb').then(function (o) {
  o.addRepresentation('surface', {
    sele: 'polymer',
    colorScheme: 'electrostatic',
    surfaceType: 'av'
  })
  o.autoView()
})
