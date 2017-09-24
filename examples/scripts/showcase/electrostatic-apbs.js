
stage.loadFile('data://1crn_apbs.pqr').then(function (o) {
  o.addRepresentation('cartoon', {
    colorScheme: 'partialCharge',
    colorScale: 'rwb'
  })
  o.addRepresentation('licorice', {
    colorScheme: 'partialCharge',
    colorScale: 'rwb'
  })

  o.autoView()
})

stage.loadFile('data://1crn_apbs_pot.dx.gz').then(function (o) {
  o.addRepresentation('dot', {
    thresholdType: 'value',
    thresholdMin: -5,
    thresholdMax: 5,
    thresholdOut: true,
    dotType: 'sphere',
    radius: 'abs-value',
    scale: 0.001,
    visible: true,
    colorScheme: 'value',
    colorScale: 'rwb'
  })

  o.addRepresentation('surface', {
    isolevelType: 'value',
    isolevel: -0.4,
    smooth: 1,
    color: 'red',
    opacity: 0.6,
    side: 'back',
    opaqueBack: false
  })

  o.addRepresentation('surface', {
    isolevelType: 'value',
    isolevel: 0.4,
    smooth: 1,
    color: 'blue',
    opacity: 0.6,
    side: 'front',
    opaqueBack: false
  })

  stage.autoView()
})
