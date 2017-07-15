
function addElement (el) {
  Object.assign(el.style, {
    position: 'absolute',
    zIndex: 10
  })
  stage.viewer.container.appendChild(el)
}

function createElement (name, properties, style) {
  var el = document.createElement(name)
  Object.assign(el, properties)
  Object.assign(el.style, style)
  return el
}

stage.loadFile('data://ligands.sd').then(function (o) {
  o.setSelection('/0')
  o.addRepresentation('licorice')
  o.autoView()

  var modelRange = createElement('input', {
    type: 'range',
    value: 0,
    min: 0,
    max: o.structure.modelStore.count - 1,
    step: 1
  }, { top: '12px', left: '12px' })
  modelRange.oninput = function (e) {
    o.setSelection('/' + e.target.value)
  }
  addElement(modelRange)
})
