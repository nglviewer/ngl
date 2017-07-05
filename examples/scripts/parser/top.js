
stage.loadFile('data://gpcr.top').then(function (o) {
  NGL.autoLoad('data://gpcr.xtc').then(function (frames) {
    o.addTrajectory(frames, {
      initialFrame: 0,
      centerPbc: true,
      removePbc: true,
      deltaTime: 200
    })
    o.addRepresentation('cartoon')
    // o.addRepresentation('point', {sele: 'water'})
    o.addRepresentation('line', {sele: 'protein'})
    stage.autoView()
  })
})
