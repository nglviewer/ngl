
stage.loadFile('data://1blu.pdb').then(function (o) {
  o.addRepresentation('cartoon', { sele: '*' })
  o.addRepresentation('backbone', {
    sele: '*',
    scale: 1.0,
    aspectRatio: 1.5,
    color: 'lightgreen'
  })
  o.addRepresentation('licorice', { sele: '*', scale: 1.0 })

  var center = o.getCenter('101')
  var zoom = o.getZoom('101')
  stage.animationControls.zoomMove(center, zoom, 0)
})
