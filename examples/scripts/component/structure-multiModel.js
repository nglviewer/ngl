
stage.loadFile('data://1LVZ.pdb', {
  firstModelOnly: true
}).then(function (o) {
  o.addRepresentation('cartoon', { sele: '*' })
  stage.autoView()
})

stage.loadFile('data://md_1u19_trj.gro', {
  asTrajectory: true
}).then(function (o) {
  o.addRepresentation('cartoon', { sele: '*' })
  o.addTrajectory()
  stage.autoView()
})
