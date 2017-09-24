
stage.loadFile('data://1M4X.cif').then(function (o) {
  o.addRepresentation('surface', {
    sele: 'polymer',
    assembly: 'BU1',
    surfaceType: 'sas',
    probeRadius: 0.1,
    scaleFactor: 0.05,
    colorScheme: 'atomindex',
    colorScale: 'PiYG',
    useWorker: false
  })
  stage.tasks.onZeroOnce(function () { stage.autoView() })
})
