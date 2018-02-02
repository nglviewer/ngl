
stage.loadFile('data://dxc.pdbqt').then(function (o) {
  o.addRepresentation('licorice', {
    colorScheme: 'modelIndex'
  })
  o.autoView()
})
