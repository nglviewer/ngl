
var promiseList = [
  stage.loadFile('data://3pqr.pqr'),
  stage.loadFile('data://3pqr-pot.dxbin')
]

Promise.all(promiseList).then(function (compList) {
  var pqr = compList[ 0 ]
  var dxbin = compList[ 1 ]

  pqr.addRepresentation('cartoon', {
    colorScheme: 'bfactor',
    colorScale: 'rwb',
    colorDomain: [ -1, 0, 1 ]
  })
  pqr.addRepresentation('licorice', {
    colorScheme: 'bfactor',
    colorScale: 'rwb',
    colorDomain: [ -1, 0, 1 ]
  })
  pqr.addRepresentation('surface', {
    colorVolume: dxbin.volume,
    colorScheme: 'volume',
    colorScale: 'rwb',
    colorDomain: [ -5, 0, 5 ]
  })

  pqr.autoView()

  dxbin.addRepresentation('surface', {
    isolevelType: 'value',
    isolevel: -1.5,
    smooth: 1,
    color: 'red',
    opacity: 0.6,
    side: 'back',
    opaqueBack: false
  })

  dxbin.addRepresentation('surface', {
    isolevelType: 'value',
    isolevel: 1.5,
    smooth: 1,
    color: 'blue',
    opacity: 0.6,
    side: 'front',
    opaqueBack: false
  })

  stage.autoView()
})
