
stage.loadFile('data://3ek3.cif', { defaultRepresentation: true })

stage.loadFile('data://3ek3-2fofc.cub').then(function (o) {
  o.addRepresentation('surface', { opacity: 0.6 })
  o.autoView()
})
