// Handle window resizing
window.addEventListener('resize', function () {
  stage.handleResize()
}, false)

var newDiv = document.getElementById('viewport').appendChild(document.createElement('div'))
newDiv.setAttribute('style', 'position: absolute; top: 0; left: 20px')
newDiv.innerHTML = `<div class="controls"><h3>Example of Setting Pivot Point</h3>
  <p class="credit">Adjust pivot point X with slider, then use Ctrl+Shift+Left-drag to rotate comp.<br>
Click on an atom to set pivot point to that atom (instead of center).<br>
To test center modes, set comp selection to (e.g.) "1-20" and rotate it.
<br>
Things to look for: in selection-center mode, changing the selection<br>
shouldn't move the molecule even if it's been translated, scaled, and<br>
rotated. In that mode, the molecule should scale and rotate about the<br>
selection's center.
</p>
  <p>Pivot point X/Y/Z: [<span id="pivotx"></span>, <span id="pivoty"></span>, <span id="pivotz"></span>]</p>
  <input type="range" min="-10" max="10" step="0.1" value="0" id="pivotSliderX" class="mySlider"></input><br>
  <input type="range" min="-10" max="10" step="0.1" value="0" id="pivotSliderY" class="mySlider"></input><br>
  <input type="range" min="-10" max="10" step="0.1" value="0" id="pivotSliderZ" class="mySlider"></input>
  <p>Current center mode: <span id="center-mode">selection</span></p>
  <input id="toggle-mode-button" type="button" value="Toggle center mode"></input>
</div>`

var comp = null

var pivot = {x: 0, y: 0, z: 0}

const tmpMat4 = new NGL.Matrix4()

function num2str (x, precision) {
  if (x >= 0) { return ' ' + x.toFixed(precision) } else { return x.toFixed(precision) }
}

function matrix4ToString (matrix, prefix = '', prec = 2) {
  const m = matrix.elements
  return `[${num2str(m[0], prec)} ${num2str(m[4], prec)} ${num2str(m[8], prec)} ${num2str(m[12], prec)}\n` +
    `${prefix} ${num2str(m[1], prec)} ${num2str(m[5], prec)} ${num2str(m[9], prec)} ${num2str(m[13], prec)}\n` +
    `${prefix} ${num2str(m[2], prec)} ${num2str(m[6], prec)} ${num2str(m[10], prec)} ${num2str(m[14], prec)}\n` +
    `${prefix} ${num2str(m[3], prec)} ${num2str(m[7], prec)} ${num2str(m[11], prec)} ${num2str(m[15], prec)}]`
}

/** Set mode, or toggle if mode is undefined */
function toggleCenterMode (mode) {
  if (mode === 'component' || mode === 'selection') { comp.centerMode = mode } else if (comp.centerMode === 'selection') { comp.centerMode = 'component' } else { comp.centerMode = 'selection' }
  document.getElementById('center-mode').innerHTML = comp.centerMode
  console.log(`Set center mode to ${comp.centerMode}`)
}
document.getElementById('toggle-mode-button')
  .addEventListener('click', toggleCenterMode)

function updatePivotUI () {
  for (const name of ['x', 'y', 'z']) {
    document.getElementById('pivot' + name).innerHTML = pivot[name].toFixed(2)
  }
}
updatePivotUI()

// Set up listener for dragging slider: set pivot point from slider values
for (const name of ['x', 'y', 'z']) {
  document.getElementById('pivotSlider' + name.toUpperCase()).addEventListener('input', function (evt) {
    var val = +evt.target.value
    pivot[name] = val
    console.log(`Setting pivot to ${pivot.x}, ${pivot.y}, ${pivot.z}`)
    comp.setPivot(pivot.x, pivot.y, pivot.z)
    updatePivotUI()
  })
}

// Set up listener for clicking on an atom: set pivot point
stage.signals.clicked.add(function (pickingProxy) {
  if (pickingProxy && pickingProxy.atom) {
    const atom = pickingProxy.atom
    const center = comp.getCenterUntransformed()
    console.log(`Picked atom ${atom.index}; setting pivot to ${atom.x}, ${atom.y}, ${atom.z} - ctr`)
    for (const name of ['x', 'y', 'z']) { pivot[name] = atom[name] - center[name] }
    updatePivotUI()
    comp.setPivot(atom.x - center.x, atom.y - center.y, atom.z - center.z)
  }
})

// When the selection changes, we don't want the molecule to move
// around. So compute a pre-transform that will take the new matrix,
// based on the new center point, back to the old matrix. At this
// point, it's important that the matrix hasn't yet been updated to
// reflect the new selection's center point.
function onSelectionChanged (sele) {
  console.log(`pivot example: selection changed to ${sele}`)

  const oldMatrix = comp.matrix.clone()
  console.log(`Old matrix:\n${matrix4ToString(oldMatrix)}`)

  comp.updateMatrix(true) // get matrix w/ new selection-center (silently, no signals)
  console.log(`New matrix:\n${matrix4ToString(comp.matrix)}`)

  // Update pre-transform to make final result same as m0 (old matrix)
  // T' = m0 * m1^-1 * T
  tmpMat4.getInverse(comp.matrix)
  comp.transform.premultiply(tmpMat4).premultiply(oldMatrix)
  console.log(`Transform:\n${matrix4ToString(comp.transform)}`)
  comp.updateMatrix()
}

stage.loadFile('data://1blu.pdb').then(function (o) {
  comp = o
  o.addRepresentation('cartoon')
  o.addRepresentation('ball+stick')
  o.autoView()
  o.selection.signals.stringChanged.add(onSelectionChanged, o, 1) // use higher priority to run before matrix update
})
