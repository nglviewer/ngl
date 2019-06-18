
console.time('load-to-render')
stage.loadFile('data://4opj.cif').then(function (o) {
  o.addRepresentation('cartoon', { assembly: 'BU1', opacity: 0.5, side: 'back' })
  o.addRepresentation('ribbon', { assembly: 'SUPERCELL', color: 'grey', scale: 1.0, visible: false })
  o.addRepresentation('backbone', { assembly: 'AU' })
  o.addRepresentation('surface', { assembly: 'BU2' })
  stage.autoView()
  stage.tasks.onZeroOnce(function () {
    console.timeEnd('load-to-render')
  })
})
