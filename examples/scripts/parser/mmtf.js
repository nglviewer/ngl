
stage.loadFile('data://1blu.mmtf').then(function (o) {
  o.addRepresentation('cartoon', { color: 'residueindex' })
  o.addRepresentation('ball+stick', { sele: 'ligand' })
  o.autoView()
})
