
stage.loadFile('data://3str-2fofc.dsn6').then(function (o) {
  o.addRepresentation('surface', { wireframe: true, color: 'tomato' })
  stage.autoView()
})

stage.loadFile('data://3str.cif').then(function (o) {
  o.addRepresentation('licorice')
  stage.autoView()
})
