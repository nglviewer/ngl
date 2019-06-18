
stage.loadFile('data://3pqr.cns').then(function (o) {
  o.addRepresentation('surface', {
    visible: true, isolevel: 2.0, opacity: 0.6
  })
  // o.autoView();
})

stage.loadFile('data://3pqr.pdb').then(function (o) {
  o.addRepresentation('cartoon')
  o.autoView()
})
