stage.loadFile('data://1d66.pdb').then(function (o) {
  o.addRepresentation('cartoon', { color: 'compvis' })
  o.addRepresentation('base', { color: 'compvis' })
  o.addRepresentation('ball+stick', { color: 'compvis', visible: false })
  o.autoView()
})