
stage.loadFile('data://ala3.pdb').then(function (o) {
  var atomPair = [
    // [ "1.CA", "3.CA" ]
    [ 8, 28 ]
  ]

  o.addRepresentation('licorice')
  o.addRepresentation('cartoon', { sele: 'protein' })
  o.addRepresentation('distance', {
    atomPair: atomPair,
    labelColor: 'skyblue',
    color: 'skyblue'
  })
  o.autoView()

  NGL.autoLoad('data://ala3.dcd').then(function (frames) {
    o.addTrajectory(frames)
  })
})
