
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

var pdbs = [ '1stm', '3nap', '1sid', '2ft1', '4cwu' ]
var colors = [ 'red', 'yellow', 'green', 'lightblue', 'violet' ]

Promise.all(pdbs.map(function (id) {
  return stage.loadFile('rcsb://' + id)
})).then(function (ol) {
  ol.map(function (o, i) {
    var s = o.structure
    var bu1 = s.biomolDict.BU1
    o.setPosition(bu1.getCenter(s).negate())
    o.addRepresentation('surface', {
      sele: 'polymer',
      assembly: 'BU1',
      color: colors[ i ],
      scaleFactor: 0.10,
      surfaceType: 'sas'
    })
    o.addAnnotation(bu1.getCenter(s), o.name)
  })

  stage.tasks.onZeroOnce(function () { stage.autoView() })
  stage.setParameters({ clipNear: 50 })

  addElement(createElement('span', {
    innerText: 'near clip'
  }, { top: '12px', left: '12px', color: 'lightgrey' }))
  var clipRange = createElement('input', {
    type: 'range',
    value: 50,
    min: 0,
    max: 100,
    step: 1
  }, { top: '28px', left: '12px' })
  clipRange.oninput = function (e) {
    stage.setParameters({ clipNear: e.target.value })
  }
  addElement(clipRange)

  function center () {
    ol.map(function (o, i) {
      var s = o.structure
      var bu1 = s.biomolDict.BU1
      o.setPosition(bu1.getCenter(s).negate())
    })
  }

  var animateButton = createElement('input', {
    type: 'button',
    value: 'animate'
  }, { top: '52px', left: '12px' })
  var pos = [ 1175, 875, 400, -200, -1000 ]
  animateButton.onclick = function (e) {
    center()
    var ac = stage.animationControls
    ol.map(function (o, i) {
      var s = o.structure
      var bu1 = s.biomolDict.BU1
      var p = bu1.getCenter(s)
      p.x += pos[ i ]
      ac.moveComponent(ol[ i ], p, 1500)
    })
  }
  addElement(animateButton)
})
