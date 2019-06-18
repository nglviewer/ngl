
stage.loadFile('rcsb://3sn6.mmtf', {
  defaultRepresentation: false
}).then(function (o) {
  o.addRepresentation('cartoon', { quality: 'low' })
  stage.autoView()

  var radius = 8
  var spacefillRepr = o.addRepresentation('ball+stick', { sele: 'NONE' })

  function getCenterArray () {
    var position = new NGL.Vector3()
    position.copy(stage.viewerControls.position)
    return position.negate()
  }

  var sphereBuffer = new NGL.SphereBuffer({
    position: new Float32Array(getCenterArray().toArray()),
    color: new Float32Array([ 1, 0.5, 1 ]),
    radius: new Float32Array([ radius ])
  })
  o.addBufferRepresentation(sphereBuffer, { opacity: 0.5 })

  var prevSele = ''
  var prevPos = new NGL.Vector3(Infinity, Infinity, Infinity)
  stage.viewerControls.signals.changed.add(function () {
    var pos = getCenterArray()
    if (pos.distanceTo(prevPos) > 0.1) {
      sphereBuffer.setAttributes({ 'position': pos.toArray() })
      prevPos = pos
      var sele = o.structure.getAtomSetWithinPoint(pos, radius).toSeleString()
      if (sele !== prevSele) {
        spacefillRepr.setSelection(sele)
        prevSele = sele
      }
    }
  })
})
