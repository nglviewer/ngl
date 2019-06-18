
stage.loadFile('data://4umt_47w.sdf').then(function (o) {
  o.addRepresentation('licorice', { multipleBond: 'symmetric' })
  stage.autoView()
})
