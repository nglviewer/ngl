
stage.loadFile('data://ala3.psf').then(function (o) {
  NGL.autoLoad('data://ala3.dcd').then(function (frames) {
    o.addTrajectory(frames, {
      initialFrame: 0,
      superpose: false
    })
    o.addRepresentation('licorice', {scale: 0.5})
    o.addRepresentation('backbone')
    stage.autoView()
  })
})
