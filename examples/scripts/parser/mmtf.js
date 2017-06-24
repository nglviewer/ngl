
stage.loadFile('data://1blu.mmtf').then(function (o) {
  o.addRepresentation('cartoon', { color: 'residueindex' })
  o.autoView()
})
