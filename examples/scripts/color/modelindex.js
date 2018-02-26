
stage.loadFile('data://1LVZ.cif').then(function (o) {
  o.addRepresentation('cartoon', { color: 'modelindex' })
  o.autoView()
})
