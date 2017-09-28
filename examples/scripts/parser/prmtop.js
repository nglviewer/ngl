
stage.loadFile('data://DPDP.prmtop').then(function (o) {
  NGL.autoLoad('data://DPDP.nc').then(function (frames) {
    o.addTrajectory(frames, {
      initialFrame: 0,
      deltaTime: 200
    })
    o.addRepresentation('licorice', {scale: 0.5})
    o.addRepresentation('spacefill', {sele: 'not :B'})
    o.addRepresentation('cartoon')
    o.addRepresentation('backbone')
    stage.autoView()
  })
})
