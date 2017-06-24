
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

stage.loadFile('rcsb://3j3q.mmtf').then(function (o) {
  o.autoView()

  var point = o.addRepresentation('point')

  var surface = o.addRepresentation('surface', {
    surfaceType: 'sas',
    smooth: 2,
    scaleFactor: 0.2,
    colorScheme: 'chainindex',
    opaqueBack: false
  })

  var cartoon = o.addRepresentation('cartoon', {
    sele: ':f0 or :f1 or :f2 or :f3 or :f4 or :f5',
    colorScheme: 'chainindex'
  })

  o.addRepresentation('ball+stick', {
    sele: ':f0',
    colorScheme: 'element'
  })

  o.addRepresentation('rocket', {
    sele: ':f0',
    colorScheme: 'chainindex'
  })

  var pointButton = createElement('input', {
    type: 'button',
    value: 'toggle points'
  }, { top: '12px', left: '12px' })
  pointButton.onclick = function (e) {
    point.toggleVisibility()
  }
  addElement(pointButton)

  var surfaceButton = createElement('input', {
    type: 'button',
    value: 'toggle surface'
  }, { top: '36px', left: '12px' })
  surfaceButton.onclick = function (e) {
    surface.toggleVisibility()
  }
  addElement(surfaceButton)

  var cartoonButton = createElement('input', {
    type: 'button',
    value: 'toggle cartoon'
  }, { top: '60px', left: '12px' })
  cartoonButton.onclick = function (e) {
    cartoon.toggleVisibility()
  }
  addElement(cartoonButton)

  var centerAllButton = createElement('input', {
    type: 'button',
    value: 'center all'
  }, { top: '96px', left: '12px' })
  centerAllButton.onclick = function (e) {
    stage.autoView()
  }
  addElement(centerAllButton)

  var centerSubunitButton = createElement('input', {
    type: 'button',
    value: 'center subunit'
  }, { top: '120px', left: '12px' })
  centerSubunitButton.onclick = function (e) {
    o.autoView(':f0 or :f1 or :f2 or :f3 or :f4 or :f5')
  }
  addElement(centerSubunitButton)

  addElement(createElement('span', {
    innerText: 'surface transparency'
  }, { top: '156px', left: '12px', color: 'lightgrey' }))
  var opacityRange = createElement('input', {
    type: 'range',
    value: 0,
    min: 0,
    max: 100,
    step: 1
  }, { top: '172px', left: '12px' })
  opacityRange.oninput = function (e) {
    surface.setParameters({ opacity: 1 - (e.target.value / 100) })
  }
  addElement(opacityRange)
})
