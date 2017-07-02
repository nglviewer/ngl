
stage.loadFile('data://DPDP.prmtop').then(function (o) {
  NGL.autoLoad('data://DPDP.nc').then(function (frames) {
    o.addTrajectory(frames, {
      initialFrame: 0,
      superpose: false
    })
    o.addRepresentation('ball+stick')
    stage.autoView()
  })
})