
stage.loadFile('data://3pqr.pdb').then(function (o) {
  o.addRepresentation('cartoon')
  o.addRepresentation('unitcell')
  o.addRepresentation('ribbon', {
    assembly: 'UNITCELL', color: 0x00DD11, scale: 0.9
  })
  stage.autoView()
})
