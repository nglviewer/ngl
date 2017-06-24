
stage.loadFile('data://1blu.pdb').then(function (o) {
  o.addRepresentation('hyperball', { sele: 'hetero' })
  o.addRepresentation('cartoon')

  stage.viewerControls.orient([
    5.16, -0.86, -8.11, 0,
    3.05, 9.11, 0.97, 0,
    7.56, -3.08, 5.15, 0,
    -28.57, -13.64, 3.36, 1
  ])
})
