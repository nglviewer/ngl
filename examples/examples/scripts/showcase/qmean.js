
function createElement (name, properties, style) {
  var el = document.createElement(name)
  Object.assign(el, properties)
  Object.assign(el.style, style)
  return el
}

function createSelect (options, properties, style) {
  var select = createElement('select', properties, style)
  options.forEach(function (d) {
    select.add(createElement('option', {
      value: d[ 0 ], text: d[ 1 ]
    }))
  })
  return select
}

function addElement (el) {
  Object.assign(el.style, {
    position: 'absolute',
    zIndex: 10
  })
  stage.viewer.container.appendChild(el)
}

Promise.all([

  stage.loadFile('data://1crn.pdb'),
  NGL.autoLoad('data://1crn_qmean_local_scores.txt', {
    ext: 'csv',
    delimiter: ' ',
    comment: '#',
    columnNames: true
  })

]).then(function (ol) {
  var protein = ol[ 0 ]
  var qmean = ol[ 1 ].data

  var qmeanScheme = NGL.ColormakerRegistry.addScheme(function (params) {
    this.domain = [ 0.5, 1 ]
    this.scale = 'PuBu'
    this.mode = 'rgb'
    var scale = this.getScale()
    this.atomColor = function (atom) {
      var value = parseFloat(qmean[ atom.residueIndex ][ 12 ])
      return scale(value)
    }
  })

  var cartoon = protein.addRepresentation('cartoon', { color: qmeanScheme })

  var schemeSelect = createSelect(
    [
      [ qmeanScheme, 'qmean' ],
      [ 'sstruc', 'secondary structure' ]
    ],
    null,
    { top: '1em', left: '1em' }
  )
  schemeSelect.onchange = function (e) {
    cartoon.setParameters({ colorScheme: e.target.value })
  }

  var centerButton = createElement(
    'button',
    { innerText: 'Center' },
    { top: '3em', left: '1em' }
  )
  centerButton.onclick = function (e) {
    stage.autoView(1000)
  }

  addElement(schemeSelect)
  addElement(centerButton)

  stage.autoView()
})
