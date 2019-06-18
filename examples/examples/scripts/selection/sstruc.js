
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('backbone', { color: 'sstruc' })
  o.addRepresentation('rocket', { sele: 'helix', color: 'sstruc' })
  o.addRepresentation('cartoon', { sele: 'sheet', color: 'sstruc' })
  o.addRepresentation('tube', { sele: 'turn', color: 'sstruc' })

  stage.autoView()
})
