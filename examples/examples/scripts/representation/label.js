
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('tube', { radius: 'sstruc' })
  o.addRepresentation('ball+stick', { sele: 'sidechainAttached' })
  o.addRepresentation('label', {
    sele: '.CA',
    color: 'element',
    labelType: 'format',
    labelFormat: '%(resname)s %(chainname)s%(resno)s'
  })
  o.autoView()
})

stage.loadFile('data://1crn.ply').then(function (o) {
  o.addRepresentation('surface', {
    opacity: 0.3,
    side: 'front'
  })
})
