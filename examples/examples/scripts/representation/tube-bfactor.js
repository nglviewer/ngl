
stage.loadFile('data://1u19.pdb').then(function (o) {
  o.addRepresentation('tube', {
    sele: ':A',
    radiusType: 'bfactor',
    radiusScale: 0.010,
    color: 'bfactor',
    colorScale: 'RdYlBu'
  })

  o.addRepresentation('ball+stick', {
    sele: ':A and sidechainAttached',
    aspectRatio: 1.5,
    color: 'bfactor',
    colorScale: 'RdYlBu'
  })

  o.autoView(':A')
})
