
// create tooltip element and add to document body
var tooltip = document.createElement('div')
Object.assign(tooltip.style, {
  display: 'none',
  position: 'fixed',
  zIndex: 10,
  pointerEvents: 'none',
  backgroundColor: 'rgba( 0, 0, 0, 0.6 )',
  color: 'lightgrey',
  padding: '8px',
  fontFamily: 'sans-serif'
})
document.body.appendChild(tooltip)

// load a structure file
stage.loadFile('data://1blu.mmtf', { defaultRepresentation: true })

// remove default hoverPick mouse action
stage.mouseControls.remove('hoverPick')

// listen to `hovered` signal to move tooltip around and change its text
stage.signals.hovered.add(function (pickingProxy) {
  if (pickingProxy && (pickingProxy.atom || pickingProxy.bond)) {
    var atom = pickingProxy.atom || pickingProxy.closestBondAtom
    var mp = pickingProxy.mouse.position
    tooltip.innerText = 'ATOM: ' + atom.qualifiedName()
    tooltip.style.bottom = window.innerHeight - mp.y + 3 + 'px'
    tooltip.style.left = mp.x + 3 + 'px'
    tooltip.style.display = 'block'
  } else {
    tooltip.style.display = 'none'
  }
})
