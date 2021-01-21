
stage.loadFile('data://water.pdb').then(function (o) {
  o.addRepresentation('ball+stick')
})

stage.loadFile('data://water.cube').then(function (o) {
  o.addRepresentation('surface', {opacity: 0.5, colorValue: 'cyan', disablePicking: true})
  o.addRepresentation('surface', {negateIsolevel: true, opacity: 0.5, colorValue: 'red', disablePicking: true})
})
