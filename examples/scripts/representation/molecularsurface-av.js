
stage.loadFile('data://2vts.mmtf').then(function (o) {
  o.addRepresentation('line', { sele: 'not hetero' })
  o.addRepresentation('licorice', {
    multipleBond: 'symmetric',
    sele: 'hetero and (not water)'
  })
  o.addRepresentation('surface', {
    sele: 'hetero and (not water)',
    surfaceType: 'av',
    contour: true,
    colorScheme: 'element',
    colorValue: '#0f0',
    useWorker: false
  })
  o.addRepresentation('surface', {
    sele: 'not hetero',
    surfaceType: 'av',
    colorScheme: 'bfactor',
    contour: true,
    filterSele: '10 OR 11 OR 12 OR 13 OR 14 OR 18 OR 31 OR 33 OR ' +
                    '64 OR 80 OR 81 OR 82 OR 83 OR 84 OR 85 OR 86 OR ' +
                    '129 OR 131 OR 132 OR 134 OR 144 OR 145'
  })
  stage.viewerControls.orient([
    -25.08, 20.9, -12.01, 0,
    3.52, -13.97, -31.66, 0,
    -23.85, -24.05, 7.95, 0,
    -27.16, -8.65, -63.38, 1
  ])
})
