
stage.loadFile('data://BaceCg.pdb').then(function (o) {
  o.addRepresentation('cartoon')
  o.addRepresentation('rope', { sele: 'helix' })
  o.addRepresentation('ball+stick')
  o.autoView()
})
