
stage.loadFile('data://3dqb.pdb').then(function (o) {
  o.addRepresentation('surface', {
    sele: 'polymer',
    colorScheme: 'electrostatic',
    colorDomain: [ -0.3, 0.3 ],
    surfaceType: 'av'
  })
  o.autoView()
})
