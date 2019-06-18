
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('cartoon')
  o.addRepresentation('hyperball', { sele: 'sidechainAttached' })
  o.autoView()
})
