
stage.loadFile('data://1d66.pdb').then(function (o) {
  o.addRepresentation('cartoon', { color: 'resname' })
  o.addRepresentation('base', { color: 'resname' })
  o.addRepresentation('ball+stick', { color: 'resname', visible: false })
  o.autoView()
})
