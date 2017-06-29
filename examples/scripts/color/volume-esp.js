
Promise.all([
  stage.loadFile('data://hf.dx'),
  stage.loadFile('data://esp.dx'),
  stage.loadFile('data://esp.mol', { ext: 'sdf' })
]).then(function (l) {
  var hfComponent = l[ 0 ]
  var espComponent = l[ 1 ]
  var molComponent = l[ 2 ]

  molComponent.addRepresentation('licorice', { multipleBond: true })

  hfComponent.addRepresentation('surface',
    { isolevel: 0.002,
      isolevelType: 'value',
      opacity: 0.95,
      side: 'front',
      colorScheme: 'volume',
      colorVolume: espComponent.volume,
      colorScale: [ 0xff0000, 0xffff00, 0x00ff00, 0x00ffff, 0x0000ff ],
      colorMode: 'rgb',
      colorDomain: [ -0.05, 0.05 ]
    })
  stage.autoView()
})
