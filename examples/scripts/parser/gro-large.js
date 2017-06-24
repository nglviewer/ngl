
stage.loadFile('data://water.gro').then(function (o) {
  o.addRepresentation('line', { color: 'residueindex' })
  o.autoView()
})
