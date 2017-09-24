
stage.loadFile('data://4YVS.cif', {
  assembly: 'AU',
  sele: '86-100:H'
}).then(function (o) {
  o.addRepresentation('helixorient')
  o.addRepresentation('rope', {
    opacity: 0.4, side: 'front', smooth: 0
  })
  o.addRepresentation('licorice', { sele: 'backbone' })
  stage.autoView()
})
