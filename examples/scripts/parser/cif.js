
stage.loadFile('data://3SN6.cif').then(function (o) {
  o.addRepresentation('cartoon', { radius: 'sstruc' })
  o.autoView()
})
