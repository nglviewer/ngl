
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('spacefill')
  o.autoView()
})
