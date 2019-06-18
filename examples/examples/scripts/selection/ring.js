
stage.loadFile('data://4w93.mmtf').then(function (o) {
  o.addRepresentation('licorice', { sele: '[3L9]' })

  o.addRepresentation('spacefill', {
    radius: 0.5, sele: '[3L9] and ring'
  })

  stage.autoView()
})
