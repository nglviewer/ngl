
stage.loadFile('data://1ema.cif').then(function (o) {
  o.addRepresentation('cartoon', {
    color: 'white',
    smoothSheet: true,
    opacity: 0.3,
    depthWrite: false,
    side: 'front',
    quality: 'high'
  })

  o.addRepresentation('licorice', {
    sele: '64-68',
    scale: 3,
    color: 'green'
  })

  o.addRepresentation('point', {
    sele: '64-68',
    opacity: 0.15,
    color: 'green',
    useTexture: true,
    pointSize: 40,
    edgeBleach: 1,
    alphaTest: 0,
    depthWrite: false
  })

  var pa = o.structure.getView(new NGL.Selection('.CA')).getPrincipalAxes()
  stage.animationControls.rotate(pa.getRotationQuaternion(), 0)
  stage.autoView()
})
