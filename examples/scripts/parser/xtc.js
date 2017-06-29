
stage.loadFile('data://md.gro').then(function (o) {
  o.addRepresentation('cartoon')
  o.autoView()

  NGL.autoLoad('data://md.xtc').then(function (frames) {
    o.addTrajectory(frames)
  })
})
