
stage.loadFile('data://adrenalin.mol2').then(function (o) {
  o.addRepresentation('hyperball')
  o.autoView()
})
