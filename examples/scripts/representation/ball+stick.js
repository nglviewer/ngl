
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('ball+stick')
  o.autoView()
})
