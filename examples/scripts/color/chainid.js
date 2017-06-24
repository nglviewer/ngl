
stage.loadFile('data://3SN6.cif').then(function (o) {
  o.addRepresentation('cartoon', { color: 'chainid' })
  o.autoView()
})
