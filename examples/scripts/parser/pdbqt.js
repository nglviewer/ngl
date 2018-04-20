
stage.loadFile('data://dxc.pdbqt', {
  sele: '/0 or /1 or /2'
}).then(function (o) {
  o.addRepresentation('licorice', {
    colorScheme: 'partialCharge'
  })
  stage.autoView()
})
