
stage.loadFile('data://md_1u19_trj.gro', {
  asTrajectory: true,
  sele: '50-100'
}).then(function (o) {
  o.addTrajectory()
  o.addRepresentation('cartoon')
  o.addRepresentation('helixorient')
  o.addRepresentation('line', {
    sele: 'not hydrogen and sidechainAttached'
  })
  stage.autoView()
})
