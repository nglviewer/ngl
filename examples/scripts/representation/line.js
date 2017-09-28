
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('ribbon')
  o.addRepresentation('line', {
    sele: 'sidechainAttached',
    linewidth: 7
  })
  o.addRepresentation('point', {
    sele: 'sidechainAttached',
    sizeAttenuation: false,
    pointSize: 7,
    alphaTest: 1,
    useTexture: true
  })
  o.autoView()
})
