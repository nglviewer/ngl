
stage.loadFile('data://md.gro').then(function (o) {
  o.addRepresentation('cartoon')
  o.addRepresentation('line')
  o.autoView()
})
