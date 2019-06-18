
stage.loadFile('data://3SN6.cif').then(function (o) {
  o.addRepresentation('cartoon', { color: 'chainname' })

  var chainData = {
    'A': { text: 'alpha subunit', color: 'firebrick' },
    'B': { text: 'beta subunit', color: 'orange' },
    'G': { text: 'gamma subunit', color: 'khaki' },
    'R': { text: 'beta 2 adrenergic receptor', color: 'skyblue' },
    'N': { text: 'nanobody', color: 'royalblue' }
  }

  var ap = o.structure.getAtomProxy()
  o.structure.eachChain(function (cp) {
    ap.index = cp.atomOffset + Math.floor(cp.atomCount / 2)
    var elm = document.createElement('div')
    elm.innerText = chainData[ cp.chainname ].text
    elm.style.color = 'black'
    elm.style.backgroundColor = chainData[ cp.chainname ].color
    elm.style.padding = '8px'
    o.addAnnotation(ap.positionToVector3(), elm)
  }, new NGL.Selection('polymer'))

  o.autoView()

  var pa = o.structure.getPrincipalAxes()
  var q = pa.getRotationQuaternion()
  q.multiply(o.quaternion.clone().inverse())
  stage.animationControls.rotate(q, 0)
  stage.animationControls.move(o.getCenter(), 0)
})
