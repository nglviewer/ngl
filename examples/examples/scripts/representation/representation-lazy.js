
stage.loadFile('rcsb://3pqr.mmtf').then(function (o) {
  o.addRepresentation('cartoon')
  o.addRepresentation('surface', { visible: false, lazy: true })
  stage.autoView()
})
