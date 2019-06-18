
stage.loadFile('data://3pqr.pdb').then(function (o) {
  o.addRepresentation('line')
  o.addRepresentation('licorice', { radius: 0.3, sele: 'ring' })
  o.addRepresentation('spacefill', { radius: 0.5, sele: 'aromaticRing' })

  stage.autoView()
})
