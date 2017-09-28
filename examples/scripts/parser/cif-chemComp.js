
stage.loadFile('data://PRDCC_000001.cif').then(function (o) {
  o.addRepresentation('licorice', { sele: '/0', multipleBond: 'symmetric' })
  stage.autoView()
})
