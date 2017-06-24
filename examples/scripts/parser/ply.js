
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('cartoon')
  o.addRepresentation('ball+stick')
  o.autoView()
})

stage.loadFile('data://1crn.ply').then(function (o) {
  o.addRepresentation('surface', {
    opacity: 0.3, side: 'double'
  })
})
