// Regression scene for bonds vanishing on extreme zoom with clipDist = 0.
//
// Bonds (and ball+stick sticks) are drawn as cylinder impostors: a 4-triangle
// bounding box that ray-casts the cylinder per pixel. Setting clipDist = 0
// removes the floor on the perspective near-plane (viewer __updateClipping),
// letting the camera get right up to a bond. Before the fix, the impostor box
// corners were pinned to a clip-space depth near the far plane, so corners that
// were still in front of the camera got clipped on zoom - half the bond would
// disappear, then all of it. After the fix they stay visible until the camera
// actually reaches the bond.
//
// How to test: run the scene, then scroll-zoom hard onto a single bond.
// Press 'c' to toggle clipDist between 0 (zoom freely) and 10 (default floor).
// Press 'o' to toggle perspective / orthographic and check both camera modes.
// (In orthographic mode zooming magnifies rather than moving the camera in,
// and gl_Position.w is always 1, so the near-clipping the fix addresses does
// not arise there - the toggle is here to confirm no regression.)

stage.loadFile('data://1crn.pdb').then(function (o) {
  o.addRepresentation('licorice', { radius: 0.15 })
  o.addRepresentation('ball+stick', { visible: false })
  // Focus tightly on a few atoms so a bond fills the view straight away.
  o.autoView('1-3')

  stage.setParameters({ clipDist: 0 })
})

var textDiv = document.createElement('div')
Object.assign(textDiv.style, {
  position: 'absolute',
  zIndex: 10,
  top: '20px',
  left: '20px',
  color: 'grey',
  fontFamily: 'monospace',
  whiteSpace: 'pre',
  pointerEvents: 'none'
})
stage.viewer.container.appendChild(textDiv)

function _f (x) {
  return (x || x === 0) ? x.toFixed(2) : '-'
}

function updateDiv () {
  var sp = stage.getParameters()
  var camera = stage.viewer.camera
  textDiv.innerHTML = [
    'Scroll to zoom hard onto a bond.',
    "Press 'c' to toggle clipDist (0 <-> 10).",
    "Press 'o' to toggle perspective / orthographic.",
    '',
    'camera:      ' + sp.cameraType,
    'clipDist:    ' + _f(sp.clipDist),
    'camera near: ' + _f(camera.near),
    'cDist:       ' + _f(stage.viewer.cDist),
    'bRadius:     ' + _f(stage.viewer.bRadius)
  ].join('\n')
}
stage.viewer.signals.rendered.add(updateDiv)

document.addEventListener('keydown', function (e) {
  if (e.key === 'c') {
    var next = stage.getParameters().clipDist === 0 ? 10 : 0
    stage.setParameters({ clipDist: next })
  } else if (e.key === 'o') {
    var mode = stage.getParameters().cameraType === 'perspective'
      ? 'orthographic'
      : 'perspective'
    stage.setParameters({ cameraType: mode })
  }
})
