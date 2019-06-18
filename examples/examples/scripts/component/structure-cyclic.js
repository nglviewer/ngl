
stage.loadFile('data://1sfi.cif').then(function (o) {
  o.addRepresentation('cartoon', { color: 'chainindex' })
  o.addRepresentation('backbone')
  o.addRepresentation('trace', { linewidth: 3 })
  o.autoView()
})
