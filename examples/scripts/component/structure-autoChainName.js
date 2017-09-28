
stage.loadFile('data://Bace1Trimer-inDPPC.gro', {
  sele: ':A or :B or DPPC'
}).then(function (o) {
  o.addRepresentation('cartoon')
  o.addRepresentation('licorice', { sele: 'DPPC' })
  o.autoView()
})
