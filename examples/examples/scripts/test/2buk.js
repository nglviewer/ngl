
stage.loadFile('data://2buk.pdb').then(function (o) {
  o.addRepresentation('backbone', {
    lineOnly: true,
    assembly: 'UNITCELL'
  })
  stage.autoView()
})
