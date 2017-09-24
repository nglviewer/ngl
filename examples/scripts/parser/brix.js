
stage.loadFile('data://3str-2fofc.brix').then(function (o) {
  o.addRepresentation('surface')
  stage.autoView()
})

stage.loadFile('data://3str.cif').then(function (o) {
  o.addRepresentation('licorice')
  stage.autoView()
})
