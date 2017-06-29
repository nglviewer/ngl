
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('licorice')
  o.addRepresentation('point', {
    sele: '*',
    sizeAttenuation: true,
    pointSize: 7,
    opacity: 0.6,
    useTexture: true,
    alphaTest: 0.0,
    edgeBleach: 1.0,
    forceTransparent: true,
    sortParticles: true
  })
  o.autoView()
})
