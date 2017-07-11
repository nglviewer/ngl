
stage.loadFile('data://adrenalin.mol2').then(function (o) {
  o.addRepresentation('ball+stick', { color: 'partialCharge' })
  o.autoView()
})
