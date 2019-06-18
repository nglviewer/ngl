
stage.loadFile('data://DPDP.pdb').then(function (o) {
  o.addRepresentation('licorice')
  o.autoView()

  NGL.autoLoad('data://DPDP.nc').then(function (frames) {
    o.addTrajectory(frames)
  })
})
