
// Load a protein
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('cartoon')
  stage.autoView()
})

// Load the same protein and move it
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.setPosition([ 20, 0, 0 ])
  o.setRotation([ 2, 0, 0 ])
  o.setScale(0.5)
  o.addRepresentation('cartoon', { color: 'orange' })
  stage.autoView()
})
