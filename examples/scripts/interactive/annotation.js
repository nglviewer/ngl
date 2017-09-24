
stage.loadFile('data://3SN6.cif').then(function (o) {
  o.addRepresentation('cartoon', { color: 'chainname' })

  var chainText = {
    'A': 'alpha subunit',
    'B': 'beta subunit',
    'G': 'gamma subunit',
    'R': 'beta 2 adrenergic receptor',
    'N': 'nanobody'
  }

  var ap = o.structure.getAtomProxy()
  o.structure.eachChain(function (cp) {
    ap.index = cp.atomOffset + Math.floor(cp.atomCount / 2)
    o.addAnnotation(ap.positionToVector3(), chainText[ cp.chainname ])
  }, new NGL.Selection('polymer'))

  o.autoView()

  var pa = o.structure.getPrincipalAxes()
  var q = pa.getRotationQuaternion()
  q.multiply(o.quaternion.clone().inverse())
  stage.animationControls.rotate(q, 0)
  stage.animationControls.move(o.getCenter(), 0)
})
