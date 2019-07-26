
stage.loadFile('data://pbc.gro').then(function (o) {
  // FIXME pbc centering and removal for files other then trajectories

  o.addRepresentation('cartoon', { sele: 'backbone' })
  o.addRepresentation('spacefill', { sele: 'backbone' })
  o.addRepresentation('line')
  o.autoView()
})
