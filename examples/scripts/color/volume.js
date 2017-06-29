
Promise.all([
  stage.loadFile('data://betaGal.mrc'),
  stage.loadFile('data://localResolution.mrc', { voxelSize: 3.54 })
]).then(function (l) {
  var betaGal = l[ 0 ]
  var localResolution = l[ 1 ]
  betaGal.addRepresentation('surface', {
    colorVolume: localResolution.volume,
    colorScheme: 'volume',
    colorScale: 'rwb',
    colorReverse: true,
    colorDomain: [ 5, 14 ]
  })
  localResolution.addRepresentation('dot', {
    thresholdMin: 0,
    thresholdMax: 8,
    thresholdType: 'value',
    dotType: 'sphere',
    radius: 0.6,
    colorScheme: 'value',
    colorScale: 'rwb',
    colorReverse: true,
    colorDomain: [ 5, 14 ]
  })
  stage.autoView()
})
