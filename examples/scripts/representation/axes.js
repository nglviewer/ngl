
stage.loadFile('rcsb://3pqr.mmtf', {
  defaultAssembly: 'BU1'
}).then(function (o) {
  o.addRepresentation('cartoon')
  o.addRepresentation('axes', {
    sele: 'RET', showAxes: false, showBox: true, radius: 0.2
  })
  o.addRepresentation('ball+stick', { sele: 'RET' })
  o.addRepresentation('axes', {
    sele: ':B and backbone', showAxes: false, showBox: true, radius: 0.2
  })
  stage.autoView()
  var pa = o.structure.getPrincipalAxes()
  stage.animationControls.rotate(pa.getRotationQuaternion(), 1500)
})
