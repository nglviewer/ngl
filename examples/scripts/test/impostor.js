
stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('ball+stick', { sele: '16', disableImpostor: true })
  o.addRepresentation('ball+stick', { sele: 'not 16' })
  o.autoView('16')
})
