
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('spacefill')
  o.autoView()
})

stage.loadFile('data://1crn.obj').then(function (o) {
  o.addRepresentation('surface', {
    opacity: 0.7, side: 'double'
  })
})
