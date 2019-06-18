
stage.loadFile('data://gpcr.top').then(function (o) {
  NGL.autoLoad('data://gpcr.xtc').then(function (frames) {
    o.addTrajectory(frames, {
      initialFrame: 0,
      centerPbc: true,
      removePbc: true
    })
    o.addRepresentation('cartoon')
    o.addRepresentation('backbone')
    o.addRepresentation('licorice', {sele: 'protein and not _h'})
    o.addRepresentation('line', {sele: 'popc and not _h'})
    stage.autoView()
  })
})
