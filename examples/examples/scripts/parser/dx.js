
stage.loadFile('data://1crn_apbs_pot.dx.gz').then(function (o) {
  o.addRepresentation('surface', {
    isolevelType: 'value',
    isolevel: -0.4,
    smooth: 1,
    color: 'red',
    opacity: 0.6,
    side: 'back',
    useWorker: false,
    opaqueBack: false
  })

  o.addRepresentation('surface', {
    isolevelType: 'value',
    isolevel: 0.4,
    smooth: 1,
    color: 'blue',
    opacity: 0.6,
    side: 'front',
    useWorker: false,
    opaqueBack: false
  })

  o.autoView()
})
