
stage.loadFile('data://md_1u19.gro').then(function (o) {
  o.addRepresentation('cartoon')
  o.addRepresentation('surface', { visible: false, lazy: true })
  o.autoView()

  NGL.autoLoad('data://md_1u19.dcd.gz').then(function (frames) {
    o.addTrajectory(frames, {
      initialFrame: 100,
      defaultTimeout: 100,
      defaultStep: undefined,
      defaultInterpolateType: 'spline',
      defaultDirection: 'forward',
      centerPbc: false,
      removePbc: false,
      superpose: true,
      sele: 'backbone and not hydrogen'
    })
  })
})
