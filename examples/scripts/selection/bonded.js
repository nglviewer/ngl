
stage.loadFile('data://1blu.mmtf').then(function (o) {
  o.addRepresentation('cartoon')

  o.addRepresentation('ball+stick')

  o.addRepresentation('spacefill', {
    sele: 'not bonded', opacity: 0.6
  })

  stage.autoView()
})
