
stage.loadFile('data://1blu.pdb').then(function (o) {
  o.addRepresentation('cartoon')
  o.autoView()
})
